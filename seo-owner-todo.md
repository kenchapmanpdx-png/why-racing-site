# SEO Owner To-Do
updated: 2026-11-13 | handbook 4.2

## Decisions
| ID | Item | Default applied | Needed from |
|---|---|---|---|
| D1 | Scary Run, Reflection Run, Pacific Coast Running Festival: running in 2027? | Each URL now serves a 200 "not on the current calendar" page with upcoming races (A01). Publishing a 2027 edition in the Staff Portal restores the full page automatically | Karissa |
| D2 | Boilerplate FAQ on 11 event pages (A12): write per-race FAQs, or remove the shared set? | Unchanged (visible copy on 11 pages; needs approval) | Karissa / Brock |
| D3 | Staff Portal footer link removed (A15) | Staff use https://whyracingevents.com/pages/admin/races.html (bookmark) | Ken: tell Brock + Karissa |
| D4 | Homepage title order (A27): topic first, brand last, drop "Premier" | Unchanged (copy) | Ken |
| D5 | Build step for CSS/JS minification + hashed immutable assets (A26) | Not added (new pipeline step) | Ken |

## Business facts needed (never invented)
| ID | Fact | Where it shows |
|---|---|---|
| F1 | Source + date for "50,000+ participants", "$3M+ raised", "Boston Qualifier" (Appletree) | Home, About, Partners, Give Back, Community, Appletree, llms.txt |
| F2 | One event count: "20+" (home) vs "21" (event copy) vs 18 live races | Home title/meta/ticker, About, llms.txt |
| F3 | Per race: entry prices + price-change dates, start time, venue street address + ZIP, parking, cutoffs | 18 event pages + schema `offers.price`, `startDate` time, `location.address` |
| F4 | Real packet pickup location/time per race (9 races showed placeholder rows; now hidden) | Event pages "Packet Pickup" |
| F5 | 1200x630 share image per race (Girlfriends Triathlon uses an Unsplash stock photo) | Event og:image |
| F6 | Profile URLs for `sameAs`: Google Business Profile (if any), RunSignUp organizer page, LinkedIn | Organization schema |
| F7 | Updated club URLs: Steelhead Coaching now redirects to monarchcoachinggroup.com; Chris Bagg Coaching to campfireendurance.com | Training page (Staff Portal: training clubs) |

## Owner access needed
| ID | Access | Unblocks |
|---|---|---|
| X1 | GSC Domain property (`sc-domain:whyracingevents.com`) Owner/Full for kenchapmanpdx@gmail.com | P1 baseline, P10 Validate Fix, Generative AI report |
| X2 | Bing Webmaster Tools (import from GSC) + IndexNow key | P10 |
| X3 | GA4 property G-R4M214WTK7: confirm AI Assistant channel + add custom AI group | P10 |
| X4 | Vercel firewall / bot protection settings visible to the connector (team scope 403) | P9 CDN check (SP12) |
| X5 | After deploy: GSC Events report "Validate Fix"; Page indexing soft 404 "Validate Fix" | P10 |
