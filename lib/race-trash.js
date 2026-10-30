// lib/race-trash.js
//
// Recoverable race deletion ("Recently deleted"). Pure data layer: callers pass
// a service-role Supabase client. Used by server.js (admin API) and the daily cron.
//
// DELETE  - race is hidden immediately: status -> 'draft' (every public query
//           requires status='active'), deleted_at stamped, previous status and
//           slug saved. The slug is replaced by a placeholder so the web address
//           is free for a new race right away.
// RESTORE - allowed until deleted_at + RECOVERY_DAYS. Puts the previous status
//           and slug back, with two rules that mirror publishing:
//             1. If it was 'active' and a newer edition of it (a race whose
//                parent_race_id points here) is now active, it comes back as
//                'archived' instead, so the site never shows two editions.
//             2. If it comes back 'active' and its previous edition (parent) is
//                active, the parent is archived (same as publishing a draft).
//           If its old web address was taken meanwhile, it gets the first free
//           "-2", "-3", ... version.
// PURGE   - the daily cron permanently removes races deleted more than
//           RECOVERY_DAYS ago. Child rows go with them (ON DELETE CASCADE).
//           Uploaded images stay in Supabase Storage (clones share image URLs).
//
// Requires migration schema/2026-10-30_soft_delete_races.sql.

const RECOVERY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const DELETED_SLUG_RE = /--deleted-[0-9a-f-]{36}$/;

const MIGRATION_MISSING = 'Delete is not switched on yet: run schema/2026-10-30_soft_delete_races.sql in the Supabase SQL editor.';

// ISO timestamp until which a race deleted at `deletedAt` can be restored.
function restoreUntil(deletedAt) {
  const t = new Date(deletedAt).getTime();
  if (!Number.isFinite(t)) return null;
  return new Date(t + RECOVERY_DAYS * DAY_MS).toISOString();
}

function placeholderSlug(slug, id) {
  return `${slug || 'race'}--deleted-${id}`;
}

function isMissingColumnError(err) {
  if (!err) return false;
  return err.code === '42703' || err.code === 'PGRST204' ||
    /deleted_at|status_before_delete|slug_before_delete|renewed_for_date/.test(String(err.message || ''));
}

const res = (status, body) => ({ status, body });

