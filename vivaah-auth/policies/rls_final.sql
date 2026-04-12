-- RLS Final — vivaah-auth/policies/rls_final.sql
-- Single source of truth for all Row Level Security policies across the core schema.
-- This file consolidates and supersedes:
--   vivaah-schema/migrations/archive/20260409000001_vivaah_os_phase1_rls.sql
--   vivaah-schema/migrations/archive/20260411000001_fix_onboarding_bootstrap.sql
--   vivaah-auth/policies/archive/20260410000003_fix_couple_view_vendors.sql
--   vivaah-schema/migrations/archive/20260412000003_fix_vendor_directory_rls.sql
--   vivaah-schema/migrations/archive/20260410000002_fix_financial_summary_security.sql
--
-- Run AFTER:
--   vivaah-schema/migrations/20260409000000_vivaah_os_phase1_schema.sql
--   vivaah-schema/migrations/20260410000001_fix_timelines_soft_delete.sql
-- Run BEFORE:
--   vivaah-schema/migrations/20260410000010_phase2_schema_additions.sql
--
-- Tables NOT covered here (RLS defined in their own migration):
--   briefings           → vivaah-schema/migrations/20260412000001_briefings_table.sql
--   wedding_templates   → vivaah-schema/migrations/20260410000010_phase2_schema_additions.sql

-- ============================================================
-- 1. Helper Functions
-- ============================================================

-- Returns true if the current user has any of the given access levels on the wedding,
-- OR is the head_planner regardless of listed access levels.
CREATE OR REPLACE FUNCTION has_role_or_access(p_wedding_id uuid, p_allowed_levels text[])
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM participants
    WHERE wedding_id = p_wedding_id
      AND user_id = auth.uid()
      AND status = 'active'
      AND (access_level = ANY(p_allowed_levels) OR role = 'head_planner')
  );
$$;

