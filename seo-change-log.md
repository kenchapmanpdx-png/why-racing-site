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
| A15 | §12, §18 | Staff Portal footer link removed | index.html, 9 pages, 404.html, lib/seo/event-page.js | public link on 28 pages -> none | grep 0 | DONE |
| A16 | §10 | Removed canonical from 404 template | 404.html | 404 body canonical = home -> none | grep | DONE |
| A20 | §2 | `max-image-preview:large` on all indexable templates | index.html, 10 pages, event-page.js, events-index.js | absent -> present | grep / curl | DONE |
| A21 | §3 | Main `<nav aria-label="Main">` | index.html, 10 pages, 404.html, event-page.js | unlabeled -> labelled | grep | DONE |
| A22 | §2 | Meta descriptions <= 155 (partners 176 -> 141, corporate 173 -> 144); /events title 72 -> 65 | pages/partners.html, pages/corporate-wellness.html, lib/seo/events-index.js | | length check | DONE |
| A23 | §2, §10 | `/pages/x.html/` 308 -> `/pages/x.html`; uppercase event slug 301 -> lowercase; other invalid slugs get the event 404 page | vercel.json, server.js | 200 duplicate / bare "Error" 404 | local + live curl | DONE |
| A25 | §14 | CSP: frame-src + form-action allow https://www.facebook.com (Meta Pixel) | vercel.json | console CSP errors on every page | live render console | DONE |
| - | §19 | Sitemap lastmod: static pages 2026-11-13 (structured data / links changed); event pages max(updated_at, EVENT_TEMPLATE_LASTMOD 2026-11-13) | lib/seo/sitemap.js | | live sitemap | DONE |
| - | §12 | Event pages: "More Races" links (Semrush: 9 pages with 1 incoming link); title never equals h1; Training links First 5K guide | lib/seo/event-page.js, server.js, pages/training.html | (commit d9e534e, earlier same day) | live curl | DONE |
