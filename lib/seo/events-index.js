// lib/seo/events-index.js
//
// Server-rendered race calendar at /events. Plain HTML with an ItemList of every
// live race, so crawlers and AI fetchers that don't run JavaScript can reach each
// /events/{slug} page (the homepage calendar is built client-side). Uses the same
// chrome (nav, footer, CSS) as the event pages.
//
// Each race is drawn as the homepage race card (index.html createDynamicRaceCard):
// photo, date, title, distances, location, logo and the register button. The card
// is rendered here on the server, so every link is in the HTML without JavaScript.

const {
  escapeHtml, escapeAttr, safeJsonLd, raceHost, formatRaceDate, buildDistanceText,
  optimizedSrc, optimizedSrcset,
  navFragment, footerFragment, PAGE_STYLE, BASE_URL, BRAND
} = require('./event-page');

const CANONICAL = `${BASE_URL}/events`;
const TITLE = `PNW Race Calendar: Running, Trail & Triathlon | ${BRAND}`;
const DESCRIPTION = 'Upcoming running, trail and triathlon races in Washington and Oregon: 5K, 10K, half marathon, marathon and ultra. Dates, locations and registration.';

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

// Same fallback photo as the homepage cards.
const CARD_FALLBACK_IMAGE = '/images/action/hagg-lake-run.jpg';

