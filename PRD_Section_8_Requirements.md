# Section 8: Requirements

---

## 8.1 Technical Requirements

Technical requirements define the infrastructure, integrations, and system-level components the product must have. They are not feature behaviours — they are the foundation that features run on.

---

### TR-01 — AI Generation Engine

**Component:** Anthropic API integration for S1 (timeline generation) and S3 (weekly briefing generation).

**TR-01-1:** The product shall use the Anthropic claude-sonnet-4-20250514 model for all AI generation calls. No other model may be substituted without explicit re-evaluation of output quality against QO7.

**TR-01-2:** All AI API calls shall be made server-side from Supabase Edge Functions. No API key shall be exposed client-side under any circumstance.

**TR-01-3:** The AI generation pipeline for timeline generation shall assemble the following inputs before calling the API: wedding date, planning start date, weeks remaining, destination flag, list of events with dates, list of vendor instances with categories and confirmation statuses, and late-start flag with weeks behind.

**TR-01-4:** The AI generation pipeline for weekly briefing shall assemble the following inputs before calling the API: all PaymentMilestones with status upcoming, due, or overdue; all VendorInstances with status below Confirmed and event within 30 days; all VendorInstances with no status change in ≥ 14 days; all Timeline items with status overdue; and the BudgetLedger planned, committed, and paid figures.

**TR-01-5:** AI API responses shall be parsed into structured data conforming to the Timeline and Briefing data models defined in Section 3.5 before being written to the database. Raw API response text shall not be stored or surfaced directly to users.

**TR-01-6:** The timeline generation Edge Function shall implement a 45-second timeout. On timeout or API error, the function shall log the failure, set a retry flag on the wedding record, and return a non-blocking response to the client.

**TR-01-7:** The retry logic shall attempt one automatic re-call 60 seconds after the initial failure. If the retry also fails, the wedding record shall be flagged with a pending-generation status and a manual trigger button shall be surfaced on the wedding dashboard.

**TR-01-8:** All AI prompts shall include explicit India-specific context: Indian wedding event taxonomy, Indian vendor booking windows, ₹ lakh denomination formatting instructions, and prohibition on Western event vocabulary. Prompt templates shall be versioned and stored in source control, not hardcoded inline.

**TR-01-9:** Each Timeline record and each Briefing record shall store the prompt version identifier used to generate it. This field (prompt_version) shall be written at generation time and shall be immutable thereafter. This enables debugging of degraded AI output after a prompt update by comparing outputs across prompt versions.

---

### TR-02 — Database and Data Model

**Component:** Supabase Postgres database implementing the entity model defined in Section 3.5.

**TR-02-1:** The database shall implement all entities defined in Section 3.5: Wedding, Event, Participant, VendorDirectory, VendorInstance, PaymentMilestone, BudgetLedger, Task, and Timeline.

**TR-02-2:** VendorDirectory and VendorInstance shall be implemented as separate tables with a nullable foreign key reference from VendorInstance to VendorDirectory. No data shall flow from VendorInstance back to VendorDirectory except wedding count increment and last-used date update.

**TR-02-3:** Rate fields shall exist only on VendorInstance records. No rate field shall exist on VendorDirectory records. This constraint shall be enforced at the schema level — the VendorDirectory table shall have no rate, amount, or price column of any kind.

**TR-02-4:** BudgetLedger committed and paid figures shall be computed views, not stored columns. Committed = sum of negotiated rates on VendorInstances where confirmation status ≥ Booked for the wedding. Paid = sum of amounts on PaymentMilestones where status = paid for the wedding. These figures shall never be manually writable.

**TR-02-5:** All entity deletions shall be implemented as soft deletes. A deleted_at timestamp column shall exist on all primary entities (Wedding, Event, VendorInstance, PaymentMilestone, Task, Timeline). Hard delete operations shall be blocked at the database layer via trigger or policy.

**TR-02-6:** All queries reading primary entities shall include a WHERE deleted_at IS NULL filter. Archived records shall be excluded from all operational views, AI inputs, and notification triggers.

**TR-02-7:** All status-bearing entities (VendorInstance confirmation status, PaymentMilestone status, Task status, Event status) shall have an associated AuditLog entry written on every status change. AuditLog schema: log_id, entity_type, entity_id, wedding_id, actor_participant_id, changed_at, previous_value, new_value, reason (nullable — required only for status reversions).

**TR-02-8:** VendorInstance status transitions shall be enforced at the database layer. A CHECK constraint or trigger shall prevent status from moving in any sequence other than: Shortlisted → Quoted → Booked → Confirmed → Done. Reversions shall require a reason entry and shall be permitted only via an explicit revert API endpoint, not via a standard update.

**TR-02-9:** The following database indexes shall be created at schema initialisation to support the primary query patterns of the product:

| Index | Table | Columns | Query pattern served |
| --- | --- | --- | --- |
| idx_vendorinstance_wedding_status | VendorInstance | wedding_id, confirmation_status | Confirmation tracker, budget ledger, briefing inputs |
| idx_paymentmilestone_wedding_duedate | PaymentMilestone | wedding_id, due_date, status | Payment calendar, briefing overdue inputs |
| idx_auditlog_entity_changedat | AuditLog | entity_id, changed_at | Stalled vendor detection, briefing at-risk inputs |
| idx_participant_wedding_access | Participant | wedding_id, access_level | RLS policy evaluation, participant management |
| idx_vendorinstance_directory | VendorInstance | directory_reference_id | Directory usage count queries |
| idx_task_wedding_status | Task | wedding_id, status | Timeline view, briefing overdue inputs |
| idx_event_wedding_date | Event | wedding_id, event_date | Confirmation tracker 30-day filter |

Additional indexes shall be added as query performance profiling identifies slow paths during development and load testing.

---

### TR-03 — Permission and Role Management

**Component:** Supabase Row Level Security (RLS) implementing the permission model defined in Section 3.3.

**TR-03-1:** All data access shall be enforced via Supabase RLS policies. Application-layer permission checks are supplementary — they shall never be the sole enforcement mechanism.

**TR-03-2:** RLS policies shall be defined per table per access level. For each table, policies shall specify which access levels can SELECT, INSERT, UPDATE, and DELETE rows belonging to a given wedding.

