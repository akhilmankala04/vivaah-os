# Section 7: User Flows

---

## 7.1 How to Read This Section

Each flow documents the step-by-step path a user takes to complete a task — including decision branches, alternate paths, and system responses. Flows are written for the primary actor of each feature. Secondary actor flows (e.g. couple viewing a planner-managed wedding) are documented where the experience differs meaningfully.

The prose flows in this section are the canonical flow reference for this PRD. Any separate wireframe or diagram files are supplementary. When conflicts arise, this section governs.

### Flow legend

**Actor labels**

| Label | Actor | Mode |
| --- | --- | --- |
| [PLANNER] | Professional wedding planner | Mode 1 primary operator |
| [HEAD] | Head planner (couple or family member) | Mode 2 primary operator |
| [COUPLE] | Couple member with couple-view access | Mode 1 limited access |
| [FAMILY] | Family member — family view, view-only, or event-specific access | Mode 1 or Mode 2 |
| [BUDGET] | Family member with budget access | Mode 2 only |
| [System:] | System-initiated action — not triggered by user | Both modes |

**Flow notation**

| Symbol | Meaning |
| --- | --- |
| Numbered step (1, 2, 3…) | Sequential user action |
| → [condition]: path | Decision branch — condition determines which path is taken |
| *System:* | Background or automatic system action |
| **End state:** | The final condition of the system and user after the flow completes |
| Indented steps under a branch | Steps that occur only if the branch condition is true |

**Mode indicators in the master map**

| Symbol | Meaning |
| --- | --- |
| (Mode 1 only) | Feature or step applies to planner-led weddings only |
| (Mode 2 only) | Feature or step applies to self-planned weddings only |
| No indicator | Applies to both modes |
| ─── feeds | Data dependency arrow — the upstream feature provides data the downstream feature reads |

**Feature phase colours (for reference in any separate diagram files)**

| Phase | Colour reference | Features |
| --- | --- | --- |
| Phase 1 — Architecture | Teal | S28, S23, S5, S29 |
| Phase 2 — Operating layer | Amber | S12, S10, S14, S17, S18 |
| Phase 3 — AI and habit layer | Purple | S1, S3 |

---

## 7.2 Master Flow Map — How the 11 Features Connect

The master flow map shows the user journey across both modes from first login through to wedding completion. It is not a feature list — it shows causality and sequence.

```
NEW USER ARRIVES
       │
       ▼
[S28] ONBOARDING WIZARD
  ├── Mode selection (Mode 1 or Mode 2)
  ├── Wedding details (date, city, destination flag, muhurat input)
  ├── Events (India defaults via S29)
  ├── Budget (planned total)
  ├── Participant setup (S23)
  │     Mode 1: invite couple → couple view
  │              invite family → family view
  │     Mode 2: invite participants → assign access levels
  │              head planner role confirmed
  └── Wizard complete
           │
           ▼
    *System: triggers S1*
           │
           ▼
[S1] AI TIMELINE GENERATED
  └── Tasks created, sequenced by week offset
  └── Late-start resequencing if < 20 weeks
           │
           ▼
WEDDING DASHBOARD (ongoing operating layer)
           │
    ┌──────┼──────────────────┐
    │      │                  │
    ▼      ▼                  ▼
[S5]    [S17]              [S3]
VENDOR  PORTFOLIO          WEEKLY
CARDS   VIEW               BRIEFING
  │     (Mode 1 only)        ▲
  │                          │
  ├── Rate entered            │
  ├── Event assigned ─────────┤ feeds
  ├── Milestones added        │
  │         │                 │
  │         ▼                 │
  │      [S12]                │
  │   PAYMENT CALENDAR ───────┤ feeds
  │         │                 │
  │         ▼                 │
  │      [S10]                │
  │   BUDGET LEDGER  ─────────┤ feeds
  │                           │
  ├── Status advanced         │
  │         │                 │
  │         ▼                 │
  │      [S14]                │
  │   CONFIRMATION    ────────┘ feeds
  │   TRACKER
  │
  └── [S18] CLIENT TEMPLATE (Mode 1 only)
        saved from completed wizard
        applied to next wedding via S28
           │
           ▼
WEDDING COMPLETION
  ├── All vendor statuses → Done
  ├── All payment milestones → Paid
  ├── All timeline tasks → Complete or Skipped
  ├── Final briefing: "All vendors confirmed, all payments cleared"
  └── Wedding archived
           │
     ┌─────┴──────────────────┐
     │                        │
     ▼                        ▼
[Mode 1]                 [Mode 2]
Planner's directory      Head planner's
grows: vendor count      directory grows:
increments, last-used    vendor count
dates updated            increments
     │                        │
     ▼                        ▼
[S18] Template available   Wedding archived
for next client wedding    in account history
```