-- Returns the event_scope_id of the current user's participant record for this wedding.
-- Used to enforce event_specific access restrictions.
CREATE OR REPLACE FUNCTION get_event_scope_id(p_wedding_id uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT event_scope_id FROM participants
  WHERE wedding_id = p_wedding_id AND user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

-- Returns the participant id of the current user for this wedding.
-- Used to enforce task-level access restrictions (assigned_to check).
CREATE OR REPLACE FUNCTION get_participant_id(p_wedding_id uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT id FROM participants
  WHERE wedding_id = p_wedding_id AND user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

-- Returns true if the current user has any active participant record on this wedding.
CREATE OR REPLACE FUNCTION is_active_participant(p_wedding_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM participants
    WHERE wedding_id = p_wedding_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- ============================================================
-- 2. Enable RLS on all core tables
-- ============================================================

ALTER TABLE weddings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_directory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_instances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_instance_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_milestones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_ledger           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines               ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_queue          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_errors        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Policies
-- ============================================================

-- ── WEDDINGS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "weddings_select" ON weddings;
DROP POLICY IF EXISTS "weddings_insert" ON weddings;
DROP POLICY IF EXISTS "weddings_update" ON weddings;
DROP POLICY IF EXISTS "weddings_delete" ON weddings;

CREATE POLICY "weddings_select" ON weddings FOR SELECT
  USING (is_active_participant(id));

CREATE POLICY "weddings_insert" ON weddings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "weddings_update" ON weddings FOR UPDATE
  USING (has_role_or_access(id, ARRAY['planner_full', 'full']));

CREATE POLICY "weddings_delete" ON weddings FOR DELETE
  USING (false);

-- ── EVENTS ───────────────────────────────────────────────────
-- INSERT includes bootstrap bypass so the wedding creator can insert events
-- before their participant row exists (chicken-and-egg at onboarding).
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;
DROP POLICY IF EXISTS "events_delete" ON events;

CREATE POLICY "events_select" ON events FOR SELECT
  USING (is_active_participant(wedding_id));

CREATE POLICY "events_insert" ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings w
      WHERE w.id = wedding_id AND w.created_by = auth.uid()
    )
    OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
  );

CREATE POLICY "events_update" ON events FOR UPDATE
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "events_delete" ON events FOR DELETE
  USING (false);

-- ── PARTICIPANTS ─────────────────────────────────────────────
-- INSERT includes bootstrap bypass for first participant row (wedding creator).
DROP POLICY IF EXISTS "participants_select" ON participants;
DROP POLICY IF EXISTS "participants_insert" ON participants;
DROP POLICY IF EXISTS "participants_update" ON participants;
DROP POLICY IF EXISTS "participants_delete" ON participants;

CREATE POLICY "participants_select" ON participants FOR SELECT
  USING (
    has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
    OR user_id = auth.uid()
  );

CREATE POLICY "participants_insert" ON participants FOR INSERT
  WITH CHECK (
    -- Bootstrap: authenticated user is the creator of the wedding
    EXISTS (
      SELECT 1 FROM weddings w
      WHERE w.id = wedding_id AND w.created_by = auth.uid()
    )
    -- Ongoing: existing head planner / planner_full can invite others
    OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
  );

-- Column-level restrictions enforced at application layer — RLS restricts rows only.
CREATE POLICY "participants_update" ON participants FOR UPDATE
  USING (
    has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
    OR user_id = auth.uid()
  );

CREATE POLICY "participants_delete" ON participants FOR DELETE
  USING (false);

-- ── VENDOR DIRECTORY ─────────────────────────────────────────
-- SELECT is open to all authenticated users — vendor_directory is a shared library.
-- Write operations remain owner-scoped.
DROP POLICY IF EXISTS "vendor_directory_select" ON vendor_directory;
DROP POLICY IF EXISTS "vendor_directory_insert" ON vendor_directory;
DROP POLICY IF EXISTS "vendor_directory_update" ON vendor_directory;
DROP POLICY IF EXISTS "vendor_directory_delete" ON vendor_directory;

CREATE POLICY "vendor_directory_select" ON vendor_directory FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "vendor_directory_insert" ON vendor_directory FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "vendor_directory_update" ON vendor_directory FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "vendor_directory_delete" ON vendor_directory FOR DELETE
  USING (false);

-- ── VENDOR INSTANCES ─────────────────────────────────────────
-- couple_view and family_view (Mode 1) can see confirmed/done vendors only.
-- Rate field is still hidden via the vendor_instances_view CASE statement.
DROP POLICY IF EXISTS "vendor_instances_select" ON vendor_instances;
DROP POLICY IF EXISTS "vendor_instances_insert" ON vendor_instances;
DROP POLICY IF EXISTS "vendor_instances_update" ON vendor_instances;
DROP POLICY IF EXISTS "vendor_instances_delete" ON vendor_instances;

CREATE POLICY "vendor_instances_select" ON vendor_instances FOR SELECT
  USING (
    -- Full access tiers: see all vendors for this wedding
    has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget', 'task', 'view_only'])
    OR
    -- Event-specific: only their assigned event's vendors
    (
      has_role_or_access(wedding_id, ARRAY['event_specific'])
      AND id IN (
        SELECT vendor_instance_id FROM vendor_instance_events
        WHERE event_id = get_event_scope_id(wedding_id)
      )
    )
    OR
    -- Couple-view (Mode 1): confirmed and done vendors only
    (
      has_role_or_access(wedding_id, ARRAY['couple_view'])
      AND confirmation_status IN ('confirmed', 'done')
      AND deleted_at IS NULL
    )
    OR
    -- Family-view (Mode 1): confirmed and done vendors only
    (
      has_role_or_access(wedding_id, ARRAY['family_view'])
      AND confirmation_status IN ('confirmed', 'done')
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "vendor_instances_insert" ON vendor_instances FOR INSERT
  WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "vendor_instances_update" ON vendor_instances FOR UPDATE
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "vendor_instances_delete" ON vendor_instances FOR DELETE
  USING (false);

-- ── VENDOR INSTANCE EVENTS ───────────────────────────────────
DROP POLICY IF EXISTS "vendor_instance_events_select" ON vendor_instance_events;
DROP POLICY IF EXISTS "vendor_instance_events_insert" ON vendor_instance_events;
DROP POLICY IF EXISTS "vendor_instance_events_delete" ON vendor_instance_events;

CREATE POLICY "vendor_instance_events_select" ON vendor_instance_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id AND (
        has_role_or_access(e.wedding_id, ARRAY['planner_full', 'full', 'budget', 'task', 'view_only'])
        OR (
          has_role_or_access(e.wedding_id, ARRAY['event_specific'])
          AND e.id = get_event_scope_id(e.wedding_id)
        )
      )
    )
  );

CREATE POLICY "vendor_instance_events_insert" ON vendor_instance_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id AND has_role_or_access(e.wedding_id, ARRAY['planner_full', 'full'])
    )
  );