**TR-03-3:** Rate fields on VendorInstance shall be excluded from SELECT responses for Participant records with access levels: couple view (Mode 1), family view (Mode 1), view-only (Mode 2), task access (Mode 2), event-specific (Mode 2), and guest (Mode 2). Only full access, budget access (Mode 2), and planner/head planner roles shall receive rate field values in query responses.

**TR-03-4:** BudgetLedger and PaymentMilestone tables shall be inaccessible (zero rows returned) for Participant records with access levels: couple view, family view, task access, event-specific, view-only, and guest. Budget access and full access participants shall receive full read access. Couple view participants shall receive a computed aggregate-only view — a separate database view or function that returns total committed and total paid without row-level detail.

**TR-03-5:** VendorDirectory records shall be accessible only to the directory owner (the planner or head planner whose user ID matches the owner field). No RLS policy shall permit any other user to read, write, or reference VendorDirectory records belonging to another user.

**TR-03-6:** Participant access level changes shall take effect immediately upon database update. There shall be no caching layer that serves stale permission data after an access level change. Session tokens shall be validated against current database access level on every authenticated request.

**TR-03-7:** The head planner role on a Mode 2 wedding shall be implemented as a distinct role value on the Participant record, not as a permission flag. Role transfer shall update the role field on both the outgoing and incoming participant records in a single atomic transaction.

