# Race delete, restore, renew: exact behavior

Code: `lib/race-trash.js`, `lib/race-clone.js`, `server.js`, `api/cron/archive-races.js`, `pages/admin/races.html`
Schema: `schema/2026-10-30_soft_delete_races.sql`
Tests: 62 API/cron + 43 browser + 2 concurrency scenarios against a Postgres/PostgREST mirror of production (2026-10-30); independent code review applied

## Timing constants

| Item | Value |
|---|---|
| Restore window | exactly 30 x 24 h after delete (`restore_until` shown in admin, viewer's local time) |
| Nightly job | 00:00 UTC = 5:00 PM PDT / 4:00 PM PST |
| Race list on site (`/api/races`) | CDN max age 60 s + 60 s stale: changes show within 2 min |
| Event page `/events/<slug>` | CDN max age 300 s + 60 s stale: changes show within 6 min |
| Event page 404 | CDN max age 60 s + 60 s stale: a restored page shows within 2 min |
| `sitemap.xml` | 10 min + up to 1 day stale (crawlers only) |
| `llms.txt` | 1 h + up to 1 day stale (crawlers only) |

## Delete

Trigger: Delete button on a race row, or "Delete this race" in the edit form. Both open one dialog.

| Step | Result |
|---|---|
| Dialog | Cancel has focus; Enter or Esc = cancel; Delete disabled for 0.6 s (double-click cannot confirm) |
| Dialog text | race name, date, place; live-race warning; exact restore deadline |
| Confirm | `status`='draft', `deleted_at`=now, `status_before_delete`, `slug_before_delete` saved, `slug`=`<slug>--deleted-<id>`. Compare-and-swap on status: a save landing at the same moment is never lost from `status_before_delete` |
| Website | off the race list immediately; event page 404 within 6 min |
| Web address | free immediately; a new race with the same name gets it |
| Child data | distances, FAQs, sponsors, photos etc. kept |
| Images in Storage | kept |
| Other editions (parent / next-year draft) | not touched |
| Admin | toast "Deleted" + Undo (10 s); row moves to Recently deleted with "Restorable until" |
| Delete again (double submit, 2 tabs) | no-op, same deadline |
| Save from a stale edit tab, or a save racing the delete | refused (409): "Restore it from Recently deleted before editing"; the update itself is filtered on `deleted_at IS NULL` |
| Failure | dialog stays open with the reason; nothing changed |

## Restore

Trigger: Undo in the toast, or Restore in Recently deleted. Allowed until `restore_until`.

| Case | Result |
|---|---|
| Normal | previous status and address back; on the website at once if it was active |
| Was active, newer edition of it now live | restored as `archived` (site never shows 2 editions) |
| Restored active, its previous edition is active | previous edition set to `archived` (same as publishing) |
| Its address was taken meanwhile | first free `<slug>-2`, `-3` ...; toast names the new address |
| Already restored | no-op |
| After 30 days | not listed; refused (410); removed at the next nightly job |
| Already removed | refused (404) |

## Permanent removal (nightly job, step 2)

| Case | Result |
|---|---|
| Deleted more than 30 days ago | row removed with all child rows |
| Deleted less than 30 days ago | kept |
| Removed race was a previous edition | newer edition stays; its parent link is cleared |
| Row active but marked deleted (cannot happen via app) | never removed; logged as error |
| Step fails | logged; renew step unaffected; job returns 500 so Vercel shows the failure |

## Next-year draft (nightly job, step 1)

Rule: each active, not-deleted race whose date has passed (Pacific date) gets one draft per race date. Mark: `renewed_for_date` = `race_date`.

| Case | Result |
|---|---|
| Date passes, not yet marked | draft created (deep copy, dates +1 year), race marked |
| Already marked for this date | skipped |
| Draft deleted (or later removed for good) | never re-created for that date |
| Race date changed (new edition), new date passes | new draft for the new date |
| Race deleted | not renewed |
| Race restored, date passed, not marked | renewed on the next nightly job |
| Copy fails | mark reverted; error logged; retried next night |
| Race deleted while being copied | new draft removed; mark reverted |
| Rows linked to a distance (start times, pricing tiers, course records, amenities) | copied and re-pointed to the copy's distances; removing last year never touches the new edition |
| Renew step fails (e.g. database error) | purge step still runs; job returns 500 |
| Two runs at once | only one can set the mark (compare-and-swap); no duplicate drafts |
| Existing data at migration | races that already had a draft are marked for their current date: no new draft until their date changes and passes again (same as before for the current edition) |

## Edit form (fixed 2026-10-30)

| Field / action | Behavior |
|---|---|
| Race type, registration URL, registration open, state | loaded when editing; saved back unchanged unless edited. Unknown stored values are added to the dropdown, never dropped |
| Distances | updated in place by id: only name, type, value written; price, capacity, start time kept. Removed rows deleted (their start times, course records, amenities, pricing tiers go with them). New rows inserted with price 0 |
| Unknown distance type | added to the dropdown; never dropped |
| Thumbnail | current image shown; Remove + save clears it; new upload replaces it; upload error = alert, save continues with the old image |
| Buttons (editing) | Save Changes (keeps current status, label shows it), Save as Draft, Save & Publish |
| Enter key in a field | does nothing (used to publish) |
| Double-click / repeat click on a save button | one save; buttons disabled until it finishes |
| Publish an edition whose newer edition is live | refused (409); keep it archived with Save Changes |
| Publish with a registration URL on whyracingevents.com / why-racing-site.vercel.app | refused (400): after the domain moves, the link would loop back to the race's own page. Allowed on drafts |
| Stored NULL race type / state | shown as "(not set)", saved back as NULL |
| Stored NULL distance type | kept NULL; existing distances are never dropped on save; an empty name keeps the stored name |
| After save | back to list, form cleared, toast; "View page" for live races (`/events/<slug>`) |
| New race with an existing race's name | refused: "Another race already uses the web address /events/<slug>" |
| Admin list dates | shown as stored (no longer a day early in Pacific time) |

## Error messages

| Cause | Message |
|---|---|
| Login expired | "your login expired. Refresh the page and log in again." |
| Rate limit (100 API requests / 15 min per IP) | "too many requests in a short time. Wait a few minutes and try again." |
| Database update not run | "Delete is not switched on yet: run schema/2026-10-30_soft_delete_races.sql ..." |

## Data repaired 2026-10-30 (`schema/2026-10-30_repair_admin_edit_wipes.sql`)

Cause: old edit form wiped registration URL and race type on every save (edits on 2026-10-29 and 2026-10-30).

| Fix | Rows | Source |
|---|---|---|
| Registration URL restored | hagg-lake-triathlon-trail-festival-2027, maupin-daze, mccubbins-gulch, mt-hood-scramble, pacific-coast-running-festival, pacific-crest-endurance-sports-festival, reflection-run, scary-run, silver-falls-trail-challenge | other edition of the same race |
| Race type `triathlon` | pdx-triathlon-festival, pacific-crest-endurance-sports-festival, hagg-lake-triathlon-trail-festival (+ -2027), columbia-river-triathlon-endurance-sports-festival, girlfriends-all-women-s-triathlon-fitness-festival | AUDIT-2026-05-28.md M-1 |
| Resolution Run prices 5K $45, 10K $55 | resolution-run | resolution-run-2027 copy |
| Couve Clover 2027 URL (pointed at Santa's Posse) | couve-clover-run-2027 | couve-clover-run |
| Scary Run 15K type 5K -> 15K | scary-run, scary-run-2027 | distance name |
| Duplicate distances removed | pacific-coast-running-festival (6 -> 3) | identical rows; no start times, tiers, records or amenities were linked to them (checked 2026-10-30) |

## Drafts whose registration URL is on the old website (cannot be published until changed)

appletree-marathon-2027, columbia-river-triathlon-endurance-sports-festival-2027, girlfriends-all-women-s-triathlon-fitness-festival-2027, pacific-coast-running-festival-2027, pacific-crest-endurance-sports-festival-2027, pdx-triathlon-festival-2027, reflection-run-2027, spring-classic-duathlon-half-marathon-10k-5k-2027; after repair also pacific-coast-running-festival, pacific-crest-endurance-sports-festival, reflection-run. All drafts; none live.

## Races marked "already renewed" by the migration

Every race that had a next-year draft on 2026-10-30 (23 races, 15 of them live) is marked for its current date. For these, no new draft is made when the current date passes; renewal resumes after the date is changed to a new edition and that date passes. Their existing drafts are copies of the edition at copy time (many are stale because the original was edited in place); delete any that are not wanted.