CREATE POLICY "vendor_instance_events_delete" ON vendor_instance_events FOR DELETE
  USING (false);

-- ── PAYMENT MILESTONES ───────────────────────────────────────
DROP POLICY IF EXISTS "payment_milestones_select" ON payment_milestones;
DROP POLICY IF EXISTS "payment_milestones_insert" ON payment_milestones;
DROP POLICY IF EXISTS "payment_milestones_update" ON payment_milestones;
DROP POLICY IF EXISTS "payment_milestones_delete" ON payment_milestones;

CREATE POLICY "payment_milestones_select" ON payment_milestones FOR SELECT
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget']));

CREATE POLICY "payment_milestones_insert" ON payment_milestones FOR INSERT
  WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "payment_milestones_update" ON payment_milestones FOR UPDATE
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "payment_milestones_delete" ON payment_milestones FOR DELETE
  USING (false);

-- ── BUDGET LEDGER ─────────────────────────────────────────────
-- INSERT includes bootstrap bypass so the wedding creator can initialise
-- the budget row before their participant record is committed.
DROP POLICY IF EXISTS "budget_ledger_select" ON budget_ledger;
DROP POLICY IF EXISTS "budget_ledger_insert" ON budget_ledger;
DROP POLICY IF EXISTS "budget_ledger_update" ON budget_ledger;

CREATE POLICY "budget_ledger_select" ON budget_ledger FOR SELECT
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget']));

CREATE POLICY "budget_ledger_insert" ON budget_ledger FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings w
      WHERE w.id = wedding_id AND w.created_by = auth.uid()
    )
    OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
  );

CREATE POLICY "budget_ledger_update" ON budget_ledger FOR UPDATE
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

-- ── TASKS ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

CREATE POLICY "tasks_select" ON tasks FOR SELECT
  USING (
    has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget', 'view_only'])
    OR (
      has_role_or_access(wedding_id, ARRAY['task'])
      AND assigned_to = get_participant_id(wedding_id)
    )
    OR (
      has_role_or_access(wedding_id, ARRAY['event_specific'])
      AND event_id = get_event_scope_id(wedding_id)
    )
  );

CREATE POLICY "tasks_insert" ON tasks FOR INSERT
  WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

-- Column-level restrictions enforced at application layer — RLS restricts rows only.
CREATE POLICY "tasks_update" ON tasks FOR UPDATE
  USING (
    has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
    OR (
      has_role_or_access(wedding_id, ARRAY['task'])
      AND assigned_to = get_participant_id(wedding_id)
    )
  );

CREATE POLICY "tasks_delete" ON tasks FOR DELETE
  USING (false);

-- ── TIMELINES ────────────────────────────────────────────────
-- All participant roles can read timelines (schedule is broadly visible).
-- INSERT includes bootstrap bypass for onboarding.
DROP POLICY IF EXISTS "timelines_select" ON timelines;
DROP POLICY IF EXISTS "timelines_insert" ON timelines;

