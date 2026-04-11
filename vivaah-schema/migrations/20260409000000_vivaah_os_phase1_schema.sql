-- 1. weddings
CREATE TABLE weddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mode smallint NOT NULL CHECK (mode IN (1, 2)),
    couple_name_1 text NOT NULL,
    couple_name_2 text,
    wedding_date date NOT NULL,
    planning_start_date date NOT NULL DEFAULT CURRENT_DATE,
    destination_flag boolean NOT NULL DEFAULT false,
    city text NOT NULL,
    total_planned_budget bigint NOT NULL,
    muhurat_flag boolean NOT NULL DEFAULT false,
    late_start_flag boolean NOT NULL DEFAULT false,
    late_start_weeks integer,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    prompt_version text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- 2. events
CREATE TABLE events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES weddings(id),
    event_name text NOT NULL,
    event_date date NOT NULL,
    start_time time,
    end_time time,
    venue_name text,
    venue_address text,
    dress_code text,
    notes text,
    is_custom boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'complete')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- 3. participants
CREATE TABLE participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    wedding_id uuid NOT NULL REFERENCES weddings(id),
    name text NOT NULL,
    phone text NOT NULL,
    role text NOT NULL CHECK (role IN ('planner', 'head_planner', 'couple', 'family', 'guest', 'custom')),
    access_level text NOT NULL CHECK (access_level IN (
      'planner_full', 'couple_view', 'family_view', 'full', 'budget',
      'task', 'event_specific', 'view_only', 'guest'
    )),
    event_scope_id uuid REFERENCES events(id),
    invited_by uuid REFERENCES participants(id),
    invited_at timestamptz NOT NULL DEFAULT now(),
    invite_status text NOT NULL DEFAULT 'pending' CHECK (invite_status IN ('pending', 'sent', 'failed', 'accepted')),
    last_active timestamptz,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. vendor_directory
-- SCHEMA RULE: This table must never contain a rate, amount, price, fee, or cost column.
-- This is a trust and privacy constraint enforced by code review and documented here.
CREATE TABLE vendor_directory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES auth.users(id),
    vendor_name text NOT NULL,
    category text NOT NULL,
    city text NOT NULL,
    phone text NOT NULL,
    notes text,
    wedding_count integer NOT NULL DEFAULT 0,
    last_used_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- 5. vendor_instances
CREATE TABLE vendor_instances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES weddings(id),
    directory_reference_id uuid REFERENCES vendor_directory(id),
    vendor_name text NOT NULL,
    category text NOT NULL,
    city text,
    phone text,
    negotiated_rate bigint,
    deliverables text,
    contract_status text NOT NULL DEFAULT 'not_uploaded' CHECK (contract_status IN ('not_uploaded', 'uploaded', 'reviewed')),
    confirmation_status text NOT NULL DEFAULT 'shortlisted' CHECK (confirmation_status IN ('shortlisted', 'quoted', 'booked', 'confirmed', 'done')),
    planner_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- 6. vendor_instance_events
CREATE TABLE vendor_instance_events (
    vendor_instance_id uuid NOT NULL REFERENCES vendor_instances(id),
    event_id uuid NOT NULL REFERENCES events(id),
    PRIMARY KEY (vendor_instance_id, event_id)
);

-- 7. payment_milestones
CREATE TABLE payment_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_instance_id uuid NOT NULL REFERENCES vendor_instances(id),
    wedding_id uuid NOT NULL REFERENCES weddings(id),
    amount bigint NOT NULL,
    due_date date NOT NULL,
    paid_date date,
    status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'paid', 'overdue')),
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- 8. budget_ledger
CREATE TABLE budget_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL UNIQUE REFERENCES weddings(id),
    total_planned_budget bigint NOT NULL,
    last_updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. tasks
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL REFERENCES weddings(id),
    event_id uuid REFERENCES events(id),
    title text NOT NULL,
    description text,
    assigned_to uuid REFERENCES participants(id),
    due_date date,
    status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'complete', 'overdue')),
    created_by uuid NOT NULL REFERENCES participants(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- 10. timelines
CREATE TABLE timelines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id uuid NOT NULL UNIQUE REFERENCES weddings(id),
    generated_at timestamptz,
    planning_horizon_months integer,
    late_start_flag boolean NOT NULL DEFAULT false,
    late_start_weeks integer,
    prompt_version text,
    items jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. audit_log
CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    wedding_id uuid NOT NULL REFERENCES weddings(id),
    actor_participant_id uuid REFERENCES participants(id),
    changed_at timestamptz NOT NULL DEFAULT now(),
    previous_value text,
    new_value text,
    reason text
);

