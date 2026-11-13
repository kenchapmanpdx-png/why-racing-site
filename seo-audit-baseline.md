# SEO/GEO Audit Baseline (P1)
handbook: 4.2 | date: 2026-11-13 | mode: AUDIT | tier: T3

## Evidence sources
| Source | Status |
|---|---|
| Raw HTML crawl (requests, browser UA) | 29 sitemap URLs + 3 redirecting link targets + admin page = 33 URLs |
| Rendered DOM (headless Chrome 1366x900, full scroll) | 30 URLs |
| Bot-UA parity (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) | 4 key routes: identical 200 + bytes |
| Lighthouse 12.8.2 mobile preset | 13 templates. Environment: cloud container (not PSI). LCP/CLS comparable; TBT/score not quotable |
| axe-core 4.14 after full scroll | 14 URLs incl. 404 |
| Semrush Site Audit export | 2026-11-13 (36 URLs, crawl from links) |
| Outbound links | 126 external URLs, browser UA + GPTBot UA, from datacenter IP |
| GSC | Reused 2026-11-11 snapshot (URL-prefix property). Domain property: no access |
| Bing WMT, GA4, Vercel firewall/logs | BLOCKED (owner access) |
| Rich Results Test (URL mode) | BLOCKED this run (no browser session on Google tool). JSON-LD parsed: 0 parse errors |

## Baseline numbers (GSC, 28 days to 2026-11-09, from 2026-11-11 audit)
- Clicks 4.48K, impressions 38.1K, CTR 11.8%, avg position 7.8
- Indexed 215, not indexed 443 (redirect 138, 404 87, soft 404 47, 403 21, noindex 16)
- CWV: mobile 73 good; desktop 69 need improvement (CLS > 0.1)
- Events enhancement: 27 valid, 23 invalid ("Missing field location", pre-fix state)
- Generative AI report: not read

## Lab baseline (Lighthouse mobile, container)
| Template | Perf | A11y | BP | SEO | LCP | CLS | LCP element | Page weight |
|---|---|---|---|---|---|---|---|---|
| / | 64 | 95 | 79 | 100 | 4.9 s | 0 | hero video | 7.6 MB |
| /events | 83 | 91 | 79 | 100 | 1.8 s | 0 | p.bluf | - |
| /events/appletree-marathon | 82 | 92 | 89 | 100 | 2.4 s | 0 | hero img | - |
| /events/ho-ho-5k | 85 | 92 | 93 | 100 | 2.7 s | 0 | hero img | - |
| /pages/about.html | 51 | 94 | 79 | 100 | 3.8 s | 0 | h1 | 48 MB |
| /pages/beneficiary.html | 52 | 93 | 79 | 100 | 3.2 s | 0 | h1 | - |
| /pages/community.html | 54 | 94 | 79 | 100 | 3.4 s | 0 | h1 | - |
| /pages/corporate-wellness.html | 81 | 94 | 79 | 100 | 3.3 s | 0 | hero img | - |
| /pages/locations.html | 36 | 94 | 79 | 100 | 10.7 s | 0 | h1 | 55.8 MB |
| /pages/partners.html | 34 | 93 | 79 | 100 | 11.6 s | 0 | span | 45.3 MB |
| /pages/training.html | 64 | 94 | 79 | 100 | 4.5 s | 0 | hero img | - |
| /pages/volunteers.html | 71 | 94 | 79 | 100 | 4.7 s | 0 | hero img | - |
| /pages/first-5k.html | 35 | 95 | 79 | 100 | 2.8 s | 0.37 | p.hero-desc | 45.1 MB |