**Reading the map:** Every arrow represents a data dependency. S5 (vendor cards) is the central data source — it feeds S12, which feeds S10, both of which feed S3. S14 reads from S5 directly. S1 reads from S28 (events and dates) and generates the task structure S3 also reads from. S17 reads from all four operating layer features simultaneously. S18 saves from S28 and is applied back to S28.

---

## 7.3 S28 — Smart Onboarding Wizard

**Primary actor:** [PLANNER] Mode 1 / [HEAD] Mode 2
**Entry point:** First login, or “Create new wedding” from portfolio/dashboard
**Preconditions:** User has a Vivaah OS account

### Main flow — Mode 1 (planner creating a client wedding)

1. User taps “Create new wedding”
2. *System:* presents mode selection screen
3. User selects “Planner-led (I am a professional planner managing this wedding)”
4. → [Has saved templates]: *System:* presents option to “Start from template” or “Start fresh”
→ [No saved templates]: proceeds to step 5
5. User enters wedding details: couple’s names, wedding date
6. → [User selects “Date chosen by pandit / muhurat”]: *System:* accepts date without alternative suggestions, sets muhurat flag
→ [User enters date directly]: *System:* accepts date, calculates planning horizon
7. *System:* calculates weeks until wedding
→ [< 20 weeks]: *System:* sets late-start flag, previews compressed timeline message
→ [≥ 20 weeks]: standard timeline
8. User enters city and selects destination wedding flag if applicable
9. *System:* presents India-specific event defaults (haldi, mehendi, sangeet, engagement, wedding, reception) with one-line descriptions
10. User selects applicable events, sets dates and times, optionally adds custom events
11. User enters total planned budget in ₹
12. *System:* presents participant setup — couple invitation
13. User enters couple member 1 name and phone number, assigns couple view
14. User enters couple member 2 name and phone number (optional), assigns couple view
15. User adds family members if desired, assigns family view per participant
16. User reviews summary screen: wedding name, date, events, budget, participants
17. User confirms and submits
18. *System:* creates Wedding record, Event records, Participant records
19. *System:* sends WhatsApp invites to all participants
20. *System:* triggers AI timeline generation (S1)
21. *System:* navigates planner to portfolio view with new wedding visible
22. → [Template applied at step 4]: *System:* pre-fills events and access configuration, planner edits as needed from step 9

**End state:** Wedding created, participants invited, timeline generation in progress. Planner is on the portfolio view.

### Alternate path — step skipped

At any step from 9 onwards, user selects “Skip”:
- *System:* marks step incomplete, advances to next step
- Skipped steps appear as flagged setup items on the wedding dashboard
- User can return to complete skipped steps at any time from the dashboard

### Alternate path — template applied (Mode 1)

At step 4, user selects a saved template:
- Events, access level configuration, and task defaults are pre-filled from the template
- Steps 9–15 show pre-filled values with edit capability
- User makes modifications and continues from step 16
- No vendor, rate, or client data from the source wedding is present

### Main flow — Mode 2 (couple or family head planner)

Steps 1–11 are identical with the following differences:
- Step 3: user selects “Self-planned (no professional planner)”
- Step 12: participant setup shows six access levels instead of two
- Step 13–15: head planner adds participants and assigns access levels; default is view-only if not specified
- Step 16: summary includes access level per participant
- All other steps identical

**End state:** Wedding created, participants invited, timeline generation in progress. Head planner is on the wedding dashboard.

---

## 7.4 S23 — Role and Access Setup

**Primary actor:** [PLANNER] Mode 1 / [HEAD] Mode 2
**Entry point:** Participant setup step within S28, or “Manage participants” from wedding settings
**Preconditions:** Wedding exists

### Flow — adding a participant (both modes)

1. User navigates to participant management (within wizard or from wedding settings)
2. User taps “Add participant”
3. User enters participant’s name and phone number
4. *System:* presents access level options based on mode
→ [Mode 1]: couple view / family view
→ [Mode 2]: full / budget / task / event-specific / view-only / guest
5. User selects access level
→ [No selection made]: *System:* defaults to view-only (Mode 2) or prompts selection (Mode 1 — no default)
6. → [Mode 2, user indicates participant is a budget contributor]: *System:* surfaces prompt: “Give this person budget visibility?”
→ [Yes]: access level set to budget
→ [No / dismissed]: access level remains as selected
7. User confirms
8. *System:* creates Participant record with assigned access level
9. *System:* sends WhatsApp invite to participant’s phone number
10. → [WhatsApp delivery succeeds]: participant status shows “Invite sent”
→ [WhatsApp delivery fails within 24 hours]: *System:* sends in-app notification to planner/head planner: “Invite to [name] failed to deliver”
→ [Failure]: participant status shows “Invite failed” with resend option

