-- Migration: 20260411000001_fix_onboarding_bootstrap.sql
-- Problem: The existing INSERT policies for participants, events, budget_ledger,
-- and timelines all require an existing participant record via has_role_or_access().
-- This creates a chicken-and-egg deadlock during onboarding: the first participant
-- cannot be inserted because no participant exists yet.
-- Fix: Add a creator-based bypass on each affected table so the wedding owner
-- can bootstrap all records for a wedding they just created.
-- This is safe because weddings_insert already requires auth.uid() IS NOT NULL,
-- and the created_by column is set by the application (not client-overridable
-- beyond what auth.uid() permits).

-- ── PARTICIPANTS ─────────────────────────────────────────────────────────────
-- Drop existing policy and replace with one that allows the wedding creator to
-- insert the initial participant row (bootstrap), plus the existing ongoing rule.
DROP POLICY IF EXISTS "participants_insert" ON participants;

CREATE POLICY "participants_insert" ON participants FOR INSERT
WITH CHECK (
  -- Bootstrap: the authenticated user is the creator of the wedding
  EXISTS (
    SELECT 1 FROM weddings w
    WHERE w.id = wedding_id AND w.created_by = auth.uid()
  )
  -- Ongoing: existing head planner / planner_full can invite others
  OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
);

-- ── EVENTS ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "events_insert" ON events;

CREATE POLICY "events_insert" ON events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM weddings w
    WHERE w.id = wedding_id AND w.created_by = auth.uid()
  )
  OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
);

-- ── BUDGET_LEDGER ─────────────────────────────────────────────────────────────
-- No INSERT policy existed before — add one.
CREATE POLICY "budget_ledger_insert" ON budget_ledger FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM weddings w
    WHERE w.id = wedding_id AND w.created_by = auth.uid()
  )
  OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
);

-- ── TIMELINES ────────────────────────────────────────────────────────────────
-- Drop if exists (policy name from Phase 1 may vary); recreate with bootstrap bypass.
DROP POLICY IF EXISTS "timelines_insert" ON timelines;

CREATE POLICY "timelines_insert" ON timelines FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM weddings w
    WHERE w.id = wedding_id AND w.created_by = auth.uid()
  )
  OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
);
