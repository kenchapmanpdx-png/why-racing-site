# SEO/GEO Status
handbook: 4.2 | mode: AUDIT | tier: T3 (events collection: /events index + 18 templated /events/{slug} pages from Supabase) | updated: 2026-11-14

## Stack
- Host/CDN: Vercel (static files from repo root + one Express function `api/index.js` for /events, /events/{slug}(.md), /sitemap.xml, /llms.txt, legacy redirects, /api/*). Not a hosted builder; no build step.
- Rendering: hybrid. SSR: /events, /events/{slug}, sitemap, llms.txt. Static HTML: home, /pages/*.html. Client fetch: home calendar (/api/races), Training clubs (/api/training-clubs), sponsor ticker (/api/global-sponsors). About team: server snapshot + live fetch.
- Data: Supabase. Registration on RunSignUp/UltraSignup. Indexable URLs: 29 (sitemap) + 3 retired-race pages.
- Trackers: GA4 G-R4M214WTK7, Meta Pixel (assets/js/analytics.js).

## Site Profile
| SP | Y/N/? | evidence | confidence |
|---|---|---|---|
| SP1 | N | en-US only | high |
| SP2 | N | no catalog; registration off-site | high |
| SP3 | N | no filter URLs | high |
| SP4 | N | 1 hero video | high |
| SP5 | N | no UGC | high |
| SP6 | N | sports events | high |
| SP7 | N | no customer-facing premises; venues via Event schema | medium (owner: GBP?) |
| SP8 | N | 29 URLs | high |
| SP9 | N | no internal search | high |
| SP10 | N | no Merchant Center | high |
| SP11 | N | US audience; chatbot not live | high |
| SP12 | ? | Vercel; bot-UA fetches 200 + identical HTML; firewall settings not visible | low |

## Decisions
training bots: Allow · GSC Search generative AI: Include (default) · canonical host: https://whyracingevents.com (apex) · trailing slash: none (308) · consent: none (US) · CDN: Vercel (settings BLOCKED) · owner standing preference: act without asking unless irreversible (applied to reversible template changes; visible copy rewrites queued)

## Phase gates
| Phase | Status | date | evidence |
|---|---|---|---|
| P0 | PASS | 2026-11-13 | this file, seo-owner-todo.md |
| P1 | PASS | 2026-11-13 | seo-audit-baseline.md (27 findings, reconciled) |
| P2 | FAIL | 2026-11-13 | A17 homepage calendar + training clubs JS-only (S3, mitigated by /events SSR) |
| P3 | PASS | 2026-11-13 | robots parser test 0/102 fail; unknown URL 404; 0 internal links to redirects; A24 LIMITED |
| P4 | FAIL | 2026-11-14 | home title brand-first (D4); og:image logo pages fixed (C03) |
| P5 | BLOCKED | 2026-11-13 | stats sources (F1, F2), key facts (F3), boilerplate FAQ (D2) |
| P6 | PASS | 2026-11-13 | JSON-LD parses on all pages; 1 org @id; no filler performer/funder; RRT URL mode not run (BLOCKED) |
| P7 | FAIL | 2026-11-13 | lab LCP > 2.5 s: home 4.9 (video), partners 6.0, locations 3.3, about 3.1 (container; PSI 429) |
| P8 | PASS | 2026-11-13 | axe after full scroll: 0 critical/serious on 14 URLs; headers by value OK |
| P9 | BLOCKED | 2026-11-13 | robots + bot-UA parity PASS; Vercel bot settings (X4) |
| P10 | BLOCKED | 2026-11-13 | GSC/BWT/GA4 access (X1-X3) |
| P11 | DEFERRED | - | trigger: +4 weeks (2026-12-11) re-baseline |

## Release
CLEAR (A05 placeholder copy fixed; admin API needs server bearer auth; no unwaivable items open)

## Checklist (§41)
### P0
- [DONE] [T1+] status file · [DONE] owner questions batched · [DONE] platform identified (own stack on Vercel)
### P1
- [BLOCKED] [AUDIT] GSC Domain property, BWT, GA4, logs (X1-X4); GSC URL-prefix snapshot reused (2026-11-11)
- [DONE] Mode 1 vs Mode 2 per template; baseline stored
- [DONE] evidence set + reconciliation · [DONE] checker flags reproduced (Semrush 403 = peacehealth.org datacenter/bot block)
### P2
- [OPEN A17] core content in server HTML (home calendar, training clubs JS-only; About team fixed A03)
- [OPEN A17] API pages static fallback (About DONE; home/training OPEN)
- [N/A] fallback freshness (no transactional facts in the About snapshot)
- [DONE A11] no primary content at opacity:0 without JS
- [DONE] raw vs rendered compared · [DONE] one instance of each fact (raw vs rendered within ~20% except home/training: A17)
- [DONE] every detail page linked from /events (SSR) + More Races
- [DONE] header nav to hubs · [DONE] URL structure · [DONE] no build step; sitemap/robots served fresh
### P3
- [LIMITED A24] apex/www/HTTPS one hop (http://www is 2 hops: Vercel)
- [DONE] trailing slash 308 incl. /pages/x.html/ (A23) · [DONE] nav/logo to / · [DONE] canonical = links = sitemap form
- [DONE A01] moved URLs to closest page, never homepage · [DONE] legacy URL map (vercel.json + server.js) · [DONE A01] retired items page
- [DONE] internal links to redirected URLs: 0 (locations links now 200) · [DONE] spam URLs 410 · [DONE] unknown URL 404 · [DONE A16] 404 own template, no canonical
- [DONE] URL inventory: sitemap 29 = canonicals; first-5k orphan fixed (d9e534e) · [DONE] crawl sitemap vs links (Semrush 28 of 29; now linked)
- [N/A A15] hidden pages: admin noindex header + server auth, not in sitemap; footer link kept by owner decision (D3, 2026-11-13)
- [DONE A02] robots full rule set per group, parser-tested · [DONE] admin auth + X-Robots-Tag, no Disallow conflict
- [DONE] lastmod provenance (static: commit dates of significant changes; events: max(updated_at, template date))
- [OPEN] evergreen archive on own domain (results/photos pages: none) · [DONE] cross-consistency host · [DONE] render-resource guard (/api render endpoints allowed)
- [N/A] pagination, facets, internal search, hreflang, variants
### P4
- [DONE] unique titles/meta/H1 (title != h1, d9e534e) · [OPEN A27] home title brand-first (D4)
- [DONE] meta descriptions present, <= 160 (A22) · [DONE] viewport · [DONE] searched names (Girlfriends Run) · [DONE] no hard-coded years
- [DONE] hub titles · [DONE] one main, nav labelled (A21) · [OPEN A19] 32 H4 card labels on Travel (kept; heuristic)
- [DONE A10/C03] og:image per page: 10 static pages + /events 1200x630; events: race image at 1200 w via optimizer (C02); 1.91:1 race crops owner (F5)
- [N/A] Article · [DONE A20] max-image-preview · [DONE] target=_blank noopener
### P5
- [DONE] opening sentence (BLUF on event pages; static pages unchanged)
- [BLOCKED A13] stats sourced + single count (F1, F2) · [DONE A05] no placeholder copy · [OPEN A13] superlatives
- [BLOCKED A12] page-specific FAQ (D2) · [DONE] brand spelling · [N/A] SP7 address block
- [N/A] awards · [N/A] price lists (none on site) · [OPEN A18] outbound links to final URLs (C04/C05 done; F7, F8 owner) · [DONE] primary CTA (Register / Find Your Race)
- [BLOCKED A14] key-facts block (F3) · [DONE] contact block (footer phone tel:) · [DONE A03] About named people + Person schema · [BLOCKED] intent map (GSC X1)
### P6
- [DONE A09] WebSite node (@id, alternateName, url, publisher) · [DONE] no empty fields, https URLs
- [DONE A09] one org @id; partner organizers keep their own identity · [OPEN F6] sameAs (3 profiles)
- [N/A] Article · [OPEN A14] Event: no street address/geo/price (data missing); [DONE A04] no filler performer; organizer name+url; eventStatus; date-only startDate (time unknown)
- [DONE] ItemList on /events; BreadcrumbList on details · [OPEN D2] FAQPage boilerplate
- [DONE] JSON-LD parses; [BLOCKED] RRT URL mode + GSC Validate Fix (X5)
- [DONE] generic-word brand: alternateName · [N/A] LocalBusiness, Product, Review/Video · [DONE] no placeholder sentinels
### P7
- [DONE] hero video poster/pause/reduced motion (2026-11-10)
- [DONE A07] images dimensioned or CSS-sized (collage fixed; ticker logos fixed-height CSS, no attrs: S4)
- [DONE] LCP image real <img>; [DONE A06/C01] photos at display size via optimizer (static pages 44-56 MB -> 2.4-6.4 MB; C01: heroes, team, logos, homepage card logos 6.8 -> 0.4 MB)
- [OPEN] analytics deferred after load (GA4 + Pixel load at defer; consent N/A)
- [OPEN A26] render-blocking Google Fonts; minify; immutable assets (D5)
- [DONE] CLS lab per template (all <= 0.026) · [FAIL] lab LCP < 2.5 s on home 4.9, partners 6.0, locations 3.3, about 3.1 · [DONE] environment recorded (container; PSI 429)
### P8
- [DONE] HSTS max-age=31536000 includeSubDomains preload (already live), CSP incl. frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy, XFO
- [DONE] contrast (A08; staff link 0.7 alpha) · [DONE] axe after scroll · [DONE] skip link, icon links named, alt text · [DONE] headers by value · [DONE] labels, nav labels, reduced motion
- [N/A] SP6 · [N/A] sensitive forms (newsletter: name + email only) · [N/A] consent banner
### P9
- [BLOCKED X4] CDN bot settings; bot-UA parity 200 identical (DONE); verified-bot logs DEFERRED
- [DONE] llms.txt live (gate: no named consumer; kept) · [DONE] .md mirrors with canonical Link header + rel=alternate
- [DONE] AI controls + training decision recorded · [DONE] robots evaluated per group · [N/A] agentic commerce
### P10
- [BLOCKED X1-X3] sitemap resubmit, Request indexing, IndexNow, GSC Domain, BWT, GA4 AI channel
- [BLOCKED X5] Validate Fix: Events "Missing field location", Page indexing soft 404 (A01)
- [DONE] release check: CLEAR
### P11
- [DEFERRED] GSC re-baseline +4 weeks (2026-12-11) and +12 weeks (2027-02-05)

## Blocked / owner needed
seo-owner-todo.md

## Deferred (trigger)
- A17 homepage/training static fallback (trigger: next homepage rebuild)
- A26 minification + immutable hashed assets (trigger: owner approves build step, D5)
- Verified-bot log check (trigger: Vercel log access, X4)
- P11 re-baseline 2026-12-11
