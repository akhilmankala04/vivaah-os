# Section 3: Product Architecture

---

## 3.1 Architectural Overview

Vivaah OS is structured around four interlocking layers:

1. **Mode layer** — determines the operating model for a wedding (planner-led or self-planned) and governs which features, roles, and permissions are available
2. **Permission layer** — determines what each participant can see and do within a wedding, based on their assigned role and the active mode
3. **Vendor layer** — a two-tier model separating the planner's persistent private directory from the wedding-specific vendor instance
4. **Data layer** — the underlying entities, relationships, and state machines that all features read from and write to

These layers are not independent. The mode layer determines which permission roles are valid. The permission layer determines which wedding data each actor can access. The vendor layer is the primary data source for the payment calendar, budget ledger, and confirmation tracker. The data layer is what the AI operates on when generating timelines and weekly briefings.

### Feature dependency chain

The V1 feature set is sequenced around a data dependency chain. Each feature depends on the data established by the feature before it. This is why the build phases are ordered the way they are — Phase 1 must be complete before Phase 2 can function, and Phase 2 must be complete before Phase 3 has anything meaningful to operate on.

```
Onboarding wizard (S28)
    └── Creates: Wedding, Events, Participants, initial access structure
         └── Vendor card (S5)
              └── Creates: VendorDirectory entries, VendorInstances
                   └── Payment milestone calendar (S12)
                        └── Creates: PaymentMilestones linked to VendorInstances
                             └── Budget ledger (S10)
                                  └── Reads: all VendorInstances (committed) + PaymentMilestones (paid)
                                       └── 30-day confirmation tracker (S14)
                                            └── Reads: VendorInstance confirmation statuses + event dates
                                                 └── AI timeline (S1)
                                                      └── Reads: Wedding, Events, VendorInstances, Tasks
                                                           └── Weekly AI briefing (S3)
                                                                └── Reads: PaymentMilestones + VendorInstances
                                                                          + Timeline items + BudgetLedger
                                                                          + Audit log
```

The consequence of this chain: if vendor instances are incomplete (missing rates, missing confirmation status), the budget ledger is inaccurate, the confirmation tracker is blind, and the AI briefing is degraded. Data quality at the vendor card level propagates through every downstream feature. This dependency must be communicated to users — incomplete vendor cards produce an incomplete plan.

Every architectural decision in this section is locked for V1. Changes to any of these layers have cascading consequences and must be treated as breaking changes.

---

## 3.2 Mode Layer

### What mode is

Mode is a wedding-level setting, not a user-level setting. It is set once during onboarding and determines the entire operating structure of that wedding — which roles exist, what access levels are available, and which features are active.

A single user account can manage multiple weddings across different modes. A professional planner may have eight Mode 1 weddings active simultaneously. A couple using Mode 2 for their own wedding may later be added as a limited-access stakeholder on a Mode 1 wedding for a sibling's marriage. Mode is always scoped to the wedding, never to the user.

Mode cannot be changed after onboarding without a full permission reset. This is a deliberate constraint — mid-wedding mode switches create permission conflicts and data visibility inconsistencies that are not recoverable without manual intervention.

### Mode 1 — Planner-led

A professional wedding planner is the primary operator. The planner creates the wedding, owns the plan, and controls all access.

**Who uses it:** Professional planners managing client weddings. The planner is the paying subscriber. The couple and family are invited participants with read-only or limited access.

**Access structure:** Two fixed access levels — couple view and family view. Neither is configurable by the couple or family. The planner assigns both. Neither level allows editing.

**Planner capabilities:** Full access to all features. Creates and manages vendor cards. Manages the full budget ledger. Manages the payment calendar. Runs the confirmation tracker. Generates and edits the AI timeline. Receives the weekly AI briefing. Manages the client onboarding template. Views the portfolio health dashboard across all active weddings.

**Couple capabilities (couple view):** Can see plan status, upcoming milestones, confirmed vendors, and total upcoming payment amounts. Cannot see itemised vendor rates. Cannot see the full budget ledger. Cannot edit any plan element. Cannot add vendors. Cannot see the portfolio view.

