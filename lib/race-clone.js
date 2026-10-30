// lib/race-clone.js
//
// "Renew" past races instead of hiding them.
//
// Old behavior: when a race date passed, the cron flipped status active -> draft,
// which removed it from the public calendar.
//
// New behavior (this module):
//   - The past race STAYS active (still shown on the calendar).
//   - A full DRAFT clone is created for next year (deep copy of the race row + all
//     child tables). Calendar dates are shifted +1 year as a provisional placeholder
//     (race_date is NOT NULL, so it can't be blank); time-of-day values (start
//     times) are preserved since they rarely change year to year. The director
//     finalizes the exact date on publish.
//   - The clone's parent_race_id points back to the edition it came from. This is
//     the dedupe key (cron skips a race that already has a child draft) and the
//     link used to retire the prior edition when the clone is published.
//
// Pure data layer: callers pass in a Supabase client (service-role). No Express,
// so the standalone Vercel cron can require this without a heavy cold start.

const CHILD_TABLES = [
  { table: 'race_content',                   clearCols: ['arrival_time'],        shiftCols: [] },
  { table: 'race_distances',                 clearCols: ['start_time'],          shiftCols: [] },
  { table: 'pricing_tiers',                  clearCols: ['start_date', 'end_date'], shiftCols: [] },
  { table: 'race_faqs',                      clearCols: [],                      shiftCols: [] },
  { table: 'race_policies',                  clearCols: [],                      shiftCols: [] },
  { table: 'race_sponsors',                  clearCols: [],                      shiftCols: [] },
  { table: 'race_beneficiaries',             clearCols: [],                      shiftCols: [] },
  { table: 'packet_pickup_locations',        clearCols: [],                      shiftCols: ['pickup_date'] },
  { table: 'award_categories',               clearCols: [],                      shiftCols: [] },
  { table: 'course_records',                 clearCols: [],                      shiftCols: [] },
  { table: 'spectator_locations',            clearCols: [],                      shiftCols: [] },
  { table: 'race_accommodations',            clearCols: [],                      shiftCols: [] },
  { table: 'race_restaurants',               clearCols: [],                      shiftCols: [] },
  { table: 'multisport_details',             clearCols: [],                      shiftCols: [] },
  { table: 'themed_event_content',           clearCols: [],                      shiftCols: [] },
  { table: 'what_to_bring_items',            clearCols: [],                      shiftCols: [] },
  { table: 'course_amenities',               clearCols: [],                      shiftCols: [] },
  { table: 'race_photos',                    clearCols: [],                      shiftCols: [] },
  { table: 'event_start_times',              clearCols: [],                      shiftCols: [] },
  { table: 'special_participant_categories', clearCols: [],                      shiftCols: [] },
];

const CHILD_STRIP = ['id', 'race_id', 'created_at', 'updated_at', 'inserted_at'];
const RACE_STRIP = ['id', 'created_at', 'updated_at', 'inserted_at', 'deleted_at', 'status_before_delete',
  'slug_before_delete', 'renewed_for_date', 'parent_race_id'];

function stripKeys(row, keys) {
  const out = { ...row };
  for (const k of keys) delete out[k];
  return out;
}

function nullKeys(row, keys) {
  for (const k of keys) if (k in row) row[k] = null;
  return row;
}