**End state:** Participant record created. Invite sent or flagged as failed.

### Flow — changing a participant’s access level

1. User opens participant management
2. User selects participant
3. User selects new access level
4. *System:* applies change immediately — no grace period
5. Participant is not notified
6. Change is recorded in audit log

**End state:** Access level updated. Participant sees new view on next load.

### Flow — revoking access

1. User opens participant management
2. User selects participant, selects “Revoke access”
3. *System:* presents confirmation: “Remove [name] from this wedding? They will be notified.”
4. User confirms
5. *System:* removes participant from wedding
6. *System:* sends WhatsApp notification to removed participant
7. All data entered by participant remains in the system

**End state:** Participant removed. Data preserved. Participant notified.

### Flow — head planner role transfer (Mode 2)

1. Head planner opens participant management
2. Head planner selects a full-access participant
3. Head planner selects “Transfer head planner role”
4. *System:* presents confirmation to head planner: “Transfer your head planner role to [name]? You will become a full-access participant.”
5. Head planner confirms
6. *System:* sends WhatsApp notification to target participant: “[Name] is transferring the head planner role to you. Accept?”
7. → [Target accepts]: *System:* updates roles, both parties notified, transfer logged in audit
→ [Target declines]: no change, both parties notified

**End state:** Role transferred or declined. Audit log updated.

---

## 7.4a First-Login Flow — Couple (Mode 1, Couple View)

**Primary actor:** [COUPLE]
**Entry point:** WhatsApp invite link sent by planner
**Preconditions:** Planner has created the wedding and added the couple as participants. WhatsApp invite delivered successfully.

### Flow — couple first access

1. Couple member receives WhatsApp message: “[Planner name] has added you to your wedding plan on Vivaah OS. Tap to view your plan.”
2. Couple member taps the link
3. *System:* opens mobile browser or app to the couple view — no login or account creation required at this step
4. *System:* displays couple view with:
    - Wedding name and date
    - Events confirmed so far (name, date, venue if entered)
    - Plan status summary (e.g. “3 of 6 events have confirmed vendors”)
    - Upcoming payment total (aggregate — no vendor breakdown)
5. → [Couple member wants to save access for later]:
    - *System:* presents optional account creation prompt: “Create an account to return to your plan anytime”
    - Couple member enters name, phone number, and sets a PIN or password
    - *System:* creates account and links to the participant record
    - All previously visible data remains — no re-invitation needed
6. → [Couple member declines account creation]: access via the invite link remains valid
    - Invite link is persistent — couple can return to the same link to view their plan
    - Link does not expire unless the planner revokes access

**End state:** Couple member is viewing their couple-view dashboard. Account creation is optional and non-blocking.

### Key design constraint

The couple must see meaningful content on the first tap of the invite link — not a sign-up wall, not a loading screen that requires account creation before anything is visible. If the wedding has no confirmed vendors or events yet, the couple view must show a clear “plan is being set up” state rather than a blank screen.

---

## 7.4b First-Login Flow — Family Member (Mode 1 Family View / Mode 2 View-Only or Guest)

**Primary actor:** [FAMILY]
**Entry point:** WhatsApp invite link sent by planner or head planner
**Preconditions:** Family member has been added as a participant with family view, view-only, or guest access.

### Flow — family member first access

1. Family member receives WhatsApp message: “You’ve been added to [couple names]’s wedding plan. Tap to view the schedule and details.”
2. Family member taps the link
3. *System:* opens to their access-level-appropriate view — no login required
→ [Family view / Mode 1]: event schedule, venues, dress codes, logistics notes
→ [View-only / Mode 2]: full plan view — events, confirmed vendors, task list (no budget)
→ [Guest access]: event schedule, venue, dress code, travel info only
4. Family member browses the information relevant to them
5. → [Family member wants to receive updates]: *System:* offers WhatsApp notification opt-in: “Get notified when the schedule updates”
    - If opted in, family member receives WhatsApp notifications on confirmed event changes
    - No account creation required for notifications — notification delivery uses the phone number the invite was sent to
6. → [Family member does not opt in]: they can return to the link at any time to check for updates manually

**End state:** Family member has seen the relevant schedule and logistics. Update notifications are optional and set up without account creation.

### Key design constraint

A family member who is 55+ years old, moderately tech-comfortable, and receiving a WhatsApp link for the first time must be able to see the sangeet date and venue within two taps. Zero account creation friction. Zero navigation complexity. The view must be a single, scrollable page with the most important information first — event name, date, time, venue, dress code.

---

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** Vendor section of any event
**Preconditions:** At least one event exists on the wedding

### Flow — category defaults presented

