// lib/seo/events-index.js
//
// Server-rendered race calendar at /events. Plain HTML with an ItemList of every
// live race, so crawlers and AI fetchers that don't run JavaScript can reach each
// /events/{slug} page (the homepage calendar is built client-side). Uses the same
// chrome (nav, footer, CSS) as the event pages.

const {
  escapeHtml, escapeAttr, safeJsonLd, raceHost, formatRaceDate, buildDistanceText,
  navFragment, footerFragment, PAGE_STYLE, BASE_URL, BRAND
} = require('./event-page');

const CANONICAL = `${BASE_URL}/events`;
const TITLE = `PNW Race Calendar: Running, Trail & Triathlon Events | ${BRAND}`;
const DESCRIPTION = 'Upcoming running, trail and triathlon races in Washington and Oregon: 5K, 10K, half marathon, marathon, ultra and triathlon. Dates, locations and registration.';

function monthLabel(isoDate) {
  const [y, m] = String(isoDate || '').split('-').map(Number);
  if (!y || !m) return 'Date TBA';
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function safeExternalUrl(u) {
  if (!u) return '';
  const s = String(u).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return 'https://' + s;
  return '';
}

function raceItem(race) {
  const url = `/events/${encodeURIComponent(race.slug)}`;
  const location = [race.city, race.state].filter(Boolean).join(', ');
  // Same source as the homepage cards: the admin "distances" text, else distance rows.
  const distances = (typeof race.distances === 'string' && race.distances.trim()) || buildDistanceText(race);
  const host = raceHost(race);
  const partner = host && host.name !== BRAND ? host : null;
  const reg = race.registration_open ? safeExternalUrl(race.registration_url) : '';
  return `      <li class="race-item">
        <h3><a href="${escapeAttr(url)}">${escapeHtml(race.name)}</a></h3>
        <p class="race-meta"><time datetime="${escapeAttr(race.race_date || '')}">${escapeHtml(formatRaceDate(race.race_date))}</time>${location ? ` &middot; ${escapeHtml(location)}` : ''}</p>
        ${distances ? `<p class="race-distances">${escapeHtml(distances)}</p>` : ''}
        ${partner ? `<p class="race-host">Hosted by <a href="${escapeAttr(partner.url)}" target="_blank" rel="noopener">${escapeHtml(partner.name)}</a></p>` : ''}
        <p class="race-links"><a href="${escapeAttr(url)}">Race details</a>${reg ? ` <a class="race-register" href="${escapeAttr(reg)}" target="_blank" rel="noopener">Register</a>` : ''}</p>
      </li>`;
}

function renderEventsIndex(races) {
  const list = (races || []).filter(r => r && r.slug && r.name);

  const groups = [];
  for (const r of list) {
    const label = monthLabel(r.race_date);
    if (!groups.length || groups[groups.length - 1].label !== label) groups.push({ label, races: [] });
    groups[groups.length - 1].races.push(r);
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Upcoming races',
    url: CANONICAL,
    numberOfItems: list.length,
    itemListElement: list.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/events/${encodeURIComponent(r.slug)}`,
      name: r.name
    }))
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Events', item: CANONICAL }
    ]
  };

  const body = groups.length
    ? groups.map(g => `    <h2>${escapeHtml(g.label)}</h2>
    <ul class="race-list">
${g.races.map(raceItem).join('\n')}
    </ul>`).join('\n')
    : '    <p>No races are listed right now. Check back soon.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(TITLE)}</title>
  <meta name="description" content="${escapeAttr(DESCRIPTION)}">
  <link rel="canonical" href="${CANONICAL}">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${CANONICAL}">
  <meta property="og:title" content="${escapeAttr(TITLE)}">
  <meta property="og:description" content="${escapeAttr(DESCRIPTION)}">
  <meta property="og:image" content="${BASE_URL}/images/logos/new-why-racing-logo.png">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="en_US">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${CANONICAL}">
  <meta name="twitter:title" content="${escapeAttr(TITLE)}">
  <meta name="twitter:description" content="${escapeAttr(DESCRIPTION)}">
  <meta name="twitter:image" content="${BASE_URL}/images/logos/new-why-racing-logo.png">

  <script type="application/ld+json">${safeJsonLd(itemList)}</script>
  <script type="application/ld+json">${safeJsonLd(breadcrumb)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/brand.css?v=20261110.2">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>

  <style>
${PAGE_STYLE}    main.event-page ul.race-list { list-style: none; padding: 0; margin: 0; }
    main.event-page .race-item { padding: 16px 0; border-bottom: 1px solid #f0e9df; }
    main.event-page .race-item:last-child { border-bottom: 0; }
    main.event-page .race-item h3 { font-family: 'Fraunces', serif; font-size: 1.25rem; margin: 0 0 4px; }
    main.event-page .race-item h3 a { color: var(--charcoal, #2c2c2c); text-decoration: none; }
    main.event-page .race-item h3 a:hover { color: var(--brand-red, #c8102e); }
    main.event-page .race-item p { margin: 2px 0; }
    main.event-page .race-meta { font-weight: 600; color: var(--slate, #5a5a6e); }
    main.event-page .race-host { font-size: 0.9rem; color: var(--slate, #5a5a6e); }
    main.event-page .race-host a { color: inherit; }
    main.event-page .race-links { margin-top: 8px !important; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
    main.event-page .race-links a { color: var(--brand-red, #c8102e); font-weight: 600; text-decoration: none; }
    main.event-page .race-links a.race-register { background: var(--brand-red, #c8102e); color: #fff; padding: 6px 14px; border-radius: 6px; }
  </style>
  <script src="/assets/js/analytics.js" defer></script>
</head>
<body>
  ${navFragment()}
  <main class="event-page" id="main-content">
    <nav aria-label="Breadcrumb" class="breadcrumbs">
      <a href="/">Home</a> &rsaquo; <span>Events</span>
    </nav>
    <h1>Upcoming Races</h1>
    <p class="bluf">${list.length} upcoming running, trail and triathlon events in Washington and Oregon, from 5Ks to ultras.</p>
${body}
  </main>
  ${footerFragment()}
  <script defer src="/assets/js/nav.js"></script>
</body>
</html>`;
}

module.exports = { renderEventsIndex };