function addOneYear(dateStr) {
  if (!dateStr) return dateStr;
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const d = new Date(Date.UTC(parseInt(m[1], 10) + 1, parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function shiftKeys(row, keys) {
  for (const k of keys) if (k in row && row[k] != null) row[k] = addOneYear(row[k]);
  return row;
}

function baseSlug(slug) {
  return String(slug || '').replace(/-20\d\d$/, '');
}

function yearFromDate(isoDate) {
  const y = parseInt(String(isoDate || '').slice(0, 4), 10);
  return Number.isFinite(y) ? y : new Date().getUTCFullYear();
}

async function pickCloneSlug(supabase, parentSlug, nextYear) {
  const base = baseSlug(parentSlug);
  let candidate = `${base}-${nextYear}`;
  for (let n = 2; n <= 20; n++) {
    const { data, error } = await supabase
      .from('races').select('id').eq('slug', candidate).maybeSingle();
    if (error) throw new Error(`slug check failed: ${error.message}`);
    if (!data) return candidate;
    candidate = `${base}-${nextYear}-v${n}`;
  }
  return `${base}-${nextYear}-${Date.now()}`;
}

async function cloneRaceForNextYear(supabase, parentRaceId, opts = {}) {
  const warnings = [];
  const { data: parent, error: pErr } = await supabase
    .from('races').select('*').eq('id', parentRaceId).single();
  if (pErr || !parent) throw new Error(`load parent race failed: ${pErr ? pErr.message : 'not found'}`);

  const nextYear = yearFromDate(parent.race_date) + 1;
  const slug = await pickCloneSlug(supabase, parent.slug, nextYear);
  const newRaceDate = addOneYear(parent.race_date);

  const cloneRace = stripKeys(parent, RACE_STRIP);
  cloneRace.race_date = newRaceDate;
  cloneRace.race_time = null;
  cloneRace.slug = slug;
  cloneRace.status = 'draft';
  cloneRace.is_featured = false;
  cloneRace.registration_open = false;
  cloneRace.parent_race_id = parentRaceId;

  const childCounts = {};

  if (opts.dryRun) {
    for (const { table } of CHILD_TABLES) {
      const { count } = await supabase
        .from(table).select('id', { count: 'exact', head: true }).eq('race_id', parentRaceId);
      if (count) childCounts[table] = count;
    }
    return { newRaceId: null, slug, raceDate: newRaceDate, childCounts, warnings, dryRun: true };
  }

  const { data: inserted, error: insErr } = await supabase
    .from('races').insert(cloneRace).select('id').single();
  if (insErr || !inserted) throw new Error(`insert clone race failed: ${insErr ? insErr.message : 'no row'}`);
  const newRaceId = inserted.id;

  // Distances first, one at a time, so every old distance id maps to its copy.
  // Rows in other tables that point at a distance (start times, pricing tiers,
  // course records, amenities) are re-pointed to the copy; otherwise they would
  // keep pointing at the parent's distance and be cascade-deleted with it.
  const distanceIdMap = {};
  {
    const { data: dists, error: dErr } = await supabase
      .from('race_distances').select('*').eq('race_id', parentRaceId).order('sort_order');
    if (dErr) warnings.push(`race_distances: read failed (${dErr.message})`);
    let copied = 0;
    for (const d of dists || []) {
      const copy = stripKeys(d, CHILD_STRIP);
      nullKeys(copy, ['start_time']);
      copy.race_id = newRaceId;
      const { data: ins, error: iErr } = await supabase.from('race_distances').insert(copy).select('id').single();
      if (iErr || !ins) { warnings.push(`race_distances: insert failed (${iErr ? iErr.message : 'no row'})`); continue; }
      distanceIdMap[d.id] = ins.id;
      copied++;
    }
    if (copied) childCounts.race_distances = copied;
  }

  for (const { table, clearCols, shiftCols } of CHILD_TABLES) {
    if (table === 'race_distances') continue; // done above
    const { data: rows, error: selErr } = await supabase
      .from(table).select('*').eq('race_id', parentRaceId);
    if (selErr) { warnings.push(`${table}: read failed (${selErr.message})`); continue; }
    if (!rows || rows.length === 0) continue;

    const payload = rows.map(r => {
      const copy = stripKeys(r, CHILD_STRIP);
      nullKeys(copy, clearCols);
      shiftKeys(copy, shiftCols);
      copy.race_id = newRaceId;
      if (copy.distance_id) copy.distance_id = distanceIdMap[copy.distance_id] || null;
      return copy;
    });

    const { error: cInsErr } = await supabase.from(table).insert(payload);
    if (cInsErr) { warnings.push(`${table}: insert ${payload.length} failed (${cInsErr.message})`); continue; }
    childCounts[table] = payload.length;
  }

  return { newRaceId, slug, raceDate: newRaceDate, childCounts, warnings };
}

// One next-year draft per race per race_date.
//   - races.renewed_for_date records the race_date a draft was already made for.
//   - Deleting that draft never brings it back (the date is still marked).
//   - Changing the race's date (a new edition) makes it eligible again once
//     the new date passes.
// The mark is set with a conditional update before cloning, so two overlapping
// runs cannot both clone the same race. If cloning fails the mark is reverted
// and the race is retried on the next run.
async function renewPastRaces(supabase, opts = {}) {
  const dryRun = !!opts.dryRun;
  const today = opts.today || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());

  const { data: pastRaces, error: fetchErr } = await supabase
    .from('races')
    .select('id, name, race_date, slug, renewed_for_date')
    .eq('status', 'active')
    .is('deleted_at', null)
    .lt('race_date', today);
  if (fetchErr) throw new Error(`fetch past races failed: ${fetchErr.message}`);

  const result = { renewed: [], skipped: [], errors: [], dryRun };
  if (!pastRaces || pastRaces.length === 0) return result;

  for (const race of pastRaces) {
    if (race.renewed_for_date === race.race_date) {
      result.skipped.push({ name: race.name, reason: `already renewed for ${race.race_date}` });
      continue;
    }
    if (dryRun) {
      try {
        const cloned = await cloneRaceForNextYear(supabase, race.id, { dryRun: true });
        result.renewed.push({ name: race.name, from: race.race_date, draftSlug: cloned.slug, draftDate: cloned.raceDate, childCounts: cloned.childCounts, warnings: [] });
      } catch (err) {
        result.errors.push({ name: race.name, error: err.message });
      }
      continue;
    }

    // Claim (compare-and-swap): mark this race_date as renewed, only if the race is
    // still active, not deleted, has the same date, and its mark is still the value
    // we read. A plain eq/is filter is used on purpose: PostgREST re-applies or()
    // filters to the returned rows, which would hide a successful update.
    const prevMark = race.renewed_for_date || null;
    let claimQuery = supabase
      .from('races')
      .update({ renewed_for_date: race.race_date })
      .eq('id', race.id)
      .eq('status', 'active')
      .eq('race_date', race.race_date)
      .is('deleted_at', null);
    claimQuery = prevMark === null ? claimQuery.is('renewed_for_date', null) : claimQuery.eq('renewed_for_date', prevMark);
    const { data: claimed, error: claimErr } = await claimQuery.select('id');
    if (claimErr) { result.errors.push({ name: race.name, error: `claim failed: ${claimErr.message}` }); continue; }
    if (!claimed || claimed.length === 0) {
      result.skipped.push({ name: race.name, reason: 'changed or claimed by another run' });
      continue;
    }

    const unclaim = async () => {
      await supabase.from('races').update({ renewed_for_date: prevMark })
        .eq('id', race.id).eq('renewed_for_date', race.race_date);
    };

    try {
      const cloned = await cloneRaceForNextYear(supabase, race.id, { dryRun: false });

      // If the race was deleted while it was being cloned, undo the clone.
      const { data: after } = await supabase
        .from('races').select('status, deleted_at').eq('id', race.id).maybeSingle();
      if (!after || after.deleted_at || after.status !== 'active') {
        await supabase.from('races').delete().eq('id', cloned.newRaceId);
        await unclaim();
        result.skipped.push({ name: race.name, reason: 'deleted or unpublished during renew; draft removed' });
        continue;
      }

      result.renewed.push({
        name: race.name, from: race.race_date, draftSlug: cloned.slug,
        draftDate: cloned.raceDate, childCounts: cloned.childCounts, warnings: cloned.warnings,
      });
    } catch (err) {
      await unclaim();
      result.errors.push({ name: race.name, error: err.message });
    }
  }
  return result;
}

module.exports = { renewPastRaces, cloneRaceForNextYear, addOneYear, CHILD_TABLES };
