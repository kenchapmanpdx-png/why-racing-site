-- Migration: add parent_race_id to races
-- Date: 2026-05-28
-- Purpose: Support "renew past race" behavior. When a race date passes, the daily
-- cron now leaves the past edition ACTIVE (still shown) and creates a DRAFT clone
-- for next year. The clone's parent_race_id points back to the edition it was
-- spawned from. This column does double duty:
--   1. Dedupe: the cron skips a race that already has a child draft
--      (EXISTS race WHERE parent_race_id = <past race id>).
--   2. Replacement: when the clone is published (status -> active), the prior
--      edition (its parent_race_id) is auto-retired to 'archived' so the public
--      calendar shows only the current edition.
--
-- Safe/additive: nullable column, no data rewrite. Rollback: DROP COLUMN.

ALTER TABLE public.races
  ADD COLUMN IF NOT EXISTS parent_race_id uuid
  REFERENCES public.races(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_races_parent_race_id
  ON public.races(parent_race_id);

COMMENT ON COLUMN public.races.parent_race_id IS
  'If set, this race is a next-year draft cloned from the referenced prior edition. Used for cron dedupe and publish-time retirement of the prior edition.';

-- Rollback:
--   DROP INDEX IF EXISTS public.idx_races_parent_race_id;
--   ALTER TABLE public.races DROP COLUMN IF EXISTS parent_race_id;
