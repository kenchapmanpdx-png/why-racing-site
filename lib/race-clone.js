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
const RACE_STRIP = ['id', 'created_at', 'updated_at', 'inserted_at', 'deleted_at', 'parent_race_id'];

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

  for (const { table, clearCols, shiftCols } of CHILD_TABLES) {
    const { data: rows, error: selErr } = await supabase
      .from(table).select('*').eq('race_id', parentRaceId);
    if (selErr) { warnings.push(`${table}: read failed (${selErr.message})`); continue; }
    if (!rows || rows.length === 0) continue;

    const payload = rows.map(r => {
      const copy = stripKeys(r, CHILD_STRIP);
      nullKeys(copy, clearCols);
      shiftKeys(copy, shiftCols);
      copy.race_id = newRaceId;
      return copy;
    });

    const { error: cInsErr } = await supabase.from(table).insert(payload);
    if (cInsErr) { warnings.push(`${table}: insert ${payload.length} failed (${cInsErr.message})`); continue; }
    childCounts[table] = payload.length;
  }

  return { newRaceId, slug, raceDate: newRaceDate, childCounts, warnings };
}

async function renewPastRaces(supabase, opts = {}) {
  const dryRun = !!opts.dryRun;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());

  const { data: pastRaces, error: fetchErr } = await supabase
    .from('races')
    .select('id, name, race_date, slug')
    .eq('status', 'active')
    .lt('race_date', today);
  if (fetchErr) throw new Error(`fetch past races failed: ${fetchErr.message}`);

  const result = { renewed: [], skipped: [], errors: [], dryRun };
  if (!pastRaces || pastRaces.length === 0) return result;

  for (const race of pastRaces) {
    try {
      const { data: existing, error: exErr } = await supabase
        .from('races').select('id, slug').eq('parent_race_id', race.id).maybeSingle();
      if (exErr) throw new Error(`dedupe check failed: ${exErr.message}`);
      if (existing) {
        result.skipped.push({ name: race.name, reason: 'already renewed', draftSlug: existing.slug });
        continue;
      }
      const cloned = await cloneRaceForNextYear(supabase, race.id, { dryRun });
      result.renewed.push({
        name: race.name, from: race.race_date, draftSlug: cloned.slug,
        draftDate: cloned.raceDate, childCounts: cloned.childCounts, warnings: cloned.warnings,
      });
    } catch (err) {
      result.errors.push({ name: race.name, error: err.message });
    }
  }
  return result;
}

module.exports = { renewPastRaces, cloneRaceForNextYear, addOneYear, CHILD_TABLES };