## Findings
| ID | Handbook § | Template / URL | Finding | Severity | Fix |
|---|---|---|---|---|---|
| A01 | §10 Retired items | /events/scary-run, /events/reflection-run, /events/pacific-coast-running-festival + legacy /scary-run/*, /reflection-run/*, /pacific-coast-running-festival/* | 302 to /#calendar (homepage). All 3 races status=draft since 2026-11-01. GSC soft 404 47; Scary Run legacy URLs ~775 clicks/28d. Linked from locations.html (Semrush: 3 temporary redirects) | S1 | Per-race 200 page "not on the current calendar" + upcoming races; legacy paths 301 to it; self-heals when a live edition is published |
| A02 | §18 | /robots.txt | Named groups (Googlebot, Bingbot, 17 AI bots) hold only `Allow: /`, so they ignore every `*` Disallow. `*` Disallows /pages/admin/ while the page sends `X-Robots-Tag: noindex` (Disallow + noindex conflict). Disallows list paths that do not exist (/.vercel/, /.git/, /schema/, ?sort=, ?filter=) | S1 | One group for all bots; Disallow /api/ with Allow for render endpoints; drop admin Disallow and non-existent paths |
| A03 | §7, §14 | /pages/about.html | Team (named people, roles) JS-only: raw HTML "Loading team..."; raw 341 vs rendered 868 words. No Person schema | S1 | Server-HTML snapshot of team cards (JS replaces with live data) + Person nodes |
| A04 | §24 Event | 18 event pages | `performer` = filler PerformingGroup "{Race} Athletes" | S2 | Remove performer |
| A05 | §6, §24 Placeholder | 9 event pages + .md mirrors | Placeholder packet pickup: "Race Village / Finish Line Area", "Main Event Site", "Please arrive early to collect your bib and timing chip." (seeded rows in packet_pickup_locations) | S2 | Hide seeded placeholder rows in HTML and Markdown |
| A06 | §14 CWV, §15 | static pages, home | Lab LCP > 2.5 s on 11 of 13 templates (locations 10.7 s, partners 11.6 s). Page weight 44-56 MB: footer collage JPGs 2.5-3.7 MB each, Cities/*.png up to 8 MB, sponsor logos up to 1.3 MB | S2 | Serve collage, city and sponsor images through Vercel image optimizer at display size |
| A07 | §15 | home 51, about 191, beneficiary 193, community 179, locations 186, partners 168, first-5k 174, training 14 images | `<img>` without width/height or aspect-ratio (collage, sponsor ticker, team). first-5k lab CLS 0.37 from collage images. GSC desktop CLS > 0.1 on 69 URLs | S2 | Collage images get intrinsic aspect box; ticker images fixed height + width attr; team photos dimensioned |
| A08 | §14 Accessibility | all templates | axe serious: color-contrast `.staff-portal-link` (every page); link-in-text-block breadcrumbs (/events, event pages); moderate: region `#stickyBar` (home); minor: image-redundant-alt (beneficiary 8, partners 6) | S2 | Remove staff link (A15); underline breadcrumb links; landmark for sticky bar |
| A09 | §24 Organization, WebSite | 9 static pages, locations, home | 9 static pages emit their own Organization node without `@id`; locations adds a second SportsOrganization node; WebSite node lacks `@id`, `alternateName`, `publisher`. sameAs: 3 profiles | S2 | Static pages reference `#organization` by `@id` (+name, url); WebSite `@id` + `alternateName` + publisher |
| A10 | §2 OG | home, /events, 9 static pages; event pages | og:image = logo on 11 pages. Event pages: raw thumbnails (several 800x800 square); Girlfriends Triathlon og:image = Unsplash stock photo | S2 | Static pages: page hero image. Events: owner to upload 1200x630 images |
| A11 | §14 Rendering | 9 static pages | Section content `.reveal` server-rendered at opacity:0 until IntersectionObserver fires; no no-JS reveal | S2 | `@media (scripting: none)` + reduced-motion reveal in brand.css |
| A12 | §3, §7, §24 FAQPage | 11 event pages | Identical boilerplate FAQ (same hash) + FAQPage schema; generic answers (strollers, dogs, gear check) on ultras/triathlons | S3 | Owner decision: per-race FAQs or remove |
| A13 | §6 Fact integrity | home, about, partners, beneficiary, community, appletree, llms.txt | Stats without visible source + date: "50,000+ participants", "$3M+", "20+ events" (home) vs "21" (event copy) vs 18 live; "Boston Qualifier" (Appletree); superlatives "premier", "best", "most supportive" | S3 | Owner: source + date per stat; one count source |
| A14 | §7 Key facts | 18 event pages | No price, start time, street address, postal code, parking or cutoffs (not stored) | S3 | Owner/Brock: enter from registration pages |
| A15 | §12, §18 Admin | 28 pages (footer) | Public "Staff Portal" link to /pages/admin/races.html | S3 | Remove link; staff bookmark the URL |
| A16 | §10 Soft 404s | /404.html (all unknown URLs) | 404 body declares canonical https://whyracingevents.com/ | S3 | Remove canonical from 404 template |
| A17 | §14 Rendering | / , training | Homepage race calendar, homepage ItemList JSON-LD, training clubs, sponsor ticker are JS-only (home raw 446 vs rendered 814 words; JSON-LD 1 raw vs 2 rendered). Mitigated: /events is SSR | S3 | Static fallback list (deferred, freshness rule) |
| A18 | §12 Outbound | training, beneficiary, home, locations | 20 outbound links redirect (http to https, apex to www); stale club URLs (steelheadcoaching.com to monarchcoachinggroup.com, chrisbaggcoaching.com to campfireendurance.com); 403 from datacenter IP (peacehealth.org, 8 tripadvisor.com, autismsocietyoregon.org); bot-only 403 (wta.org, scleroderma.org) | S3 | Update URLs in DB/HTML to final destinations; record bot-only blocks |
| A19 | §3 | /pages/locations.html | 32 H4 headings (guide box titles) | S4 | Leave: card labels; not contorting (§0 heuristics) |
| A20 | §2 | all indexable | No `max-image-preview:large` | S4 | Add robots meta |
| A21 | §3, §14 | all templates | Main `<nav>` has no aria-label (breadcrumb nav labelled) | S4 | `aria-label="Main"` |
| A22 | §2 | partners (176), corporate-wellness (173), /events title (72) | Meta description > 160; title > 65 | S4 | Shorten |
| A23 | §2, §10 | /pages/*.html/ ; /events/Upper-Case | Trailing-slash variant of .html pages returns 200 (canonical OK) instead of redirect; uppercase event slug returns bare "Error" 404 body | S4 | 308 for `/pages/x.html/`; event 404 template for any non-matching slug |
| A24 | §10 | http://www.whyracingevents.com/ | 2 hops (308 to https www, 308 to apex) | S4 | LIMITED (Vercel applies HTTPS redirect before domain redirect) |
| A25 | §14 | event pages | CSP blocks Facebook pixel frame + form-action (console errors) | S4 | Allow www.facebook.com in frame-src/form-action on SSR routes |
| A26 | §14 Code | all | Render-blocking Google Fonts CSS (~880 ms lab) + brand.css; unminified CSS/JS (Semrush 70 files); static assets `max-age=86400, must-revalidate` (not immutable) | S4 | Deferred (build step = new dependency) |
| A27 | §2 | / | Title leads with brand ("WHY RACING EVENTS \| Premier PNW ...") | S4 | Topic first, brand suffix (owner copy) |

## Observed, not actioned (reason)
- Semrush low text-to-HTML ratio (22): §31 triage list (text-to-code ratio). No rule.
- Semrush low word count (4): fixed minimum word counts are triage-only; content depth tracked in A14.
- Lighthouse TBT 410-6,540 ms: container CPU; not quotable (§0 Lab environment).
- Lighthouse `third-party-cookies` (best-practices 79): Facebook/GA cookies; consent not legally required for US audience (decision recorded).
- `/index.html` 200 with canonical `/`: no internal links point to it. PASS.
- `/?utm_source=x` 200 with canonical `/`. PASS.
- Event month headings "November 2026" on /events: data-driven, not hard-coded. PASS.
- Beneficiary description "Supporting community health initiatives" (Appletree): race-specific DB text, not a seed sentinel.