**Family capabilities (family view):** Can see the event schedule and logistics — dates, times, venues, and dress codes. Cannot see vendors, budget, or task details. Cannot edit anything.

**Key constraint:** The couple cannot escalate their own access. The planner is the only actor who can change access levels. If a couple attempts to access a restricted view, they receive a permission-denied state, not a prompt to request access.

### Mode 2 — Self-planned

The couple and family plan without a professional planner. One designated person holds full admin authority.

**Who uses it:** Couples, family members, or a trusted individual designated to lead planning. The head planner is the primary account holder and the paying subscriber (or free tier user).

**Access structure:** Six configurable access levels. Access is open by default — all invited members receive view-only access unless the head planner configures otherwise. The head planner can upgrade, downgrade, or revoke any participant's access at any time.

**Head planner capabilities:** Full access to all features available in Mode 2. All the same operational capabilities as a Mode 1 planner, except portfolio view and client onboarding template (Mode 1 only). Additionally: can configure and reconfigure all participant access levels, and can transfer the head planner role.

**Head planner role transfer:** The head planner role can be transferred to any participant with full access. Transfer requires explicit confirmation from both parties. The outgoing head planner is automatically downgraded to full access (not removed). Role transfer is logged and cannot be undone except by the new head planner initiating a reverse transfer.

### Mode comparison

| Dimension | Mode 1 — Planner-led | Mode 2 — Self-planned |
| --- | --- | --- |
| Primary operator | Professional planner | Head planner (couple or family member) |
| Access levels available | 2 (fixed) | 6 (configurable) |
| Who controls access | Planner only | Head planner |
| Couple can edit | No | Yes, if granted full or relevant access |
| Portfolio view | Yes (planner only) | No |
| Client onboarding template | Yes (planner only) | No |
| Head planner role transfer | Not applicable | Yes |
| AI timeline and briefing | Yes (both) | Yes (both) |
| Paying subscriber | Planner | Head planner or couple |

### How mode is initialised — the onboarding wizard

Mode is set during the smart onboarding wizard (S28). The wizard is the entry point into the data model — nothing in the architecture exists before it runs. It establishes the following in sequence:

1. **Mode selection** — the user identifies whether a professional planner is managing the wedding (Mode 1) or the couple and family are self-managing (Mode 2). This single selection determines the permission structure for everything that follows.
2. **Wedding details** — couple names, wedding date (including muhurat-based date input), city or destination flag, and approximate guest count.
3. **Events** — the wizard presents India-specific event defaults (haldi, mehendi, sangeet, engagement, wedding, reception) and the user selects which apply, sets dates and times, and adds custom events if needed.
4. **Budget** — total planned budget entered as a single figure in ₹. This is the only manually entered budget figure. All committed and paid figures are subsequently computed from vendor and payment data.
5. **Participant setup** — in Mode 1, the planner invites the couple and optionally family members, assigns couple view or family view. In Mode 2, the head planner invites participants and assigns access levels (default: view only for all).
6. **Timeline generation** — on wizard completion, S1 runs automatically using the wedding date, events, and planning start date to generate the initial AI timeline. If the planning horizon is compressed, the late-start flag is set and the timeline is resequenced accordingly.

The wizard is reusable in Mode 1 — the planner can save a completed wizard configuration as a client onboarding template (S18) and apply it to future weddings with modifications. In Mode 2 there is no template feature, but the wizard remembers previous event and budget configurations for reference.

---

## 3.3 Permission Layer

### Mode 1 access levels

**Couple view**

- Visible: plan status summary, upcoming milestones, confirmed vendor names and categories (no rates), total upcoming payment amounts (no breakdown), event schedule
- Hidden: vendor rates, payment breakdown, full budget ledger, task list, unconfirmed vendors, planner notes
- Actions: none — read only

**Family view**

- Visible: event schedule (dates, times, venues), dress codes, logistics notes marked as family-visible by the planner
- Hidden: all vendor information, all budget information, all task information, plan status
- Actions: none — read only

### Mode 2 access levels

**Full access**

- Visible: everything
- Actions: create, edit, and delete vendors; manage budget entries; manage tasks; manage events; invite and configure participant access; generate and edit AI timeline; view and act on weekly briefing
- Note: only the head planner can manage other participants' access levels and transfer the head planner role. Full access users can do everything else.

