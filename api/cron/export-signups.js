// Cron: export new email signups since last run, email as CSV via Postmark.
// Standalone Vercel serverless function — avoids loading the full Express
// bundle so cold-start is faster than routing through server.js.
//
// Schedule defined in vercel.json `crons`. Auth: Bearer ${CRON_SECRET}.

const { createClient } = require('@supabase/supabase-js');
const { ServerClient } = require('postmark');

// CSV cell sanitization — quote-escape and prefix any cell starting with =, +, -,
// @, tab, or carriage return so spreadsheet apps don't interpret it as a formula.
function sanitizeCSVCell(value) {
  if (value === null || value === undefined) return '';
  const trimmed = String(value).trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed.replace(/"/g, '""');
}

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const postmarkToken = process.env.POSTMARK_API_TOKEN;
  const fromEmail = process.env.SIGNUP_EXPORT_FROM;
  // Recipient pinned to info@whyracingevents.com (per Ken, 2026-06-10 —
  // newsletter signups should go to info@). Previously brock@whyracingevents.com.
  // Hardcoded to stay independent of Vercel env state. Change this string to redirect.
  const toEmail = 'info@whyracingevents.com';

  if (!supabaseUrl || !supabaseKey) {
    console.error('[cron export-signups] Missing Supabase credentials');
    return res.status(500).json({ error: 'Supabase config missing' });
  }
  if (!postmarkToken) {
    console.error('[cron export-signups] Missing POSTMARK_API_TOKEN');
    return res.status(500).json({ error: 'Postmark config missing' });
  }
  if (!fromEmail) {
    console.error('[cron export-signups] Missing SIGNUP_EXPORT_FROM env var (sender email, must be Postmark-verified)');
    return res.status(500).json({ error: 'Sender email not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const postmark = new ServerClient(postmarkToken);

  try {
    const snapshotTime = new Date().toISOString();

    // Fetch unexported signups — include id so we can update by exact IDs to
    // avoid a race window between the select filter and the later update filter.
    const { data: signups, error: fetchError } = await supabase
      .from('email_signups')
      .select('id, email, first_name, last_name, source, created_at')
      .eq('exported', false)
      .lte('created_at', snapshotTime)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[cron export-signups] fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch signups' });
    }

    if (!signups || signups.length === 0) {
      return res.status(200).json({ message: 'No new signups', count: 0 });
    }

    // Generate CSV
    const csvHeader = 'Email,First Name,Last Name,Source,Signed Up';
    const csvRows = signups.map(s => {
      const createdAt = new Date(s.created_at).toLocaleDateString('en-US');
      return [
        sanitizeCSVCell(s.email),
        sanitizeCSVCell(s.first_name || ''),
        sanitizeCSVCell(s.last_name || ''),
        sanitizeCSVCell(s.source || ''),
        createdAt,
      ].map(cell => `"${cell}"`).join(',');
    });
    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Postmark email size guard (10 MB total, leave room for headers)
    const csvSizeBytes = Buffer.byteLength(csvContent, 'utf8');
    if (csvSizeBytes > 9 * 1024 * 1024) {
      await postmark.sendEmail({
        From: fromEmail,
        To: toEmail,
        Subject: `⚠️ Signup Export Too Large — ${signups.length} signups`,
        TextBody: `The weekly signup export has ${signups.length} new signups and the CSV is too large to email. Please export manually from Supabase.`,
      });
      return res.status(400).json({ error: 'CSV too large to email', count: signups.length });
    }

    const today = new Date().toLocaleDateString('en-US');
    await postmark.sendEmail({
      From: fromEmail,
      To: toEmail,
      Subject: `New Email Signups — ${today} (${signups.length} new)`,
      TextBody: `Attached is a CSV with ${signups.length} new email signup(s) since the last export.\n\nHave a great day!`,
      Attachments: [
        {
          Name: `email-signups-${new Date().toISOString().split('T')[0]}.csv`,
          Content: Buffer.from(csvContent).toString('base64'),
          ContentType: 'text/csv',
        },
      ],
    });

    // Mark exactly the rows we emailed as exported — update by ID so any rows
    // that arrived after snapshotTime aren't silently skipped.
    const exportedIds = signups.map(s => s.id);
    const { error: updateError } = await supabase
      .from('email_signups')
      .update({ exported: true, exported_at: new Date().toISOString() })
      .in('id', exportedIds);

    if (updateError) {
      console.error('[cron export-signups] failed to mark rows exported AFTER email sent:', updateError);
      // Email already delivered. Return 500 so Vercel logs the failure rather
      // than silently continuing. Next run will re-export until resolved.
      return res.status(500).json({ error: 'Email sent but failed to mark rows exported', details: updateError.message });
    }

    return res.status(200).json({ success: true, count: signups.length });
  } catch (err) {
    console.error('[cron export-signups] fatal:', err);
    return res.status(500).json({ error: 'Export failed', details: err.message });
  }
};
