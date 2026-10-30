-- Migration: recoverable race deletion ("Recently deleted") + per-edition renewal
-- Date: 2026-10-30
--
-- Delete in the admin no longer removes a race. It is hidden (status -> 'draft'),
-- stamped with deleted_at, and its slug is renamed so the web address is free
-- for a new race. Restore puts status and slug back. The daily cron removes
-- races deleted more than 30 days ago.
--
--   deleted_at            when it was deleted; NULL = not deleted
--   status_before_delete  status to put back on restore
--   slug_before_delete    web address to put back on restore
--   renewed_for_date      race_date the renew cron already made a next-year
--                         draft for. The cron makes at most one draft per race
--                         per race_date, so deleting a draft never brings it back,
--                         and changing the race date (new edition) re-enables it.
--
-- Safe/additive: nullable columns + one backfill. Re-running is harmless.

ALTER TABLE public.races
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_before_delete text,
  ADD COLUMN IF NOT EXISTS slug_before_delete text,
  ADD COLUMN IF NOT EXISTS renewed_for_date date;

CREATE INDEX IF NOT EXISTS idx_races_deleted_at
  ON public.races(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Backfill: a race that already has a next-year draft counts as renewed for its
-- current date. Keeps the old rule ("has a draft -> skip") for existing data.
UPDATE public.races r
   SET renewed_for_date = r.race_date
 WHERE r.renewed_for_date IS NULL
   AND EXISTS (SELECT 1 FROM public.races c WHERE c.parent_race_id = r.id);

COMMENT ON COLUMN public.races.deleted_at IS
  'Set when a race is deleted in the admin. Restorable until deleted_at + 30 days, then purged by the daily cron.';
COMMENT ON COLUMN public.races.status_before_delete IS
  'Status the race had before it was deleted; restored on undo.';
COMMENT ON COLUMN public.races.slug_before_delete IS
  'Slug the race had before it was deleted (deleted races get a placeholder slug so the address is free).';
COMMENT ON COLUMN public.races.renewed_for_date IS
  'race_date the renew cron already created a next-year draft for. One draft per race per race_date.';

NOTIFY pgrst, 'reload schema';

-- Rollback:
--   DROP INDEX IF EXISTS public.idx_races_deleted_at;
--   ALTER TABLE public.races DROP COLUMN IF EXISTS renewed_for_date;
--   ALTER TABLE public.races DROP COLUMN IF EXISTS slug_before_delete;
--   ALTER TABLE public.races DROP COLUMN IF EXISTS status_before_delete;
--   ALTER TABLE public.races DROP COLUMN IF EXISTS deleted_at;
