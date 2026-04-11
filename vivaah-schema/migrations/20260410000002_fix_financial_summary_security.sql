-- Fix: Replace the insecure couple_view_financial_summary with the secure version
-- This ensures the SECURITY DEFINER version is always the live definition
-- regardless of migration order

CREATE OR REPLACE FUNCTION couple_view_financial_summary(p_wedding_id uuid)
RETURNS TABLE (
    total_planned bigint,
    total_committed bigint,
    total_paid bigint,
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
