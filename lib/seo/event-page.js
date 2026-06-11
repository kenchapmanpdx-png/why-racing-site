// lib/seo/event-page.js
//
// Renders a full SEO/GEO-optimized HTML page for a single race event, server-side.
// Output is plain HTML with embedded JSON-LD; no client-side hydration required for
// the visible content. Safe for AI crawlers that don't run JavaScript (GPTBot,
// ClaudeBot, PerplexityBot, etc.). Reference: SEO_GEO_doc_review.md §3, §4.
//
// Inputs: a "full race" object matching the shape returned by GET /api/races/:id/full.
// Output: { html, statusCode } so the caller can choose 200 vs 404 etc.

const BASE_URL = 'https://whyracingevents.com';
const BRAND = 'WHY RACING EVENTS';
const ORG_ID = `${BASE_URL}/#organization`;

// ---------- Escaping helpers ----------

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  // Same as escapeHtml for our use; kept separate for clarity at call sites.
  return escapeHtml(value);
}

// JSON-LD strings must escape `</` to prevent script-tag breakout.
function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

// ---------- Data shaping helpers ----------

function formatRaceDate(isoDate) {
  if (!isoDate) return '';
  // race_date is a DATE in Supabase (YYYY-MM-DD). Render in Pacific time context.
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function isoDateOnly(isoDate) {
  if (!isoDate) return '';
  return isoDate.split('T')[0];
}

function buildDistanceText(race) {
  if (race.distances_display) return race.distances_display;
  if (Array.isArray(race.race_distances) && race.race_distances.length) {
    return race.race_distances.map(d => d.name).filter(Boolean).join(' • ');
  }
  if (Array.isArray(race.distances) && race.distances.length) {
    return race.distances.join(' • ');
  }
  return '';
}

// True for triathlon events. Prefers the race_type column, but falls back to the
// distances text so a stale/missing race_type doesn't mislabel a tri as "Running"
// (mirrors the homepage filter heuristic in index.html).
function isTriathlon(race) {
  if (race.race_type === 'triathlon') return true;
  const d = buildDistanceText(race).toLowerCase();
  return /triathlon|\btri\b|tri\/|aquabike/.test(d);
}

function mapEventStatus(race) {
  // Database `status` tracks lifecycle (active/draft/archived). Schema.org eventStatus
  // tracks per-occurrence state (scheduled/postponed/cancelled). Default safe value.
  if (race.event_status === 'cancelled') return 'https://schema.org/EventCancelled';
  if (race.event_status === 'postponed') return 'https://schema.org/EventPostponed';
  if (race.event_status === 'rescheduled') return 'https://schema.org/EventRescheduled';
  return 'https://schema.org/EventScheduled';
}

function pickOgImage(race) {
  // OG image preference: hero (typically widescreen) > thumbnail > logo > fallback.
  // Per doc §2: og:image should be 1200×630. Hero images are typically that aspect.
  return race.hero_image_url || race.thumbnail_url || race.logo_url || `${BASE_URL}/images/logos/new-why-racing-logo.png`;
}

function buildMetaDescription(race) {
  // Stay within 125-155 chars for conservative mobile display. Always include race
  // name, distances, location, date — these are the queries people actually run.
  const dist = buildDistanceText(race);
  const where = [race.city, race.state].filter(Boolean).join(', ');
  const date = formatRaceDate(race.race_date);
  const parts = [
    race.name,
    dist ? `(${dist})` : '',
    where ? `in ${where}` : '',
    date ? `on ${date}.` : '.',
    'Register, get course details, and find race day info from WHY RACING EVENTS.'
  ].filter(Boolean);
  let desc = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (desc.length > 158) desc = desc.slice(0, 155).trimEnd() + '…';
  return desc;
}

// ---------- Schema builders ----------

function buildSportsEventSchema(race, canonicalUrl) {
  const dist = buildDistanceText(race);
  const where = [race.city, race.state].filter(Boolean).join(', ');

  const event = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': `${canonicalUrl}#event`,
    name: race.name,
    description: race.content && race.content.summary
      ? race.content.summary
      : `${race.name}${dist ? ` — ${dist}` : ''}${where ? ` in ${where}` : ''}.`,
    startDate: race.race_date || undefined,
    eventStatus: mapEventStatus(race),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: isTriathlon(race) ? 'Triathlon' : 'Running',
    organizer: { '@id': ORG_ID },
    url: canonicalUrl
  };

  // Location: build a Place only when we have something meaningful.
  if (race.venue || race.city || race.state) {
    event.location = {
      '@type': 'Place',
      name: race.venue || `${race.city}${race.state ? ', ' + race.state : ''}`
    };
    if (race.city || race.state) {
      event.location.address = {
        '@type': 'PostalAddress',
        ...(race.city && { addressLocality: race.city }),
        ...(race.state && { addressRegion: race.state }),
        addressCountry: 'US'
      };
    }
    if (race.latitude && race.longitude) {
      event.location.geo = {
        '@type': 'GeoCoordinates',
        latitude: race.latitude,
        longitude: race.longitude
      };
    }
  }

  // Offers — only attach when registration is open and URL exists. Empty
  // offers blocks fail Google's Rich Results Test.
  if (race.registration_open && race.registration_url) {
    const offer = {
      '@type': 'Offer',
      url: race.registration_url,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: race.registration_opens_at || undefined
    };
    // If we have pricing tiers, surface the lowest current price for richer eligibility.
    if (Array.isArray(race.pricing_tiers) && race.pricing_tiers.length) {
      const prices = race.pricing_tiers
        .map(t => parseFloat(t.price))
        .filter(p => !isNaN(p));
      if (prices.length) offer.price = Math.min(...prices).toFixed(2);
    }
    event.offers = offer;
  }

  // subEvent — only when we actually have distinct distances. Each subEvent
  // references the parent so the relationship is explicit.
  if (Array.isArray(race.race_distances) && race.race_distances.length > 1) {
    event.subEvent = race.race_distances.map(d => ({
      '@type': 'SportsEvent',
      name: `${race.name} — ${d.name}`,
      startDate: race.race_date || undefined,
      sport: event.sport,
      superEvent: { '@id': event['@id'] }
    }));
  }

  // funder — beneficiary nonprofits. Reinforces the $3M-donated story in entity graph.
  if (Array.isArray(race.beneficiaries) && race.beneficiaries.length) {
    event.funder = race.beneficiaries.map(b => {
      const node = { '@type': 'NonprofitOrganization', name: b.name };
      if (b.url) node.url = b.url;
      return node;
    });
  }

  if (race.hero_image_url || race.thumbnail_url) {
    event.image = [race.hero_image_url || race.thumbnail_url];
  }

  return event;
}

