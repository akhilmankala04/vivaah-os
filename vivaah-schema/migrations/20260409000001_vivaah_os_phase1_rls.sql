-- Migration: 20260409000001_vivaah_os_phase1_rls.sql

-- 1. Helper Functions
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

CREATE OR REPLACE FUNCTION get_event_scope_id(p_wedding_id uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT event_scope_id FROM participants
  WHERE wedding_id = p_wedding_id AND user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_participant_id(p_wedding_id uuid)
RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT id FROM participants
  WHERE wedding_id = p_wedding_id AND user_id = auth.uid() AND status = 'active'
  LIMIT 1;
$$;

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

-- 2. Enable RLS
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_instance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log_errors ENABLE ROW LEVEL SECURITY;


-- 3. Policy Applications

-- WEDDINGS
CREATE POLICY "weddings_select" ON weddings FOR SELECT
USING (is_active_participant(id));

CREATE POLICY "weddings_insert" ON weddings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "weddings_update" ON weddings FOR UPDATE
USING (has_role_or_access(id, ARRAY['planner_full', 'full']));

CREATE POLICY "weddings_delete" ON weddings FOR DELETE
USING (false);

-- EVENTS
CREATE POLICY "events_select" ON events FOR SELECT
USING (is_active_participant(wedding_id));

CREATE POLICY "events_insert" ON events FOR INSERT
WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "events_update" ON events FOR UPDATE
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "events_delete" ON events FOR DELETE
USING (false);

-- PARTICIPANTS
CREATE POLICY "participants_select" ON participants FOR SELECT
USING (
  has_role_or_access(wedding_id, ARRAY['planner_full', 'full']) 
  OR user_id = auth.uid()
);

CREATE POLICY "participants_insert" ON participants FOR INSERT
WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

-- Column-level restrictions enforced at application layer — RLS restricts rows only.
CREATE POLICY "participants_update" ON participants FOR UPDATE
USING (
  has_role_or_access(wedding_id, ARRAY['planner_full', 'full']) 
  OR user_id = auth.uid()
);

CREATE POLICY "participants_delete" ON participants FOR DELETE
USING (false);

-- VENDOR DIRECTORY
CREATE POLICY "vendor_directory_select" ON vendor_directory FOR SELECT
USING (owner_user_id = auth.uid());

CREATE POLICY "vendor_directory_insert" ON vendor_directory FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "vendor_directory_update" ON vendor_directory FOR UPDATE
USING (owner_user_id = auth.uid());

CREATE POLICY "vendor_directory_delete" ON vendor_directory FOR DELETE
USING (false);

-- VENDOR INSTANCES
CREATE POLICY "vendor_instances_select" ON vendor_instances FOR SELECT
USING (
  has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget', 'task', 'view_only'])
  OR (
    has_role_or_access(wedding_id, ARRAY['event_specific']) 
    AND id IN (
      SELECT vendor_instance_id FROM vendor_instance_events 
      WHERE event_id = get_event_scope_id(wedding_id)
    )
  )
);

CREATE POLICY "vendor_instances_insert" ON vendor_instances FOR INSERT
WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "vendor_instances_update" ON vendor_instances FOR UPDATE
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "vendor_instances_delete" ON vendor_instances FOR DELETE
USING (false);

-- VENDOR INSTANCE EVENTS
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

-- PAYMENT MILESTONES
CREATE POLICY "payment_milestones_select" ON payment_milestones FOR SELECT
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget']));

CREATE POLICY "payment_milestones_insert" ON payment_milestones FOR INSERT
WITH CHECK (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "payment_milestones_update" ON payment_milestones FOR UPDATE
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "payment_milestones_delete" ON payment_milestones FOR DELETE
USING (false);

-- BUDGET LEDGER
CREATE POLICY "budget_ledger_select" ON budget_ledger FOR SELECT
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'budget']));

CREATE POLICY "budget_ledger_update" ON budget_ledger FOR UPDATE
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

-- TASKS
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

-- TIMELINES
CREATE POLICY "timelines_select" ON timelines FOR SELECT
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full', 'view_only', 'budget', 'couple_view', 'task', 'event_specific']));

-- AUDIT LOG
-- Write access is restricted to service role only. Edge Functions must use the SUPABASE_SERVICE_ROLE_KEY, not the anon key, when writing to audit_log and messages_queue. Using the anon key will result in permission denied.
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT
USING (has_role_or_access(wedding_id, ARRAY['planner_full', 'full']));

CREATE POLICY "audit_log_insert_update_delete" ON audit_log FOR ALL
USING (false);

-- MESSAGES QUEUE
-- Access is restricted to service role only. End users fetch delivery status via Edge Functions.
CREATE POLICY "messages_queue_all" ON messages_queue FOR ALL
USING (false);

-- AUDIT LOG ERRORS
-- Access is restricted to service role only.
CREATE POLICY "audit_log_errors_all" ON audit_log_errors FOR ALL
USING (false);

-- 4. VIEWS FOR CONDITIONAL FIELD ACCESS

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

-- Redefine couple_view_financial_summary to bypass RLS natively using SECURITY DEFINER 
-- so that it can secretly sum fields its invoker cannot see.
-- Includes an inline security check to ensure callers are actively participating in the wedding.
CREATE OR REPLACE FUNCTION couple_view_financial_summary(p_wedding_id uuid)
RETURNS TABLE (
    total_planned bigint,
    total_committed bigint,
    total_paid bigint,
    upcoming_30_days bigint
) AS $$
BEGIN
    IF NOT is_active_participant(p_wedding_id) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        bl.total_planned_budget AS total_planned,
        COALESCE((SELECT SUM(negotiated_rate) FROM vendor_instances WHERE wedding_id = p_wedding_id AND confirmation_status IN ('booked', 'confirmed', 'done') AND deleted_at IS NULL), 0) AS total_committed,
        COALESCE((SELECT SUM(amount) FROM payment_milestones WHERE wedding_id = p_wedding_id AND status = 'paid' AND deleted_at IS NULL), 0) AS total_paid,
        COALESCE((SELECT SUM(amount) FROM payment_milestones WHERE wedding_id = p_wedding_id AND status IN ('upcoming', 'due') AND due_date <= CURRENT_DATE + 30 AND deleted_at IS NULL), 0) AS upcoming_30_days
    FROM budget_ledger bl
    WHERE bl.wedding_id = p_wedding_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION couple_view_financial_summary(uuid) TO authenticated;