1. User navigates to an event’s vendor section
2. *System:* checks event type against defaults library
3. *System:* displays suggested vendor categories for this event type
    - Haldi: photographer, caterer (snacks/beverages), décor, makeup artist
    - Mehendi: mehendi artist, photographer, caterer (snacks), décor
    - Sangeet: DJ/live music, photographer/videographer, caterer, décor, lighting
    - Wedding: venue, caterer, photographer, videographer, décor, florist, priest/pandit, mehendi, baraat (band/DJ), lighting
    - Reception: venue, caterer, photographer, videographer, décor, DJ/live music, lighting
4. User selects which suggestions to apply
→ [User accepts a suggestion]: *System:* creates an empty vendor slot in that category for this event
→ [User dismisses a suggestion]: *System:* removes it from the list — it does not reappear
5. User can add custom categories not in the defaults list
6. Custom categories are saved for reuse within this wedding

**End state:** Vendor category slots created for the event. User can now add vendors to each slot.

---

## 7.6 S5 — Vendor Card with Two-Layer Architecture

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** Event vendor section, or “Add vendor” from the wedding vendor list
**Preconditions:** Wedding and at least one event exist

### Flow — adding a new vendor (not in directory)

1. User taps “Add vendor”
2. User enters vendor name
3. *System:* searches planner’s private directory for matches
→ [No matches found]: *System:* indicates “New vendor — not in your directory”
4. User enters: category (from defaults or custom), city, phone number
5. User enters negotiated rate in ₹
6. User assigns vendor to one or more events
7. User optionally enters: payment schedule, deliverables, notes
8. User saves
9. *System:* creates VendorInstance linked to this wedding with status: Shortlisted
10. *System:* presents prompt: “Save [vendor name] to your directory for future weddings?”
→ [User confirms]: *System:* creates VendorDirectory entry, links instance to directory entry
→ [User declines]: only VendorInstance is created, no directory entry

**End state:** Vendor card created with Shortlisted status. Optional directory entry created.

### Flow — adding a vendor from the private directory

1. User taps “Add vendor”
2. User types vendor name or searches by category
3. *System:* searches planner’s private directory
4. *System:* displays matching directory vendors as suggestions
5. User selects a directory vendor
6. *System:* shows vendor preview card:
    - Vendor name, category, city, phone
    - Planner notes from directory
    - Wedding count (“Used in 4 weddings”)
    - Last used date (“Last used: August 2024”)
    - Rate field: blank, labelled “For reference only — enter this wedding’s rate”
7. User enters negotiated rate for this wedding (cannot be pre-filled or carried over)
8. User assigns to one or more events
9. User optionally adds milestones, deliverables, notes
10. User saves
11. *System:* creates VendorInstance linked to this wedding and to the directory entry
12. *System:* increments directory entry’s wedding count by 1
13. *System:* updates directory entry’s last-used date

**End state:** Vendor card created. Directory entry updated (count and last-used date only — no rate data written back).

### Flow — advancing vendor confirmation status

1. User opens a vendor card
2. User selects “Update status”
3. *System:* shows available next status (one step forward only)
→ [Current status: Shortlisted]: next available = Quoted
→ [Current status: Quoted]: next available = Booked
→ [Current status: Booked]: next available = Confirmed
→ [Current status: Confirmed]: next available = Done
4. → [Advancing to Booked with no rate entered]: *System:* blocks advance, highlights rate field: “Rate required before booking”
5. User selects next status and confirms
6. *System:* updates status, writes to audit log
7. *System:* updates confirmation tracker and AI briefing data

**End state:** Status updated. Audit log entry created.

### Flow — reverting vendor status

1. User opens vendor card, selects “Revert status”
2. *System:* presents confirmation: “Move [vendor] back to [previous status]? This affects the tracker and budget.”
3. User enters a reason (required)
4. User confirms
5. *System:* reverts status, writes revert reason and previous/new status to audit log
6. → [Reverted from Booked or higher, event within 30 days]: vendor reappears in confirmation tracker

**End state:** Status reverted. Reason logged.

---

## 7.7 S12 — Payment Milestone Calendar

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** “Payments” tab on wedding dashboard, or milestone section within a vendor card
**Preconditions:** At least one vendor instance with at least one payment milestone exists

### Flow — adding a payment milestone

1. User opens a vendor card
2. User navigates to “Payment milestones”
3. User taps “Add milestone”
4. User enters: amount (₹), due date, description (e.g. “50% advance”)
5. *System:* checks if milestone total exceeds negotiated rate
→ [Total exceeds rate]: inline warning: “Milestone total (₹X) exceeds negotiated rate (₹Y)”
6. User saves
7. *System:* creates PaymentMilestone record linked to vendor instance and wedding
8. *System:* milestone appears in payment calendar with status: upcoming