function buildBreadcrumbSchema(race, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Events', item: `${BASE_URL}/#events` },
      { '@type': 'ListItem', position: 3, name: race.name, item: canonicalUrl }
    ]
  };
}

function buildFaqSchema(race) {
  if (!Array.isArray(race.faqs) || !race.faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: race.faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  };
}

// ---------- HTML fragments ----------

function navFragment() {
  // Server-rendered nav matches the pattern in pages/*.html. Mobile menu JS is
  // loaded via /assets/js/nav.js; layout works fine without JS for desktop.
  return `
<nav class="navbar" id="navbar">
  <div class="nav-container">
    <a href="/" class="nav-logo">
      <img src="/images/logos/new-why-racing-logo.png" alt="WHY RACING EVENTS" width="140" height="40">
    </a>
    <ul class="nav-menu">
      <li><a href="/#events">Events</a></li>
      <li><a href="/pages/training.html">Training</a></li>
      <li><a href="/pages/community.html">Community</a></li>
      <li><a href="/pages/partners.html">Partners</a></li>
      <li><a href="/pages/about.html">About</a></li>
    </ul>
    <button class="hamburger" aria-label="Open menu" onclick="toggleMobileMenu()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="/#events">Events</a>
    <a href="/pages/training.html">Training</a>
    <a href="/pages/community.html">Community</a>
    <a href="/pages/partners.html">Partners</a>
    <a href="/pages/about.html">About</a>
  </div>
</nav>`;
}