**TR-03-8:** A dedicated Supabase database view or RPC function shall be implemented to serve the couple-view financial summary. This view shall accept a wedding_id parameter and return exactly four fields: total_planned (the Wedding record's planned budget), total_committed (sum of VendorInstance negotiated rates where status ≥ Booked), total_paid (sum of PaymentMilestone amounts where status = paid), and upcoming_30_days (sum of PaymentMilestone amounts where status = upcoming or due and due_date ≤ today + 30 days). This view shall be the only mechanism by which couple-view participants receive financial data. It shall be accessible via a separate RLS policy that permits couple-view participants to call it but returns no row-level rate or milestone detail.

---

### TR-04 — Scheduled Job Infrastructure

**Component:** Supabase Edge Functions with cron scheduling, implementing all autonomous system actions defined in Section 7.15.

**TR-04-1:** The following jobs shall be implemented as scheduled Edge Functions:

| Job | Schedule | Function |
| --- | --- | --- |
| Milestone overdue flagging | Daily at 00:01 | Set PaymentMilestone status to overdue where due_date < today and status ≠ paid |
| Stalled vendor detection | Daily at 06:00 | Flag VendorInstances where last status change > 14 days ago and status < Confirmed |
| Weekly briefing generation | Weekly, user-configured (default Monday 08:00) | Assemble inputs, call AI API, store briefing, trigger delivery |
| Health score recalculation | Event-driven on any status change | Recalculate wedding health score from current data |

**TR-04-2:** All scheduled jobs shall be idempotent — running the same job twice in the same period shall produce the same result as running it once. Jobs shall check the current state before writing to prevent duplicate status changes or duplicate briefing records.

**TR-04-3:** All scheduled job executions shall be logged with: job name, execution timestamp, wedding IDs processed, records updated, and any errors encountered. Job logs shall be retained for 90 days.

**TR-04-4:** Briefing generation jobs shall be scoped per planner or head planner account — one job execution per account per scheduled cycle. For Mode 1 planners with multiple active weddings, a single job execution shall produce one multi-wedding briefing document, not one briefing per wedding.

---

### TR-05 — WhatsApp Integration Layer

**Component:** WhatsApp Business API integration via a third-party provider (Twilio or Gupshup — provider to be confirmed during technical scoping). Implemented as Supabase Edge Functions.

**TR-05-1:** All WhatsApp message sends shall be triggered from server-side Edge Functions. No WhatsApp API credentials shall be exposed client-side.

**TR-05-2:** The following message types shall be implemented as distinct WhatsApp templates registered with the provider:

| Message type | Trigger | Recipient |
| --- | --- | --- |
| Participant invite | Participant added to wedding | New participant |
| Role transfer request | Head planner initiates transfer | Target participant |
| Access revoked | Head planner revokes access | Removed participant |
| Weekly briefing | Scheduled briefing generation | Planner / head planner |
| Wedding suspended | Planner account deleted | Couple members |
| Invite delivery failure | 24-hour delivery timeout | Planner / head planner (in-app) |

**TR-05-3:** Each WhatsApp template shall comply with WhatsApp Business API template requirements: pre-approved template body, approved variable placeholders, and no promotional content. Template approval shall be completed before V1 launch — this is a launch dependency.

**TR-05-4:** WhatsApp delivery status shall be tracked via delivery webhooks from the provider. A delivery record shall be written for each message sent, updated when the delivery webhook confirms success or failure.

**TR-05-5:** On delivery failure (no delivery confirmation within 24 hours), the system shall: update the participant's invite status to "failed", create an in-app notification for the planner or head planner, and surface a resend option on the participant management screen.

**TR-05-6:** The weekly briefing WhatsApp message shall contain the full briefing content — not a link to the app. Message length shall be optimised for readability within WhatsApp's character limits. If the full briefing exceeds WhatsApp's single-message character limit, it shall be split into sequential messages numbered for clarity (e.g. "Weekly briefing 1/2", "Weekly briefing 2/2").

**TR-05-7:** Invite links sent via WhatsApp shall be persistent — they shall not expire on a time basis. Links shall be invalidated only when the planner or head planner explicitly revokes the participant's access.

**TR-05-8:** The WhatsApp integration layer shall implement rate limit handling for the WhatsApp Business API provider. When the provider returns a rate limit response (HTTP 429 or provider-equivalent), the system shall: queue the unsent message with a retry timestamp, attempt resend after the provider-specified retry interval, retry up to three times before marking the message as failed, and notify the sender of the failure via an in-app notification. Message queuing shall be implemented in Supabase as a messages_queue table with status (pending / sent / failed) and retry_count fields. No message shall be silently dropped on rate limit.

---

### TR-06 — Audit Log System

**Component:** AuditLog table in Supabase with event-driven write triggers.

**TR-06-1:** The AuditLog shall capture every change to the following fields and entities: VendorInstance confirmation status, PaymentMilestone status and paid date, Task status, Event status, Participant access level, Participant role, and Wedding status.

**TR-06-2:** Each AuditLog entry shall contain: log_id, entity_type, entity_id, wedding_id, actor_participant_id, changed_at (UTC timestamp), previous_value, new_value, and reason (text, nullable).

**TR-06-3:** AuditLog writes shall be non-blocking — a failure to write an audit log entry shall not cause the underlying operation to fail. Audit log write failures shall be logged separately for monitoring.

**TR-06-4:** The AuditLog shall be readable by the AI briefing generation pipeline to detect stalled entities — specifically, VendorInstances where no AuditLog entry exists with changed_at within the last 14 days.

**TR-06-5:** AuditLog records shall not be deletable by any user action. They are permanent records. Soft delete does not apply to AuditLog entries.

---

### TR-07 — Frontend and Hosting

**Component:** Web application hosted on Netlify. Frontend framework to be confirmed during technical scoping (React recommended given Supabase SDK compatibility).

**TR-07-1:** The application shall be deployed via Netlify with continuous deployment from the main branch of the source repository.

**TR-07-2:** All environment variables (Anthropic API key, Supabase project URL, Supabase anon key, WhatsApp provider credentials) shall be stored in Netlify environment configuration. No secrets shall be committed to source control.

**TR-07-3:** The application shall be a Progressive Web App (PWA) — installable on Android and iOS home screens, with offline-readable cached views for the most recently loaded wedding dashboard, vendor list, and event schedule.

**TR-07-4:** Supabase Edge Functions shall handle all server-side logic: AI API calls, WhatsApp message sends, audit log writes, and scheduled job execution. No server-side logic shall be implemented in Netlify Functions unless a capability gap requires it.

**TR-07-5:** The PWA service worker shall cache the following views for offline reading: the most recently loaded wedding dashboard, the vendor list for the most recently viewed wedding, and the event schedule for the most recently viewed wedding. Cached data shall be served from the service worker cache when the device is offline. When a user attempts a write operation (marking a payment paid, updating a vendor status, adding a vendor) while offline, the system shall display a clear message: "You're offline. This action will be saved when you reconnect." Write operations attempted offline shall not be queued for automatic sync — they shall be blocked with the explanatory message. Read operations shall succeed from cache.

---

## 8.2 Design Requirements

Design requirements specify how the product must look and behave at the interface level — not the visual design itself, but the constraints that the visual design must satisfy.

---

### DR-01 — Mobile-First Interface

**DR-01-1:** Every feature shall be fully functional on a mobile browser at 390px viewport width (iPhone 14 equivalent). No feature shall require a desktop browser to complete its primary flow.

**DR-01-2:** All primary actions — adding a vendor, marking a payment paid, confirming a vendor from the tracker, checking the portfolio view — shall be completable in three taps or fewer from the feature's entry point.

**DR-01-3:** Touch targets shall be a minimum of 44×44px. No interactive element shall be smaller than this on mobile viewports.

**DR-01-4:** Desktop is a supported secondary surface. The portfolio view (S17) and budget ledger (S10) shall have enhanced desktop layouts that take advantage of wider viewports — additional columns, side-by-side panels, expanded data density. Mobile layouts for these features shall be functional but may deprioritise data density in favour of readability.

**DR-01-5:** All forms shall be optimised for mobile keyboard input: numeric keyboards for rupee amounts, date pickers for date fields, phone number keyboards for phone fields. No form shall default to a full keyboard where a specialised input type is available.

---

### DR-02 — Progressive Disclosure for Complex Weddings

**DR-02-1:** The default view for any feature shall show the most critical information first — not the most complete information. Detail shall be available on demand, not displayed by default.

**DR-02-2:** The vendor card default view shall show: vendor name, category, status, and next payment milestone. Full details (rate, all milestones, deliverables, notes) shall be accessible via expansion or a detail view.

**DR-02-3:** The budget ledger default view shall show the three primary figures (planned, committed, paid) and the remaining amount. Per-vendor and per-milestone breakdown shall be accessible via drill-down, not shown by default.

**DR-02-4:** The portfolio view (S17) shall show wedding cards with health scores by default. Health score breakdown shall be accessible via tap — not shown inline on the card.

**DR-02-5:** The onboarding wizard shall present one decision at a time. No step shall require the user to make more than one distinct choice before advancing. Multi-select (event selection) is permitted as a single step because all choices belong to the same decision.

**DR-02-6:** Power users (Persona 3B — Nisha) shall be able to access full data density without navigating multiple levels. Progressive disclosure shall use expand/collapse patterns, not deep navigation hierarchies. A user should never be more than two taps from any piece of data relevant to their access level.

---

### DR-03 — Role-Aware UI Rendering

**DR-03-1:** The UI shall render only the elements relevant to the current participant's access level. Hidden elements shall not be rendered as disabled or greyed-out — they shall not appear at all. A couple-view participant must not see a greyed-out budget tab; the budget tab must not exist in their navigation.

**DR-03-2:** Permission-denied states shall be graceful. When a participant navigates to a restricted view via a direct link or URL, they shall see a friendly, explanatory message — not an error code, blank screen, or broken UI. The message shall explain what they can access at their level and suggest they contact their planner for more detail if needed.

**DR-03-3:** The navigation structure shall adapt to the active mode and access level. Mode 1 planner navigation: portfolio, active wedding, vendor cards, payments, tracker, briefings, settings. Mode 1 couple navigation: plan status, schedule, upcoming payments. Mode 2 head planner navigation: dashboard, vendor cards, payments, budget, tracker, timeline, briefings, participants, settings. Mode 2 view-only navigation: plan, schedule, vendors (confirmed only).

**DR-03-4:** Access level indicators shall be visible to the planner and head planner in participant management views. Each participant's current access level shall be displayed alongside their name. Access level labels shall use plain language — "Can see everything", "Budget only", "Schedule only" — not technical role names.

---

### DR-04 — India-Specific UX

**DR-04-1:** All financial input fields shall accept rupee amounts without currency symbol entry. The ₹ symbol shall be displayed as a prefix, not entered by the user. Input validation shall accept both plain numbers (36500000) and lakh-formatted numbers (36.5L) — the system shall normalise to a base integer for storage.

**DR-04-2:** All financial display values shall use Indian denomination: ₹X,XXX for amounts under ₹1L; ₹X.XX lakh for amounts ≥ ₹1L; ₹X.XX crore for amounts ≥ ₹1 crore. Rounding shall be to two decimal places for lakh and crore display.

**DR-04-3:** Date inputs throughout the product shall use DD/MM/YYYY format. No MM/DD/YYYY format shall appear anywhere. The muhurat date input field shall include a label option: "Date set by pandit" — selecting this label applies no behavioural change but records the muhurat flag on the Wedding record.

**DR-04-4:** All default event names shall use Indian terminology: haldi, mehendi, sangeet, engagement, wedding, reception. No anglicised substitute shall appear in any default label, placeholder text, tooltip, or system-generated content.

**DR-04-5:** All system-generated text — AI timeline tasks, briefing items, notification messages — shall use Indian event names and Indian vendor category names natively. Prompt templates for AI generation shall enforce this through explicit instruction and example output.

**DR-04-6:** WhatsApp notification messages shall be formatted for readability within WhatsApp's rendering: line breaks between sections, bold text (using *asterisks*) for vendor names, dates, and amounts, and plain text for body content. No HTML or markdown that does not render in WhatsApp shall be used in WhatsApp message bodies.

---

### DR-05 — Data Completeness Visual Language

**DR-05-1:** A consistent visual language shall distinguish complete vendor cards from incomplete ones. The specific visual treatment is at the designer's discretion, but it must be immediately perceivable without reading — colour, iconography, or both. This treatment shall be applied uniformly across all vendor list views.

**DR-05-2:** A vendor card is considered complete when it has: confirmation status ≥ Booked, a negotiated rate entered, at least one payment milestone with a due date, and an event assignment. These are the four completeness criteria. Partial completeness (e.g. rate entered but no milestone) shall be reflected in a partial completeness indicator, not a binary complete/incomplete state.

**DR-05-3:** The wedding dashboard shall display a completeness signal when more than 30% of vendor cards are incomplete, or when any event occurring within 60 days has no vendors at Booked status or higher. The signal shall be informational — it shall never block any action.

**DR-05-4:** The completeness signal shall include a specific, actionable message: not "your plan is incomplete" but "4 vendors are missing payment details. Add milestones to keep your budget accurate." The message shall link directly to the relevant feature view.

---

### DR-06 — Empty States

**DR-06-1:** Every feature view shall have a designed empty state for when no data exists. Empty states shall not be blank screens, spinner-only views, or generic error messages.

**DR-06-2:** Empty state content shall be directive — it shall tell the user exactly what to do next. Format: one-line explanation of why the view is empty, one primary action button, optional secondary context. Example: "No vendors added yet. Add your first vendor to start tracking payments and confirmations." → [Add vendor] button.

**DR-06-3:** The portfolio view empty state (S17-4) shall be the product's primary new-user onboarding moment for Mode 1 planners. It shall be welcoming, not clinical. It shall show a clear value proposition alongside the "Create wedding" CTA.

**DR-06-4:** The briefing empty state (S3-7) shall be positive in tone — "Your wedding is on track" — and shall surface upcoming tasks from the timeline. It shall not look like a failure state.

---

### DR-07 — Zero-Friction Participant Onboarding

**DR-07-1:** Participants with view-only, family view, or guest access shall be able to access their relevant wedding information within two taps of receiving the WhatsApp invite link — without creating an account, downloading an app, or completing a sign-up flow.

**DR-07-2:** The invite link shall open a mobile-optimised web view showing only the content relevant to the participant's access level. This view shall load within 3 seconds on a 4G Indian mobile connection.

**DR-07-3:** Account creation shall be offered as an optional step after the participant has seen their content — never as a prerequisite. The account creation prompt shall be dismissible and non-blocking.

**DR-07-4:** The family and guest view accessed via invite link shall be a single, scrollable page. Navigation complexity shall be zero — no menu, no tab bar, no nested views. All relevant information shall be visible on one scroll.

**DR-07-5:** The minimum font size in the family and guest view shall be 16px. All text shall meet WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text). These constraints serve the older family member demographic (Persona 4) who may have reduced visual acuity.

