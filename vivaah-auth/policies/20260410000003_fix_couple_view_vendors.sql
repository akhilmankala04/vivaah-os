-- Fix: Allow couple_view and family_view to see confirmed/done vendors
-- Rate field remains NULL via the vendor_instances_view CASE statement

-- Drop the existing vendor_instances_select policy and replace it
DROP POLICY IF EXISTS "vendor_instances_select" ON vendor_instances;

CREATE POLICY "vendor_instances_select" ON vendor_instances FOR SELECT
USING (
  -- Full access tiers: see all vendors
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
  -- Couple-view (Mode 1): only confirmed and done vendors
  (
    has_role_or_access(wedding_id, ARRAY['couple_view'])
    AND confirmation_status IN ('confirmed', 'done')
    AND deleted_at IS NULL
  )
  OR
  -- Family-view (Mode 1): only confirmed and done vendors
  (
    has_role_or_access(wedding_id, ARRAY['family_view'])
    AND confirmation_status IN ('confirmed', 'done')
    AND deleted_at IS NULL
  )
);

-- Fix: Add family_view and guest to timelines SELECT policy
DROP POLICY IF EXISTS "timelines_select" ON timelines;

CREATE POLICY "timelines_select" ON timelines FOR SELECT
USING (
  has_role_or_access(wedding_id, ARRAY[
    'planner_full', 'full', 'view_only', 'budget', 
    'couple_view', 'task', 'event_specific',
    'family_view', 'guest'
  ])
);