CREATE POLICY "timelines_select" ON timelines FOR SELECT
  USING (
    has_role_or_access(wedding_id, ARRAY[
      'planner_full', 'full', 'view_only', 'budget',
      'couple_view', 'task', 'event_specific',
      'family_view', 'guest'
    ])
  );

CREATE POLICY "timelines_insert" ON timelines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM weddings w
      WHERE w.id = wedding_id AND w.created_by = auth.uid()
    )
    OR has_role_or_access(wedding_id, ARRAY['planner_full', 'full'])
  );

-- ── AUDIT LOG ────────────────────────────────────────────────
-- Write access is restricted to service role only.
-- Edge Functions must use SUPABASE_SERVICE_ROLE_KEY when writing to audit_log.
DROP POLICY IF EXISTS "audit_log_select" ON audit_log;
DROP POLICY IF EXISTS "audit_log_insert_update_delete" ON audit_log;

CREATE POLICY "audit_log_select" ON audit_log FOR SELECT
  USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "audit_log_insert_update_delete" ON audit_log FOR ALL
  USING (false);

-- ── MESSAGES QUEUE ───────────────────────────────────────────
-- Access is restricted to service role only. Delivery status is exposed
-- to end users via Edge Functions, never direct table reads.
DROP POLICY IF EXISTS "messages_queue_all" ON messages_queue;

CREATE POLICY "messages_queue_all" ON messages_queue FOR ALL
  USING (false);

-- ── AUDIT LOG ERRORS ─────────────────────────────────────────
-- Access is restricted to service role only.
DROP POLICY IF EXISTS "audit_log_errors_all" ON audit_log_errors;

CREATE POLICY "audit_log_errors_all" ON audit_log_errors FOR ALL
  USING (false);

-- ============================================================
-- 4. Vendor instances view (conditional rate visibility)
-- ============================================================
-- Hides negotiated_rate from restricted access levels.
-- All SELECT on vendor data must use this view, never the base table.

CREATE OR REPLACE VIEW vendor_instances_view
WITH (security_invoker = true)
AS
SELECT
    id, wedding_id, directory_reference_id, vendor_name, category, city, phone,
    CASE
      WHEN has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget']) THEN negotiated_rate
      ELSE NULL::bigint
    END AS negotiated_rate,
    deliverables, contract_status, confirmation_status, planner_notes,
    created_at, updated_at, deleted_at
FROM vendor_instances;

-- ============================================================
-- 5. couple_view_financial_summary (SECURITY DEFINER function)
-- ============================================================
-- Bypasses RLS to sum financial fields that couple_view cannot directly see.
-- Includes an inline active-participant check so it cannot be called by outsiders.

CREATE OR REPLACE FUNCTION couple_view_financial_summary(p_wedding_id uuid)
RETURNS TABLE (
    total_planned    bigint,
    total_committed  bigint,
    total_paid       bigint,
    upcoming_30_days bigint
) AS $$
BEGIN
    -- Security check: caller must be an active participant on this wedding
    IF NOT is_active_participant(p_wedding_id) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        bl.total_planned_budget AS total_planned,
        COALESCE((
            SELECT SUM(negotiated_rate)
            FROM vendor_instances
            WHERE wedding_id = p_wedding_id
              AND confirmation_status IN ('booked', 'confirmed', 'done')
              AND deleted_at IS NULL
        ), 0) AS total_committed,
        COALESCE((
            SELECT SUM(amount)
            FROM payment_milestones
            WHERE wedding_id = p_wedding_id
              AND status = 'paid'
              AND deleted_at IS NULL
        ), 0) AS total_paid,
        COALESCE((
            SELECT SUM(amount)
            FROM payment_milestones
            WHERE wedding_id = p_wedding_id
              AND status IN ('upcoming', 'due')
              AND due_date <= CURRENT_DATE + 30
              AND deleted_at IS NULL
        ), 0) AS upcoming_30_days
    FROM budget_ledger bl
    WHERE bl.wedding_id = p_wedding_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION couple_view_financial_summary(uuid) TO authenticated;
