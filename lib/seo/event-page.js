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

// Site-relative paths ("/images/x.jpg", "images/x.jpg") -> absolute URLs. Social
// cards and schema.org need absolute URLs, and a bare "images/..." path would
// otherwise resolve under /events/ and 404.
function absoluteUrl(u) {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE_URL}/${String(u).replace(/^\/+/, '')}`;
}

// Image shown at the top of the event page. Uploaded images (hero, then the
// admin thumbnail) win over old site-path heroes: several of those point at
// scraped files that were never deployed or are small low-res banners.
function reliableHero(race) {
  const h = race.hero_image_url;
  // Uploaded (http) heroes and the curated /images/heroes/ set are known-good.
  return h && (/^https?:\/\//i.test(h) || /^\/?images\/heroes\//.test(h)) ? h : null;
}

function pickHeroImage(race) {
  return absoluteUrl(reliableHero(race) || race.thumbnail_url || race.hero_image_url || null);
}

function pickOgImage(race) {
  // OG image preference: known-good hero > thumbnail > other hero > logo > fallback.
  // A scraped site-path hero can point at a file that was never deployed, which
  // would leave a blank social card.
  const pick = reliableHero(race) || race.thumbnail_url || race.hero_image_url || race.logo_url;
  return pick ? absoluteUrl(pick) : `${BASE_URL}/images/logos/new-why-racing-logo.png`;
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
    const funders = race.beneficiaries
      .map(b => {
        const name = b.name || b.organization_name;
        if (!name) return null;
        const node = { '@type': 'NonprofitOrganization', name };
        const url = b.url || b.website_url;
        if (url) node.url = url;
        return node;
      })
      .filter(Boolean);
    if (funders.length) event.funder = funders;
  }

  if (race.hero_image_url || race.thumbnail_url) {
    event.image = [pickOgImage(race)];
  }

  return event;
}

function buildBreadcrumbSchema(race, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Events', item: `${BASE_URL}/#calendar` },
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
      <li><a href="/pages/training.html">Training</a></li>
      <li><a href="/pages/volunteers.html">Volunteer</a></li>
      <li><a href="/pages/beneficiary.html">Give Back</a></li>
      <li><a href="/pages/community.html">Community</a></li>
      <li><a href="/pages/locations.html">Travel</a></li>
      <li><a href="/pages/partners.html">Sponsors</a></li>
      <li><a href="/pages/about.html">About</a></li>
      <li><a href="/pages/corporate-wellness.html">Corporate Wellness</a></li>
      <li><a href="/#calendar" class="nav-cta">Find My Race</a></li>
    </ul>
    <button class="hamburger" aria-label="Open menu" onclick="toggleMobileMenu()">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="/">Home</a>
    <a href="/pages/training.html">Training</a>
    <a href="/pages/volunteers.html">Volunteer</a>
    <a href="/pages/beneficiary.html">Give Back</a>
    <a href="/pages/community.html">Community</a>
    <a href="/pages/locations.html">Travel</a>
    <a href="/pages/partners.html">Sponsors</a>
    <a href="/pages/about.html">About</a>
    <a href="/pages/corporate-wellness.html">Corporate Wellness</a>
    <a href="/#calendar">Find My Race</a>
  </div>
</nav>`;
}

function footerFragment() {
  // Same links as the footer on the rest of the site.
  return `
<footer>
  <div class="footer-inner">
    <div class="footer-logo"><span>WHY RACING EVENTS</span></div>
    <div class="footer-tagline">Fitness. Family. Fun. What's Your WHY?</div>
    <div class="footer-social">
      <a href="https://www.facebook.com/whyracingevents/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
      <a href="https://www.instagram.com/why_racing_events/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
      <a href="https://www.youtube.com/@WhyRacingEvents" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
    </div>
    <div class="footer-links">
      <a href="/#calendar">Races</a>
      <a href="/pages/training.html">Training</a>
      <a href="/pages/volunteers.html">Volunteer</a>
      <a href="/pages/beneficiary.html">Give Back</a>
      <a href="/pages/community.html">Community</a>
      <a href="/pages/locations.html">Travel</a>
      <a href="/pages/partners.html">Sponsors</a>
      <a href="/pages/about.html">About</a>
      <a href="/pages/corporate-wellness.html">Corporate Wellness</a>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">© ${new Date().getFullYear()} WHY RACING EVENTS Inc. • La Center, WA • (360) 314-4682</div>
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

// distance_value is free text from the admin form ("6.2 miles", "13.1", "5").
// distance_unit is never set by the form and defaults to 'km' in the database,
// so it is only appended to a bare number, and a bare number on a marathon or
// mile distance is shown in miles.
function distanceLabel(d) {
  const v = String(d.distance_value == null ? '' : d.distance_value).trim();
  if (!v) return '';
  if (/[a-z]/i.test(v)) return v;
  const label = `${d.name || ''} ${d.distance_type || ''}`;
  const unit = /marathon|mile/i.test(label) ? 'miles' : (d.distance_unit || '');
  return unit ? `${v} ${unit}` : v;
}

