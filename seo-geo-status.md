# SEO/GEO Status
handbook: 4.2 | mode: AUDIT | tier: T3 (events collection: /events index + 18 templated /events/{slug} pages from Supabase) | updated: 2026-11-13

## Stack
- Host/CDN: Vercel (static files from repo root + one Express function `api/index.js` for /events, /events/{slug}(.md), /sitemap.xml, /llms.txt, legacy redirects, /api/*). Not a hosted builder; no build step.
- Rendering: hybrid. SSR: /events, /events/{slug}, sitemap, llms.txt. Static HTML: home, /pages/*.html. Client-side fetch: home calendar (/api/races), About team (/api/team-members), Training clubs (/api/training-clubs), sponsor ticker (/api/global-sponsors).
- Data: Supabase (races + child tables). Registration on RunSignUp/UltraSignup (third party).
- Indexable URLs: 29 (sitemap). Trackers: GA4 G-R4M214WTK7, Meta Pixel 2195644757412966 (assets/js/analytics.js).

## Site Profile
| SP | Y/N/? | evidence | confidence |
|---|---|---|---|
| SP1 | N | en-US only, US races | high |
| SP2 | N | no catalog; registration off-site | high |
| SP3 | N | no filters in URLs | high |
| SP4 | N | 1 hero video; no video pages | high |
| SP5 | N | no UGC | high |
| SP6 | N | sports events, not health/YMYL | high |
| SP7 | N | no customer-facing premises; footer "La Center, WA" + phone only; venues covered by Event schema | medium (owner: GBP listing?) |
| SP8 | N | 29 URLs | high |
| SP9 | N | no internal search | high |
| SP10 | N | no Merchant Center | high |
| SP11 | N | US audience; chatbot not live (`/api/chat/status`) | high |
| SP12 | ? | Vercel; bot UA fetches 200 + identical HTML; firewall/bot-protection settings not visible (connector 403) | low |

## Decisions
training bots: Allow · GSC Search generative AI: Include (default) · canonical host: https://whyracingevents.com (apex, no trailing slash) · trailing slash: none (308 to slashless) · consent: none (US audience; no regime confirmed) · CDN: Vercel (settings BLOCKED) · owner standing preference: act without asking unless irreversible (applied to non-visible, reversible template changes)

## Phase gates
| Phase | Status | date | evidence |
|---|---|---|---|
| P0 | PASS | 2026-11-13 | this file, seo-owner-todo.md |
| P1 | PASS | 2026-11-13 | seo-audit-baseline.md (27 findings; reconciliation done) |
| P2-P10 | see Checklist | 2026-11-13 | seo-change-log.md |

## Release
CLEAR (A05 placeholder copy fixed in this run; no unwaivable items open)

## Checklist (§41)
See seo-change-log.md for fixes. Statuses as of 2026-11-13 end of run are in the run report (project doc `claude/seo-geo-v42-run-2026-11-13.md`).

## Blocked / owner needed
seo-owner-todo.md

## Deferred (trigger)
- A17 homepage static calendar fallback (trigger: next homepage rebuild; needs snapshot freshness rule)
- A26 minification/immutable assets (trigger: owner approves build step)
- Verified-bot log check (trigger: Vercel log access)
