// Cron: renew past races (do NOT hide them).
//
// When a race date passes, the past edition STAYS active (still shown on the
// public calendar). This job creates a full DRAFT clone for next year (deep copy
// of the race + all child tables, with date/time fields cleared). The clone is
// linked to its parent via parent_race_id. Dedupe: races.renewed_for_date records
// the race_date a draft was made for, so each race gets at most one draft per
// race_date (deleting the draft does not bring it back). When the draft is later
// published (status -> active), server.js retires the prior edition.
//
// Second step: permanently remove races deleted more than 30 days ago
// (lib/race-trash.js). Runs after renew and cannot affect it.
//
// Standalone Vercel serverless function — does not load the full Express bundle,
// so cold-start is faster than routing through server.js.
//
// Schedule defined in vercel.json `crons`. Auth: Bearer ${CRON_SECRET}.

const { createClient } = require('@supabase/supabase-js');
const { renewPastRaces } = require('../../lib/race-clone');
const { purgeDeletedRaces } = require('../../lib/race-trash');

module.exports = async function handler(req, res) {
  // Auth — Vercel cron sends a Bearer token in the Authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('[cron renew-races] Missing Supabase credentials');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Optional dry-run for safe manual testing: /api/cron/archive-races?dryRun=1
  const dryRun = req.query && (req.query.dryRun === '1' || req.query.dryRun === 'true');

  // Step 1: renew. Step 2: purge. Each runs even if the other fails.
  let result = null;
  let renewError = null;
  try {
    result = await renewPastRaces(supabase, { dryRun });
    console.log(`[cron renew-races]${dryRun ? ' (dry-run)' : ''} renewed=${result.renewed.length} skipped=${result.skipped.length} errors=${result.errors.length}`);
    if (result.renewed.length) {
      console.log('  renewed:', result.renewed.map(r => `${r.name} -> ${r.draftSlug}`).join(', '));
    }
    if (result.errors.length) {
      console.error('  errors:', result.errors.map(e => `${e.name}: ${e.error}`).join(' | '));
    }
  } catch (err) {
    renewError = err.message;
    console.error('[cron renew-races] failed:', err.message);
  }

  // Permanently remove races deleted more than 30 days ago (lib/race-trash.js).
  let purge = null;
  let purgeError = null;
  try {
    purge = await purgeDeletedRaces(supabase, { dryRun });
    console.log(`[cron purge-deleted]${dryRun ? ' (dry-run)' : ''} purged=${purge.purged.length} errors=${purge.errors.length}`);
    if (purge.purged.length) console.log('  purged:', purge.purged.map(r => r.name).join(', '));
    if (purge.errors.length) console.error('  purge errors:', purge.errors.map(e => `${e.name}: ${e.error}`).join(' | '));
  } catch (err) {
    purgeError = err.message;
    console.error('[cron purge-deleted] failed:', err.message);
  }

  const failed = !!(renewError || purgeError);
  return res.status(failed ? 500 : 200).json({
    success: !failed,
    dryRun,
    renewed: result ? result.renewed.length : 0,
    skipped: result ? result.skipped.length : 0,
    errors: result ? result.errors.length : 0,
    details: result,
    renewError,
    purge,
    purgeError,
  });
};