---

### DR-08 — Accessibility Baseline

**DR-08-1:** All interactive elements shall have visible focus states for keyboard and assistive technology navigation.

**DR-08-2:** All images and icons that convey meaning shall have descriptive alt text or ARIA labels. Decorative images shall have empty alt attributes.

**DR-08-3:** All form fields shall have associated labels — not placeholder-only labelling. Labels shall persist when the field has a value.

**DR-08-4:** The product shall be usable at 200% browser zoom without horizontal scrolling or content truncation.

**DR-08-5:** A full WCAG 2.1 AA audit is out of V1 scope but shall be scheduled for V1.1. The requirements in DR-07-5 and DR-08-1 through DR-08-4 are the minimum baseline for V1.

---

### DR-09 — Health Score Visual States

**DR-09-1:** The portfolio view health score indicator shall communicate three distinct states through visual design alone — without requiring the user to read a label to understand the state:

- **Good:** No overdue payments, no unconfirmed vendors within 30 days, no budget overspend, no overdue tasks.
- **At-risk:** One or more of: a vendor unconfirmed within 30 days, a payment due within 7 days, a task overdue, committed spend ≥ 85% of planned.
- **Critical:** One or more of: an overdue payment, a vendor unconfirmed within 14 days of their event, committed spend ≥ 100% of planned.

**DR-09-2:** The three states shall be visually unambiguous from a distance of arm's length on a mobile screen. Colour alone shall not be the sole differentiator — shape, iconography, or both shall reinforce the distinction to serve users with colour vision deficiency.

**DR-09-3:** The health score visual treatment shall be consistent across the portfolio view card, the health score breakdown tap view, and any dashboard summary indicators that reference wedding health.

---

### DR-10 — Loading and Skeleton States

**DR-10-1:** All primary feature views shall display a skeleton layout during data loading — not a blank screen, not a full-screen spinner. The skeleton shall reflect the approximate structure of the loaded view: card shapes for vendor lists, row shapes for payment calendars, block shapes for budget figures.

