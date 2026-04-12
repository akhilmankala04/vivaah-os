-- Migration: 20260413000001_fix_tasks_created_by_nullable
-- Purpose: Make tasks.created_by nullable so AI-generated tasks can be
--          inserted by the edge function (service role, no participant actor).
-- Impact:  Existing NOT NULL rows are unaffected. New AI tasks insert with
--          created_by = NULL. Human-created tasks continue to set created_by.

ALTER TABLE tasks
  ALTER COLUMN created_by DROP NOT NULL;
