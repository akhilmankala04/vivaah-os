-- Migration: 20260411000002_fix_audit_trigger_security.sql
-- Problem: write_audit_log_from_trigger runs as the authenticated user, which
-- cannot INSERT into audit_log or audit_log_errors (both have RLS USING (false)).
-- When any status-change trigger fires (payment milestone marked paid, vendor status
-- advanced, etc.), the trigger rolls back the entire UPDATE with a 403 error.
-- Fix: Add SECURITY DEFINER so the function runs as the postgres role (function owner),
-- bypassing RLS for the audit write only. The caller's identity is still captured via
-- the p_actor_participant_id argument resolved before this function is called.

CREATE OR REPLACE FUNCTION write_audit_log_from_trigger(
    p_entity_type text,
    p_entity_id uuid,
    p_wedding_id uuid,
    p_actor_participant_id uuid,
    p_previous_value text,
    p_new_value text
) RETURNS void AS $$
BEGIN
    INSERT INTO audit_log (entity_type, entity_id, wedding_id, actor_participant_id, changed_at, previous_value, new_value)
    VALUES (p_entity_type, p_entity_id, p_wedding_id, p_actor_participant_id, now(), p_previous_value, p_new_value);
EXCEPTION WHEN OTHERS THEN
    INSERT INTO audit_log_errors (entity_type, entity_id, wedding_id, failed_at, error_message)
    VALUES (p_entity_type, p_entity_id, p_wedding_id, now(), SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