// Site-hosted images are stored without a leading slash ("images/logos/x.png");
// make them root-relative so they resolve from /events.
function sitePath(u) {
  const s = String(u || '').trim();
  if (!s) return '';
  if (/^(?:https?:)?\/\//i.test(s)) return s;
  return '/' + s.replace(/^\/+/, '');
}

// "Sat, November 21, 2026": the homepage card date plus the weekday.
function cardDate(isoDate) {
  const [y, m, d] = String(isoDate || '').split('-').map(Number);
  if (!y || !m || !d) return formatRaceDate(isoDate) || 'Date TBA';
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Card photo: optimized WebP, original URL if the optimizer fails. The first
// three load eagerly (top of the page), the rest lazily.
function cardImageTag(race, index) {
  const src = sitePath(race.thumbnail_url || race.hero_image_url) || CARD_FALLBACK_IMAGE;
  const srcset = optimizedSrcset(src, [384, 640, 828]);
  return '<img ' + [
    `src="${escapeAttr(optimizedSrc(src, 640))}"`,
    srcset ? `srcset="${escapeAttr(srcset)}" sizes="(max-width: 768px) 90vw, 380px" data-orig="${escapeAttr(src)}" onerror="this.onerror=null;this.removeAttribute('srcset');this.src=this.dataset.orig"` : '',
    `alt="${escapeAttr(race.name)}"`,
    index < 3 ? 'loading="eager"' : 'loading="lazy"',
    index === 0 ? 'fetchpriority="high"' : 'decoding="async"',
    /bigfoot/i.test(race.name) ? 'style="object-position: center 25%"' : ''
  ].filter(Boolean).join(' ') + '>';
}

// Race logo: optimized, then the original, then hidden (no broken-image icon).
function cardLogoTag(race) {
  const src = sitePath(race.logo_url);
  if (!src) return '';
  const opt = optimizedSrc(src, 384);
  const alt = `alt="${escapeAttr(race.name)} logo" class="card-logo" loading="lazy" decoding="async"`;
  return opt !== src
    ? `<img src="${escapeAttr(opt)}" data-orig="${escapeAttr(src)}" onerror="this.onerror=function(){this.style.display='none'};this.src=this.dataset.orig" ${alt}>`
    : `<img src="${escapeAttr(src)}" onerror="this.onerror=null;this.style.display='none'" ${alt}>`;
}

// One grid cell. `month` is set on the first race of each month: its <h2> sits
// above that card, so the cards run as one continuous grid.
function raceCard(race, index, month) {
  const url = `/events/${encodeURIComponent(race.slug)}`;
  const location = [race.city, race.state].filter(Boolean).join(', ');
  // Same source as the homepage cards: the admin "distances" text, else distance rows.
  const distances = (typeof race.distances === 'string' && race.distances.trim()) || buildDistanceText(race);
  const host = raceHost(race);
  const partner = host && host.name !== BRAND ? host : null;
  const reg = race.registration_open ? safeExternalUrl(race.registration_url) : '';
  // Photo link, as on the homepage: the info page when the race has one, else
  // registration while it is open. The title links to the race's own event page.
  const photoUrl = race.instructions_pdf_url ? safeExternalUrl(race.instructions_pdf_url) : reg;
  const photo = cardImageTag(race, index);
  const ribbon = /girlfriend/i.test(race.name)
    ? ' <i class="fas fa-ribbon" style="color: #ff69b4;" title="Breast Cancer Awareness" aria-hidden="true"></i>'
    : '';
  const date = race.race_date
    ? `<time datetime="${escapeAttr(race.race_date)}">${escapeHtml(cardDate(race.race_date))}</time>`
    : 'Date TBA';
  const logo = cardLogoTag(race);
  const meta = [
    distances ? `<span><i class="fas fa-route" aria-hidden="true"></i> ${escapeHtml(distances)}</span>` : '',
    location ? `<span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(location)}</span>` : ''
  ].filter(Boolean);
  const lines = [
    '<li class="event-cell">',
    month ? `  <h2 class="month-label">${escapeHtml(month)}</h2>` : '',
    '  <div class="event-card">',
    photoUrl
      ? `    <a class="card-img-container" href="${escapeAttr(photoUrl)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${photo}</a>`
      : `    <div class="card-img-container">${photo}</div>`,
    '    <div class="card-body">',
    '      <div>',
    `        <span class="card-date">${date}</span>`,
    `        <h3 class="card-title"><a href="${escapeAttr(url)}">${escapeHtml(race.name)}</a>${ribbon}</h3>`,
    '      </div>',
    '      <div class="card-foot">',
    meta.length || logo ? `        <div class="card-meta-row"><div class="card-meta">${meta.join('')}</div>${logo}</div>` : '',
    partner ? `        <p class="card-host">Hosted by <a href="${escapeAttr(partner.url)}" target="_blank" rel="noopener">${escapeHtml(partner.name)}</a></p>` : '',
    reg
      ? `        <a class="card-cta" href="${escapeAttr(reg)}" target="_blank" rel="noopener">Register Now &amp; Event Details</a>`
      : '        <span class="card-cta card-cta-disabled">Coming Soon</span>',
    `        <a class="card-details" href="${escapeAttr(url)}">Race details</a>`,
    '      </div>',
    '    </div>',
    '  </div>',
    '</li>'
  ];
  return lines.filter(Boolean).map(l => '        ' + l).join('\n');
}

// Homepage calendar look (index.html: .calendar-intro, .event-grid, .event-card),
// scoped to this page. Loaded after PAGE_STYLE so it wins over the
// event-page text styles.
const CARD_STYLE = `    main.events-index { max-width: none; padding: 0; }
    main.events-index + footer { margin-top: 0; }
    main.events-index .calendar-intro { padding: 32px 5% 40px; text-align: center; }
    main.events-index nav.breadcrumbs { max-width: 1200px; margin: 0 auto 32px; text-align: left; }
    main.events-index h1 { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 3rem; text-transform: uppercase; letter-spacing: 1px; line-height: 1.15; margin: 0 0 15px; color: #000; }
    main.events-index .bluf { max-width: 700px; margin: 0 auto; color: #666; font-size: 1.1rem; }
    main.events-index .calendar-grid { background: var(--grey, #f4f4f4); padding: 30px 5% 80px; }
    main.events-index ul.event-grid { list-style: none; padding: 0; margin: 0 auto; max-width: 1200px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
    main.events-index .event-cell { position: relative; display: flex; flex-direction: column; padding-top: 58px; min-width: 0; }
    main.events-index .month-label { position: absolute; top: 0; left: 0; right: 0; height: 58px; display: flex; align-items: center; gap: 12px; margin: 0; padding: 0 0 4px; border: 0; font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 1.5rem; font-style: italic; text-transform: uppercase; letter-spacing: 1px; line-height: 1.15; color: #000; white-space: nowrap; }
    main.events-index .month-label::before { content: ''; flex: 0 0 4px; height: 24px; background: var(--brand-red, #E31837); border-radius: 2px; }
    main.events-index .month-label::after { content: ''; flex: 1; height: 1px; background: #d4d4d4; }
    main.events-index .event-card { flex: 1; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), border-color 0.4s; position: relative; border: 1px solid #eee; display: flex; flex-direction: column; }
    main.events-index .event-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), inset 0 -3px 0 var(--brand-red, #E31837); border-bottom-color: var(--brand-red, #E31837); }
    main.events-index .card-img-container { display: block; height: 200px; position: relative; overflow: hidden; background: #e2e8f0; }
    main.events-index .card-img-container img { width: 100%; height: 100%; object-fit: cover; display: block; }
    main.events-index .card-body { padding: 25px; flex: 1; display: flex; flex-direction: column; }
    main.events-index .card-date { display: block; color: #767676; font-weight: 600; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; }
    main.events-index .card-title { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 1.6rem; line-height: 1.1; font-style: italic; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px; color: #000; }
    main.events-index .card-title a { color: inherit; text-decoration: none; }
    main.events-index .card-title a:hover { color: var(--brand-red, #E31837); }
    main.events-index .card-foot { margin-top: auto; }
    main.events-index .card-meta-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 15px; padding-top: 15px; border-top: 1px solid #eee; }
    main.events-index .card-meta { display: flex; gap: 15px; flex-wrap: wrap; min-width: 0; }
    main.events-index .card-meta span { display: flex; align-items: center; gap: 6px; font-size: 13px; line-height: 1.4; color: #555; font-weight: 600; }
    main.events-index .card-meta i { color: var(--brand-red, #E31837); }
    main.events-index .card-logo { height: 60px; width: auto; max-width: 120px; object-fit: contain; flex-shrink: 0; }
    main.events-index .card-host { margin: -5px 0 15px; font-size: 13px; color: #555; }
    main.events-index .card-host a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
    main.events-index .card-cta { display: flex; align-items: center; justify-content: center; width: 100%; padding: 14px; background: var(--brand-red, #E31837); color: #fff; font-size: 13px; font-weight: 700; line-height: 1.3; text-transform: uppercase; text-align: center; text-decoration: none; border-radius: 6px; transition: background-color 0.3s; }
    main.events-index a.card-cta:hover { background: #000; }
    main.events-index .card-cta-disabled { background: #ccc; color: #4a4a4a; cursor: not-allowed; }
    main.events-index .card-details { display: block; margin-top: 10px; padding: 6px 0; text-align: center; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #000; text-decoration: none; }
    main.events-index .card-details::after { content: ' \\2192'; }
    main.events-index .card-details:hover { color: var(--brand-red, #E31837); }
    main.events-index a:focus-visible { outline: 2px solid var(--brand-red, #E31837); outline-offset: 2px; }
    main.events-index .no-races { text-align: center; margin: 0; padding: 0 5% 80px; }
    @media (max-width: 768px) {
      main.events-index .calendar-intro { padding: 24px 5% 20px; }
      main.events-index nav.breadcrumbs { margin-bottom: 20px; }
      main.events-index h1 { font-size: 2.22rem; margin-bottom: 10px; }
      main.events-index .bluf { font-size: 15.4px; line-height: 1.5; }
      main.events-index .calendar-grid { padding: 20px 5% 50px; }
      main.events-index ul.event-grid { grid-template-columns: 1fr; gap: 20px; }
      main.events-index .event-cell { padding-top: 0; }
      main.events-index .month-label { position: static; height: auto; padding: 12px 0 14px; }
      main.events-index .event-card { border: none; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
      main.events-index .event-card:hover { transform: none; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
      main.events-index .card-img-container { height: 180px; }
      main.events-index .card-body { padding: 15px; }
      main.events-index .card-title { font-size: 1.3rem; margin-bottom: 10px; line-height: 1.2; }
      main.events-index .card-date { color: var(--brand-red, #E31837); }
      main.events-index .card-meta-row { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
      main.events-index .card-meta { gap: 12px; }
      main.events-index .card-meta span { font-size: 11px; color: #64748b; }
      main.events-index .card-cta { padding: 12px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(227, 24, 55, 0.15); }
      main.events-index .card-cta-disabled { box-shadow: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      main.events-index .event-card, main.events-index .card-cta { transition: none; }
      main.events-index .event-card:hover { transform: none; }
    }
`;

function renderEventsIndex(races) {
  const list = (races || []).filter(r => r && r.slug && r.name);

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

  // One list in date order; the first race of each month carries the month heading.
  let prevMonth = null;
  const body = list.length
    ? `    <div class="calendar-grid">
      <ul class="event-grid">
${list.map((r, i) => {
    const month = monthLabel(r.race_date);
    const start = month !== prevMonth;
    prevMonth = month;
    return raceCard(r, i, start ? month : '');
  }).join('\n')}
      </ul>
    </div>`
    : '    <p class="no-races">No races are listed right now. Check back soon.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(TITLE)}</title>
  <meta name="robots" content="max-image-preview:large">
  <meta name="description" content="${escapeAttr(DESCRIPTION)}">
  <link rel="canonical" href="${CANONICAL}">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${CANONICAL}">
  <meta property="og:title" content="${escapeAttr(TITLE)}">
  <meta property="og:description" content="${escapeAttr(DESCRIPTION)}">
  <meta property="og:image" content="${BASE_URL}/images/og/events.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="en_US">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${CANONICAL}">
  <meta name="twitter:title" content="${escapeAttr(TITLE)}">
  <meta name="twitter:description" content="${escapeAttr(DESCRIPTION)}">
  <meta name="twitter:image" content="${BASE_URL}/images/og/events.jpg">

  <script type="application/ld+json">${safeJsonLd(itemList)}</script>
  <script type="application/ld+json">${safeJsonLd(breadcrumb)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Oswald:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/brand.css?v=20261114.1">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>

  <style>
${PAGE_STYLE}${CARD_STYLE}  </style>
  <script src="/assets/js/analytics.js" defer></script>
</head>
<body>
  ${navFragment()}
  <main class="event-page events-index" id="main-content">
    <div class="calendar-intro">
      <nav aria-label="Breadcrumb" class="breadcrumbs">
        <a href="/">Home</a> &rsaquo; <span>Events</span>
      </nav>
      <h1>Upcoming Races</h1>
      <p class="bluf">${list.length} upcoming running, trail and triathlon events in Washington and Oregon, from 5Ks to ultras.</p>
    </div>
${body}
  </main>
  ${footerFragment()}
  <script defer src="/assets/js/nav.js"></script>
</body>
</html>`;
}

module.exports = { renderEventsIndex };
