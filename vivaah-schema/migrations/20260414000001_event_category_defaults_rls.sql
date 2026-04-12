-- Migration: 20260414000001_event_category_defaults_rls.sql
-- Creates the event_category_defaults table (if missing on fresh installs)
-- and enables RLS with read-only access for authenticated users.
--
-- This table is a shared platform reference — it is never user-writable.
-- All writes are done via the seed script:
--   vivaah-india-defaults/seeds/seed_event_category_defaults.sql

CREATE TABLE IF NOT EXISTS event_category_defaults (
  id            serial PRIMARY KEY,
  event_type    text    NOT NULL,
  category_name text    NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  UNIQUE (event_type, category_name)
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE event_category_defaults ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read platform defaults.
-- No user can write to this table — inserts/updates come from seed scripts
-- run under the service role, not from application code.
DROP POLICY IF EXISTS "event_category_defaults_select" ON event_category_defaults;

CREATE POLICY "event_category_defaults_select" ON event_category_defaults FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Block all writes from user-context queries
DROP POLICY IF EXISTS "event_category_defaults_write" ON event_category_defaults;

CREATE POLICY "event_category_defaults_write" ON event_category_defaults FOR ALL
  USING (false);