**Budget access**

- Visible: full budget ledger (planned, committed, paid), payment milestone calendar, vendor rates, payment schedule
- Hidden: task list, AI briefing, timeline editing
- Actions: add and edit budget entries and payment records; cannot add or edit vendors

**Task access**

- Visible: tasks assigned to them, event schedule, confirmed vendor names
- Hidden: budget, vendor rates, unassigned tasks, AI briefing
- Actions: update status of assigned tasks only

**Event-specific access**

- Visible: all vendor, task, and timeline information for one assigned event only
- Hidden: all other events, full budget, portfolio
- Actions: can edit vendor and task information for their assigned event only

**View only**

- Visible: full plan — events, confirmed vendors, schedule, task list (no budget)
- Hidden: budget ledger, vendor rates, payment details
- Actions: none — read only

**Guest access**

- Visible: event schedule, venue details, dress codes, travel and logistics notes marked as guest-visible
- Hidden: everything else
- Actions: none — read only

### Permission enforcement rules

1. Permissions are enforced at the data layer, not the UI layer. A budget-access user who inspects the DOM or calls the API directly must receive the same restricted response as they would through the UI.
2. Access level changes take effect immediately. There is no grace period or session expiry delay.
3. Downgrading a participant's access does not notify them. The change is silent — they simply see less on their next load.
4. Revoking access removes the participant from the wedding entirely. Their previously entered data remains. They receive a notification that their access has been removed.
5. The head planner cannot revoke their own access or downgrade themselves below full access. Only a transfer to another participant changes the head planner's role.
6. In Mode 1, the planner account cannot be removed from a wedding. If the planner deletes their account, the wedding enters a suspended state and the couple is notified.

---

## 3.4 Vendor Layer

### Overview

The vendor architecture is a two-layer model. The two layers are structurally separate, serve different purposes, and must never be conflated in the data model or the UI.

**Layer 1 — Private vendor directory (persistent)**
Belongs to the planner or head planner. Persists across all weddings. Contains identity and relationship data only. Never contains rates.

**Layer 2 — Wedding vendor instance (contextual)**
Belongs to one wedding. Created fresh for every wedding. Contains all commercial and operational data for that vendor within this wedding. Rates are always here, never in Layer 1.

### Layer 1 — Private vendor directory

**What it stores:**