**DR-10-2:** Skeleton states shall appear within 100ms of navigation to a view. If data loads within 3 seconds (NFR-01-2), the skeleton shall be replaced by real content without a visible flash. If data load exceeds 3 seconds, a subtle loading indicator shall be added to the skeleton.

**DR-10-3:** AI generation states (timeline generation, briefing generation) shall use a distinct loading pattern from data-fetch skeletons — an animated progress indicator with a message explaining what is being generated ("Generating your planning timeline...") rather than a content skeleton, since the structure of the content is not yet known.

**DR-10-4:** The portfolio view shall load health score cards in a skeleton state and populate them as each wedding's data resolves — not wait for all 50 weddings to load before showing any. Weddings shall render progressively as their data becomes available.

---

### DR-11 — Offline State Design

**DR-11-1:** When the application detects an offline state, a persistent but unobtrusive banner shall appear at the top of the screen: "You're offline — viewing saved data."

**DR-11-2:** In offline state, all interactive write controls (add vendor, mark paid, update status, save changes) shall be visually disabled with an explanatory tooltip: "Reconnect to make changes."

**DR-11-3:** The offline banner shall disappear automatically when connectivity is restored. No user action shall be required to return to the online state.

**DR-11-4:** Cached offline views shall be clearly dated — a subtle timestamp shall indicate when the cached data was last updated, so the user understands they may not be seeing the most current state.

---

Functional requirements are derived from the P0 and P1 acceptance criteria in Section 6. Each requirement is a single, testable behaviour statement. Requirements are prefixed FR-[feature ID]-[sequence] and grouped by feature in build-phase order.

---

### Phase 1 — Architecture

**S28 — Smart Onboarding Wizard**

FR-S28-01: The system shall present a mode selection screen as the first step of every new wedding creation flow.
FR-S28-02: The system shall support two mode options: "Planner-led" (Mode 1) and "Self-planned" (Mode 2). Mode selection shall determine all subsequent access level options and feature availability for that wedding.
FR-S28-03: The system shall display saved templates as an option at the start of a new wedding creation flow if the user has at least one saved template. If no templates exist, the template option shall not be displayed.
FR-S28-04: The system shall accept a muhurat date input without flagging the date as unusual or suggesting alternatives. The muhurat flag shall be recorded on the Wedding record.
FR-S28-05: The system shall calculate the planning horizon as the number of weeks between today and the wedding date. If the horizon is fewer than 20 weeks, the system shall set the late-start flag and display a compressed planning message.
FR-S28-06: The system shall present the India-specific default event set (haldi, mehendi, sangeet, engagement, wedding, reception) as selectable options in the events step, each with a one-line description.
FR-S28-07: The system shall allow each wizard step from the events step onwards to be skipped. Skipped steps shall be flagged as outstanding setup items on the wedding dashboard.
FR-S28-08: The system shall trigger AI timeline generation automatically upon wizard completion. The wizard completion screen shall indicate that timeline generation is in progress.
FR-S28-09: On wizard completion, Mode 1 planners shall be navigated to the portfolio view. Mode 2 head planners shall be navigated to the wedding dashboard.

**S23 — Role and Access Setup**

FR-S23-01: The system shall enforce exactly two access levels in Mode 1 (couple view, family view) and exactly six access levels in Mode 2 (full, budget, task, event-specific, view-only, guest).
FR-S23-02: In Mode 1, only the planner account shall be able to assign, change, or revoke participant access levels.
FR-S23-03: In Mode 2, only the head planner account shall be able to assign, change, or revoke participant access levels and transfer the head planner role.
FR-S23-04: New participants in Mode 2 shall default to view-only access if no access level is selected by the head planner.
FR-S23-05: The system shall send a WhatsApp invite message to each new participant's phone number upon participant creation.
FR-S23-06: The system shall detect WhatsApp delivery failure within 24 hours and create an in-app notification for the planner or head planner with a resend option.
FR-S23-07: Access level changes shall take effect immediately on the participant's next authenticated request. No grace period or cache delay is permitted.
FR-S23-08: Revoked participants shall receive a WhatsApp notification of their removal. Their previously entered data shall be retained in the system.
FR-S23-09: Head planner role transfer shall require explicit confirmation from both the outgoing and incoming head planner before taking effect. The transfer shall be atomic — both role changes shall complete in a single database transaction or neither shall.
FR-S23-10: If a Mode 1 planner account is deleted, the associated wedding shall enter a suspended state and the couple shall receive a WhatsApp notification.
FR-S23-11: When a head planner adds a participant identified as a budget contributor, the system shall surface a prompt offering budget access. The prompt shall be dismissible.

**S5 — Vendor Card**

FR-S5-01: The system shall create a VendorInstance record when a vendor is added to a wedding, with an initial confirmation status of Shortlisted.
FR-S5-02: When a vendor name is entered, the system shall search the planner's private VendorDirectory and display matching entries as suggestions.
FR-S5-03: When a directory vendor is selected, the system shall display a preview card with non-rate fields only (name, category, city, phone, notes, wedding count, last-used date). The rate field shall always be blank.
FR-S5-04: The system shall offer a one-action prompt to save a new vendor to the directory simultaneously with creating the wedding instance.
FR-S5-05: When a directory vendor is added to a new wedding, the system shall increment the directory entry's wedding count by one and update the last-used date. No other directory fields shall be modified.
FR-S5-06: The system shall prevent VendorInstance status from advancing to Booked if no negotiated rate has been entered. An inline message shall explain the requirement.
FR-S5-07: VendorInstance status shall only advance forward in the sequence: Shortlisted → Quoted → Booked → Confirmed → Done. Lateral or backward moves shall require an explicit revert action.
FR-S5-08: Status reversions shall require a reason entry. The revert reason and the previous and new status values shall be written to the AuditLog.
FR-S5-09: VendorInstance status of Done shall not be revertable. Any attempt to revert a Done status shall be rejected with an explanatory message.
FR-S5-10: Every VendorInstance shall support event assignment to one or more events. Vendor instances with no event assignment shall be flagged as incomplete in the completeness signal.
FR-S5-11: VendorDirectory records shall be inaccessible to all users other than the directory owner, enforced via Supabase RLS.
FR-S5-12: Couple-view participants shall see vendor names and categories only for vendors with status ≥ Confirmed. No rate, milestone, or note data shall be returned for couple-view queries.