**End state:** Milestone created. Visible in payment calendar.

### Flow — marking a milestone as paid

1. User opens payment calendar or vendor card
2. User selects a milestone with status upcoming or overdue
3. User taps “Mark as paid”
4. *System:* pre-fills paid date as today
5. → [Payment was made on a different date]: user edits paid date
6. User confirms
7. *System:* updates milestone status to paid, records paid date
8. *System:* budget ledger recalculates paid total immediately
9. Milestone remains visible in calendar in paid state

**End state:** Milestone marked paid. Budget ledger updated.

### Flow — editing a milestone

1. User opens a milestone with status upcoming or overdue
2. User edits amount or due date
3. *System:* saves changes
4. *System:* recalculates budget ledger with updated amount
5. *System:* if new due date is in the past, status updates to overdue
6. Change written to audit log

**End state:** Milestone updated. Budget recalculated.

---

## 7.8 S10 — Budget Ledger

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** “Budget” tab on wedding dashboard
**Preconditions:** Planned budget entered during onboarding. At least one vendor instance with a rate.

### Flow — viewing the budget ledger

1. User opens the budget tab
2. *System:* calculates:
    - Committed = sum of all vendor rates where status ≥ Booked
    - Paid = sum of all paid milestone amounts
    - Remaining = planned minus committed
3. *System:* displays three primary figures: planned / committed / paid, plus remaining
4. → [Committed ≥ 85% of planned]: *System:* shows warning indicator
→ [Committed ≥ 100% of planned]: *System:* shows escalated overspend alert
5. User can drill down into committed figure to see per-vendor breakdown
6. User can drill down into paid figure to see per-milestone breakdown

**End state:** User sees current financial state of the wedding.

### Flow — updating the planned budget

1. User opens budget tab
2. User taps “Edit planned budget”
3. User enters new planned budget figure
4. *System:* saves new figure
5. *System:* recalculates remaining and overspend threshold
6. → [New planned total < current committed]: overspend alert triggers immediately
7. Change written to audit log
8. *System:* includes budget change in next weekly briefing

**End state:** Planned budget updated. Ledger recalculated.

### Secondary flow — budget-access family member (Mode 2)

1. Family member with budget access opens budget tab
2. *System:* displays same view as head planner: planned / committed / paid / remaining
3. *System:* displays payment milestone calendar
4. *System:* displays per-vendor rate breakdown
5. All edit controls are hidden — view only
6. Task list, AI briefing, and timeline are not accessible from this view

**End state:** Family member sees full financial picture. No edit capability.

---

## 7.9 S14 — 30-Day Confirmation Tracker

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** “Confirmations” tab on wedding dashboard, or flagged item on dashboard at-risk section
**Preconditions:** Vendor instances exist with event assignments. Events have confirmed dates.

### Flow — reviewing the tracker

1. User opens the confirmation tracker
2. *System:* queries all vendor instances where:
    - Confirmation status is Shortlisted, Quoted, or Booked (not Confirmed or Done)
    - Assigned event date is within 30 days
3. *System:* displays results sorted by days until event (most urgent first)
4. Each row shows: vendor name, category, event name, event date, current status, days until event
5. → [Any vendor has had no status update in ≥ 14 days]: *System:* flags as stalled with “No update in [X] days”
6. User reviews list

**End state:** User has a complete picture of unconfirmed vendors with upcoming events.

### Flow — confirming a vendor from the tracker

1. User sees an unconfirmed vendor in the tracker
2. User taps “Mark confirmed”
3. *System:* updates vendor instance status to Confirmed
4. Vendor disappears from the tracker list
5. *System:* writes status change to audit log
6. *System:* updates portfolio health score (if Mode 1) and next briefing

**End state:** Vendor confirmed. Removed from tracker. Audit log updated.

---

## 7.10 S17 — Planner Portfolio View with Health Scores

**Primary actor:** [PLANNER] Mode 1 only
**Entry point:** Default landing screen after login for Mode 1 planner accounts
**Preconditions:** Planner account exists. At least one wedding is active.

### Flow — reviewing the portfolio

1. Planner logs in
2. *System:* loads portfolio view as default screen
3. *System:* for each active wedding, calculates health score from:
    - Number of overdue payment milestones
    - Number of unconfirmed vendors with events within 30 days
    - Number of overdue timeline tasks
    - Budget overspend status
4. *System:* displays wedding cards sorted by health score (most at-risk first)
5. Each card shows: couple names, wedding date, days until wedding, health score indicator
6. → [No active weddings]: *System:* shows empty state with “Create wedding” CTA

**End state:** Planner sees all active weddings ranked by risk.

### Flow — investigating a health score