- Vendor name
- Category (from India-specific category defaults — S29)
- City
- Phone number
- Notes (free text — planner's private observations)
- Wedding count (number of weddings this vendor has been used in, auto-incremented)

**What it never stores:**

- Rates of any kind
- Payment terms
- Deliverables
- Contract information
- Any data specific to a single wedding

**Who owns it:**

- In Mode 1: the professional planner. The directory is private to that planner and is never visible to clients, other planners, or the platform.
- In Mode 2: the head planner. Same privacy rules apply.

**How it grows:**

- Every time a new vendor is added to any wedding, the planner is offered a one-action save to directory.
- When a vendor already in the directory is added to a new wedding, the directory entry is not modified — a new wedding instance is created.
- The directory is never modified by wedding-instance data. The two layers do not write to each other.

**Cross-wedding behaviour:**

- The wedding count is the only field that updates across weddings — it increments each time a directory vendor is added to a new wedding.
- The last-used date is recorded for display purposes (shown as a reference signal when adding the vendor to a new wedding).
- No rate data from any wedding is ever surfaced in the directory or used to populate a rate field in a new wedding.

### Layer 2 — Wedding vendor instance

**What it stores:**

- Reference to directory entry (if vendor exists in directory) or standalone vendor record (if new)
- Negotiated rate (mandatory before status can advance past Quoted)
- Payment schedule (milestone dates and amounts)
- Deliverables (free text or structured list)
- Contract status (not uploaded / uploaded / reviewed)
- Confirmation status (lifecycle below)
- Planner notes for this wedding (separate from directory notes)
- Event assignment (which event(s) this vendor is serving)

**Confirmation status lifecycle:**

```
Shortlisted → Quoted → Booked → Confirmed → Done
```

- **Shortlisted:** Vendor is under consideration. No rate entered. No commitment made.
- **Quoted:** Rate has been received and entered. No payment made. No booking confirmed.
- **Booked:** Advance payment made. Vendor has acknowledged the booking. Date is held.
- **Confirmed:** Vendor has provided written or WhatsApp confirmation of the date, time, and deliverables. This is the status the 30-day confirmation tracker (S14) monitors.
- **Done:** Wedding event is complete. Final payment made or logged.

Status can only move forward in this sequence. Reverting a status (e.g. from Booked back to Quoted) requires explicit action and a reason entry, and is logged.

**When adding a vendor to a wedding:**

If the vendor exists in the planner's directory:

- A preview card is shown with: vendor name, category, city, phone, planner notes, wedding count, and last-used date
- The rate field is always blank — it must be entered fresh
- The preview is explicitly labelled as reference information, not a pre-fill
- One action creates the wedding instance and links it to the directory entry

If the vendor is new:

- The vendor details are entered once
- One action saves to the directory and creates the wedding instance simultaneously
- The vendor is immediately available in the directory for future weddings

**Rate privacy:**
Rates from past weddings are never shown anywhere — not in the preview card, not in the directory, not in any comparison view. The last-used date is shown as a time reference only. This is a non-negotiable privacy and trust constraint. A planner's negotiated rates are the product of their vendor relationships and commercial judgement — they are not platform data.

---

## 3.5 Data Model

### Core entities

**Wedding**
The top-level entity. All other entities belong to a wedding.

- Fields: wedding ID, mode (1 or 2), couple names, wedding date, planning start date, destination flag, city/cities, total planned budget, created by (planner or head planner ID), status (active / suspended / archived)
- Relationships: has many Events, has many VendorInstances, has one BudgetLedger, has many Participants, has one Timeline, has many PaymentMilestones

**Event**
A distinct ceremony or celebration within the wedding.

- Fields: event ID, wedding ID, event name (from India-specific defaults or custom), date, start time, end time, venue name, venue address, dress code, notes, status (planned / confirmed / complete)
- Relationships: belongs to Wedding, has many VendorInstances (via event assignment), has many Tasks, has many Timeline items

**Participant**
Any user with access to a wedding.

- Fields: participant ID, user ID, wedding ID, role (planner / head planner / couple / family / guest / custom), access level (mode-specific), invited by, invited at, last active, status (active / revoked)
- Relationships: belongs to Wedding, belongs to User, has many assigned Tasks

**VendorDirectory** (Layer 1)
The planner's persistent private vendor record.

- Fields: directory ID, owner (planner/head planner user ID), vendor name, category, city, phone, notes, wedding count, last used date, created at
- Relationships: belongs to User (planner), has many VendorInstances (via reference — read only, no data flow back)

**VendorInstance** (Layer 2)
The wedding-specific vendor record.

- Fields: instance ID, wedding ID, directory reference (nullable — null if vendor not in directory), vendor name (denormalised for portability), category, negotiated rate, payment schedule (array of milestone objects), deliverables, contract status, confirmation status, event assignment (array of event IDs), planner notes, created at, updated at
- Relationships: belongs to Wedding, optionally references VendorDirectory, belongs to one or many Events, has many PaymentMilestones

**PaymentMilestone**
A single payment obligation within a vendor's payment schedule.

- Fields: milestone ID, vendor instance ID, wedding ID, amount (₹), due date, paid date (nullable), status (upcoming / due / paid / overdue), description (e.g. "50% advance", "balance on wedding day"), created at
- Relationships: belongs to VendorInstance, belongs to Wedding

**BudgetLedger**
The financial record of the wedding.

- Fields: ledger ID, wedding ID, total planned budget, total committed (sum of all booked/confirmed vendor rates), total paid (sum of all paid milestones), last updated at
- Note: committed and paid are computed from VendorInstance and PaymentMilestone data respectively — they are not manually entered fields. Planned budget is the only manually entered figure.
- Relationships: belongs to Wedding, derived from VendorInstances and PaymentMilestones

**Task**
A discrete action item within the wedding plan.

- Fields: task ID, wedding ID, event ID (nullable — some tasks are wedding-level, not event-specific), title, description, assigned to (participant ID, nullable), due date, status (not started / in progress / complete / overdue), created by, created at, updated at
- Relationships: belongs to Wedding, optionally belongs to Event, optionally assigned to Participant

**Timeline**
The AI-generated planning schedule for the wedding.

- Fields: timeline ID, wedding ID, generated at, planning horizon (months), late-start flag (boolean), late-start weeks (integer — how many weeks behind the standard horizon the couple is starting), items (array of timeline item objects)
- Timeline item fields: item ID, timeline ID, week offset (weeks before wedding date), title, description, category (vendor / budget / event / admin), status (pending / complete / overdue / skipped), linked entity (vendor instance ID or task ID, nullable)
- Relationships: belongs to Wedding, timeline items link to Tasks and VendorInstances

### Key data rules

1. **Rate data never crosses weddings.** No query, aggregate, or derived field may surface rate data from one wedding in the context of another. This is enforced at the query layer, not just the UI.
2. **Budget figures are computed, not stored.** Committed spend is always calculated from the current state of VendorInstances. Paid spend is always calculated from PaymentMilestone records. There is no stored committed or paid total that can go stale.
3. **Vendor directory and vendor instance are append-only in opposite directions.** The directory grows when new vendors are added. Instances are created fresh and never write back to the directory (except incrementing the wedding count and updating the last-used date — metadata only, never commercial data).
4. **Status transitions are logged.** Every change to VendorInstance confirmation status, PaymentMilestone status, Task status, and Event status is written to an audit log with timestamp, actor ID, previous state, and new state. This log is used by the AI briefing to detect stalled progress.
5. **Participant access is enforced at the query layer.** Every data fetch is scoped to the requesting participant's access level. Budget and rate fields are excluded from responses for participants without budget access. Vendor details are excluded for family-view and guest-access participants.
6. **Soft delete only.** No entity is hard-deleted. Vendors, tasks, and events that are removed are marked as archived. This preserves audit trail and prevents broken references in the timeline and briefing.
7. **V1 treats budget as a single wedding-level ledger.** The BudgetLedger holds one planned budget figure for the entire wedding. Dual-family budget contributions — where bride's family and groom's family each fund separate events or categories — are not tracked as separate ledger entries in V1. Families with split contributions should enter the combined total as the planned budget. The distinction between which family committed which spend is not captured in the data model at this stage. This is a deliberate V1 simplification, not an oversight. Dual-family budget attribution with event-level ownership tracking is a V2 data model addition that will require schema changes to BudgetLedger and VendorInstance. It is noted here so it does not resurface as an ambiguity in feature requirements or edge cases.

---

## 3.6 AI Layer — Data Dependencies

The two AI features in V1 — S1 (timeline generation) and S3 (weekly briefing) — operate on the data model described above. Their inputs and outputs are defined here to make the dependency chain explicit.

### S1 — AI multi-event timeline generation

**Inputs:**

- Wedding date
- Planning start date (derived: weeks remaining = wedding date minus start date)
- Destination flag
- List of events (names, dates, times)
- List of vendor instances (categories, confirmation statuses)
- Late-start flag and late-start weeks (calculated at generation time)

**What the AI produces:**

- A sequenced list of timeline items, each with a week offset, category, title, and linked entity where applicable
- A late-start resequencing if the planning horizon is compressed — tasks are reprioritised by consequence severity, not just by standard lead time
- India-specific task defaults: mehendi artist booking window, caterer advance payment norms, muhurat-aligned event sequencing

**Output stored as:** Timeline entity with array of timeline items. Items are linked to Tasks (auto-created on generation) and VendorInstances where applicable.

**Regeneration:** Timeline can be regenerated at any point. Regeneration does not overwrite completed items — only pending and overdue items are recalculated. The user is shown a diff of what changed before confirming.

### S3 — Weekly AI briefing

**Inputs:**

- All PaymentMilestones with status upcoming, due, or overdue — sorted by due date
- All VendorInstances with confirmation status Shortlisted or Quoted and event date within 30 days
- All Timeline items with status overdue
- Budget ledger — planned vs. committed vs. paid
- Audit log — items that have not changed status in more than 14 days

**What the AI produces:**

- Overdue section: tasks and payments that have passed their due date without being marked complete
- At-risk section: vendors not yet confirmed with events approaching, payments due within 7 days, timeline items stalled for 14+ days
- Upcoming decisions section: the 3–5 most consequential actions required in the next 7–14 days, ranked by consequence severity
- Budget health summary: planned vs. committed vs. paid, percentage of budget committed, projected final spend if current trajectory continues

**Output format:** Structured briefing delivered in-app and via WhatsApp. Briefing is generated weekly on a fixed day set during onboarding (default: Monday morning). Briefs are stored and accessible historically — a planner can review the briefing from three weeks ago to understand when a problem first surfaced.

**Tone:** Direct. The briefing names the specific vendor, specific amount, or specific task that is at risk — it does not summarise in generalities. "Mehendi artist Priya Arts has not confirmed the 14 March booking. Last contact was 18 days ago." Not "some vendors may need follow-up."

---

## 3.7 V2 Vendor Network — What the Private Directory Makes Possible

The private vendor directory (Layer 1) is scoped to the individual planner in V1. Each planner's directory is private, non-shareable, and invisible to the platform. This is the right architecture for V1 — trust is built by proving the product is safe with sensitive data before asking planners to contribute to a shared pool.

In V2, the private directory becomes the raw material for a platform-level shared vendor network. As planners accumulate directory entries across weddings, the platform accumulates structured vendor data — names, categories, cities, and usage counts — across thousands of planning relationships. This data is the foundation for trust signals: booking frequency across planners, response reliability, category depth by city. A vendor who appears in 200 planners' directories with high usage counts carries a signal that no paid listing can replicate.

The V2 vendor network will require its own scoping exercise covering trust architecture, incentive design for planner contribution, vendor opt-in mechanics, and rate transparency decisions. It is not a feature extension of V1 — it is a platform layer that V1 makes possible by establishing the data foundation. Nothing in the V1 private directory architecture should be designed in a way that makes this migration harder. Specifically: vendor records must be portable (no planner-specific encoding), categories must be standardised (S29 defaults are the shared taxonomy), and the directory must be queryable by city and category at the platform level when the time comes.

---

## 3.8 Technology Stack

The V1 stack is fixed. Architecture decisions in this section are made with these tools in mind. Full technical requirements are in Section 8 — this subsection notes only the architectural implications of each choice.

**Anthrpic API (claude-sonnet-4-20250514)** — powers S1 (AI timeline generation) and S3 (weekly AI briefing). The AI layer operates on structured data from the Supabase data model — it does not have direct database access. Data is assembled server-side, passed to the API as a structured prompt context, and the response is parsed and written back to the database. Prompt engineering for both features must produce consistent, structured output that maps cleanly to the Timeline and briefing data models defined in 3.5 and 3.6.

**Supabase** — the primary database and backend. Postgres handles all relational data. Supabase's row-level security (RLS) is the implementation mechanism for the permission enforcement rules in 3.3 — access level checks defined in the permission layer map directly to RLS policies on the relevant tables. This is the correct implementation path: permission enforcement at the database layer, not the application layer, satisfies the rule that access is enforced at the query layer rather than the UI. Supabase Auth handles user authentication and session management. Supabase Edge Functions handle server-side logic including AI API calls, briefing generation scheduling, and audit log writes.

**Netlify** — frontend hosting and deployment. The web application is deployed via Netlify. Netlify Functions handle any edge compute needs not covered by Supabase Edge Functions. Environment variables for Anthropic API keys and Supabase connection strings are managed through Netlify's environment configuration and never exposed client-side.

**WhatsApp delivery** — WhatsApp Business API (via a provider such as Twilio or Gupshup) handles all WhatsApp-based notification delivery — participant invites, weekly briefing delivery, and payment reminders. This is not a V1 build-from-scratch item — it is an integration. The specific provider is to be confirmed during technical scoping. The architecture requires only that outbound WhatsApp messages can be triggered from Supabase Edge Functions with a recipient phone number and message payload.