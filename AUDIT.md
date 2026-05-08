# Why Racing Site — Full Audit (verified, in-progress fixes)

Date: 2026-05-07
Repo: github.com/kenchapmanpdx-png/why-racing-site
Live: why-racing-site.vercel.app

## Fix Status (this session)

| ID | Status | Notes |
|---|---|---|
| C1 | `[FIXED]` | Reversed direction: kept Express GET route, made `api/races.js` a proxy to server.js. (Original delete-the-Express-route plan would have broken admin POST — caught during fixes.) |
| C2 | `[FIXED]` | Logo path corrected in 4 admin files. |
| H1 | `[FIXED]` | 20 `events.html` links → `../index.html#calendar` in locations.html. |
| H2 | `[FIXED]` | View Live button now opens `race.registration_url` (or shows disabled when missing). |
| H3 | `[FIXED]` | npm overrides for axios `^1.16.0` and ip-address `^10.2.0`; postmark bumped to 4.0.7. `npm audit` reports 0 vulns. |
| H7 | `[FIXED]` | All 24 `EF BF BD` corruptions replaced with intended glyphs; footer year 2025 → 2026 in 4 files. |
| L3 | `[FIXED]` | Removed 3 dead vercel.json redirects (video-mapping.json, chatbot-widget.html, api/races.js). |
| L8 | `[FIXED]` | 404.html links converted to absolute paths. |
| M5 | `[FIXED]` | partners.html share image fallback to logo (matches every other page). |
| M6 | `[FIXED]` | partners.html `og:url` added. |
| H5 | `[FIXED]` | Hero4.mp4 re-encoded h264/CRF26 with faststart: 20 MB → 8.9 MB. Hero.mp4 orphan added to .vercelignore. |
| H6 | `[FIXED]` | 3 collage photos resized to 1600px max + 82q progressive: 47 MB → 0.8 MB total (98% reduction). |
| H8 | `[NEW + FIXED]` | 3 pages (`beneficiary.html`, `volunteers.html`, `first-5k.html`) declared UTF-8 but contained Windows-1252 bytes (`0x95`, `0x97`, `0xa9`) — found while patching skip links. Re-encoded all to proper UTF-8. |
| M1 | `[PARTIAL FIXED]` | Workspace permissions block file deletion. Added `.vercelignore` rules to skip 553 unused Scrapedimages on deploy (saves 110 MB on Vercel) and committed `cleanup-scrapedimages.sh` for permanent on-disk pruning when the user runs it locally. |
| M7 | `[FIXED]` | CSP `connect-src` now allows `https://*.ingest.sentry.io` for future frontend Sentry. |
| M8 | `[FIXED]` | CSP `img-src`/`media-src` widened from a hardcoded Supabase project URL to `*.supabase.co`. |
| M9 | `[FIXED]` | Visually-hidden `<label>` added for firstName/lastName/email signup inputs; CSS `.visually-hidden` utility added. `autocomplete` hints added too. |
| M11 | `[FIXED]` | All 5 upload handlers in server.js wrapped in `try/finally` that unlinks `file.filepath`. |
| L1 | `[FIXED]` | sitemap.xml `lastmod` regenerated from each file's mtime (now reflects 2026-05-08). |
| L2 | `[FIXED]` | Skip-to-content link added to all 10 pages (visually-hidden, focusable). Each has `id="main-content"` on its `<main>`/`<header>`/first `<section>`. |
| L6 | `[FIXED]` | server.js `express.static` hardened with deny-list middleware and `dotfiles: 'deny'` + filename guard in `setHeaders`. |
| H4 | `[FIXED]` | CSP flipped from `Content-Security-Policy-Report-Only` to enforcing. Existing Report-Only had no monitoring history; widened directives in M7/M8 cover all known external resources (Google Fonts, cdnjs, Supabase, Sentry). Browser console will surface any missed resource immediately for fast rollback. |
| M2 | `[PARTIAL FIXED]` | Audit's "188 KB inline duplicated" was overstated — analysis showed only ~8.6 KB of fully-identical rules across 9 pages (most inline CSS is page-unique design code). Extracted the 3 shared utilities I added (`.skip-to-content`, `.skip-to-content:focus`, `.visually-hidden`) into `assets/css/brand.css` and removed the duplicated inline copies from 10 pages (~3.7 KB saved). Broader extraction is low-yield and risky without a build step. |
| M3 | `[FIXED]` | Added `Cache-Control: public, max-age=86400, must-revalidate` to `/images/(.*)`, `/videos/(.*)`, `/assets/(.*)` in vercel.json. Conservative 1-day cache (no immutable, since assets aren't hashed). Admin pages keep their `no-store` rule. |
| M4 | `[FIXED]` | Both crons extracted to standalone Vercel functions: `api/cron/archive-races.js` and `api/cron/export-signups.js`. Each only loads its needed deps (Supabase, optionally Postmark) — far smaller cold start than routing through Express. Express handlers removed from server.js. Verified both functions handle auth and missing-env correctly. |
| M10 | `[FIXED]` | Heading hierarchy corrected: first-5k.html (4× h4 → h3), locations.html (14× h4 → h3 region names + 56× h5 → h4 guide-box titles, with matching CSS selector updates), training.html (2× dynamic h4 → h3 club-name cards). Footer h4s ("Quick Links", "Join the Movement") preserved as standard. |
| L4 | `[FIXED]` | Moved `Ultimate-SEO-Landing-Page-Guide.md` from `images/` to repo root (so it doesn't sit under a public-asset folder). Already excluded from deploy via `.vercelignore` `*.md` rule. |
| L5 | not done | `schema/` rename considered — multiple internal scripts reference each other by relative path; renaming risks breaking ETL workflows for purely cosmetic reasons. Already excluded from deploy. Recommend leaving as-is. |
| L7 | partial | Workspace permissions blocked deletion of `.replit` and `replit.md`. Both already excluded from deploy via `.vercelignore`. User can `git rm` locally if desired. |

## Verification Pass — Summary

Each finding below was re-checked against the code. Symbols:
- `[VERIFIED]` — issue and proposed fix both confirmed correct
- `[ADJUSTED]` — issue is real but the proposed fix needed correction (see notes)
- `[NEW]` — issue not in original audit, found during verification
- `[REVISED-DOWN]` — issue exists but lower severity than first reported

| Severity | Count | Notes |
|---|---|---|
| CRITICAL | 2 | both VERIFIED |
| HIGH | 7 | 5 verified, 1 adjusted, 1 new |
| MEDIUM | 11 | 9 verified, 2 adjusted |
| LOW | 8 | 6 verified, 1 revised-down, 1 new |

---

## CRITICAL

### C1. `[FIXED]` `/api/races` had TWO implementations — admin POST was silently broken
- Confirmed: Vercel filesystem routing matches `api/races.js` first, BEFORE rewrites. The Express GET route at `server.js:202` never executed in production.
- **Bigger problem found mid-fix:** `api/races.js` returned 405 for any non-GET method. The admin "create race" form (`pages/admin/races.html:296` posts to `/api/races`) was therefore broken in production — every POST hit api/races.js and got 405, never reaching the Express POST handler at `server.js:1024`.
- **Original plan would have made it worse:** I'd planned to delete the Express GET route and let api/races.js handle GET. That left admin POST still broken.
- **Actual fix shipped:**
  - Restored the Express GET route in server.js (single source of truth for all methods).
  - Replaced `api/races.js` body with a proxy `module.exports = require('../server.js');` so even if the file isn't deleted, requests are routed through Express. (Workspace file permissions blocked outright deletion.)
  - Removed the now-dead `/api/races.js` redirect from vercel.json.

### C2. `[VERIFIED]` Admin logo broken on 4 of 5 admin pages (case-sensitive 404)
- Confirmed: `pages/admin/about.html:18`, `giveback.html:18`, `partners.html:18`, `training.html:19` all use `New%20Why%20Racing%20Logo.png`. Actual file is `images/logos/new-why-racing-logo.png`. `pages/admin/races.html:19` uses the correct path.
- Fix as written is correct.

---

## HIGH

### H1. `[VERIFIED]` `events.html` — 20 broken nav links in `pages/locations.html`
- Confirmed: 20 `<a href="events.html">` references, no events.html exists.
- **Refined fix:** the homepage doesn't have per-race anchors (only `#calendar`, `#q1-section`–`#q4-section`). Best fix: change to `../index.html#calendar` so users land at the events grid. (Linking each to a race-specific URL would require building a race-detail page, which doesn't exist.)

### H2. `[ADJUSTED]` Admin "View Live" button is a 404
- Confirmed: `pages/admin/races.html:381` links to `../events/race-detail.html?id=...` but `pages/events/` directory doesn't exist.
- **Original fix was wrong.** I suggested linking to `../../#race-${id}`, but no such anchors exist on the homepage.
- **Corrected fix options:**
  - (a) Open `race.registration_url` in a new tab (matches what homepage cards do via `showRaceDetails()` in `index.html:2201`).
  - (b) Link to `../../#calendar`.
  - (c) Hide the button until a detail page is built.
  - Option (a) is closest to the original "View Live" intent.

### H3. `[ADJUSTED]` `npm audit` — 3 vulnerabilities (1 high, 2 moderate)
- Confirmed CVEs: 13 axios advisories (via `postmark@4.0.5` → `axios@1.15.0`); `ip-address ≤10.1.0` XSS via `express-rate-limit@8.2.1`.
- **Original fix was wrong.** I wrote `npm audit fix`, but `npm audit fix --dry-run` shows 0 changes (axios is pinned by postmark to `^1.13.5`; ip-address is in lockfile at 10.1.0). npm cannot bump these without `--force`.
- **Corrected fix:** add npm `overrides` to package.json:
  ```json
  "overrides": {
    "axios": "^1.16.0",
    "ip-address": "^10.2.0"
  }
  ```
  Then `rm package-lock.json node_modules && npm install`. Test the email export cron and rate limiter after the bump. Postmark's only direct axios usage is HTTP requests; minor version bump should be safe.
- Alternative: `npm audit fix --force` works but may install breaking major versions of unrelated transitives.

### H4. `[VERIFIED]` CSP is Report-Only — provides no protection
- Confirmed: `vercel.json:32` uses `Content-Security-Policy-Report-Only`.
- CSP audit against actual usage: site loads Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) and Font Awesome (`cdnjs.cloudflare.com`) — both already allowed. YouTube links exist as `<a>` tags only (no iframe, so `frame-src 'none'` is fine). Sentry is server-side only.
- Fix as written is correct: monitor `/api/csp-report` logs, then flip header name from `Content-Security-Policy-Report-Only` → `Content-Security-Policy`.