1. Planner taps health score indicator on a wedding card
2. *System:* displays health score breakdown:
    - [x]  overdue payments
    - [Y] unconfirmed vendors within 30 days
    - [Z] overdue tasks
    - Budget: on track / at risk / overspent
3. Each line item is tappable
4. Planner taps a line item
5. *System:* navigates directly to the relevant feature view within that wedding (payment calendar / confirmation tracker / task list / budget ledger)

**End state:** Planner is on the specific feature view that needs action.

---

## 7.11 S18 — Client Onboarding Template

**Primary actor:** [PLANNER] Mode 1 only
**Entry point:** Wedding settings → “Save as template”, or template library in account settings
**Preconditions:** At least one wedding has been set up and completed through the onboarding wizard

### Flow — saving a template

1. Planner opens a completed wedding’s settings
2. Planner selects “Save as template”
3. *System:* presents template naming screen
4. Planner enters template name (e.g. “5-event South Indian, Bangalore”)
5. *System:* displays what will be saved: event names and sequence, access level configuration, task category defaults
6. *System:* explicitly confirms what will not be saved: couple names, dates, vendor data, rates, payment milestones, client notes
7. Planner confirms
8. *System:* creates template record in planner’s template library

**End state:** Template saved. Available in the onboarding wizard for future weddings.

### Flow — applying a template (within S28)

1. Planner begins new wedding creation (within S28)
2. Planner selects “Start from template”
3. *System:* displays template library: template name, event count, last used date, usage count
4. Planner selects a template
5. *System:* pre-fills events, access configuration, and task defaults
6. Planner reviews pre-filled values
7. Planner edits as needed (couple names, dates, rates are all blank — must be entered fresh)
8. Planner continues through remaining wizard steps
9. Wizard completes as per S28 main flow from step 16

**End state:** New wedding created with template structure applied. All client-specific fields entered fresh.

---

## 7.12 S1 — AI Multi-Event Timeline Generation

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** Automatic trigger on wizard completion. Manual trigger via “Generate timeline” or “Regenerate timeline” on dashboard.
**Preconditions:** Wedding exists with at least one event and a wedding date.

### Flow — automatic generation on wizard completion

1. Onboarding wizard completes (S28 step 17)
2. *System:* assembles generation inputs:
    - Wedding date, planning start date (today), weeks remaining
    - Destination flag
    - List of events with dates
    - Late-start flag and weeks (if applicable)
3. *System:* calls Anthropic API with structured prompt context
4. → [API response received within 45 seconds]:
    - *System:* parses response into Timeline record with timeline item array
    - *System:* creates Task records linked to timeline items
    - *System:* displays timeline on wedding dashboard
    - → [Late-start flag is set]: *System:* shows banner: “Your wedding is [X] weeks away. We’ve prioritised the most time-sensitive tasks first.”
5. → [API response not received within 45 seconds or API error]:
    - *System:* shows message: “We’re having trouble generating your timeline right now. Your wedding has been set up.”
    - *System:* retries automatically after 60 seconds
    - → [Retry succeeds]: timeline appears without user action
    - → [Retry fails]: “Generate timeline” button shown on dashboard

**End state:** Timeline visible on dashboard (standard path), or retry/manual trigger available (failure path).

### Flow — manual regeneration

1. User selects “Regenerate timeline” from timeline view or dashboard
2. *System:* assembles current state inputs (as above, plus current vendor and task data)
3. *System:* generates diff of proposed changes:
    - Tasks to be added (new items not in current timeline)
    - Tasks to be rescheduled (existing pending tasks with new due dates)
    - Tasks to be removed (no longer relevant given current state)
4. *System:* displays diff for user review
5. → [User confirms]: *System:* applies changes
    - Completed tasks: preserved unchanged
    - Custom/user-modified tasks: preserved with their modified values
    - Pending and overdue AI-generated tasks: replaced with regenerated versions
6. → [User cancels]: no changes applied

**End state:** Timeline updated with confirmed changes. Completed and custom tasks untouched.

### Flow — marking a task complete

1. User views timeline
2. User selects a task with status pending or overdue
3. User taps “Mark complete”
4. *System:* updates task status to complete
5. *System:* writes completion to audit log with timestamp and actor
6. *System:* removes task from overdue/upcoming sections of next briefing

**End state:** Task marked complete. Audit log updated. Briefing queue updated.

---

## 7.13 S3 — Weekly AI Briefing

**Primary actor:** [PLANNER] / [HEAD]
**Entry point:** Scheduled delivery (WhatsApp + in-app). Manual access via “Briefings” on dashboard.
**Preconditions:** Wedding has active vendor, payment, and timeline data. At least one briefing cycle has passed since wedding creation.

### Flow — briefing generation (system-initiated)

