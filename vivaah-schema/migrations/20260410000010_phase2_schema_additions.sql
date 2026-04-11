-- Migration: 20260410000010_phase2_schema_additions.sql
-- Phase 2 schema additions: wedding_templates table, health score cache, Edge Function support
-- Prerequisites: 20260409000000, 20260409000001, 20260410000001, 20260410000002 must be applied first

-- ============================================================
-- 1. wedding_templates table
-- ============================================================
-- SCHEMA RULE: This table must NEVER store couple names, wedding dates,
-- vendor data, rates, payment milestones, or client notes.
-- Only event structure, access configuration, and task category defaults.

CREATE TABLE wedding_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES auth.users(id),
  template_name text NOT NULL,
  event_sequence jsonb NOT NULL,
  -- Array of: { event_name: text, display_order: integer, is_custom: boolean }
  -- Example: [{"event_name": "haldi", "display_order": 1, "is_custom": false}]
  access_config jsonb NOT NULL,
  -- Mode 1: { default_couple_access: "couple_view", default_family_access: "family_view" }
  -- Mode 2: { default_participant_access: "view_only" }
  task_category_defaults jsonb,
  -- Array of category name strings, e.g. ["Decor", "Catering", "Photography"]
  usage_count integer NOT NULL DEFAULT 0,
  last_used_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT template_name_not_empty CHECK (length(trim(template_name)) > 0)
);

COMMENT ON TABLE wedding_templates IS
  'Planner-owned reusable wedding configuration templates. '
  'Stores ONLY event structure, access config, and task defaults. '
  'NEVER stores couple names, wedding dates, vendor data, rates, milestones, or client notes.';

-- ============================================================
-- 2. weddings table — 3 new columns for Phase 2
-- ============================================================

-- Cached health score for performant portfolio view (NFR-03-5)
-- Invalidated by triggers on payment_milestones, vendor_instances, tasks
ALTER TABLE weddings
  ADD COLUMN IF NOT EXISTS health_score text
    CHECK (health_score IN ('good', 'at_risk', 'critical'))
    DEFAULT 'good',
  ADD COLUMN IF NOT EXISTS health_score_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES wedding_templates(id);

COMMENT ON COLUMN weddings.health_score IS
  'Cached health score from wedding_health_score(). '
  'Invalidated (recalculated) by triggers on payment_milestones, vendor_instances, and tasks status changes.';

-- ============================================================
-- 3. Health score cache function and triggers
-- ============================================================

-- Helper called by triggers and Edge Functions to recalculate and persist health score
CREATE OR REPLACE FUNCTION cache_wedding_health_score_for(p_wedding_id uuid)
RETURNS void AS $$
DECLARE
  v_health_result record;
BEGIN
  -- wedding_health_score() already exists from Phase 1 schema
  SELECT * INTO v_health_result FROM wedding_health_score(p_wedding_id);
  UPDATE weddings
  SET health_score = v_health_result.state,
      health_score_updated_at = now()
  WHERE id = p_wedding_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cache_wedding_health_score_for(uuid) IS
  'Recalculates and caches health_score on weddings by calling wedding_health_score(). '
  'Called by triggers and Edge Functions. SECURITY DEFINER so triggers can write without caller elevation.';

-- Trigger function: called by all three status-change triggers below
CREATE OR REPLACE FUNCTION trigger_cache_wedding_health_score()
RETURNS trigger AS $$
BEGIN
  PERFORM cache_wedding_health_score_for(NEW.wedding_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 1: PaymentMilestone status changes
CREATE TRIGGER recalculate_health_on_milestone_change
  AFTER UPDATE ON payment_milestones
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_cache_wedding_health_score();

-- Trigger 2: VendorInstance confirmation_status changes
CREATE TRIGGER recalculate_health_on_vendor_change
  AFTER UPDATE ON vendor_instances
  FOR EACH ROW
  WHEN (OLD.confirmation_status IS DISTINCT FROM NEW.confirmation_status)
  EXECUTE FUNCTION trigger_cache_wedding_health_score();

-- Trigger 3: Task status changes
CREATE TRIGGER recalculate_health_on_task_change
  AFTER UPDATE ON tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_cache_wedding_health_score();

-- ============================================================
-- 4. RLS on wedding_templates
-- ============================================================

ALTER TABLE wedding_templates ENABLE ROW LEVEL SECURITY;

-- Owner isolation: same pattern as vendor_directory
-- No cross-user access allowed under any circumstance
CREATE POLICY "templates_select" ON wedding_templates FOR SELECT
  USING (owner_user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "templates_insert" ON wedding_templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_user_id = auth.uid());

CREATE POLICY "templates_update" ON wedding_templates FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Hard deletes blocked — soft delete only (guard trigger below)
CREATE POLICY "templates_delete" ON wedding_templates FOR DELETE
  USING (false);

-- ============================================================
-- 5. Standard triggers on wedding_templates
-- ============================================================

-- Reuse existing set_updated_at() function from Phase 1
CREATE TRIGGER set_wedding_templates_updated_at
  BEFORE UPDATE ON wedding_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Reuse existing guard_hard_delete() function from Phase 1
CREATE TRIGGER prevent_wedding_template_delete
  BEFORE DELETE ON wedding_templates
  FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();

-- ============================================================
-- 6. New indexes
-- ============================================================

CREATE INDEX idx_templates_owner
  ON wedding_templates(owner_user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_weddings_health
  ON weddings(health_score)
  WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX idx_paymentmilestone_overdue
  ON payment_milestones(wedding_id, due_date)
  WHERE status IN ('upcoming', 'due') AND deleted_at IS NULL;
