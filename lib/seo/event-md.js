// lib/seo/event-md.js
//
// Returns a clean Markdown mirror of an event page for AI ingestion. Same
// information as the HTML page, no nav/footer/CSS noise. Doc §22 (Stripe
// pattern). Consumers: ChatGPT, Claude, Perplexity, Gemini, agentic browsers.
//
// Input shape: same "full race" object as renderEventPage().

const BASE_URL = 'https://whyracingevents.com';

function formatRaceDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
}

function buildDistanceText(race) {
  if (race.distances_display) return race.distances_display;
  if (Array.isArray(race.race_distances) && race.race_distances.length) {
    return race.race_distances.map(d => d.name).filter(Boolean).join(' • ');
  }
  if (Array.isArray(race.distances) && race.distances.length) return race.distances.join(' • ');
  return '';
}

function renderEventMarkdown(race) {
  if (!race || !race.slug || !race.name) return null;
  const dist = buildDistanceText(race);
  const where = [race.city, race.state].filter(Boolean).join(', ');
  const date = formatRaceDate(race.race_date);
  const url = `${BASE_URL}/events/${encodeURIComponent(race.slug)}`;
  const sport = race.race_type === 'triathlon' ? 'triathlon' : 'running event';

  const lines = [];
  lines.push(`# ${race.name}`);
  lines.push('');
  lines.push(`> ${race.name} is a ${dist ? dist + ' ' : ''}${sport}${where ? ' in ' + where : ''}${date ? ' on ' + date : ''}, hosted by WHY RACING EVENTS.`);
  lines.push('');
  if (race.content && race.content.summary) {
    lines.push(race.content.summary);
    lines.push('');
  }

  // Details key-value
  lines.push('## Race Day Details');
  lines.push('');
  if (date) lines.push(`- **Date:** ${date}`);
  if (race.venue) lines.push(`- **Venue:** ${race.venue}`);
  if (where) lines.push(`- **Location:** ${where}`);
  if (dist) lines.push(`- **Distances:** ${dist}`);
  lines.push(`- **Race type:** ${race.race_type === 'triathlon' ? 'Triathlon' : 'Running'}`);
  lines.push(`- **Registration:** ${race.registration_open ? 'Open' : 'Coming soon'}`);
  if (race.registration_open && race.registration_url) {
    lines.push(`- **Register at:** ${race.registration_url}`);
  }
  lines.push('');

  // Distances detail
  if (Array.isArray(race.race_distances) && race.race_distances.length) {
    lines.push('## Distance Options');
    lines.push('');
    race.race_distances.forEach(d => {
      const detail = d.distance_value && d.distance_unit ? ` — ${d.distance_value} ${d.distance_unit}` : '';
      lines.push(`- **${d.name}**${detail}`);
    });
    lines.push('');
  }

  // Pricing
  if (Array.isArray(race.pricing_tiers) && race.pricing_tiers.length) {
    lines.push('## Pricing');
    lines.push('');
    lines.push('| Tier | Distance | Price | Ends |');
    lines.push('|---|---|---|---|');
    race.pricing_tiers.forEach(t => {
      lines.push(`| ${t.name || t.tier_name || 'Tier'} | ${t.distance_label || t.distance || ''} | $${t.price} | ${t.valid_until || t.ends_at || ''} |`);
    });
    lines.push('');
  }

  // Packet pickup
  if (Array.isArray(race.packet_pickup) && race.packet_pickup.length) {
    lines.push('## Packet Pickup');
    lines.push('');
    race.packet_pickup.forEach(p => {
      const name = p.location_name || p.name || 'Pickup';
      lines.push(`- **${name}**`);
      if (p.address) lines.push(`  - Address: ${p.address}`);
      if (p.date) lines.push(`  - Date: ${p.date}${p.hours ? ' — ' + p.hours : ''}`);
      if (p.notes) lines.push(`  - Notes: ${p.notes}`);
    });
    lines.push('');
  }

  // Beneficiaries
  if (Array.isArray(race.beneficiaries) && race.beneficiaries.length) {
    lines.push('## Beneficiary');
    lines.push('');
    race.beneficiaries.forEach(b => {
      lines.push(`- **${b.name}**${b.url ? ` — ${b.url}` : ''}`);
      if (b.description) lines.push(`  - ${b.description}`);
    });
    lines.push('');
  }

  // Sponsors
  if (Array.isArray(race.sponsors) && race.sponsors.length) {
    lines.push('## Sponsors');
    lines.push('');
    race.sponsors.forEach(s => lines.push(`- ${s.name}`));
    lines.push('');
  }

  // FAQ
  if (Array.isArray(race.faqs) && race.faqs.length) {
    lines.push('## Frequently Asked Questions');
    lines.push('');
    race.faqs.forEach(f => {
      lines.push(`### ${f.question}`);
      lines.push('');
      lines.push(f.answer);
      lines.push('');
    });
  }

  lines.push('---');
  lines.push(`Canonical URL: ${url}`);
  if (race.updated_at) lines.push(`Last updated: ${String(race.updated_at).split('T')[0]}`);
  lines.push('Source: WHY RACING EVENTS Inc., La Center, WA.');
  lines.push('');

  return lines.join('\n');
}

module.exports = { renderEventMarkdown };