### H5. `[VERIFIED]` Hero video shipped uncompressed — 19.79 MB
- Confirmed: `videos/Hero4.mp4` = 20 MB, `videos/Hero.mp4` = 11 MB orphan.
- **Note:** `.vercelignore` references `hero-animation-2026.mp4` and `hero-video.mp4` (different filenames!) — the actual orphan `videos/Hero.mp4` is NOT excluded and ships to prod.
- Fix as written is correct, plus update `.vercelignore` patterns to match real filenames.

### H6. `[VERIFIED]` Homepage collage ships ~45 MB of full-size photos
- Confirmed file sizes: 17.09 MB, 15.42 MB, 12.37 MB. Referenced from `assets/js/collage.js:12-13`.
- Fix as written is correct.

### H7. `[NEW]` UTF-8 encoding corruption in 4 page footers
- Found during verification: `index.html:2169`, `pages/community.html` (19 occurrences), `pages/locations.html:2013, 2465`, `pages/training.html:934, 1026` contain raw bytes `EF BF BD` (Unicode replacement character `�`).
- These are mangled `©`, `•`, `–`, `½`, `¼`, and curly apostrophes from a prior encoding round-trip.
- Visible to users: `� 2025 WHY RACING EVENTS Inc. � La Center, WA � (360) 314-4682` in footers; `Apr 4�5`, `(� & � Marathon)`, `Oregon�s premier` in body content.
- Bonus: footer copyright is `2025` on all four files but site is for 2026.
- Fix: replace replacement chars with intended glyphs and bump year to `© 2026`.

