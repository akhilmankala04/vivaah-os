-- Fix: Add soft delete support to timelines table
ALTER TABLE timelines ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Fix: Add soft delete guard trigger to timelines (was missing)
-- The guard_hard_delete function already exists from the initial migration
CREATE TRIGGER prevent_timeline_delete 
BEFORE DELETE ON timelines 
FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();

-- Fix: Add soft delete guard trigger to vendor_directory (was missing)
CREATE TRIGGER prevent_vendor_directory_delete 
BEFORE DELETE ON vendor_directory 
FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();

-- Fix: Add soft delete guard to payment_milestones general hard deletes
-- Note: prevent_paid_milestone_delete already exists for paid milestones
-- This adds the general guard for ALL milestone hard deletes
-- The paid milestone guard (enforce_paid_milestone_delete) runs first for paid milestones
-- For non-paid milestones, guard_hard_delete blocks hard delete — 
-- soft delete via deleted_at is the only permitted deletion path
CREATE TRIGGER prevent_payment_milestone_hard_delete 
BEFORE DELETE ON payment_milestones 
FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();

-- Also update the timeline index to include WHERE deleted_at IS NULL
-- (Drop and recreate since the original index has no partial condition)
DROP INDEX IF EXISTS idx_timeline_wedding;
CREATE INDEX idx_timeline_wedding ON timelines(wedding_id) WHERE deleted_at IS NULL;
