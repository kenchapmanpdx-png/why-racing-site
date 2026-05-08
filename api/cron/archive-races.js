// Cron: archive past races to draft status (so they can be reused next year).
// Standalone Vercel serverless function — does not load the full Express bundle,
// so cold-start is faster than routing through server.js.
//
// Schedule defined in vercel.json `crons`. Auth: Bearer ${CRON_SECRET}.

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Auth — Vercel cron sends a Bearer token in the Authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('[cron archive-races] Missing Supabase credentials');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Use Pacific time for the date boundary — races are PNW events and the cron
    // runs at midnight UTC (= 4-5pm Pacific). Using UTC would archive same-day
    // races mid-afternoon.
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());

    const { data: pastRaces, error: fetchError } = await supabase
      .from('races')
      .select('id, name, race_date')
      .eq('status', 'active')
      .lt('race_date', today);

    if (fetchError) {
      console.error('[cron archive-races] fetch error:', fetchError);
      return res.status(500).json({ error: 'Fetch failed', details: fetchError.message });
    }

    if (!pastRaces || pastRaces.length === 0) {
      return res.status(200).json({ success: true, archived: 0 });
    }

    const { error: updateError } = await supabase
      .from('races')
      .update({ status: 'draft' })
      .eq('status', 'active')
      .lt('race_date', today);

    if (updateError) {
      console.error('[cron archive-races] update error:', updateError);
      return res.status(500).json({ error: 'Update failed', details: updateError.message });
    }

    console.log(`[cron archive-races] Archived ${pastRaces.length} race(s):`,
      pastRaces.map(r => `${r.name} (${r.race_date})`).join(', '));

    return res.status(200).json({
      success: true,
      archived: pastRaces.length,
      races: pastRaces.map(r => ({ name: r.name, date: r.race_date }))
    });
  } catch (err) {
    console.error('[cron archive-races] fatal:', err);
    return res.status(500).json({ error: 'Cron failed', details: err.message });
  }
};