function footerFragment() {
  return `
<footer>
  <div class="footer-inner">
    <div class="footer-logo"><span>WHY RACING EVENTS</span></div>
    <div class="footer-tagline">Fitness. Family. Fun. What's Your WHY?</div>
    <div class="footer-links">
      <a href="/pages/about.html">About</a>
      <a href="/pages/beneficiary.html">Beneficiaries</a>
      <a href="/pages/volunteers.html">Volunteer</a>
      <a href="/pages/partners.html">Partners</a>
      <a href="/pages/training.html">Training</a>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">© 2026 WHY RACING EVENTS Inc. • La Center, WA • (360) 314-4682</div>
    <div class="staff-portal-footer">
      <a href="/pages/admin/races.html" class="staff-portal-link">Staff Portal</a>
    </div>
  </div>
</footer>`;
}

// ---------- Section renderers ----------

function bluf(race) {
  // §3 of doc: answer the user's likely question in the first 60 words.
  // Pattern: "[Race Name] is a [distance] [type] in [city], [state] on [date],
  // hosted by WHY RACING EVENTS."
  const dist = buildDistanceText(race);
  const where = [race.city, race.state].filter(Boolean).join(', ');
  const date = formatRaceDate(race.race_date);
  const sport = isTriathlon(race) ? 'triathlon' : 'running event';

  const parts = [
    `<strong>${escapeHtml(race.name)}</strong> is`,
    dist ? `a ${escapeHtml(dist)} ${sport}` : `a ${sport}`,
    where ? `in ${escapeHtml(where)}` : '',
    date ? `on ${escapeHtml(date)},` : ',',
    `hosted by ${BRAND}.`
  ].filter(Boolean);

  let summary = parts.join(' ').replace(/\s+/g, ' ').replace(/\s,/g, ',');
  if (race.content && race.content.summary) {
    summary += ' ' + escapeHtml(race.content.summary);
  }
  return `<p class="bluf">${summary}</p>`;
}

function detailsBlock(race) {
  const dist = buildDistanceText(race);
  const rows = [
    ['Date', formatRaceDate(race.race_date)],
    ['Location', race.venue || [race.city, race.state].filter(Boolean).join(', ')],
    ['Distances', dist],
    ['Race Type', isTriathlon(race) ? 'Triathlon' : 'Running'],
    ['Registration', race.registration_open ? 'Open' : 'Coming Soon']
  ].filter(([, v]) => v);

  const rowsHtml = rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('\n');
  return `
<section aria-labelledby="details">
  <h2 id="details">Race Day Details</h2>
  <dl class="race-details">${rowsHtml}</dl>
</section>`;
}

function distancesBlock(race) {
  if (!Array.isArray(race.race_distances) || !race.race_distances.length) return '';
  const items = race.race_distances.map(d => `
    <li>
      <strong>${escapeHtml(d.name)}</strong>${d.distance_value && d.distance_unit ? ` — ${escapeHtml(d.distance_value)} ${escapeHtml(d.distance_unit)}` : ''}
    </li>`).join('');
  return `
<section aria-labelledby="distances">
  <h2 id="distances">Distance Options</h2>
  <ul class="distances">${items}</ul>
</section>`;
}