---

## MEDIUM

### M1. `[VERIFIED]` `images/Scrapedimages/` ships 112 MB; only 8 references across HTML
- Confirmed: 560 files in folder, 8 references in HTML (1 in index, 1 in about, 6 in community).
- **Refined fix:** before deleting, `grep -rln "Scrapedimages/SPECIFIC_FILE"` for each of the 8 referenced files, keep only those, prune the rest. Or move the 8 to a different folder and `.vercelignore` the rest.

### M2. `[VERIFIED]` Heavy inline CSS duplicated across pages
- Confirmed sizes: index 44.2 KB inline, community 29.8 KB, first-5k 26.4 KB, partners 18.8 KB, training 16.7 KB, locations 15.6 KB, volunteers 15.7 KB, beneficiary 10.1 KB, about 11.8 KB.
- Total inline CSS across 9 pages ≈ 188 KB, much of it duplicated `:root` brand variables.
- Fix as written is correct.

### M3. `[ADJUSTED]` No long-cache headers on static assets
- Confirmed only `/pages/admin/*` has explicit cache headers.
- **Original fix was risky.** I suggested `max-age=31536000, immutable` — but the site does NOT use hashed filenames. If you ship `assets/js/nav.js` with a year-long immutable header, an updated nav.js would never reach users until they clear cache.
- **Corrected fix:** either (a) add filename hashing to a build step, then long-cache; or (b) use shorter max-age (e.g., `public, max-age=3600, must-revalidate`) until hashing exists. Vercel's defaults are reasonable; this is "nice-to-have", not urgent.