**S29 — India-Specific Category Defaults**

FR-S29-01: The system shall display India-specific vendor category suggestions when a user opens the vendor section of any event, based on the event type.
FR-S29-02: Category suggestions shall be dismissible on a per-suggestion basis. Dismissed suggestions shall not reappear for that event.
FR-S29-03: Users shall be able to add custom vendor categories. Custom categories shall be saved for reuse within the same wedding.
FR-S29-04: All financial figures displayed in the product shall use ₹ prefix and Indian denomination (lakh, crore). No figure shall be displayed in thousands, millions, or any non-Indian denomination.
FR-S29-05: All default event names in system-generated content, labels, and templates shall use Indian terminology. No anglicised substitutes shall appear.

---

### Phase 2 — Operating Layer

**S12 — Payment Milestone Calendar**

FR-S12-01: The system shall display all PaymentMilestone records for a wedding in chronological order, grouped by month, with status indicators.
FR-S12-02: The system shall display the total amount due across all milestones with status upcoming or due within the next 30 days as a summary figure.
FR-S12-03: The system shall automatically set PaymentMilestone status to overdue at 00:01 on the day after the due date if the milestone has not been marked paid.
FR-S12-04: Marking a milestone as paid shall update its status to paid, record the paid date, and trigger an immediate recalculation of the BudgetLedger paid total.
FR-S12-05: Paid milestones shall remain visible in the calendar with a paid status indicator. They shall not be removed from the view.
FR-S12-06: Editing a milestone's amount shall trigger an immediate recalculation of the BudgetLedger committed total and a check of the overspend thresholds.
FR-S12-07: Editing a milestone's due date to a past date shall automatically update the milestone status to overdue.
FR-S12-08: Paid milestones shall not be deletable. Unpaid milestones may be soft-deleted with a confirmation prompt. Soft-deleted milestones shall trigger BudgetLedger recalculation.
FR-S12-09: If the sum of a vendor's payment milestones exceeds the vendor's negotiated rate, an inline warning shall be displayed on the vendor card and the milestone entry screen.
FR-S12-10: Couple-view participants shall see only a total aggregate upcoming payment figure — no vendor names, rates, or individual milestone details.

**S10 — Budget Ledger**

FR-S10-01: The BudgetLedger shall display three computed figures: planned (manually entered), committed (sum of VendorInstance rates where status ≥ Booked), and paid (sum of paid PaymentMilestone amounts).
FR-S10-02: Committed and paid figures shall update automatically when underlying VendorInstance or PaymentMilestone data changes. Manual entry of these figures shall not be possible.
FR-S10-03: The system shall display a warning indicator when committed spend reaches 85% of planned budget.
FR-S10-04: The system shall display an escalated alert when committed spend reaches or exceeds 100% of planned budget.
FR-S10-05: Both the 85% warning and 100% alert shall appear on the wedding dashboard and in the next weekly briefing.
FR-S10-06: The planned budget figure shall be editable post-onboarding. Edits shall trigger immediate recalculation of all derived figures and overspend thresholds.
FR-S10-07: Planned budget edits shall be written to the AuditLog with previous and new values.
FR-S10-08: Budget-access participants (Mode 2) shall have read access to the full BudgetLedger, PaymentMilestone calendar, and per-vendor rate breakdown. They shall have no write access to vendor cards or tasks.
FR-S10-09: Couple-view participants (Mode 1) shall see only a total committed figure and total paid figure — no planned budget total and no per-vendor breakdown.

**S14 — 30-Day Confirmation Tracker**

FR-S14-01: The confirmation tracker shall display all VendorInstances where confirmation status is below Confirmed and the assigned event date is within 30 days.
FR-S14-02: Tracker entries shall be sorted by days until the assigned event, most urgent first.
FR-S14-03: Each tracker entry shall display: vendor name, category, event name, event date, current status, and days until event.
FR-S14-04: The system shall flag a VendorInstance as stalled when no AuditLog entry exists for that instance within the past 14 days and the status is below Confirmed. Stalled instances shall display a "No update in [X] days" indicator.
FR-S14-05: Users shall be able to update a vendor's confirmation status directly from the tracker view without navigating to the vendor card.
FR-S14-06: Confirming a vendor from the tracker shall update the VendorInstance status to Confirmed, write to the AuditLog, and remove the vendor from the tracker list.
FR-S14-07: Stalled vendors shall be included in the weekly AI briefing at-risk section.

**S17 — Planner Portfolio View**

FR-S17-01: The portfolio view shall be the default landing screen for Mode 1 planner accounts on every login.
FR-S17-02: The portfolio view shall display all active weddings as cards with: couple names, wedding date, days until wedding, and a health score indicator.
FR-S17-03: Wedding cards shall be sorted by health score (most at-risk first) by default. An option to sort by wedding date shall be available.
FR-S17-04: Health scores shall be computed from four factors using the following weighting and escalation rules:

- **Overdue payments:** Each overdue PaymentMilestone contributes a critical weight. One or more overdue payments sets the wedding to Critical state regardless of other factors.
- **Unconfirmed vendors within 30 days:** Each unconfirmed vendor (status < Confirmed) with an event within 30 days contributes an at-risk weight. Three or more sets the wedding to Critical state.
- **Overdue tasks:** Each overdue Task contributes an at-risk weight. Five or more overdue tasks sets the wedding to At-risk state if not already Critical.
- **Budget overspend:** Committed spend ≥ 100% of planned sets the wedding to Critical state. Committed spend ≥ 85% sets the wedding to At-risk state if not already Critical.
- **Good state:** No overdue payments, no unconfirmed vendors within 30 days, no budget overspend ≥ 85%, and fewer than 5 overdue tasks.
The health score algorithm shall be implemented as a Supabase database function that can be called independently of the UI for testing and monitoring purposes.
FR-S17-05: Health score indicators shall be tappable. Tapping shall reveal a breakdown of the contributing factors with counts and direct navigation links to the relevant feature views.
FR-S17-06: Health scores shall update in real time when any contributing factor changes. No manual refresh shall be required.
FR-S17-07: When a planner has no active weddings, the portfolio view shall display a designed empty state with a "Create wedding" CTA.

