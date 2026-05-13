# SEO/GEO Reference — Review Before Applying to Why Racing Events

Reviewing `SEO GEO on-site-seo-geo-reference-unified (1).md` against the WRE codebase. Findings ordered: doc-itself issues, WRE-specific gaps, current-site baseline, decisions needed before implementation.

---

## 1. Doc Quality — Strong Foundations

Keep as-is:
- Rules-vs-heuristics framing with `[SPEC]`/`[STUDY]`/`[HEURISTIC]` tags
- Site Profile gating (SP1–SP9 + build state)
- "Verify against real tools" + dual-mode crawler test (Mode 1 raw HTML / Mode 2 rendered DOM)
- Schema hygiene: empty fields worse than absent; never mark up content not visible
- AI bot two-tier policy (citation bots ALLOW, training bots per-policy)
- Cross-consistency check (sitemap host = canonical host = robots.txt Sitemap host)
- §14 deployment build chain warning (Vercel buildCommand bypass)
- §29 hard don'ts
- §32 verified constants

---

## 2. Doc Issues — Fix or Caveat Before Applying

### Outdated or shifting facts (as of 2026-05-13)

| Doc location | Issue | Recommended change |
|---|---|---|
| §26 / §32 | "ChatGPT 87% Bing top-10 correlation, Feb 2025" | OpenAI's own index has rolled out further through 2025–2026; Bing dependency weakened further. Keep Bing Webmaster Tools setup for AI Performance Report, but downgrade rationale weight. |
| §32 | Profound 30M-citation patterns (Wikipedia 47.9%, Reddit 46.7%, YouTube overtaking Reddit Q1 2026) | Already tagged `[STUDY]`. Add caveat that citation source mix has continued shifting; do not over-index on these percentages for content strategy. |
| §24 VideoObject | `transcript` listed as property | Schema.org accepts it, but Google's documented VideoObject properties don't include `transcript` as a rich-result driver. AI ingestion benefit > Google benefit. Doc already says "not required by Google" — strengthen that callout. |
| §28 | "30 days for priority pages" freshness | Single Profound study; tagged `[STUDY]` already. For event/race pages this is impossible between annual events. Replace WRE-specific cadence with: results page next-day; event page within 7 days of date changes; evergreen content quarterly. |
| §29 | "302 for permanent URL changes" listed under don'ts | Doc body (§10) correctly notes both 301 and 302 pass equity, only indexation signaling differs. Don'ts list reads stricter than body text — align wording. |

### Internal contradictions / under-specified

- §7 "Author byline (Person schema)" listed as required per-page. Does not fit event/listing/results pages. Make conditional on content type (article/blog/guide only).
- §11 "Don't `noindex` paginated pages" + §11 "internal search → noindex,follow". Both are correct but adjacent — clarify these are different page classes.
- §13 hreflang section assumes one site/one domain. Doc has no guidance for a multi-brand portfolio with shared parent (WRE + Bivouac + X-Dog). See §3 below.
- §22 ".md mirror at same path" → real cost is doubled content surface + maintenance. Doc presents as one-line action; flag as Phase 6+ deferred, lighter llms.txt-only is the baseline.
- §27 "AI segment event tagging" gated to "6+ months post-launch." WRE is an existing site with rebuild — clarify whether that gate applies to (a) the rebuild's launch date or (b) original site age.

### Missing / weak coverage

- **No SportsEvent / SportsOrganization / Athlete schemas.** Doc lists generic Event in §24's "Other Schema Types" tail. For an event company these belong in the main schema set.
- **No Schedule schema** for annually recurring events (`Event.eventSchedule` with `Schedule`).
- **No event status handling.** Race events need `eventStatus`: `EventScheduled`, `EventRescheduled`, `EventPostponed`, `EventCancelled`, `EventMovedOnline`. This is high-value for race directors and the doc skips it.
- **No NonprofitOrganization / fundedItem pattern** for beneficiary/charity tie-ins. WRE has $3M donated; this schema reinforces credibility + entity graph.
- **No Course schema differentiation** (training course vs race course). Schema.org `Course` = educational; race courses need `Event` + geo description, not Course.
- **No subOrganization / parentOrganization handling** for the WRE + Bivouac + X-Dog cluster.
- **No image-gallery / ImageGallery pattern** for event photo archives. WRE has 600+ scraped images.
- **No SoftwareApplication / WebApplication schema** for the registration platform itself (long-term).
- **No live-event / BroadcastEvent treatment.** Probably N/A but worth confirming.
- **Affiliate disclosure is mentioned but not centralized.** WRE has an Amazon affiliate shop page — `rel="sponsored"` is mandatory on every outbound, plus FTC disclosure copy. Pull this into a dedicated bullet in §7 "required per-page elements" for commerce pages.