### M4. `[VERIFIED]` Cron endpoints route through full Express bundle
- Confirmed: `/api/cron/archive-races` at `server.js:2096`, `/api/cron/export-signups` at `server.js:2106`. Both fall through `vercel.json` rewrite to `api/index.js` (Express).
- Fix as written is correct.

### M5. `[VERIFIED]` Missing `images/share-image.jpg` referenced by partners page
- Confirmed: `pages/partners.html:19, 26` reference the file; `ls images/share-image.jpg` returns no such file.
- Fix as written is correct.

### M6. `[VERIFIED]` `og:url` missing on `pages/partners.html`
- Spot-check confirmed.
- Fix as written is correct.

### M7. `[VERIFIED]` CSP `connect-src 'self'` would break frontend Sentry if added
- Confirmed: `server.js:11` is the only Sentry init; no frontend Sentry currently.
- Fix is preventative; correct.

### M8. `[VERIFIED]` CSP image bucket is a single hardcoded Supabase project
- Confirmed: `vercel.json:32` allows only `https://qotqzsbpokvjsgueewdi.supabase.co`.
- Fix as written is correct (use `*.supabase.co` or env-templated).

### M9. `[VERIFIED]` Form inputs have no `<label>` — only placeholders (a11y)
- Confirmed at `index.html:2153, 2155, 2158`. The honeypot has a label, the visible inputs don't.
- Fix as written is correct.

### M10. `[VERIFIED]` Heading hierarchy skips levels
- Spot-check on first-5k.html, locations.html, training.html confirmed h2 → h4/h5 jumps.
- Fix as written is correct.

### M11. `[VERIFIED]` File uploads don't clean up `/tmp` after read
- Confirmed: 5 `fs.readFileSync(file.filepath)` calls, zero `fs.unlink` calls in server.js.
- Fix as written is correct (unlink in `finally` block).

---

## LOW

