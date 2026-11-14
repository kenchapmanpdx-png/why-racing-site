# SEO Change Log
handbook 4.2 | run 2026-11-13

| ID | § | Change | Files | Before -> After | Verified with | Result |
|---|---|---|---|---|---|---|
| A01 | §10 Retired items | Race with no live edition keeps its own URL: 200 page "not on the current race calendar" + 6 upcoming races + calendar CTA; BreadcrumbList; no Event schema. Legacy paths 301 to it; year-edition slugs 301 to base slug | server.js, lib/seo/event-page.js | /events/scary-run etc. 302 -> /#calendar (homepage) -> 200 own page; /scary-run/* 302 -> 301 /events/scary-run | local server against prod DB; live curl after deploy | DONE |
| A02 | §18 | One group for 20 named bots + `*`; Disallow /api/ with Allow for 5 render endpoints; removed /pages/admin/ Disallow (noindex header + server auth) and 5 non-existent paths | robots.txt | named bots ignored all Disallows -> every bot same rules | protego parser: 6 bots x 17 paths, 0 failures | DONE |
| A03 | §7, §14 | Server-HTML snapshot of team cards inside #teamGrid (JS replaces with live data; failure keeps snapshot). AboutPage + 5 Person nodes (worksFor #organization) | pages/about.html | raw "Loading team..." -> 5 named people, roles, My WHY in raw HTML | JS-disabled Chrome: team visible, opacity 1 | DONE |
| A04 | §24 Event | Removed filler `performer` (parent, subEvents, homepage ItemList) and `funder` (beneficiaries do not fund the race) | lib/seo/event-page.js, index.html | PerformingGroup "{Race} Athletes" on 18 pages -> none | JSON-LD parse of rendered page | DONE |
| A05 | §6, §24 | Seeded pickup row ("Race Village / Finish Line Area" + "Main Event Site") filtered in fetchRaceFull: hidden in HTML and .md | server.js | 9 event pages showed placeholder pickup -> block hidden until real data | local render: 0 matches HTML + .md | DONE |
| A06 | §14, §15 | Collage tiles, sponsor-ticker logos and city card backgrounds served via Vercel image optimizer (384 / 384 / 828 px, q75, webp) | assets/js/collage.js, assets/js/nav.js, pages/locations.html | PHOTO16.jpg 2.81 MB -> 17 KB; Vancouver.png 8.05 MB -> ~0.38 MB | live curl of /_vercel/image; Lighthouse re-run | DONE |
| A07 | §15 | Collage grid rows `minmax(0,1fr)` + tile width/height attrs | assets/css/brand.css, assets/js/collage.js | first-5k lab CLS 0.37 from collage tiles | Lighthouse re-run | DONE |
| A08 | §14 | Breadcrumb links underlined; sticky bar `role=region` + label; staff link removed (contrast) | lib/seo/event-page.js, index.html | axe serious color-contrast + link-in-text-block | axe re-run | DONE |
| A09 | §24 | Static pages reference `#organization` by @id (+name, url); duplicate SportsOrganization (locations) and partners Organization node replaced; WebPage url + isPartOf; WebSite @id, alternateName "Why Racing", url = canonical home, publisher | index.html, pages/*.html | 9 unlinked Organization nodes -> 1 org identity | JSON-LD parse all pages | DONE |
| A10 | §2 | 1200x630 share images for Training, Volunteers, Corporate Wellness (cropped from page heroes) + og:image:width/height | images/og/*.jpg, 3 pages | logo -> page photo | file dims = declared 1200x630 | DONE (8 pages remain: owner F5) |
| A11 | §14 | `.reveal` visible with `@media (scripting: none)` and `prefers-reduced-motion: reduce` | assets/css/brand.css (cache key v=20261113 on 14 refs) | content opacity:0 without JS | JS-disabled Chrome | DONE |
| A15 | §12, §18 | Staff Portal footer link removed, then restored same day: staff need it to reach the portal (owner decision D3). Contrast raised to 0.7 alpha (brand.css v=20261113.4) | index.html, 9 pages, lib/seo/event-page.js, assets/css/brand.css | link kept; axe contrast fixed | axe | N/A (owner decision) |
| A16 | §10 | Removed canonical from 404 template | 404.html | 404 body canonical = home -> none | grep | DONE |
| A20 | §2 | `max-image-preview:large` on all indexable templates | index.html, 10 pages, event-page.js, events-index.js | absent -> present | grep / curl | DONE |
| A21 | §3 | Main `<nav aria-label="Main">` | index.html, 10 pages, 404.html, event-page.js | unlabeled -> labelled | grep | DONE |
| A22 | §2 | Meta descriptions <= 155 (partners 176 -> 141, corporate 173 -> 144); /events title 72 -> 65 | pages/partners.html, pages/corporate-wellness.html, lib/seo/events-index.js | | length check | DONE |
| A23 | §2, §10 | `/pages/x.html/` 308 -> `/pages/x.html`; uppercase event slug 301 -> lowercase; other invalid slugs get the event 404 page | vercel.json, server.js | 200 duplicate / bare "Error" 404 | local + live curl | DONE |
| A25 | §14 | CSP: frame-src + form-action allow https://www.facebook.com (Meta Pixel) | vercel.json | console CSP errors on every page | live render console | DONE |
| - | §19 | Sitemap lastmod: static pages 2026-11-13 (structured data / links changed); event pages max(updated_at, EVENT_TEMPLATE_LASTMOD 2026-11-13) | lib/seo/sitemap.js | | live sitemap | DONE |
| - | §12 | Event pages: "More Races" links (Semrush: 9 pages with 1 incoming link); title never equals h1; Training links First 5K guide | lib/seo/event-page.js, server.js, pages/training.html | (commit d9e534e, earlier same day) | live curl | DONE |
| A06 | §14 | Hero collage built after load + idle (was DOMContentLoaded); tiles still under reduced motion | assets/js/collage.js, assets/css/brand.css (v=20261113.2) | Travel LCP 13.2 s -> 3.3 s, TBT 10,170 -> 800 ms; Sponsors 12.3 -> 6.0 s (with collage blocked: 4.4 s) | Lighthouse 12 mobile, container | DONE (Sponsors still > 2.5 s: OPEN) |
| A08 | §14 | Footer text contrast 0.4 -> 0.7 alpha (first-5k tagline, 404 labels) | pages/first-5k.html, 404.html | axe serious color-contrast | axe re-run: 0 serious on 14 URLs | DONE |
| B01 | §10 | Old WordPress event IDs (`/event/NNN`): 31 IDs 301 to the race each one was (live edition, else the race's own page). Evidence per ID in `LEGACY_EVENT_IDS` (RunSignup race pages, Run Oregon previews, Columbian articles). 5 backlinked IDs with no identifying page (867, 877, 881, 926, 1024) and `/events/1063` 301 to `/events`. Any other ID: 404 page with calendar link | server.js, vercel.json | 404 -> 301 (27 backlinked URLs, Semrush 2026-11-13) | local server against prod DB; live curl after deploy | DONE |
| B02 | §10 | `/upcoming-events`, `/event`, `/event/` 308 to `/events`; `/triathlon-duathlon-awards-series` 308 to `/events` (was homepage) | vercel.json | 404 / homepage -> calendar | live curl | DONE |
| B03 | §10 Retired items | Pacific Crest Endurance Sports Festival keeps its own URL: 200 page "not currently being produced" (Karissa, 2026-11-02), similar race link (Hagg Lake, date and place from the live race list), 6 upcoming races, email list link. Static stub because its database rows are soft-deleted. `/pacific-crest-endurance/*`, `/event/871`, `/event/927`, `/event/989` 301 to it in one hop | server.js, lib/seo/event-page.js | 301 to Hagg Lake page (49 referring domains pointed at another race) -> own page | local + live curl | DONE |
| B04 | §10 Retired items | Lucky Triathlon Festival (Woodland, WA; last listed July 2022): own 200 page at `/events/lucky-triathlon` with similar race link (PDX Triathlon Festival); `/lucky-triathlon/*`, `/the-lucky-triathlon/*` 301 to it | server.js | 301 to `/#calendar` (homepage, soft-404 risk) -> own page | local + live curl | DONE |
| B05 | §10, §12 | Every retired-race page: "Join the email list" link to the homepage signup form; optional similar-race line; fallback redirect is `/events`, never the homepage | lib/seo/event-page.js, server.js | | local render | DONE |
| B06 | §2 | Meta description on the Staff Portal sign-in page (Semrush warning: missing meta description) | pages/admin/races.html | missing -> present | grep | DONE |

## Lab after fixes (Lighthouse mobile, container, 2026-11-13)
| Template | LCP before -> after | CLS before -> after | Weight before -> after | A11y before -> after |
|---|---|---|---|---|
| / | 4.9 -> 4.9 s | 0 -> 0 | 7.4 -> 7.4 MB | 95 -> 100 |
| locations | 10.7 -> 3.3 s | 0 -> 0.024 | 53.2 -> 4.2 MB | 94 -> 100 |
| partners | 11.6 -> 6.0 s | 0 -> 0 | 43.2 -> 2.4 MB | 93 -> 99 |
| first-5k | 2.8 -> 2.2 s | 0.37 -> 0 | 44.0 -> 3.4 MB | 95 -> 95 |
| about | 3.8 -> 3.1 s | 0 -> 0 | 46.9 -> 6.3 MB | 94 -> 100 |
| community | 3.4 -> 1.9 s | 0 -> 0 | 43.1 -> 2.4 MB | 94 -> 100 |
| /events/scary-run (new) | - -> 2.1 s | - -> 0 | - -> 0.6 MB | - -> 100 |

## Screaming Frog crawl fixes (2026-11-14)
source: Screaming Frog SEO Spider 23.1 crawl 2026-11-14 (240 URLs; project doc claude/screaming-frog-crawl-2026-11-14.md) | commit 324bc74

| ID | § | Change | Files | Before -> After | Verified with | Result |
|---|---|---|---|---|---|---|
| C01 | §14, §15 | Site-hosted raster images through Vercel image optimizer (srcset where wide), `data-orig` + onerror fallback to the original. Static: 3 page heroes (`fetchpriority="high"`), About team + mission photos, First 5K, Corporate Wellness, Give Back photo + 19 charity logos, Sponsors podium, Travel race logos (8), testimonial avatars (home 3, community 4). JS-rendered: homepage race-card logos, Sponsors page logos, About live team photos. Event template: `optimizedSrc` accepts /images/ paths (local heroes), sponsor/beneficiary logos at 384 w | index.html, pages/*.html, lib/seo/event-page.js | static optimized imgs 10.7 MB -> 1.5 MB (src width, WebP); homepage card logos 6.8 MB -> 0.4 MB; Bigfoot hero 1.08 MB -> 75 KB | live curl: 103 optimizer/og URLs 200 image/* | DONE |
| C02 | §2 | Event + retired-page og:image/twitter:image = picked image via optimizer at 1200 w (absolute URL). Schema image unchanged | lib/seo/event-page.js | 19 event og images 23.0 MB -> 4.7 MB (Accept */*; Couve Clover 4.2 MB -> 137 KB) | live curl | DONE (1.91:1 crops: owner F5) |
| C03 | §2 (A10) | 1200x630 share images for Home, Races, About, Community, Sponsors, Give Back, Travel, First 5K, cropped from site photos (pro-action-1, hagg-lake-run, karissa-and-rod-schoene, pro-action-3, finish-line, group-swim, Cities/Vancouver, family-finish) + og:image:width/height | images/og/*.jpg, 7 pages, lib/seo/events-index.js | logo 291x237 -> 1200x630 on 8 pages | live HTML | DONE |
| C04 | §12 | Facebook profile link in final form (footer, event template, 404, schema sameAs) | 11 HTML + event-page.js | /whyracingevents/ 302 -> /WhyRacingEvents/ 200 | live HTML + curl | DONE |
| C05 | §12 (A18) | Outbound 301 links to final URLs: EM3 Concrete (static ticker, 6 pages), Bivouac Racing, Vancouver Public Schools, Washougal Schools Foundation, Clark County Food Bank, NW Battle Buddies, La Center Schools, Trailkeepers of Oregon | 7 pages | 9 redirecting hosts -> 200 | curl final URLs 200 | DONE (EM3 in live ticker data: owner F8) |
| C06 | §2 | Title fit by estimated SERP pixel width (lib/seo/serp.js: Arial 19.2 px, fit <= 550 px; calibrated to SF, mean error 6 px) instead of 65 chars, event + retired templates | lib/seo/serp.js, lib/seo/event-page.js | over 561 px: 5 events + Scary Run -> 0 (Columbia River uses year variant) | local render 19 events + 2 retired; live HTML | DONE |
| C07 | §2 | Meta descriptions <= 155 chars and <= 940 px est.: Community, Training, Volunteers, Travel, /events; retired-page variants checked the same way | 4 pages, events-index.js, event-page.js | 5 static over 155 chars / 4 over 985 px -> 0 | serp.js + live HTML | DONE |
| C08 | §5 | Event "About the Race" h2 names the race | lib/seo/event-page.js | duplicate h2 on 19 pages -> unique | local render | DONE ("Race Day Details" kept) |
| C09 | §15 | Nav logo width/height (291x237) + CSS width:auto; brand.css v=20261114.1 on 14 files | 11 HTML, brand.css, 404 inline CSS, event-page.js, events-index.js | missing size attrs -> set; render unchanged | diff | DONE |
| C10 | §16 | Podium image alt text shortened (102 -> 70 chars) | pages/partners.html | | diff | DONE |
| C11 | ops | Local Screaming Frog exports ignored | .gitignore, .vercelignore | | | DONE |

Not changed (reason): image renames (DB `logo_url` values reference the filenames); static page titles over 561 px (only the brand suffix truncates; Google shows the site name separately); beneficiary readability (copy, owner); UltraSignup `eid` link (event ID rolls to current year); nosniff/Referrer-Policy on `/_vercel/image` (platform route).

## /events race cards (2026-11-14)
source: owner request (make /events look like the homepage calendar, same race cards, no SEO or redirect changes) | commit ca81ffe

| ID | § | Change | Files | Before -> After | Verified with | Result |
|---|---|---|---|---|---|---|
| D01 | design | /events: each race drawn as the homepage race card (photo, date, title, distances, location, logo, register button), server-rendered, one grid in date order; month h2 above the first race of each month; Oswald headings. Unchanged: URL, title, meta description, canonical, og/twitter, ItemList + BreadcrumbList JSON-LD, h1, intro line, breadcrumb, h2/h3 text and order, internal links + anchors, "Hosted by" links, sitemap, llms.txt, redirects | lib/seo/events-index.js, lib/seo/event-page.js (2 exports), server.js (/events select: 4 image/info columns) | text list -> cards; HTML 30.9 -> 79.8 KB raw; links in main 65 -> 84 (19 photo links to the info/registration page, same as homepage cards, aria-hidden + tabindex -1; 2 new targets: xdogadventures.org info pages); register anchor "Register" -> "Register Now & Event Details" | local render from live /api/races diffed against live HTML (head tags, JSON-LD, headings, links); Chrome 1440 / 900 / 390 px: 19 cards, 0 broken images, 0 console errors, no horizontal scroll; live curl after deploy | DONE |