async function readRace(supabase, id) {
  const { data, error } = await supabase.from('races').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// First slug in [desired, desired-2, desired-3, ...] not used by another race.
async function pickFreeSlug(supabase, desired, selfId) {
  const base = desired || 'race';
  for (let n = 1; n <= 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const { data, error } = await supabase.from('races').select('id').eq('slug', candidate);
    if (error) throw new Error(`slug check failed: ${error.message}`);
    if (!data || data.length === 0 || (data.length === 1 && data[0].id === selfId)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function softDeleteRace(supabase, id) {
  const done = r => res(200, {
    success: true, id, name: r.name, deleted_at: r.deleted_at,
    restore_until: restoreUntil(r.deleted_at), was_status: r.status_before_delete,
  });

  // Compare-and-swap on the status we read, so the saved "status before delete"
  // is exactly what the race had at the moment of deletion. Retried if a save
  // changed the race in between.
  for (let attempt = 0; attempt < 3; attempt++) {
    const race = await readRace(supabase, id);
    if (!race) return res(404, { error: 'Race not found' });
    if (!('deleted_at' in race) || !('slug_before_delete' in race)) return res(500, { error: MIGRATION_MISSING });
    if (race.deleted_at) return done(race); // already deleted (double-click, two tabs)

    let q = supabase
      .from('races')
      .update({
        status: 'draft',
        deleted_at: new Date().toISOString(),
        status_before_delete: race.status || 'draft',
        slug_before_delete: race.slug,
        slug: placeholderSlug(race.slug, id),
      })
      .eq('id', id)
      .is('deleted_at', null);
    q = race.status == null ? q.is('status', null) : q.eq('status', race.status);
    const { data: rows, error } = await q.select('*');
    if (error) return res(500, { error: isMissingColumnError(error) ? MIGRATION_MISSING : error.message });
    if (rows && rows.length) return done(rows[0]);
    // 0 rows: deleted by someone else, or status changed since the read -> re-read
  }
  return res(409, { error: 'The race changed while deleting. Refresh and try again.' });
}

async function restoreRace(supabase, id, opts = {}) {
  const nowMs = opts.now || Date.now();
  const race = await readRace(supabase, id);
  if (!race) return res(404, { error: 'This race was already permanently removed.' });
  if (!('deleted_at' in race) || !('slug_before_delete' in race)) return res(500, { error: MIGRATION_MISSING });

  if (!race.deleted_at) {
    return res(200, { success: true, id, name: race.name, status: race.status, slug: race.slug, already: true, notes: [] });
  }
  if (nowMs > new Date(restoreUntil(race.deleted_at)).getTime()) {
    return res(410, { error: `The ${RECOVERY_DAYS}-day restore window for this race has ended.` });
  }

  const notes = [];
  let status = race.status_before_delete || 'draft';

  // Rule 1: a newer edition is live -> come back archived, not active.
  if (status === 'active') {
    const { data: liveChildren, error: cErr } = await supabase
      .from('races').select('id').eq('parent_race_id', id).eq('status', 'active').is('deleted_at', null);
    if (cErr) return res(500, { error: cErr.message });
    if (liveChildren && liveChildren.length) {
      status = 'archived';
      notes.push('newer_edition_live');
    }
  }

  const desiredSlug = race.slug_before_delete || String(race.slug || '').replace(DELETED_SLUG_RE, '') || null;
  let restored = null;
  let lastErr = null;
  for (let attempt = 0; attempt < 3 && !restored; attempt++) {
    const slug = await pickFreeSlug(supabase, desiredSlug, id);
    const { data: rows, error } = await supabase
      .from('races')
      .update({ status, slug, deleted_at: null, status_before_delete: null, slug_before_delete: null })
      .eq('id', id)
      .not('deleted_at', 'is', null)
      .select('*');
    if (error) {
      lastErr = error;
      if (error.code === '23505') continue; // slug taken between check and update: pick again
      return res(500, { error: error.message });
    }
    if (!rows || rows.length === 0) {
      // Restored by someone else a moment earlier, or purged.
      const now = await readRace(supabase, id);
      if (now && !now.deleted_at) {
        return res(200, { success: true, id, name: now.name, status: now.status, slug: now.slug, already: true, notes: [] });
      }
      return res(404, { error: 'This race was already permanently removed.' });
    }
    restored = rows[0];
  }
  if (!restored) return res(500, { error: lastErr ? lastErr.message : 'Restore failed' });

  if (desiredSlug && restored.slug !== desiredSlug) notes.push('slug_changed');

  // Rule 2: coming back active retires an active previous edition (same as publish).
  if (status === 'active' && race.parent_race_id) {
    const { data: retired, error: pErr } = await supabase
      .from('races')
      .update({ status: 'archived' })
      .eq('id', race.parent_race_id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .select('id');
    if (pErr) console.error(`restore ${id}: could not retire previous edition ${race.parent_race_id}: ${pErr.message}`);
    else if (retired && retired.length) notes.push('previous_edition_archived');
  }

  return res(200, {
    success: true, id, name: restored.name, status: restored.status, slug: restored.slug,
    previous_slug: desiredSlug, notes,
  });
}

async function purgeDeletedRaces(supabase, opts = {}) {
  const dryRun = !!opts.dryRun;
  const cutoff = new Date((opts.now || Date.now()) - RECOVERY_DAYS * DAY_MS).toISOString();
  const result = { purged: [], errors: [], dryRun };

  const { data: expired, error } = await supabase
    .from('races')
    .select('id, name, status, deleted_at')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff);
  if (error) throw new Error(`fetch deleted races failed: ${error.message}`);

  for (const race of expired || []) {
    if (race.status === 'active') {
      // Cannot happen through the app (delete sets 'draft'; edits are blocked while deleted).
      result.errors.push({ name: race.name, error: 'status is active; not removed' });
      continue;
    }
    if (dryRun) { result.purged.push({ name: race.name, deleted_at: race.deleted_at }); continue; }
    const { error: dErr } = await supabase
      .from('races')
      .delete()
      .eq('id', race.id)
      .not('deleted_at', 'is', null)
      .lt('deleted_at', cutoff)
      .neq('status', 'active');
    if (dErr) result.errors.push({ name: race.name, error: dErr.message });
    else result.purged.push({ name: race.name, deleted_at: race.deleted_at });
  }
  return result;
}

module.exports = {
  RECOVERY_DAYS, restoreUntil, placeholderSlug, isMissingColumnError,
  softDeleteRace, restoreRace, purgeDeletedRaces, MIGRATION_MISSING,
};