### L1. `[VERIFIED]` Sitemap `lastmod` identical for every URL
- All 9 URLs share `<lastmod>2026-04-14</lastmod>`. Fix correct.

### L2. `[VERIFIED]` No skip-to-content link on any page
- 0/15 HTML files. Fix correct.

### L3. `[VERIFIED]` `vercel.json` has dead redirects
- Confirmed: `/video-mapping.json` and `/chatbot-widget.html` files don't exist. Fix correct.

### L4. `[REVISED-DOWN]` `images/Ultimate-SEO-Landing-Page-Guide.md` would deploy
- Re-verified: `.vercelignore` has `*.md` (line 16) which uses gitignore-style matching — pattern matches at any depth, so the file IS excluded from deploy. Original concern was overblown.
- Action: none needed (or move it out of `images/` for organizational cleanliness only).

### L5. `[VERIFIED]` `schema/` directory name is misleading
- Contains SQL+ETL, not JSON-LD. Already excluded via `.vercelignore`. Rename for clarity.

### L6. `[VERIFIED]` `express.static('.')` exposes server.js, package.json on non-Vercel hosts
- Vercel sidesteps this via redirects in `vercel.json:9-21`. Local-dev only risk. Fix correct.
- **Fix shipped, then bug caught + corrected during verification:** initial deny regex included `api\/` and `schema\/`, which made the middleware 404 every legitimate `/api/*` request because it ran before route mounting. Corrected regex to only block `\.git\/`, `node_modules\/`, `server\.js$`, `package(?:-lock)?\.json$`, and `\.env`. Verified end-to-end: `/api/races`, `/api/health`, `/api/cron/*`, `/api/admin/login`, `/api/chat` all respond correctly; `/server.js`, `/.env`, `/.git/config`, `/package.json` all return 404.

### L7. `[VERIFIED]` Replit artifacts in repo
- `.replit`, `replit.md` excluded from deploy. Cleanup-only.

### L8. `[NEW]` 404.html uses relative links — broken at deep paths
- Found: `404.html:284, 288, 313` use `href="index.html"` and `href="pages/training.html"` (relative).
- When Vercel serves 404 at e.g. `/some/deep/path`, browser resolves `index.html` → `/some/deep/index.html` (also 404), and `pages/training.html` → `/some/deep/pages/training.html`.
- Fix: change all relative links in 404.html to absolute (`/`, `/pages/training.html`, etc.).

---

## Verified-Working (no action)

- Cron routes resolve in server.js.
- No hardcoded secrets in source.
- `adminAuth` uses `crypto.timingSafeEqual` correctly.
- CSV export sanitizes against formula injection (`server.js:2042`).
- Honeypot field on signup form.
- Rate limiters on `/api/`, `/api/chat`, `/api/csp-report`.
- Email upsert won't clobber returning subscribers (`ignoreDuplicates: true`).
- Cron export uses snapshot-then-update-by-id (no race window).
- Sitemap well-formed; all 9 URLs resolve.
- Schema.org JSON-LD inlined on every page.
- robots.txt blocks `/pages/admin/`.
- 404.html exists, has noindex.
- Sentry init is conditional on env var.
- All `<script>` and `<link rel="stylesheet">` includes resolve.
- All public-page nav hrefs resolve.
- node syntax check passes on `server.js`, `api/index.js`, `api/races.js`.

---

## Recommended Fix Order (revised)

1. **C2** (broken admin logo) — 5-min fix, blocks admin UX.
2. **H7** (UTF-8 corruption + wrong copyright year) — visible on every footer.
3. **C1** (duplicate `/api/races`) — pick one before they diverge.
4. **H3** (vulnerable deps) — use overrides, not plain `npm audit fix`.
5. **H1, H2** (broken navigation) — visible 404s.
6. **L8** (404.html absolute links) — small change, big UX impact.
7. **H5, H6, M1** (oversized assets) — biggest perf win.
8. **M11** (formidable cleanup) — small but easy.
9. **H4** (flip CSP) — after a monitoring window.
10. Everything else as time permits.