-- 12. messages_queue
CREATE TABLE messages_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone text NOT NULL,
    message_type text NOT NULL CHECK (message_type IN (
      'participant_invite', 'role_transfer_request', 'access_revoked',
      'weekly_briefing', 'wedding_suspended', 'invite_delivery_failure'
    )),
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    retry_count integer NOT NULL DEFAULT 0,
    retry_after timestamptz,
    sent_at timestamptz,
    failed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. audit_log_errors
CREATE TABLE audit_log_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text,
    entity_id uuid,
    wedding_id uuid,
    failed_at timestamptz NOT NULL DEFAULT now(),
    error_message text
);

-- Required Indexes
CREATE INDEX idx_vendorinstance_wedding_status ON vendor_instances(wedding_id, confirmation_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_paymentmilestone_wedding_duedate ON payment_milestones(wedding_id, due_date, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_auditlog_entity_changedat ON audit_log(entity_id, changed_at);
CREATE INDEX idx_participant_wedding_access ON participants(wedding_id, access_level);
CREATE INDEX idx_vendorinstance_directory ON vendor_instances(directory_reference_id) WHERE directory_reference_id IS NOT NULL;
CREATE INDEX idx_task_wedding_status ON tasks(wedding_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_event_wedding_date ON events(wedding_id, event_date) WHERE deleted_at IS NULL;


-- TRIGGERS TO IMPLEMENT

-- 1. Soft delete guard
CREATE OR REPLACE FUNCTION guard_hard_delete()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Hard delete is not permitted. Use soft delete (set deleted_at).';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_wedding_delete BEFORE DELETE ON weddings FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();
CREATE TRIGGER prevent_event_delete BEFORE DELETE ON events FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();
CREATE TRIGGER prevent_vendor_instance_delete BEFORE DELETE ON vendor_instances FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();
CREATE TRIGGER prevent_task_delete BEFORE DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();
CREATE TRIGGER prevent_timeline_delete BEFORE DELETE ON timelines FOR EACH ROW EXECUTE FUNCTION guard_hard_delete();


-- Updated_at setter
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_weddings BEFORE UPDATE ON weddings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_participants BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_vendor_directory BEFORE UPDATE ON vendor_directory FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_vendor_instances BEFORE UPDATE ON vendor_instances FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_payment_milestones BEFORE UPDATE ON payment_milestones FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_timelines BEFORE UPDATE ON timelines FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 2. Audit log writer
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION audit_status_change()
RETURNS trigger AS $$
DECLARE
    entity_type text := TG_TABLE_NAME;
    wedding_uuid uuid;
    actor_id uuid := NULL;
BEGIN
    wedding_uuid := NEW.wedding_id;

    BEGIN
        SELECT id INTO actor_id 
        FROM participants 
        WHERE user_id = auth.uid() AND wedding_id = wedding_uuid 
        LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
        actor_id := NULL;
    END;

    IF entity_type = 'vendor_instances' THEN
        IF OLD.confirmation_status IS DISTINCT FROM NEW.confirmation_status THEN
            PERFORM write_audit_log_from_trigger('vendor_instance', NEW.id, wedding_uuid, actor_id, OLD.confirmation_status, NEW.confirmation_status);
        END IF;
    ELSIF entity_type = 'payment_milestones' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM write_audit_log_from_trigger('payment_milestone', NEW.id, wedding_uuid, actor_id, OLD.status, NEW.status);
        END IF;
    ELSIF entity_type = 'tasks' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM write_audit_log_from_trigger('task', NEW.id, wedding_uuid, actor_id, OLD.status, NEW.status);
        END IF;
    ELSIF entity_type = 'events' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM write_audit_log_from_trigger('event', NEW.id, wedding_uuid, actor_id, OLD.status, NEW.status);
        END IF;
    ELSIF entity_type = 'participants' THEN
        IF OLD.access_level IS DISTINCT FROM NEW.access_level THEN
            PERFORM write_audit_log_from_trigger('participant', NEW.id, wedding_uuid, actor_id, OLD.access_level, NEW.access_level);
        END IF;
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM write_audit_log_from_trigger('participant', NEW.id, wedding_uuid, actor_id, OLD.status, NEW.status);
        END IF;
        IF OLD.role IS DISTINCT FROM NEW.role THEN
            PERFORM write_audit_log_from_trigger('participant', NEW.id, wedding_uuid, actor_id, OLD.role, NEW.role);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_vi_status AFTER UPDATE ON vendor_instances FOR EACH ROW EXECUTE FUNCTION audit_status_change();
CREATE TRIGGER audit_pm_status AFTER UPDATE ON payment_milestones FOR EACH ROW EXECUTE FUNCTION audit_status_change();
CREATE TRIGGER audit_task_status AFTER UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION audit_status_change();
CREATE TRIGGER audit_event_status AFTER UPDATE ON events FOR EACH ROW EXECUTE FUNCTION audit_status_change();
CREATE TRIGGER audit_participant_status AFTER UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION audit_status_change();


-- 3. Status transition enforcement - vendor_instances
CREATE OR REPLACE FUNCTION enforce_vi_status_transition()
RETURNS trigger AS $$
BEGIN
    IF OLD.confirmation_status IS DISTINCT FROM NEW.confirmation_status THEN
        IF OLD.confirmation_status = 'done' THEN
            RAISE EXCEPTION 'Done status cannot be reverted';
        ELSIF OLD.confirmation_status = 'shortlisted' AND NEW.confirmation_status = 'quoted' THEN
            -- Valid
        ELSIF OLD.confirmation_status = 'quoted' AND NEW.confirmation_status = 'booked' THEN
            IF NEW.negotiated_rate IS NULL THEN
                RAISE EXCEPTION 'Rate required before booking';
            END IF;
        ELSIF OLD.confirmation_status = 'booked' AND NEW.confirmation_status = 'confirmed' THEN
            -- Valid
        ELSIF OLD.confirmation_status = 'confirmed' AND NEW.confirmation_status = 'done' THEN
            -- Valid
        ELSE
            RAISE EXCEPTION 'Invalid status transition';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vi_status_transition BEFORE UPDATE ON vendor_instances FOR EACH ROW EXECUTE FUNCTION enforce_vi_status_transition();


-- 4. Paid milestone delete guard
CREATE OR REPLACE FUNCTION enforce_paid_milestone_delete()
RETURNS trigger AS $$
BEGIN
    IF OLD.status = 'paid' THEN
        RAISE EXCEPTION 'Paid milestones cannot be deleted.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_paid_milestone_delete BEFORE DELETE ON payment_milestones FOR EACH ROW EXECUTE FUNCTION enforce_paid_milestone_delete();


-- 5. Directory vendor count updater
CREATE OR REPLACE FUNCTION update_vendor_directory_count()
RETURNS trigger AS $$
BEGIN
    IF NEW.directory_reference_id IS NOT NULL THEN
        UPDATE vendor_directory
        SET wedding_count = wedding_count + 1,
            last_used_date = CURRENT_DATE
        WHERE id = NEW.directory_reference_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vd_count AFTER INSERT ON vendor_instances FOR EACH ROW EXECUTE FUNCTION update_vendor_directory_count();


-- COMPUTED VIEWS

-- couple_view_financial_summary
CREATE OR REPLACE FUNCTION couple_view_financial_summary(p_wedding_id uuid)
RETURNS TABLE (
    total_planned bigint,
    total_committed bigint,
    total_paid bigint,
    upcoming_30_days bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bl.total_planned_budget AS total_planned,
        COALESCE((SELECT SUM(negotiated_rate) FROM vendor_instances WHERE wedding_id = p_wedding_id AND confirmation_status IN ('booked', 'confirmed', 'done') AND deleted_at IS NULL), 0) AS total_committed,
        COALESCE((SELECT SUM(amount) FROM payment_milestones WHERE wedding_id = p_wedding_id AND status = 'paid' AND deleted_at IS NULL), 0) AS total_paid,
        COALESCE((SELECT SUM(amount) FROM payment_milestones WHERE wedding_id = p_wedding_id AND status IN ('upcoming', 'due') AND due_date <= CURRENT_DATE + 30 AND deleted_at IS NULL), 0) AS upcoming_30_days
    FROM budget_ledger bl
    WHERE bl.wedding_id = p_wedding_id;
END;
$$ LANGUAGE plpgsql;


-- wedding_health_score
CREATE OR REPLACE FUNCTION wedding_health_score(p_wedding_id uuid)
RETURNS TABLE (
    state text,
    overdue_payments_count integer,
    unconfirmed_vendors_within_30_days integer,
    overdue_tasks_count integer,
    budget_committed_pct integer,
    unconfirmed_vendors_within_14_days integer
) AS $$
DECLARE
    v_overdue_payments_count integer;
    v_unconfirmed_vendors_14 integer;
    v_unconfirmed_vendors_30 integer;
    v_overdue_tasks_count integer;
    v_total_planned bigint;
    v_total_committed bigint;
    v_budget_committed_pct integer := 0;
    v_state text := 'good';
    v_payment_due_within_7 integer;
    v_wedding_date date;
BEGIN
    SELECT wedding_date INTO v_wedding_date FROM weddings WHERE id = p_wedding_id AND deleted_at IS NULL;
    
    -- overdue_payments_count
    SELECT COUNT(*)::integer INTO v_overdue_payments_count FROM payment_milestones WHERE wedding_id = p_wedding_id AND status = 'overdue' AND deleted_at IS NULL;
    
    -- payment due within 7 days
    SELECT COUNT(*)::integer INTO v_payment_due_within_7 FROM payment_milestones WHERE wedding_id = p_wedding_id AND status IN ('upcoming', 'due') AND due_date <= CURRENT_DATE + 7 AND deleted_at IS NULL;

    -- unconfirmed_vendors linked to events or defaulting to wedding_date
    SELECT COUNT(DISTINCT vi.id)::integer INTO v_unconfirmed_vendors_14 
    FROM vendor_instances vi
    LEFT JOIN vendor_instance_events vie ON vi.id = vie.vendor_instance_id
    LEFT JOIN events e ON vie.event_id = e.id
    WHERE vi.wedding_id = p_wedding_id 
      AND vi.confirmation_status IN ('shortlisted', 'quoted')
      AND vi.deleted_at IS NULL 
      AND (e.deleted_at IS NULL OR e.id IS NULL)
      AND COALESCE(e.event_date, v_wedding_date) <= CURRENT_DATE + 14;

    SELECT COUNT(DISTINCT vi.id)::integer INTO v_unconfirmed_vendors_30 
    FROM vendor_instances vi
    LEFT JOIN vendor_instance_events vie ON vi.id = vie.vendor_instance_id
    LEFT JOIN events e ON vie.event_id = e.id
    WHERE vi.wedding_id = p_wedding_id 
      AND vi.confirmation_status IN ('shortlisted', 'quoted')
      AND vi.deleted_at IS NULL 
      AND (e.deleted_at IS NULL OR e.id IS NULL)
      AND COALESCE(e.event_date, v_wedding_date) <= CURRENT_DATE + 30;

    -- overdue_tasks_count
    SELECT COUNT(*)::integer INTO v_overdue_tasks_count FROM tasks WHERE wedding_id = p_wedding_id AND status = 'overdue' AND deleted_at IS NULL;

    -- budget_committed_pct
    SELECT total_planned_budget INTO v_total_planned FROM budget_ledger WHERE wedding_id = p_wedding_id;
    SELECT COALESCE(SUM(negotiated_rate), 0) INTO v_total_committed FROM vendor_instances WHERE wedding_id = p_wedding_id AND confirmation_status IN ('booked', 'confirmed', 'done') AND deleted_at IS NULL;

    IF COALESCE(v_total_planned, 0) > 0 THEN
        v_budget_committed_pct := ((v_total_committed * 100) / v_total_planned)::integer;
    END IF;

    -- Determine state
    IF v_overdue_payments_count >= 1 OR v_unconfirmed_vendors_14 >= 1 OR v_budget_committed_pct >= 100 THEN
        v_state := 'critical';
    ELSIF v_unconfirmed_vendors_30 >= 1 OR v_payment_due_within_7 >= 1 OR v_overdue_tasks_count >= 1 OR v_budget_committed_pct >= 85 THEN
        v_state := 'at_risk';
    ELSE
        v_state := 'good';
    END IF;

    RETURN QUERY SELECT v_state, v_overdue_payments_count, v_unconfirmed_vendors_30, v_overdue_tasks_count, v_budget_committed_pct, v_unconfirmed_vendors_14;
END;
$$ LANGUAGE plpgsql;