1. *System:* briefing generation triggers at configured day and time (default: Monday 8:00am)
2. *System:* assembles briefing inputs:
    - All PaymentMilestones with status upcoming, due, or overdue — sorted by due date
    - All VendorInstances with status below Confirmed and event within 30 days
    - All VendorInstances with no status change in ≥ 14 days (stalled)
    - All Timeline items with status overdue
    - BudgetLedger: planned / committed / paid
3. → [Mode 1 — planner with multiple weddings]: inputs assembled per wedding, weddings ranked by risk level
→ [Mode 2 — single wedding]: inputs assembled for that wedding only
4. *System:* calls Anthropic API with assembled context
5. *System:* parses response into structured briefing with four sections: overdue / at-risk / upcoming decisions / budget health
6. → [No overdue, at-risk, or stalled items]: *System:* generates all-clear briefing with next 1–3 upcoming tasks
7. *System:* stores briefing as a historical record
8. *System:* delivers briefing in-app and via WhatsApp simultaneously

**End state:** Briefing delivered and stored. User has a complete picture of what needs action this week.

### Flow — receiving and acting on the WhatsApp briefing

1. User receives WhatsApp message containing the full briefing
2. User reads overdue section
3. → [User wants to act immediately]: user opens the app
    - *System:* opens to the briefing view with the same content
    - User taps an item (e.g. overdue payment)
    - *System:* navigates to the relevant feature view (payment calendar)
    - User takes action (marks payment paid)
    - *System:* updates briefing item status
4. → [User reads and acts later]: briefing is available in-app when ready
5. → [User does nothing]: item remains in next week’s briefing if unresolved

**End state:** User has acted on briefing items, or items persist to next week’s briefing.

### Flow — accessing briefing history

1. User navigates to “Briefings” on the wedding dashboard
2. *System:* displays all past briefings in reverse chronological order
3. User selects a past briefing
4. *System:* displays the briefing in its original form as generated on that date
5. User can compare current state with past briefings to understand when an issue first appeared

**End state:** User has reviewed historical briefing for context on a persistent issue.

### Secondary flow — couple receiving a briefing (Mode 1)

Couples in Mode 1 do not receive the weekly AI briefing. The briefing is a planner-only feature. Couples receive event-specific notifications (e.g. upcoming payment totals, confirmed vendor updates) via WhatsApp on a trigger basis, not on the weekly schedule. This distinction is enforced at the delivery layer — the briefing generation job runs only for planner and head planner accounts.

### Flow — the briefing habit loop (weekly cycle)

This flow documents the full weekly cycle — from briefing delivery through action and resolution — showing how the system closes the loop between a flagged item and its resolution in the following week’s briefing.

1. Monday 8:00am: *System:* generates and delivers briefing via WhatsApp and in-app
2. User reads briefing — identifies 2–3 items requiring action this week
3. User acts on items during the week:
    - Marks an overdue payment as paid → *System:* updates PaymentMilestone status to paid
    - Confirms a vendor from the confirmation tracker → *System:* updates VendorInstance status to Confirmed
    - Completes a timeline task → *System:* updates Task status to complete
4. Each action is written to the audit log with timestamp and actor
5. Following Monday: *System:* generates next briefing
6. *System:* reads current state — resolved items are no longer overdue or at-risk
7. Next briefing reflects resolved items:
    - Items acted on do not appear in the overdue or at-risk sections
    - Budget health section reflects any payments made
    - Upcoming decisions section shows the next set of consequential actions
8. → [Items not acted on]: they reappear in the new briefing with updated days-outstanding count
    - Format: “[Vendor name] — no update in [X] days. Flagged last week.”
    - Persistent items accumulate days-outstanding visibility until resolved

**End state:** The briefing creates a weekly action rhythm. Resolved items disappear. Unresolved items persist with growing urgency. The user’s engagement with the briefing directly determines the health score of their wedding.

---

## 7.14 Flow Reference Table

The prose flows in this section are the canonical reference for all 11 V1 features. Wireframe and diagram files are supplementary. The table below serves as the index: one row per feature, with mode coverage, primary actor, entry point, and key decision branches.

