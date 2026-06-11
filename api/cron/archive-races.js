// Cron: renew past races (do NOT hide them).
//
// When a race date passes, the past edition STAYS active (still shown on the
// public calendar). This job creates a full DRAFT clone for next year (deep copy
// of the race + all child tables, with date/time fields cleared). The clone is
// linked to its parent via parent_race_id, which also dedupes repeat runs — a race
// that already has a next-year draft is skipped. When the draft is later published
// (status -> active), server.js retires the prior edition.
//
// Standalone Vercel serverless function — does not load the full Express bundle,
// so cold-start is faster than routing through server.js.
//
// Schedule defined in vercel.json `crons`. Auth: Bearer ${CRON_SECRET}.

const { createClient } = require('@supabase/supabase-js');
const { renewPastRaces } = require('../../lib/race-clone');

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

  try {
    const result = await renewPastRaces(supabase, { dryRun });

    console.log(`[cron renew-races]${dryRun ? ' (dry-run)' : ''} renewed=${result.renewed.length} skipped=${result.skipped.length} errors=${result.errors.length}`);
    if (result.renewed.length) {
      console.log('  renewed:', result.renewed.map(r => `${r.name} -> ${r.draftSlug}`).join(', '));
    }
    if (result.errors.length) {
      console.error('  errors:', result.errors.map(e => `${e.name}: ${e.error}`).join(' | '));
    }

    return res.status(200).json({
      success: true,
      dryRun,
      renewed: result.renewed.length,
      skipped: result.skipped.length,
      errors: result.errors.length,
      details: result,
    });
  } catch (err) {
    console.error('[cron renew-races] fatal:', err);
    return res.status(500).json({ error: 'Cron failed', details: err.message });
  }
};