**S18 — Client Onboarding Template**

FR-S18-01: Planners shall be able to save a completed wedding's configuration as a named template from the wedding settings.
FR-S18-02: A saved template shall capture: event names and sequence, access level configuration, and task category defaults. It shall explicitly not capture: couple names, wedding date, vendor data, rates, payment milestones, or client notes.
FR-S18-03: Templates shall be available for selection in the onboarding wizard when creating a new wedding. Selecting a template shall pre-fill the events and access configuration steps.
FR-S18-04: All pre-filled template values shall be editable before the wizard is submitted.
FR-S18-05: Template edits shall not affect any wedding previously created from that template.
FR-S18-06: Templates shall be deletable. Deletion shall require a confirmation prompt and shall not affect any weddings previously created from the template.

---

### Phase 3 — AI and Habit Layer

**S1 — AI Multi-Event Timeline Generation**

FR-S1-01: The system shall trigger AI timeline generation automatically on onboarding wizard completion.
FR-S1-02: The generated timeline shall contain sequenced tasks with week offsets from the wedding date, categories (vendor/budget/event/admin), titles, descriptions, and due dates.
FR-S1-03: Timeline tasks shall reference India-specific booking windows — photographer at 16 weeks, mehendi artist at 10 weeks, caterer final menu at 4 weeks — as baseline defaults. These defaults shall be adjustable via prompt configuration without code changes.
FR-S1-04: All event names in system-generated timeline tasks shall use Indian terminology. No anglicised substitutes shall appear.
FR-S1-05: When the late-start flag is set, the timeline shall resequence tasks by consequence severity. Tasks whose delay would cause vendor unavailability or budget impact shall be placed in the earliest available weeks.
FR-S1-06: The system shall implement a 45-second timeout on AI generation API calls. On timeout or error, the system shall retry once after 60 seconds and surface a manual trigger button if the retry also fails.
FR-S1-07: Timeline regeneration shall display a diff of proposed changes before applying them. Completed tasks and user-modified tasks shall be excluded from regeneration.
FR-S1-08: Custom tasks added by the user shall be visually distinguished from AI-generated tasks in all timeline views.
FR-S1-09: Marking a task complete shall update its status, write to the AuditLog, and remove it from the overdue and upcoming sections of the next briefing.

**S3 — Weekly AI Briefing**