### Heuristics to relax for WRE

| Doc rule | Why relax for WRE |
|---|---|
| Subfolder depth ≤ 3–4 | `/events/{year}/{race}/{distance}/results` is 5 levels and legitimate. Treat as soft target. |
| Click depth ≤ 3 from homepage | 21 events × multiple distances × archive years = mathematically tight. Hub pages soak this up but accept some 4-click paths. |
| Single H1 convention | Already flagged in doc. WRE event pages with distinct distance variants legitimately have section-level H1s in `<section>` blocks. |
| Banned filler "transform/empower/seamless" | Check WRE messaging — "What's Your WHY?" is identity-based and benign. Run a sweep before broad enforcement; do not bulk-rewrite hero copy without owner approval. |
| Engagement rate >20% target | Endurance audiences read deep; 20% is a floor, not a goal. Use as alert threshold (below 20% = problem), not a target. |

---

## 3. WRE-Specific Additions Needed (Not in Doc)

### Multi-brand portfolio handling

WRE + Bivouac + X-Dog share an operator but are separate brands/domains. Required pattern:

- Each domain ships its own Organization schema as the primary entity.
- Cross-reference via `parentOrganization` or `memberOf` with shared `@id` for the operator entity.
- Do NOT consolidate brand identity in schema if separate domains; that confuses entity disambiguation.
- `sameAs` from each brand → its own social profiles only, not cross-brand.

### Event schema baseline (every event page)

```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "@id": "https://whyracingevents.com/{race-slug}#event-{year}",
  "name": "[Race Name] [Year]",
  "startDate": "2026-MM-DDTHH:MM-08:00",
  "endDate": "2026-MM-DDTHH:MM-08:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "[Park / Venue]",
    "address": {"@type": "PostalAddress", "addressLocality": "...", "addressRegion": "WA", "addressCountry": "US"},
    "geo": {"@type": "GeoCoordinates", "latitude": "...", "longitude": "..."}
  },
  "organizer": {"@id": "https://whyracingevents.com/#organization"},
  "sport": "Running",
  "offers": {
    "@type": "Offer",
    "url": "https://whyracingevents.com/{race-slug}/register",
    "price": "45.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2025-MM-DDTHH:MM-08:00"
  },
  "subEvent": [
    {"@type": "SportsEvent", "name": "5K", "startDate": "..."},
    {"@type": "SportsEvent", "name": "10K", "startDate": "..."},
    {"@type": "SportsEvent", "name": "Half Marathon", "startDate": "..."}
  ],
  "superEvent": {"@id": "https://whyracingevents.com/{race-slug}#series"}
}
```

### Recurring annual race series

`superEvent` of type `EventSeries` with `eventSchedule` of type `Schedule` capturing annual recurrence. Lets AI assistants answer "when is the next [Race]?" without scraping all years.

### Beneficiary / charity coupling

```json
"funder": [{"@type": "NonprofitOrganization", "name": "[Charity]", "url": "..."}]
```

Or pair `Event.offers` with `additionalProperty` describing the percentage donated. WRE's $3M-donated story belongs in structured data, not just hero copy.

### Image / photo gallery

- ImageObject with `caption`, `contentLocation` (event name + year), `creator` (photographer), `dateCreated`.
- Required for AI tools to recommend "find your race photos" workflows.
- Filename rename: `{race-year}-{event}-{distance}-{location}.webp`. Current `Scrapedimages/` folder uses opaque hashes — `1456335100-1.jpg`. Rename batch-by-batch with redirect map.

---

## 4. Current Site Baseline (Observed)

`index.html` + `vercel.json` audit:

| Element | Status | Action |
|---|---|---|
| Title tag | Present, keyword-loaded | Verify pixel width <600px; confirm uniqueness across pages |
| Meta description | Present, ~155 chars | OK; verify uniqueness across pages |
| Meta keywords | Present | Drop entirely. Google has not used since 2009; clutter. |
| Canonical | Self-referencing, absolute | OK |
| OG / Twitter | Present, image is the logo PNG | Replace image with a 1200×630 dedicated OG asset (logo isn't OG-spec dimensions; LinkedIn/Slack previews will crop) |
| Organization schema | Present in @graph | Add `founder`, `foundingDate`, `numberOfEmployees` (optional), `award` for $3M donated, `parentOrganization` if applicable |
| WebSite schema | Present with SearchAction | Verify `target` URL matches actual internal search; remove if no search lives at `/?s=` |
| HSTS | Missing from vercel.json headers | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` |
| CSP | Present, allows `'unsafe-inline'` for scripts | Acceptable for now; tighten in a separate hardening pass |
| Admin noindex | Configured per-route in vercel.json | OK |
| robots.txt | Present | Audit against §18 two-tier AI policy; confirm citation bots allowed, training bots per Ken's decision |
| sitemap.xml | Present | Audit `<lastmod>` accuracy per §19; confirm per-URL git-derived stamps, not build-time uniform |
| Image format | JPG/PNG mix in `images/` | Convert to WebP at build/CDN; preserve originals |
| Image filenames | Opaque hashes in `Scrapedimages/` | Rename with descriptive slugs; map old→new with 301 (`vercel.json redirects`) |
| Build chain | `package.json` has no `build` script | If/when build chain introduced for `sitemap.xml`/`llms.txt` regeneration, set Vercel buildCommand to `npm run build`, not bundler step |
| Cron jobs | Two cron paths in vercel.json | OK |

---

## 5. Implementation Phasing (Proposed)

Doc presents §1–§30 as one pass. For WRE, batch into milestones:

1. **Pre-flight decisions** — Site Profile + AI bot policy + multi-brand handling (see §6 below).
2. **Critical baseline** — robots.txt audit, sitemap.xml truthful `<lastmod>`, cross-consistency check, HSTS, drop meta keywords, fix OG image dimensions.
3. **Event schema rollout** — SportsEvent + Schedule + EventStatus on all 21 events; Organization expanded; BreadcrumbList.
4. **On-page content patterns** — BLUF capsules, H1/H2 hierarchy, FAQ blocks on top event pages.
5. **Image/video pipeline** — alt text sweep, WebP conversion, srcset, transcript publication for the 102 YouTube videos (largest leverage for AI citation).
6. **GEO/AI surface** — llms.txt directory, then llms-full.txt, then optional .md mirrors (Phase 6+, lower priority).
7. **Analytics** — GA4 AI Assistants channel, Bing Webmaster Tools AI Performance Report.
8. **Defer** — §33 Expert-Tier until 6 months post-rebuild-launch baseline.

---

## 6. Decisions Needed Before Implementation

Batch ask, not blocking research:

1. **Training-bot policy** — Allow or Disallow GPTBot / ClaudeBot / anthropic-ai / CCBot / Google-Extended / Applebot-Extended / Bytespider / Meta-ExternalAgent? Default in doc is Allow; flipping to Disallow does not affect classic search or AI citation (only training corpus inclusion).
2. **Multi-brand schema linkage** — Treat WRE + Bivouac + X-Dog as separate Organizations (recommended) or with shared parent operator entity?
3. **Programmatic SEO scope** — §33 is deferred per doc rules, but race × distance × year template pages are likely high-value. Defer or pull forward to Phase 4?
4. **.md mirror strategy** — Full `/page-path.md` mirror at every priority URL (Stripe pattern), or llms.txt-only directory listing (lighter)?
5. **Photo gallery scope** — Rename `Scrapedimages/` files with descriptive slugs + 301 map (high lift, high payoff) or accept the hash filenames and only fix alt text?
6. **Single-author or per-event author** — Race director bylines on event pages, or organization-as-publisher only?

---

## 7. What Would Be Different vs. Doc-as-Written

Net change from doc → WRE-tailored implementation:

- **Add** Event/SportsEvent/Schedule schemas as Tier-1 (doc relegates to "Other Schema Types").
- **Add** eventStatus handling (postpone/cancel/reschedule patterns) — completely missing.
- **Add** multi-brand parentOrganization/memberOf guidance.
- **Add** image gallery + photographer attribution schema.
- **Soften** subfolder/click-depth heuristics for event-heavy architecture.
- **Soften** 30-day freshness rule with race-cadence-aware policy.
- **Defer** .md mirror to Phase 6+; not baseline.
- **Make conditional** the "author byline required per page" rule (article-class pages only).
- **Strengthen** affiliate disclosure callout — pull into a dedicated `rel="sponsored"` + FTC bullet for commerce surfaces.
- **Drop** `meta name="keywords"` from current index.html (vestigial).
- **Replace** OG image with 1200×630 dedicated asset (current OG image is the logo PNG).
- **Add** HSTS header to vercel.json.
- **Audit and align** sitemap `<lastmod>` to per-URL git-derived stamps before submitting to GSC.