| Feature | Section | Mode | Primary actor | Entry point | Key decision branches |
| --- | --- | --- | --- | --- | --- |
| S28 — Onboarding wizard | 7.3 | Both (mode-variant) | Planner / Head | First login or “Create wedding” | Mode selection; template vs. fresh; muhurat date; late-start flag |
| S23 — Role and access setup | 7.4 | Both (mode-variant) | Planner / Head | Within S28 or participant settings | Mode 1 vs. Mode 2 access levels; WhatsApp delivery failure; role transfer |
| Couple first login | 7.4a | Mode 1 | Couple | WhatsApp invite link | Account creation optional; no login wall |
| Family first login | 7.4b | Both | Family | WhatsApp invite link | Access level determines view; notification opt-in |
| S29 — India category defaults | 7.5 | Both | Planner / Head | Event vendor section | Accept / dismiss / custom category |
| S5 — Vendor card | 7.6 | Both (mode-variant) | Planner / Head | Event vendor section or “Add vendor” | New vs. directory vendor; status advance vs. revert; directory save prompt |
| S12 — Payment calendar | 7.7 | Both | Planner / Head | Payments tab or vendor card | Add / edit / mark paid; milestone total vs. rate check |
| S10 — Budget ledger | 7.8 | Both (mode-variant) | Planner / Head / Budget-access family | Budget tab | View only vs. edit; 85% and 100% overspend triggers |
| S14 — Confirmation tracker | 7.9 | Both | Planner / Head | Confirmations tab or dashboard | 30-day filter; stalled flag; confirm from tracker |
| S17 — Portfolio view | 7.10 | Mode 1 only | Planner | Default login screen | Health score breakdown; navigate to feature view; empty state |
| S18 — Client template | 7.11 | Mode 1 only | Planner | Wedding settings or template library | Save from completed wedding; apply in S28; edit template |
| S1 — AI timeline | 7.12 | Both (mode-variant) | Planner / Head | Auto on wizard completion | API success vs. failure; late-start resequencing; manual regeneration diff |
| S3 — Weekly briefing | 7.13 | Both (mode-variant) | Planner / Head | Scheduled delivery | Multi-wedding portfolio grouping; all-clear state; WhatsApp vs. in-app; habit loop |

---

## 7.15 Key Decision Points — Mode Divergence, Convergence, and AI Autonomy

### Where Mode 1 and Mode 2 diverge

| Decision point | Mode 1 behaviour | Mode 2 behaviour |
| --- | --- | --- |
| Who controls access | Planner only — couple cannot escalate | Head planner — configurable by anyone with full access |
| Available access levels | 2 fixed (couple view, family view) | 6 configurable (full, budget, task, event-specific, view-only, guest) |
| Couple can edit | Never | Yes, if granted full or event-specific access |
| Portfolio view | Planner sees all active weddings with health scores | Not available — head planner sees one wedding only |
| Client onboarding template | Planner can save and reuse templates across clients | Not available |
| Head planner role transfer | Not applicable — planner always owns the wedding | Available — role can be transferred to any full-access participant |
| Weekly briefing scope | All active weddings grouped by risk, most urgent first | Single wedding only |
| Default landing screen after login | Portfolio view | Wedding dashboard |
| Onboarding template option | Shown if saved templates exist | Not shown |

### Where Mode 1 and Mode 2 converge

These flows and behaviours are identical regardless of mode:

- Vendor card creation (S5) — same data model, same two-layer directory/instance separation
- Payment milestone calendar (S12) — same flow, same status lifecycle
- Budget ledger (S10) — same planned/committed/paid structure; same overspend thresholds
- 30-day confirmation tracker (S14) — same 30-day window, same stalled-vendor detection
- AI timeline (S1) — same generation logic, same India-specific defaults, same late-start resequencing
- Weekly briefing format (S3) — same four sections, same specificity standard; only scope differs (portfolio vs. single wedding)
- India-specific formatting (S29) — ₹ lakh denomination and Indian event names throughout, both modes
- WhatsApp delivery (S23, S3) — all notifications and invites via WhatsApp first, both modes
- Audit log — all status changes logged with timestamp and actor, both modes
- Soft delete — no hard deletes on any entity, both modes

### Where the AI acts autonomously

These are the points in the product where the system takes action without a user trigger. Engineering must treat each as a scheduled or event-driven background job.

| Autonomous action | Trigger | Feature |
| --- | --- | --- |
| Timeline generation | Onboarding wizard completion | S1 |
| Timeline generation retry | 60 seconds after failed first attempt | S1 |
| Late-start flag set | Wedding date entered with < 20 weeks remaining | S1, S28 |
| Milestone status → overdue | Midnight on the day after due date, if not paid | S12 |
| Vendor flagged as stalled | 14 days since last status change, status below Confirmed | S14, S3 |
| Health score recalculation | Any change to overdue payments, unconfirmed vendors, overdue tasks, or budget status | S17 |
| Weekly briefing generation | Configured day and time (default: Monday 8:00am) | S3 |
| WhatsApp briefing delivery | Same trigger as in-app generation | S3 |
| Wedding suspended | Planner account deletion (Mode 1) | S23 |
| Budget overspend warning | Committed spend crosses 85% or 100% of planned budget | S10 |

---

*Section 7 complete.Next: Section 8 — Requirements (technical, design, functional, non-functional)*