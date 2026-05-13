// lib/seo/sitemap.js
//
// Renders the site's sitemap.xml dynamically: hard-coded canonical static pages +
// every visible+active race from Supabase. Per doc §19, the only field Google
// reliably uses is <lastmod>, so we derive it per URL from the best available
// signal (updated_at, race_date, created_at) and omit <changefreq>/<priority>.

const BASE_URL = 'https://whyracingevents.com';

// Static pages with their most-recent git commit dates (auto-update via build step
// later; for now these are the truthful values as of the current revision).
const STATIC_URLS = [
  { loc: `${BASE_URL}/`,                          lastmod: '2026-04-18' },
  { loc: `${BASE_URL}/pages/about.html`,          lastmod: '2026-02-25' },
  { loc: `${BASE_URL}/pages/training.html`,       lastmod: '2026-04-14' },
  { loc: `${BASE_URL}/pages/beneficiary.html`,    lastmod: '2026-02-25' },
  { loc: `${BASE_URL}/pages/volunteers.html`,     lastmod: '2026-02-25' },
  { loc: `${BASE_URL}/pages/locations.html`,      lastmod: '2026-04-14' },
  { loc: `${BASE_URL}/pages/partners.html`,       lastmod: '2026-04-14' },
  { loc: `${BASE_URL}/pages/community.html`,      lastmod: '2026-04-14' },
  { loc: `${BASE_URL}/pages/first-5k.html`,       lastmod: '2026-02-25' }
];

function escapeXml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function deriveLastmod(race) {
  // Prefer updated_at (most reflective of content edits). Fall back to created_at,
  // then race_date (better than nothing, gives Google a stable date for new races).
  const candidate = race.updated_at || race.created_at || race.race_date;
  if (!candidate) return new Date().toISOString().split('T')[0];
  return String(candidate).split('T')[0];
}

function renderSitemapXml(races) {
  const eventUrls = (races || [])
    .filter(r => r && r.slug && r.is_visible && r.status === 'active')
    .map(r => ({
      loc: `${BASE_URL}/events/${encodeURIComponent(r.slug)}`,
      lastmod: deriveLastmod(r)
    }));

  const all = [...STATIC_URLS, ...eventUrls];

  const urlEntries = all
    .map(u => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

module.exports = { renderSitemapXml };