function distancesBlock(race) {
  if (!Array.isArray(race.race_distances) || !race.race_distances.length) return '';
  const items = race.race_distances.map(d => `
    <li>
      <strong>${escapeHtml(d.name)}</strong>${distanceLabel(d) ? ` — ${escapeHtml(distanceLabel(d))}` : ''}
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
  // DB rows use organization_name / website_url; fall back for older shapes.
  const items = race.sponsors.map(s => {
    const name = s.name || s.organization_name || '';
    return `
    <li>
      ${s.logo_url ? `<img src="${escapeAttr(s.logo_url)}" alt="${escapeAttr(name ? name + ' logo' : 'Sponsor logo')}" loading="lazy" width="160" height="80">` : ''}
      ${name ? `<span>${escapeHtml(name)}</span>` : ''}
    </li>`;
  }).join('');
  return `
<section aria-labelledby="sponsors">
  <h2 id="sponsors">Sponsors</h2>
  <ul class="sponsors">${items}</ul>
</section>`;
}

function beneficiariesBlock(race) {
  if (!Array.isArray(race.beneficiaries) || !race.beneficiaries.length) return '';
  const items = race.beneficiaries.map(b => {
    const name = b.name || b.organization_name || '';
    return `
    <li>
      ${b.logo_url ? `<img src="${escapeAttr(b.logo_url)}" alt="${escapeAttr(name ? name + ' logo' : 'Beneficiary logo')}" loading="lazy" width="160" height="80">` : ''}
      ${name ? `<strong>${escapeHtml(name)}</strong>` : ''}
      ${b.description ? `<p>${escapeHtml(b.description)}</p>` : ''}
    </li>`;
  }).join('');
  const heading = race.beneficiaries.length > 1 ? 'Beneficiaries' : 'Beneficiary';
  return `
<section aria-labelledby="beneficiaries">
  <h2 id="beneficiaries">${heading}</h2>
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
  const heroImage = pickHeroImage(race);
  const heroFallback = race.thumbnail_url && absoluteUrl(race.thumbnail_url) !== heroImage ? absoluteUrl(race.thumbnail_url) : '';
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
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

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
  <link rel="stylesheet" href="/assets/css/brand.css?v=20261031">
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
    .navbar .nav-menu { display: flex; align-items: center; gap: 20px; list-style: none; margin: 0; padding: 0; }
    .navbar .nav-menu a { color: var(--charcoal, #2c2c2c); text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: .02em; }
    .navbar .nav-menu a:hover { color: var(--brand-red, #c8102e); }
    .navbar .nav-menu a.nav-cta { background: var(--brand-red, #c8102e); color: #fff; padding: 8px 14px; border-radius: 6px; }
    .navbar .nav-menu a.nav-cta:hover { color: #fff; opacity: .9; }
    .navbar .hamburger { display: none; flex-direction: column; gap: 5px; width: 44px; height: 44px; align-items: center; justify-content: center; background: none; border: 0; cursor: pointer; }
    .navbar .hamburger span { display: block; width: 24px; height: 2px; background: var(--charcoal, #2c2c2c); }
    .mobile-menu { display: none; flex-direction: column; padding: 8px 20px 16px; background: #fff; border-bottom: 1px solid #e6e1d8; }
    .mobile-menu a { padding: 12px 4px; color: var(--charcoal, #2c2c2c); text-decoration: none; font-weight: 600; border-bottom: 1px solid #f0e9df; }
    .mobile-menu.active { display: flex; }
    @media (max-width: 1100px) {
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
    footer .footer-social { display: flex; gap: 14px; justify-content: center; margin: 0 0 20px; }
    footer .footer-social a { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,.1); color: #fff; text-decoration: none; }
    footer .footer-social a:hover { background: var(--brand-red, #c8102e); }
    footer .footer-bottom { border-top: 1px solid rgba(255,255,255,.12); margin-top: 24px; padding: 16px 20px; display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; justify-content: center; font-size: 13px; color: rgba(255,255,255,.6); }
    footer .footer-bottom .staff-portal-link { color: rgba(255,255,255,.5); text-decoration: none; }
  </style>
  <script src="/assets/js/analytics.js" defer></script>
</head>
<body>
  ${navFragment()}
  <main class="event-page">
    <nav aria-label="Breadcrumb" class="breadcrumbs">
      <a href="/">Home</a> &rsaquo; <a href="/#calendar">Events</a> &rsaquo; <span>${escapeHtml(race.name)}</span>
    </nav>
    <h1>${escapeHtml(race.name)}</h1>
    ${bluf(race)}
    ${heroImage ? `<img src="${escapeAttr(heroImage)}" alt="${escapeAttr(race.name)} — ${escapeAttr([race.city, race.state].filter(Boolean).join(', '))}" class="hero" width="1200" height="630" fetchpriority="high"${heroFallback ? ` onerror="this.onerror=null;this.src='${escapeAttr(heroFallback)}'"` : ''}>` : ''}
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