function pricingBlock(race) {
  if (!Array.isArray(race.pricing_tiers) || !race.pricing_tiers.length) return '';
  const rows = race.pricing_tiers.map(t => `
    <tr>
      <th scope="row">${escapeHtml(t.name || t.tier_name || 'Tier')}</th>
      <td>${escapeHtml(t.distance_label || t.distance || '')}</td>
      <td>$${escapeHtml(t.price)}</td>
      <td>${escapeHtml(t.valid_until || t.ends_at || '')}</td>
    </tr>`).join('');
  return `
<section aria-labelledby="pricing">
  <h2 id="pricing">Pricing</h2>
  <table class="pricing-table">
    <thead><tr><th>Tier</th><th>Distance</th><th>Price</th><th>Ends</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
}

function packetPickupBlock(race) {
  if (!Array.isArray(race.packet_pickup) || !race.packet_pickup.length) return '';
  const items = race.packet_pickup.map(p => `
    <li>
      <strong>${escapeHtml(p.location_name || p.name || 'Pickup')}</strong>
      ${p.address ? `<br><span class="address">${escapeHtml(p.address)}</span>` : ''}
      ${p.date ? `<br><time>${escapeHtml(p.date)}</time>` : ''}
      ${p.hours ? ` &middot; ${escapeHtml(p.hours)}` : ''}
      ${p.notes ? `<p>${escapeHtml(p.notes)}</p>` : ''}
    </li>`).join('');
  return `
<section aria-labelledby="packet-pickup">
  <h2 id="packet-pickup">Packet Pickup</h2>
  <ul class="packet-pickup">${items}</ul>
</section>`;
}

function sponsorsBlock(race) {
  if (!Array.isArray(race.sponsors) || !race.sponsors.length) return '';
  const items = race.sponsors.map(s => `
    <li>
      ${s.logo_url ? `<img src="${escapeAttr(s.logo_url)}" alt="${escapeAttr(s.name + ' logo')}" loading="lazy" width="160" height="80">` : ''}
      <span>${escapeHtml(s.name)}</span>
    </li>`).join('');
  return `
<section aria-labelledby="sponsors">
  <h2 id="sponsors">Sponsors</h2>
  <ul class="sponsors">${items}</ul>
</section>`;
}

function beneficiariesBlock(race) {
  if (!Array.isArray(race.beneficiaries) || !race.beneficiaries.length) return '';
  const items = race.beneficiaries.map(b => `
    <li>
      ${b.logo_url ? `<img src="${escapeAttr(b.logo_url)}" alt="${escapeAttr(b.name + ' logo')}" loading="lazy" width="160" height="80">` : ''}
      <strong>${escapeHtml(b.name)}</strong>
      ${b.description ? `<p>${escapeHtml(b.description)}</p>` : ''}
    </li>`).join('');
  return `
<section aria-labelledby="beneficiaries">
  <h2 id="beneficiaries">Beneficiary</h2>
  <ul class="beneficiaries">${items}</ul>
</section>`;
}

function faqBlock(race) {
  if (!Array.isArray(race.faqs) || !race.faqs.length) return '';
  const items = race.faqs.map(f => `
    <div class="faq-item">
      <h3>${escapeHtml(f.question)}</h3>
      <p>${escapeHtml(f.answer)}</p>
    </div>`).join('');
  return `
<section aria-labelledby="faqs">
  <h2 id="faqs">Frequently Asked Questions</h2>
  <div class="faqs">${items}</div>
</section>`;
}

function registerCta(race) {
  if (!race.registration_open || !race.registration_url) {
    return `<div class="cta-wrap"><span class="cta-disabled">Registration Opens Soon</span></div>`;
  }
  return `<div class="cta-wrap">
    <a href="${escapeAttr(race.registration_url)}" target="_blank" rel="noopener sponsored" class="cta-primary">Register Now</a>
  </div>`;
}

// ---------- Main render ----------

function renderEventPage(race, opts = {}) {
  const slug = race.slug;
  if (!slug || !race.name) {
    return { html: null, statusCode: 500 };
  }

  const canonicalUrl = `${BASE_URL}/events/${encodeURIComponent(slug)}`;
  const title = `${race.name} — ${[race.city, race.state].filter(Boolean).join(', ')} | ${BRAND}`.slice(0, 70);
  const description = buildMetaDescription(race);
  const ogImage = pickOgImage(race);
  const lastUpdated = isoDateOnly(race.updated_at) || isoDateOnly(race.created_at) || '';

  const schemas = [
    buildSportsEventSchema(race, canonicalUrl),
    buildBreadcrumbSchema(race, canonicalUrl)
  ];
  const faq = buildFaqSchema(race);
  if (faq) schemas.push(faq);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${escapeAttr(canonicalUrl)}">
  <link rel="icon" type="image/png" href="/images/logos/new-why-racing-logo.png">

  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeAttr(canonicalUrl)}">
  <meta property="og:title" content="${escapeAttr(race.name + ' | ' + BRAND)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:image" content="${escapeAttr(ogImage)}">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="en_US">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeAttr(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeAttr(race.name + ' | ' + BRAND)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
  <meta name="twitter:image" content="${escapeAttr(ogImage)}">

  ${schemas.map(s => `<script type="application/ld+json">${safeJsonLd(s)}</script>`).join('\n  ')}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/brand.css">
  <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>

  <style>
    main.event-page { max-width: 960px; margin: 0 auto; padding: 32px 20px 80px; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: var(--charcoal, #2c2c2c); }
    main.event-page h1 { font-family: 'Fraunces', serif; font-size: clamp(2rem, 5vw, 3rem); margin: 16px 0 8px; line-height: 1.1; }
    main.event-page h2 { font-family: 'Fraunces', serif; font-size: 1.5rem; margin: 40px 0 12px; padding-top: 12px; border-top: 1px solid #e6e1d8; }
    main.event-page h3 { font-size: 1.05rem; margin: 16px 0 4px; }
    main.event-page .bluf { font-size: 1.1rem; margin: 16px 0 24px; }
    main.event-page .hero { width: 100%; max-height: 420px; object-fit: cover; border-radius: 8px; }
    main.event-page dl.race-details { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; }
    main.event-page dl.race-details dt { font-weight: 600; color: var(--slate, #5a5a6e); }
    main.event-page table.pricing-table { width: 100%; border-collapse: collapse; }
    main.event-page table.pricing-table th, main.event-page table.pricing-table td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e6e1d8; }
    main.event-page ul.distances, main.event-page ul.packet-pickup { list-style: none; padding: 0; }
    main.event-page ul.distances li, main.event-page ul.packet-pickup li { padding: 10px 0; border-bottom: 1px solid #f0e9df; }
    main.event-page ul.sponsors, main.event-page ul.beneficiaries { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    main.event-page ul.sponsors li, main.event-page ul.beneficiaries li { padding: 12px; background: var(--cream, #faf7f2); border-radius: 6px; text-align: center; }
    main.event-page .faqs .faq-item { margin: 16px 0; padding: 16px; background: var(--cream, #faf7f2); border-radius: 6px; }
    main.event-page .cta-wrap { margin: 24px 0; }
    main.event-page .cta-primary { display: inline-block; background: var(--brand-red, #c8102e); color: #fff; padding: 14px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; }
    main.event-page .cta-disabled { display: inline-block; background: #e6e1d8; color: var(--slate, #5a5a6e); padding: 14px 28px; border-radius: 6px; font-weight: 600; }
    main.event-page .last-updated { font-size: 0.85rem; color: var(--slate, #5a5a6e); margin-top: 48px; }

    /* --- Site chrome (nav + footer) — self-contained so these server-rendered
       pages don't depend on per-page inline CSS that only lives in pages/*.html. --- */
    * , *::before, *::after { box-sizing: border-box; }
    body { margin: 0; }
    .navbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #e6e1d8; font-family: 'Inter', system-ui, sans-serif; }
    .navbar .nav-container { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; padding: 12px 20px; }
    .navbar .nav-logo { display: inline-flex; align-items: center; }
    .navbar .nav-logo img { height: 40px; width: auto; display: block; }
    .navbar .nav-menu { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0; }
    .navbar .nav-menu a { color: var(--charcoal, #2c2c2c); text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: .02em; }
    .navbar .nav-menu a:hover { color: var(--brand-red, #c8102e); }
    .navbar .hamburger { display: none; flex-direction: column; gap: 5px; width: 44px; height: 44px; align-items: center; justify-content: center; background: none; border: 0; cursor: pointer; }
    .navbar .hamburger span { display: block; width: 24px; height: 2px; background: var(--charcoal, #2c2c2c); }
    .mobile-menu { display: none; flex-direction: column; padding: 8px 20px 16px; background: #fff; border-bottom: 1px solid #e6e1d8; }
    .mobile-menu a { padding: 12px 4px; color: var(--charcoal, #2c2c2c); text-decoration: none; font-weight: 600; border-bottom: 1px solid #f0e9df; }
    .mobile-menu.active { display: flex; }
    @media (max-width: 768px) {
      .navbar .nav-menu { display: none; }
      .navbar .hamburger { display: flex; }
    }
    main.event-page .breadcrumbs { font-size: 0.85rem; color: var(--slate, #5a5a6e); margin: 0 0 8px; border-top: 0; padding-top: 0; }
    main.event-page .breadcrumbs a { color: var(--brand-red, #c8102e); text-decoration: none; }
    main.event-page .breadcrumbs a:hover { text-decoration: underline; }
    footer { background: #0a0a0a; color: #fff; margin-top: 64px; font-family: 'Inter', system-ui, sans-serif; }
    footer .footer-inner { max-width: 1200px; margin: 0 auto; padding: 48px 20px 24px; text-align: center; }
    footer .footer-logo span { font-family: 'Fraunces', serif; font-weight: 700; font-size: 1.4rem; letter-spacing: .04em; }
    footer .footer-tagline { color: rgba(255,255,255,.7); margin: 8px 0 20px; }
    footer .footer-links { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
    footer .footer-links a { color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; }
    footer .footer-links a:hover { color: var(--brand-red, #c8102e); }
    footer .footer-bottom { border-top: 1px solid rgba(255,255,255,.12); margin-top: 24px; padding: 16px 20px; display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; justify-content: center; font-size: 13px; color: rgba(255,255,255,.6); }
    footer .footer-bottom .staff-portal-link { color: rgba(255,255,255,.5); text-decoration: none; }
  </style>
</head>
<body>
  ${navFragment()}
  <main class="event-page">
    <nav aria-label="Breadcrumb" class="breadcrumbs">
      <a href="/">Home</a> &rsaquo; <a href="/#events">Events</a> &rsaquo; <span>${escapeHtml(race.name)}</span>
    </nav>
    <h1>${escapeHtml(race.name)}</h1>
    ${bluf(race)}
    ${ogImage ? `<img src="${escapeAttr(ogImage)}" alt="${escapeAttr(race.name)} — ${escapeAttr([race.city, race.state].filter(Boolean).join(', '))}" class="hero" width="1200" height="630" fetchpriority="high">` : ''}
    ${registerCta(race)}
    ${detailsBlock(race)}
    ${distancesBlock(race)}
    ${pricingBlock(race)}
    ${packetPickupBlock(race)}
    ${beneficiariesBlock(race)}
    ${sponsorsBlock(race)}
    ${faqBlock(race)}
    ${lastUpdated ? `<p class="last-updated">Last updated: <time datetime="${escapeAttr(lastUpdated)}">${escapeHtml(lastUpdated)}</time></p>` : ''}
  </main>
  ${footerFragment()}
  <script defer src="/assets/js/nav.js"></script>
</body>
</html>`;

  return { html, statusCode: 200 };
}

module.exports = { renderEventPage, escapeHtml };
// (renew/audit pass 2026-05-29: added site-chrome CSS + isTriathlon fallback)