FR-S3-01: The system shall generate a weekly briefing for each planner and head planner account on the configured schedule (default: Monday 08:00 in the user's local timezone).
FR-S3-02: The briefing shall contain four sections: overdue, at-risk, upcoming decisions, and budget health.
FR-S3-03: Each briefing item shall name the specific vendor, amount, task, or date it refers to. Generic language shall not appear in any briefing item.
FR-S3-04: For Mode 1 planners with multiple active weddings, the briefing shall group items by wedding, sorted by risk level (most at-risk wedding first).
FR-S3-05: The briefing shall be delivered in-app and via WhatsApp simultaneously at the configured time.
FR-S3-06: The WhatsApp briefing message shall contain the full briefing content — not a link to the app.
FR-S3-07: Every generated briefing shall be stored as a historical record and accessible from the wedding dashboard in reverse chronological order.
FR-S3-08: When no overdue, at-risk, or stalled items exist, the briefing shall display a positive all-clear message and surface the next 1–3 upcoming tasks from the timeline.
FR-S3-09: Items that remain unresolved across multiple briefing cycles shall reappear with an updated days-outstanding count and a "Flagged last week" indicator.
FR-S3-10: Vendor instances with no status change in ≥ 14 days and status below Confirmed shall appear in the briefing at-risk section with the specific message format defined in S3-6 acceptance criteria.
FR-S3-11: Couple-view participants (Mode 1) shall not receive the weekly AI briefing. Briefing generation jobs shall run only for planner and head planner accounts.

FR-S3-12: When the full briefing content exceeds 4,096 characters (WhatsApp's practical single-message length limit for Business API templates), the briefing shall be split into sequential messages. Split rules: the overdue section shall always appear in message 1; the at-risk section shall follow in message 1 if it fits, otherwise it opens message 2; upcoming decisions and budget health shall fill remaining messages. Each split message shall be numbered ("Weekly briefing 1/2", "Weekly briefing 2/2"). The in-app briefing shall always display as a single document regardless of WhatsApp split behaviour.

---

## 8.4 Non-Functional Requirements

Non-functional requirements define how the product must perform — not what it does, but how well it does it. They are the standards against which the implementation is measured.

---

### NFR-01 — Performance

**NFR-01-1 — AI generation:** AI-generated outputs (timeline generation, weekly briefing generation) shall be visible to the user within 30 seconds of the triggering action end-to-end — including API call, response parsing, database write, and UI render. This is the maximum acceptable duration for a synchronous generation flow.

**NFR-01-2 — Non-AI page loads:** All non-AI feature views (dashboard, vendor list, payment calendar, budget ledger, confirmation tracker, portfolio view) shall load within 3 seconds on a 4G Indian mobile connection (estimated bandwidth: 10–25 Mbps, estimated latency: 50–100ms). This is the relevant performance baseline — not a fibre connection benchmark.

**NFR-01-3 — Dashboard refresh:** The wedding dashboard and portfolio view health scores shall reflect the current state of the data within 5 seconds of any status change. Real-time updates shall not require a manual page refresh.

**NFR-01-4 — Invite link load:** The participant invite link view (couple, family, guest) shall load and display relevant content within 3 seconds of the link being tapped on a 4G Indian mobile connection.

**NFR-01-5 — Onboarding wizard:** The onboarding wizard shall complete all steps and navigate to the post-wizard destination within 2 seconds of the final submission tap, excluding AI timeline generation time (which is asynchronous).

---

### NFR-02 — Reliability and Uptime

**NFR-02-1:** The payment milestone calendar (S12), budget ledger (S10), and vendor card system (S5) shall maintain 99.9% uptime — these are the features that planners and head planners depend on for active financial management. Downtime of these features constitutes a service failure.

**NFR-02-2:** The weekly briefing generation job shall complete successfully for ≥ 99% of scheduled executions. Failed executions shall be logged, alerted to the engineering team, and retried within 1 hour.

**NFR-02-3:** WhatsApp delivery shall achieve ≥ 95% successful delivery within 10 minutes of the trigger event for registered WhatsApp numbers. Delivery failures shall be detected via webhook within 24 hours and surfaced to the sender.

**NFR-02-4:** Supabase RLS enforcement shall have zero tolerance for permission bypass. A security incident in which any participant accesses data above their access level shall be treated as a P0 incident regardless of the data accessed.

**NFR-02-5:** The audit log shall have 100% write reliability for all status-bearing entities. Audit log write failures shall not cause the underlying operation to fail but shall trigger an immediate alert to the engineering team.

---

### NFR-03 — Scalability

**NFR-03-1:** A single planner account shall support up to 50 simultaneous active weddings without degradation of portfolio view load time beyond the 3-second NFR-01-2 threshold. This covers the maximum realistic portfolio size for an agency planner.

**NFR-03-2:** A single wedding shall support up to 200 participant records, 50 vendor instances, 200 payment milestones, and 500 timeline tasks without degradation of dashboard or feature view load times.

**NFR-03-3:** The weekly briefing generation job shall be designed to scale horizontally — adding more planner accounts shall not increase briefing generation time per account. Each account's briefing shall be generated independently.

**NFR-03-4:** The database schema and RLS policies shall be designed to support 10,000 concurrent active weddings at V1 launch target scale, with a clear path to 100,000 weddings without schema changes.

**NFR-03-5:** Health scores shall be computed and cached per wedding in a dedicated health_score column on the Wedding record. Cache invalidation shall be event-driven: any change to a PaymentMilestone status, VendorInstance confirmation status, Task status, or BudgetLedger figure shall trigger an immediate health score recalculation for the affected wedding via a Supabase database trigger. The cached health score shall be the value read by the portfolio view — not a live computation on every portfolio load. This approach satisfies both NFR-01-3 (health scores reflect current state within 5 seconds of any change) and NFR-03-1 (portfolio view loads within 3 seconds for 50 weddings) without requiring a live aggregation query across all weddings on every login.

---

### NFR-04 — Data Privacy and Isolation

**NFR-04-1:** Rate data from any VendorInstance shall never appear in any query, derived field, API response, or AI prompt context belonging to a different wedding. This shall be enforced at the RLS layer — cross-wedding rate queries shall return zero results for any authenticated user.

**NFR-04-2:** VendorDirectory records shall never be accessible to any user other than the directory owner. This shall be enforced at the RLS layer. No application-layer join shall expose directory records to non-owner queries.

**NFR-04-3:** AI generation prompts shall contain only data belonging to the wedding being processed. No cross-wedding data shall be included in any AI prompt. Edge Functions assembling prompt context shall explicitly scope all queries to the target wedding ID.

**NFR-04-4:** Couple personal data (names, phone numbers, wedding details) shall not be used for any purpose other than operating the product. It shall not be shared with vendors, used for advertising, or included in any aggregated dataset that could be reverse-engineered to identify individuals.

**NFR-04-5:** All data shall be stored in Supabase's India or Asia-Pacific region where available, to minimise data residency concerns for Indian users. Region selection shall be confirmed during Supabase project configuration before any production data is written.

---

### NFR-05 — Security

**NFR-05-1:** All API keys (Anthropic, Supabase service role, WhatsApp provider) shall be stored as environment variables in Netlify and Supabase configuration. No key shall appear in source code, client-side JavaScript, or any repository file.

**NFR-05-2:** All client-to-server communication shall use HTTPS. No HTTP endpoints shall be exposed.

**NFR-05-3:** Participant invite links shall be implemented as signed tokens with the participant ID and wedding ID encoded. Unsigned or manually constructed URLs shall not grant access.

**NFR-05-4:** Supabase Auth shall handle all user authentication. Session tokens shall expire after 7 days of inactivity for planner and head planner accounts. Participant invite link sessions (for non-account participants) shall not expire on a time basis — they shall remain valid until access is revoked.

**NFR-05-5:** All status reversion operations shall be performed via a dedicated API endpoint that enforces the reason-entry requirement and AuditLog write. Standard PATCH operations on status fields shall be rejected for reversion scenarios.

---

### NFR-06 — Data Retention

**NFR-06-1:** All wedding data shall be retained indefinitely while the associated planner or head planner account is active. Data shall not be deleted on a time basis.

**NFR-06-2:** When an account is deleted, associated wedding data shall enter a suspended state for 90 days before permanent deletion. During the suspension period, the data shall be recoverable via a support request.

**NFR-06-3:** AuditLog records shall be retained permanently. They shall not be subject to any deletion policy — automatic or manual.

**NFR-06-4:** The VendorDirectory shall persist across all weddings for the lifetime of the planner account. Directory records shall not be deleted when a wedding is archived.

---

### NFR-07 — Error Monitoring and Alerting

**NFR-07-1:** An error monitoring service (Sentry or equivalent) shall be integrated with both the frontend application and all Supabase Edge Functions before V1 launch. Error monitoring is a launch dependency — the product shall not go live without it.

**NFR-07-2:** The following error categories shall trigger immediate alerts to the engineering team (defined as: notification within 5 minutes of occurrence):

- Any RLS permission bypass — a participant accessing data above their access level
- Any cross-wedding data exposure — rate or personal data from wedding A appearing in a query for wedding B
- Any AI generation Edge Function failure that affects more than one account simultaneously
- Any AuditLog write failure
- Any scheduled job that fails to execute within 30 minutes of its scheduled time

**NFR-07-3:** The following error categories shall trigger non-urgent alerts (defined as: notification within 1 hour, reviewed at next working session):

- Individual AI generation failures (single-account, retry available)
- Individual WhatsApp delivery failures (surfaced in-app to sender)
- Individual briefing generation failures (retry within 1 hour per NFR-02-2)

**NFR-07-4:** Error monitoring shall capture: error message, stack trace, affected user account ID (anonymised), affected wedding ID, and timestamp. No personal data (names, phone numbers, vendor rates) shall be included in error logs or monitoring alerts.

**NFR-07-5:** A monthly error report shall be reviewed by the engineering team covering: total error count by category, error rate trends, and any recurring patterns. This review is a V1 operational requirement, not a V2 addition.

---