# Section 6: User Stories

---

## 6.1 How to Read This Section

### Priority definitions

**P0 — Must ship.** The feature is not shippable without this story. It covers the core flow that the feature exists to deliver. A P0 story that fails means the feature fails.

**P1 — Should ship.** The story covers an important variant, secondary actor flow, or permission boundary that the product needs to handle correctly at launch. Shipping without it creates a real gap in the user experience — not a fatal one, but one that will generate support issues or erode trust.

**P2 — Can follow.** The story covers an edge case, convenience enhancement, or non-critical secondary flow that improves the product but is not required for launch. P2 stories are the first candidates for post-launch iteration.

### Mode tags

**Mode 1** — feature or story applies to planner-led weddings only.
**Mode 2** — feature or story applies to self-planned weddings only.
**Both** — feature applies to both modes with identical behaviour.
**Both (mode-variant)** — feature applies to both modes but acceptance criteria differ by mode. Mode-specific criteria are noted within the story.

### Story format

Each story follows this structure:

> **As a** [actor], **I want to** [job], **so that** [outcome].
> 
> 
> **Given** [precondition], **When** [action], **Then** [result].
> 

Multiple Given/When/Then blocks are used when a story has more than one testable outcome.

### Cross-feature dependencies

Each feature block notes which other features must have functioning data before its stories can be fully tested. These are build-order dependencies, not just test dependencies.

---

## 6.2 S23 — Role and Access Setup

**Mode:** Both (mode-variant)
**Phase:** 1 — Architecture
**Depends on:** S28 (onboarding wizard creates the wedding and initial participants)

---

**Story S23-1***As a professional planner (Mode 1), I want to invite the couple to their wedding with couple-view access, so that they can see plan progress and upcoming payments without accessing operational detail.*

**Priority:** P0 — Mode 1

Given a wedding has been created in Mode 1 and the planner is logged in,
When the planner enters the couple's names and phone numbers in the participant setup screen and selects "couple view",
Then both members of the couple receive a WhatsApp message with a link to access their wedding view,
And their access level is set to couple view,
And they can see plan status, confirmed vendor names, upcoming milestone totals, and event schedule,
And they cannot see vendor rates, the full budget ledger, task list, or unconfirmed vendors.

Given the couple has received the invite link,
When they tap the link,
Then they are taken directly to their couple view without being required to create an account before viewing,
And account creation is offered as an optional step after the initial view loads.

---

**Story S23-2***As a professional planner (Mode 1), I want to invite family members with family-view access, so that they can see the event schedule and logistics without seeing any vendor or budget information.*

**Priority:** P1 — Mode 1

Given a wedding has been created in Mode 1,
When the planner adds a family member's phone number and selects "family view",
Then the family member receives a WhatsApp invite,
And their access is limited to event schedule, venue details, and dress codes only,
And no vendor names, rates, task information, or budget figures are visible to them.

---

**Story S23-3***As a professional planner (Mode 1), I want to change a participant's access level, so that I can adjust visibility as the wedding progresses.*

**Priority:** P1 — Mode 1

Given a participant exists on a Mode 1 wedding,
When the planner opens the participant settings and changes their access level,
Then the change takes effect immediately on the participant's next load,
And the participant is not notified of the change,
And the participant's previously accessible data is no longer visible if their access has been downgraded.

---

**Story S23-4***As a couple member (Mode 1), I want to understand what I can and cannot see, so that I do not mistake restricted content for missing information.*

**Priority:** P1 — Mode 1

Given a couple member is logged in with couple-view access,
When they navigate to a section they do not have access to (e.g. full budget breakdown, vendor rates),
Then they see a clear, friendly message explaining that this information is managed by their planner,
And they do not see an error state, a blank screen, or a broken UI element,
And there is no option to request elevated access from within the product.

---

**Story S23-5***As a head planner (Mode 2), I want to invite participants and assign access levels, so that every family member has the right level of information for their role.*

**Priority:** P0 — Mode 2

Given a wedding has been created in Mode 2,
When the head planner adds a participant by phone number and selects an access level from the six available options,
Then the participant receives a WhatsApp invite with a link appropriate to their access level,
And their access is enforced immediately upon accepting the invite,
And the head planner can see all participants and their current access levels in a single participant management screen.

Given the head planner adds a participant without selecting an access level,
Then the participant defaults to view-only access,
And the head planner is shown a confirmation that the default has been applied with an option to change it.

---

**Story S23-6***As a head planner (Mode 2), I want to transfer the head planner role to another participant, so that operational control can move to the right person if circumstances change.*

**Priority:** P1 — Mode 2

Given a participant with full access exists on the wedding,
When the head planner selects that participant and initiates a role transfer,
Then the target participant receives a WhatsApp notification asking them to confirm the transfer,
And the transfer only completes when the target participant confirms,
And upon confirmation, the target participant becomes head planner with full admin access,
And the outgoing head planner is automatically assigned full access (not removed),
And the transfer is recorded in the audit log with timestamp and both participant IDs.

Given the target participant declines the transfer,
Then no change is made and the current head planner retains their role,
And both parties are notified of the declined transfer.

---

**Story S23-7***As a head planner (Mode 2), I want to revoke a participant's access, so that I can remove someone who no longer needs to be involved.*

**Priority:** P1 — Mode 2

Given a participant exists on the wedding,
When the head planner revokes their access,
Then the participant is removed from the wedding immediately,
And the participant receives a WhatsApp notification that their access has been removed,
And all data they entered remains in the system,
And the participant cannot access any wedding data via their previous invite link.

---

**Story S23-8***As a budget-contributing family member (Mode 2), I want to be prompted for budget access when I am added as a contributor, so that I can see the financial picture I am funding.*

**Priority:** P1 — Mode 2

Given the head planner is adding a family member,
When the head planner indicates this person is contributing to the wedding budget,
Then the access configuration screen surfaces a prompt: "This person is contributing to the budget. Would you like to give them budget visibility?",
And if the head planner selects yes, the participant is assigned budget access,
And if the head planner selects no, the participant is assigned the default view-only access,
And the prompt can be dismissed and the access level changed later.

---

**Story S23-9***As a couple with a planner-led wedding, I want to be notified if my planner's account is deleted, so that I know my wedding plan is at risk and can take action.*

**Priority:** P1 — Mode 1

Given a Mode 1 wedding has an active planner account,
When the planner deletes their account,
Then the wedding enters a suspended state immediately,
And both members of the couple receive a WhatsApp notification: "Your wedding planner's account has been closed. Your wedding plan is in a suspended state. Please contact your planner or reach out to support.",
And the couple can still read all wedding data in their couple view,
And no data is deleted — the wedding record, vendors, payments, and timeline are preserved,
And the wedding remains suspended until either the planner reactivates their account or a support-assisted transfer of ownership is completed.

---

**Story S23-10***As a professional planner or head planner, I want to know when a WhatsApp invite fails to deliver, so that I can ensure every participant has actually received access.*

**Priority:** P1 — Both

Given a participant has been added and a WhatsApp invite has been sent,
When the WhatsApp message fails to deliver (invalid number, unregistered WhatsApp account, or delivery timeout after 24 hours),
Then the planner or head planner receives an in-app notification: "[Participant name]'s invite could not be delivered via WhatsApp",
And the participant's status in the participant list shows "Invite failed",
And the planner is offered two options: resend to a different number, or copy an invite link to share manually,
And the failed delivery does not block the participant from being added — they are pending until the invite is delivered and accepted.

---

## 6.3 S5 — Vendor Card with Two-Layer Architecture

**Mode:** Both (mode-variant)
**Phase:** 1 — Architecture
**Depends on:** S23 (participants must exist), S28 (wedding and events must exist), S29 (category defaults must be loaded)

---

**Story S5-1***As a professional planner or head planner, I want to add a new vendor to a wedding, so that all vendor details are stored in one place and accessible to all relevant participants.*

**Priority:** P0 — Both

Given a wedding exists and the user has full access,
When the user adds a new vendor by entering name, category, city, phone, and negotiated rate,
Then a vendor instance is created for this wedding,
And a one-action prompt is shown: "Save [vendor name] to your directory for future weddings?",
And if confirmed, the vendor is simultaneously saved to the user's private directory and the wedding instance is created,
And if declined, only the wedding instance is created,
And the vendor appears in the wedding's vendor list with a status of Shortlisted.

---

**Story S5-2***As a professional planner or head planner, I want to add a vendor from my private directory to a new wedding, so that I do not have to re-enter contact details I already have.*

**Priority:** P0 — Both

Given the user has vendors in their private directory,
When the user begins adding a vendor to a wedding and searches by name or category,
Then matching directory vendors are shown as suggestions,
And selecting a directory vendor shows a preview card with: vendor name, category, city, phone, planner notes, wedding count, and last-used date,
And the rate field is always blank regardless of any previous wedding's rate,
And the preview card is explicitly labelled "For reference only — enter this wedding's rate below",
And confirming creates a new wedding instance linked to the directory entry,
And the directory entry's wedding count increments by one.

---

**Story S5-3***As a professional planner or head planner, I want to update a vendor's confirmation status as the booking progresses, so that the system accurately reflects where each vendor relationship stands.*

**Priority:** P0 — Both

Given a vendor instance exists on a wedding,
When the user updates the confirmation status,
Then the status can only advance forward in the sequence: Shortlisted → Quoted → Booked → Confirmed → Done,
And each status change is recorded in the audit log with timestamp and actor ID,
And reverting a status requires an explicit action and a reason entry,
And the status change is reflected immediately in the confirmation tracker (S14) and the AI briefing (S3).

Given the user attempts to advance the status to Booked without a rate entered,
Then the system prevents the advance and shows an inline message: "A negotiated rate is required before marking this vendor as Booked",
And the rate field is highlighted for completion.

---

**Story S5-4***As a professional planner or head planner, I want to add payment milestones to a vendor card, so that I can track what is due and when.*

**Priority:** P0 — Both

Given a vendor instance exists with a status of Quoted or higher,
When the user adds a payment milestone with amount, due date, and description,
Then the milestone is created and linked to the vendor instance,
And the milestone appears in the payment milestone calendar (S12),
And the total of all milestones for this vendor is shown against the negotiated rate,
And if milestone totals exceed the negotiated rate, an inline warning is shown.

---

**Story S5-5***As a couple member (Mode 1 — couple view), I want to see confirmed vendors without seeing their rates, so that I am informed about who is booked without accessing pricing detail.*

**Priority:** P1 — Mode 1

Given a vendor has a status of Confirmed or Done,
When a couple-view participant views the wedding,
Then they see the vendor name and category,
And they do not see the vendor rate, payment milestones, or planner notes,
And vendors with a status below Confirmed are not visible to couple-view participants.

---

**Story S5-6***As a professional planner or head planner, I want to see a data completeness signal on incomplete vendor cards, so that I know which vendors are missing information that the AI features need.*

**Priority:** P1 — Both

Given a vendor instance exists,
When the vendor card is missing one or more of: negotiated rate, at least one payment milestone with a due date, event assignment, or has a status below Booked,
Then the vendor card displays a visual completeness indicator distinguishing it from complete cards,
And the dashboard shows an aggregate completeness signal when more than 30% of vendor cards are incomplete,
And the completeness signal does not block any action — it informs only.

---

**Story S5-7***As a professional planner, I want my private vendor directory to remain private across all weddings and all other users, so that my vendor relationships and notes are never visible to clients or other planners.*

**Priority:** P0 — Both

Given a vendor exists in a planner's private directory,
When any participant other than the directory owner accesses the wedding,
Then no directory-level data (notes, wedding count, last-used date) is visible to them,
And the vendor instance data (rate, milestones, deliverables) is visible only according to their access level,
And no API call from a non-owner account returns directory fields for that vendor.

---

**Story S5-8***As a professional planner or head planner, I want to revert a vendor's confirmation status when circumstances change, so that the system reflects the actual state of the booking.*

**Priority:** P1 — Both

Given a vendor instance has a status of Quoted, Booked, or Confirmed,
When the user initiates a status revert,
Then the system presents a confirmation prompt: "Are you sure you want to move [vendor name] back to [previous status]? This will affect the confirmation tracker and budget ledger.",
And the user is required to enter a reason before the revert is confirmed,
And upon confirmation, the status reverts to the selected previous status,
And the revert is recorded in the audit log with timestamp, actor ID, previous status, new status, and the entered reason,
And if the status is reverted from Booked or higher, the vendor reappears in the confirmation tracker if their event is within 30 days.

Given the user attempts to revert a vendor with status Done,
Then the system prevents the revert and shows: "This vendor's event is complete. Status cannot be changed.",
And no revert action is available for Done status.

---

**Story S5-9***As a professional planner or head planner, I want to assign a vendor to one or more events, so that the confirmation tracker and timeline know which vendor belongs to which event.*

**Priority:** P0 — Both

Given a vendor instance exists on a wedding with at least one event,
When the user opens the vendor card and selects event assignment,
Then they see a list of all events on the wedding,
And they can assign the vendor to one or more events,
And the assignment is saved and reflected immediately in the confirmation tracker (which filters by event date),
And a vendor with no event assignment is flagged as incomplete in the completeness signal (QO4),
And if a vendor is assigned to an event and that event's date changes, the vendor's appearance in the confirmation tracker updates automatically.

---

## 6.4 S28 — Smart Onboarding Wizard

**Mode:** Both (mode-variant)
**Phase:** 1 — Architecture
**Depends on:** Nothing — this is the entry point to the data model

---

**Story S28-1***As a professional planner or head planner, I want to set up a new wedding through a guided wizard, so that all the foundational data is in place before I start adding vendors and tasks.*

**Priority:** P0 — Both

Given the user is creating a new wedding,
When they complete the onboarding wizard steps in sequence — mode selection, wedding details, events, budget, participant setup,
Then a wedding record is created with all entered data,
And all selected events are created with their dates and times,
And all invited participants receive WhatsApp invites,
And the AI timeline generation (S1) is triggered automatically on wizard completion,
And the user lands on the wedding dashboard (or portfolio view for Mode 1 planners) after completion.

Given the user is on a step and selects "skip",
Then the step is marked as incomplete and the wizard advances,
And skipped steps are flagged on the dashboard as outstanding setup items,
And the wizard can be resumed from any skipped step later.

---

**Story S28-2***As a professional planner or head planner, I want to enter a muhurat-based wedding date, so that the planning system respects the auspicious date my family has selected rather than assuming I chose the date freely.*

**Priority:** P0 — Both

Given the user is on the wedding date step of the onboarding wizard,
When the user selects "Date chosen by pandit / muhurat",
Then the date input accepts the entered date without suggesting alternatives or flagging it as unusual,
And the planning horizon is calculated from today to the entered date regardless of how it was selected,
And if the horizon is less than 6 months, the late-start flag is set and the user is shown: "Your wedding is [X] weeks away. We'll prioritise the most time-sensitive tasks first.",
And the timeline is generated accordingly.

---

**Story S28-3***As a professional planner (Mode 1), I want to apply a saved onboarding template to a new wedding, so that I do not rebuild the same event structure and access configuration from scratch for every client.*

**Priority:** P0 — Mode 1

Given the planner has at least one saved client onboarding template (S18),
When the planner begins a new wedding and selects "Use a template",
Then they see a list of their saved templates with the event count, last used date, and a preview of the event names,
And selecting a template pre-fills the events, access configuration, and task defaults,
And the planner can edit any pre-filled field before completing the wizard,
And no vendor data, rates, or client-specific information from the template's source wedding is carried over.

Given the planner does not have any saved templates,
Then the "Use a template" option is not shown,
And the wizard proceeds with blank defaults.

---

**Story S28-4***As a head planner (Mode 2), I want the wizard to recommend the right events for my wedding type, so that I do not have to know in advance which events a wedding of my kind typically includes.*

**Priority:** P1 — Mode 2

Given the user is on the events step of the onboarding wizard,
When the user has entered a wedding type or guest count,
Then the wizard presents the India-specific default event set (haldi, mehendi, sangeet, engagement, wedding, reception) as selectable options,
And each event has a brief one-line description so the user knows what it covers,
And the user can deselect events that do not apply, add custom events, and reorder the sequence,
And selected events carry the India-specific vendor category defaults for that event type (S29).

---

**Story S28-5***As a professional planner (Mode 1), I want to complete the wizard for a standard 5-event wedding in under 10 minutes when using a template, so that onboarding a new client does not consume more time than my current process.*

**Priority:** P0 — Mode 1

Given the planner is onboarding a new wedding using a saved template,
When they complete all required wizard steps,
Then the total time from wizard start to wedding dashboard is under 10 minutes,
And the number of manual inputs required (fields that cannot be pre-filled by the template or AI defaults) is 15 or fewer for a standard 5-event wedding.

*Note: This story has a performance acceptance criterion. It should be validated through usability testing with target persona users (Kavya-equivalent planners), not just QA testing.*

---

## 6.5 S29 — India-Specific Vendor Category Defaults

**Mode:** Both
**Phase:** 1 — Architecture
**Depends on:** S28 (events must exist to receive category assignments)

---

**Story S29-1***As a professional planner or head planner, I want the system to suggest the right vendor categories for each Indian wedding event, so that I do not have to manually identify which vendor types each event needs.*

**Priority:** P0 — Both

Given an event has been created (e.g. mehendi),
When the user opens the vendor section for that event,
Then the system suggests the standard vendor categories for that event type — for mehendi: mehendi artist, photographer, caterer (snacks), décor,
And the user can accept, dismiss, or add categories not in the default list,
And dismissed suggestions do not reappear,
And custom categories added by the user are saved for reuse in future events on this wedding.

---

**Story S29-2***As a professional planner or head planner, I want all financial figures displayed in Indian rupee formatting with lakh and crore denomination, so that the numbers are immediately readable without mental conversion.*

**Priority:** P0 — Both

Given any screen that displays a financial figure,
When the figure is rendered,
Then amounts under ₹1L are shown as ₹XX,XXX,
And amounts of ₹1L and above are shown as ₹X.XX lakh,
And amounts of ₹1 crore and above are shown as ₹X.XX crore,
And no figure is ever shown in thousands, millions, or any non-Indian denomination,
And the ₹ symbol always precedes the figure.

---

**Story S29-3***As any user, I want to see Indian wedding event names used natively throughout the product, so that the terminology matches how I talk about my own wedding.*

**Priority:** P0 — Both

Given any screen that references a wedding event by name,
When the event name is rendered,
Then the native Indian event name is used (haldi, mehendi, sangeet, engagement, wedding, reception),
And no anglicised substitute (e.g. "turmeric ceremony", "henna", "music evening") appears anywhere in the product,
And custom event names entered by the user are displayed exactly as entered.

---

## 6.6 S12 — Payment Milestone Calendar

**Mode:** Both
**Phase:** 2 — Operating layer
**Depends on:** S5 (vendor instances with payment milestones must exist)

---

**Story S12-1***As a professional planner or head planner, I want to see all payment milestones across all vendors in a single calendar view, so that I can see what is due and when without opening each vendor card individually.*

**Priority:** P0 — Both

Given at least one vendor instance with at least one payment milestone exists,
When the user opens the payment milestone calendar,
Then all milestones are displayed in chronological order with: vendor name, amount in ₹ lakh, due date, and status (upcoming / due / paid / overdue),
And the calendar view shows milestones grouped by month,
And overdue milestones are visually distinguished from upcoming ones,
And the total amount due in the next 30 days is shown as a summary figure at the top.

---

**Story S12-2***As a professional planner or head planner, I want to mark a payment milestone as paid, so that the budget ledger updates automatically and the milestone is removed from the outstanding view.*

**Priority:** P0 — Both

Given a payment milestone exists with status upcoming or overdue,
When the user marks it as paid,
Then the milestone status updates to paid,
And the paid date is recorded as today (with an option to enter a different date if the payment was made earlier),
And the budget ledger (S10) reflects the updated paid total immediately,
And the milestone remains visible in the calendar in a paid state — it is not removed.

---

**Story S12-3***As a couple member (Mode 1 — couple view), I want to see the total amount due in upcoming payments without seeing the breakdown by vendor, so that I can plan my finances without accessing rate-level detail.*

**Priority:** P1 — Mode 1

Given a couple-view participant is logged in,
When they view their wedding summary,
Then they see the total upcoming payment amount due in the next 30 days as a single figure,
And they do not see individual vendor names, rates, or milestone breakdowns,
And the figure updates automatically as milestones are marked paid or new milestones are added.

---

**Story S12-4***As a professional planner or head planner, I want overdue payment milestones to be flagged immediately on the dashboard, so that I am never unaware of a missed payment.*

**Priority:** P0 — Both

Given a payment milestone's due date has passed and its status is not paid,
When the user logs in or refreshes the dashboard,
Then the overdue milestone is shown prominently in the dashboard's at-risk section,
And it is included in the next weekly AI briefing (S3) under the overdue section,
And the milestone status automatically updates to overdue at midnight on the day after the due date.

---

**Story S12-5***As a professional planner or head planner, I want to edit a payment milestone's amount or due date, so that the calendar stays accurate when vendor terms are renegotiated.*

**Priority:** P1 — Both

Given a payment milestone exists with any status other than paid,
When the user edits the milestone amount or due date,
Then the change is saved immediately,
And the budget ledger recalculates committed and remaining figures using the updated amount,
And the edit is recorded in the audit log with the previous and new values,
And if the due date is moved to a past date, the milestone status automatically updates to overdue.

Given a payment milestone has a status of paid,
When the user attempts to edit it,
Then the amount and due date fields are locked,
And only the paid date can be edited,
And an inline note explains: "Amount and due date cannot be changed after a milestone is marked paid."

---

**Story S12-6***As a professional planner or head planner, I want to delete a payment milestone added in error, so that the payment calendar and budget ledger are not distorted by incorrect entries.*

**Priority:** P1 — Both

Given a payment milestone exists with a status of upcoming or overdue,
When the user deletes the milestone,
Then a confirmation prompt is shown: "Delete this milestone? This will update your committed budget total.",
And upon confirmation, the milestone is soft-deleted and no longer appears in the calendar,
And the budget ledger recalculates immediately using the remaining milestones,
And the deletion is recorded in the audit log.

Given a payment milestone has a status of paid,
When the user attempts to delete it,
Then the system prevents deletion and shows: "Paid milestones cannot be deleted. Edit the paid date or contact support if this was entered in error."

---

**Mode:** Both
**Phase:** 2 — Operating layer
**Depends on:** S5 (vendor instances provide committed figures), S12 (payment milestones provide paid figures)

---

**Story S10-1***As a professional planner or head planner, I want to see planned, committed, and paid spend in a single view, so that I always know the true financial state of the wedding.*

**Priority:** P0 — Both

Given a wedding has a planned budget entered and at least one vendor instance exists,
When the user opens the budget ledger,
Then they see three figures prominently: total planned budget, total committed (sum of all vendor rates at Booked status or higher), and total paid (sum of all paid milestones),
And a remaining figure is shown: planned minus committed,
And all figures are in ₹ lakh or crore denomination,
And committed and paid figures update automatically — they are never manually entered,
And the last-updated timestamp is shown.

---

**Story S10-2***As a professional planner or head planner, I want to see a budget overspend warning before I am over budget, so that I can take corrective action before the committed total exceeds the planned total.*

**Priority:** P0 — Both

Given the user is viewing the budget ledger,
When the committed total reaches 85% of the planned budget,
Then a warning indicator appears: "You have committed [X]% of your planned budget. [₹Y lakh] remains.",
And when the committed total reaches or exceeds 100% of planned budget,
Then the warning escalates: "Committed spend has exceeded your planned budget by ₹[X].",
And both warnings appear on the dashboard and in the next weekly briefing.

---

**Story S10-3***As a budget-access family member (Mode 2), I want to see the full budget ledger without being able to edit vendor records, so that I can track the financial picture I am contributing to.*

**Priority:** P1 — Mode 2

Given a participant has budget access on a Mode 2 wedding,
When they open the budget ledger,
Then they see planned, committed, and paid figures,
And they see the payment milestone calendar,
And they see vendor rates per vendor,
And they cannot edit any vendor card, add new vendors, or change any payment status,
And they cannot access the task list or AI briefing.

---

**Story S10-4***As a couple member (Mode 1 — couple view), I want to see a total committed figure without vendor-level rate detail, so that I can monitor overall spend without accessing information my planner has not shared.*

**Priority:** P1 — Mode 1

Given a couple-view participant views their wedding,
When they look at the financial summary,
Then they see the total committed amount and the total paid amount as aggregate figures,
And they do not see individual vendor rates or the full budget ledger,
And they do not see the planned budget total (this is the planner's operational figure, not a client-facing one).

---

**Story S10-5***As a professional planner or head planner, I want to update the planned budget after onboarding, so that the ledger stays accurate when the wedding scope or family contributions change.*

**Priority:** P1 — Both

Given a wedding exists with a planned budget entered during onboarding,
When the user edits the planned budget figure,
Then the new figure is saved immediately,
And the budget ledger recalculates remaining and overspend figures using the updated planned total,
And the edit is recorded in the audit log with the previous and new values,
And if the new planned total is lower than the current committed total, the overspend warning triggers immediately,
And the change is reflected in the next weekly AI briefing's budget health section.

---

**Mode:** Both
**Phase:** 2 — Operating layer
**Depends on:** S5 (vendor instances with event assignments and confirmation statuses), S28 (events with confirmed dates)

---

**Story S14-1***As a professional planner or head planner, I want to see all vendors with unconfirmed bookings whose events are within 30 days, so that I can prioritise follow-up before it is too late.*

**Priority:** P0 — Both

Given vendor instances exist with events assigned,
When the user opens the confirmation tracker,
Then all vendors with a status of Shortlisted, Quoted, or Booked (not yet Confirmed) whose assigned event is within 30 days are listed,
And each entry shows: vendor name, category, event name, event date, current status, and days until event,
And the list is sorted by days until event (most urgent first),
And vendors whose events are more than 30 days away are not shown in this view (they appear in the AI timeline instead).

---

**Story S14-2***As a professional planner or head planner, I want to update a vendor's confirmation status directly from the tracker, so that I can record a confirmation without navigating away to the vendor card.*

**Priority:** P0 — Both

Given a vendor appears in the 30-day confirmation tracker,
When the user marks the vendor as Confirmed from within the tracker view,
Then the vendor's confirmation status updates to Confirmed in the vendor instance,
And the vendor disappears from the tracker list,
And the status change is logged in the audit log,
And the budget ledger and AI briefing reflect the updated status.

---

**Story S14-3***As a professional planner or head planner, I want vendors who have had no status change for more than 14 days to be flagged as stalled, so that silent vendor relationships are surfaced before they become a problem.*

**Priority:** P1 — Both

Given a vendor instance exists with a status below Confirmed,
When 14 days have passed since the last status change on that vendor,
Then the vendor is flagged as stalled in the confirmation tracker with a visual indicator,
And a note shows: "No update in [X] days",
And the stalled vendor is included in the next weekly AI briefing (S3) under the at-risk section.

---

## 6.9 S17 — Planner Portfolio View with Health Scores

**Mode:** Mode 1 only
**Phase:** 2 — Operating layer
**Depends on:** S5, S10, S12, S14 (health score is computed from data across all four features)

---

**Story S17-1***As a professional planner, I want to see all my active weddings in a single portfolio view with health scores, so that I know which wedding needs my attention today without opening each one.*

**Priority:** P0 — Mode 1

Given the planner has at least one active wedding,
When they log in or navigate to the portfolio view,
Then all active weddings are shown as cards with: couple names, wedding date, days until wedding, and a health score,
And the portfolio view is the default landing screen after login for Mode 1 planner accounts,
And weddings are sorted by health score (most at-risk first) by default, with an option to sort by wedding date.

---

**Story S17-2***As a professional planner, I want to understand what drives each wedding's health score, so that I can act on it rather than just observe it.*

**Priority:** P0 — Mode 1

Given a wedding has a health score below a good threshold,
When the planner taps on the health score indicator,
Then they see a breakdown of the contributing factors: number of overdue payments, number of unconfirmed vendors within 30 days, number of overdue tasks, and budget overspend status,
And each factor is shown with a count and a one-line description of the issue,
And tapping any factor navigates directly to the relevant feature view (payment calendar, confirmation tracker, task list, budget ledger).

Given a wedding has a good health score,
When the planner views the card,
Then a positive indicator is shown with a brief reason: "All vendors confirmed, no overdue payments",
And no action is required.

---

**Story S17-3***As a professional planner, I want the health score to update in real time as I take action on a wedding, so that the portfolio view reflects the current state of my work.*

**Priority:** P1 — Mode 1

Given a planner has acted on a health-score-affecting item (marked a payment paid, confirmed a vendor, completed an overdue task),
When they return to the portfolio view,
Then the affected wedding's health score has updated to reflect the action,
And the update does not require a manual refresh.

---

**Story S17-4***As a professional planner logging in for the first time with no active weddings, I want the portfolio view to guide me toward creating my first wedding, so that an empty state does not feel like a broken product.*

**Priority:** P1 — Mode 1

Given a planner account exists with no active weddings,
When the planner logs in and the portfolio view loads,
Then the screen shows a clear empty state — not a blank page,
And the empty state displays: "You have no active weddings. Create your first wedding to get started.",
And a prominent "Create wedding" button is the primary call to action,
And a secondary prompt offers: "Import from a template" if any templates exist,
And no health score, sorting, or filtering UI is shown until at least one wedding exists.

---

**Mode:** Mode 1 only
**Phase:** 2 — Operating layer
**Depends on:** S28 (a completed wedding setup is the source of a template)

---

**Story S18-1***As a professional planner, I want to save a completed wedding setup as a reusable template, so that future similar weddings can be onboarded faster.*

**Priority:** P0 — Mode 1

Given a wedding setup has been completed (events, access configuration, task defaults),
When the planner selects "Save as template" from the wedding settings,
Then they are prompted to name the template (e.g. "5-event South Indian wedding, Bangalore"),
And the template saves: event names and sequence, access level configuration, and task category defaults,
And the template does not save: couple names, wedding date, vendor data, rates, payment milestones, or any client-specific information,
And the template appears in the planner's template library for use in future onboarding wizard sessions (S28-3).

---

**Story S18-2***As a professional planner, I want to edit a saved template, so that I can refine my standard setup as I learn what works across clients.*

**Priority:** P1 — Mode 1

Given a saved template exists,
When the planner opens the template and makes changes (adds an event, changes an access level default, adds a task),
Then the changes are saved to the template,
And existing weddings that were created from this template are not affected by the change,
And the template's last-edited date updates.

---

**Story S18-3***As a professional planner, I want to see how many weddings have been created from each template, so that I can identify which templates are most useful and which need refinement.*

**Priority:** P2 — Mode 1

Given the planner is viewing their template library,
When they view a template entry,
Then they see: template name, number of weddings created from it, and date last used,
And they can sort templates by usage count or last used date.

---

**Story S18-4***As a professional planner, I want to delete a template I no longer use, so that my template library stays relevant and uncluttered.*

**Priority:** P2 — Mode 1

Given a saved template exists,
When the planner selects delete on the template,
Then a confirmation prompt is shown: "Delete [template name]? Weddings already created from this template will not be affected.",
And upon confirmation, the template is removed from the library,
And if any active weddings were created from this template, those weddings are not affected — the link between wedding and template is informational only,
And the deletion is not reversible.

---

**Mode:** Both (mode-variant)
**Phase:** 3 — AI and habit layer
**Depends on:** S28 (wedding and events must exist), S29 (category defaults provide the task taxonomy)

---

**Story S1-1***As a professional planner or head planner, I want the system to generate a complete AI planning timeline on wedding setup completion, so that I have a structured task sequence without having to build one from scratch.*

**Priority:** P0 — Both

Given a wedding has been set up with at least one event and a wedding date,
When the onboarding wizard completes,
Then an AI-generated timeline is created automatically,
And the timeline contains sequenced tasks grouped by week offset from the wedding date,
And each task has a category (vendor / budget / event / admin), a title, a description, and a due date,
And tasks reference India-specific booking windows — e.g. photographer at 16 weeks out, mehendi artist at 10 weeks out, caterer final menu at 4 weeks out,
And all event names in the timeline use Indian terminology natively,
And the timeline is visible to the user within 30 seconds of wizard completion,
And the generated timeline must contain at minimum: one vendor booking task per event, one payment milestone task per confirmed vendor, and one confirmation follow-up task per event within 30 days of the wedding date,
And no task uses Western event vocabulary (e.g. "bachelorette", "rehearsal dinner") unless explicitly added by the user as a custom event,
And all financial figures referenced in timeline task descriptions use ₹ lakh denomination.

---

**Story S1-2***As a professional planner or head planner starting with a compressed planning horizon, I want the AI timeline to reprioritise tasks by consequence severity, so that the most critical tasks are surfaced first regardless of standard lead times.*

**Priority:** P0 — Both

Given a wedding has fewer than 20 weeks until the wedding date at setup,
When the AI timeline is generated,
Then the late-start flag is set to true,
And the user is shown a clear message: "Your wedding is [X] weeks away. We've prioritised the most time-sensitive tasks first.",
And the timeline resequences tasks by consequence severity — tasks whose delay would cause vendor unavailability or budget impact are moved to the earliest weeks,
And lower-consequence tasks (invitations, favours, logistics) are deprioritised or flagged as optional given the time available,
And the late-start resequencing is visually distinguished from the standard sequence so the user understands it is a compressed plan.

---

**Story S1-3***As a professional planner or head planner, I want to regenerate the timeline when wedding details change, so that the plan stays accurate as the wedding evolves.*

**Priority:** P1 — Both

Given a timeline exists and wedding details have changed (new event added, event date changed, vendor booked that was on the timeline),
When the user selects "Regenerate timeline",
Then the system shows a diff of what will change — tasks that will be added, removed, or rescheduled — before the regeneration is confirmed,
And upon confirmation, only pending and overdue tasks are recalculated,
And tasks already marked complete are preserved unchanged,
And the regeneration completes within 30 seconds.

---

**Story S1-4***As any user with appropriate access, I want to mark timeline tasks as complete, so that the timeline reflects actual progress and the AI briefing has accurate data to work from.*

**Priority:** P0 — Both

Given a timeline task exists with status pending or overdue,
When the user marks it as complete,
Then the task status updates to complete,
And the completion is logged in the audit log,
And the timeline view updates to reflect the completion,
And the task is removed from the AI briefing's overdue and upcoming sections on the next briefing generation.

---

**Story S1-5***As a professional planner or head planner, I want to manually add, edit, or remove timeline tasks, so that the AI-generated plan can be adjusted for this wedding's specific circumstances.*

**Priority:** P1 — Both

Given a timeline exists,
When the user adds a custom task,
Then the task is created with the user-specified title, category, due date, and optional assignment,
And the custom task is visually distinguished from AI-generated tasks,
And custom tasks are not removed or modified during a timeline regeneration.

Given the user edits an AI-generated task,
Then the edited task is flagged as user-modified,
And user-modified tasks are preserved during regeneration with their modified values.

---

**Story S1-6***As a professional planner or head planner, I want to know when AI timeline generation fails and be able to retry, so that a failed API call does not leave me with no plan after completing onboarding.*

**Priority:** P1 — Both

Given the onboarding wizard has completed and the AI timeline generation has been triggered,
When the Anthropic API call fails or does not return within 45 seconds,
Then the user is shown a clear message: "We're having trouble generating your timeline right now. Your wedding has been set up — we'll try again shortly.",
And the wedding dashboard loads with all entered data intact,
And the system automatically retries timeline generation once after a 60-second delay,
And if the retry succeeds, the timeline appears on the dashboard without requiring any user action,
And if the retry also fails, a "Generate timeline" button is shown prominently on the dashboard so the user can trigger it manually when ready,
And no data entered during onboarding is lost regardless of generation outcome.

---

**Mode:** Both (mode-variant)
**Phase:** 3 — AI and habit layer
**Depends on:** S5, S10, S12, S14, S1 (briefing reads from all operational features and the timeline)

---

**Story S3-1***As a professional planner or head planner, I want to receive a weekly AI briefing that tells me exactly what is overdue, at risk, and coming up, so that I can act on the most important items without auditing the full plan.*

**Priority:** P0 — Both

Given a wedding has active vendor, payment, and timeline data,
When the weekly briefing is generated (default: Monday morning, configurable),
Then the briefing contains four sections in order: overdue, at-risk, upcoming decisions, and budget health,
And each item in the briefing names the specific vendor, amount, task, or date it refers to — no generalities,
And the briefing is delivered in-app and via WhatsApp simultaneously,
And the WhatsApp message contains the full briefing content, not a link to the app,
And the briefing is stored and accessible historically from the wedding dashboard.

Mode 1 — planner: the briefing covers all active weddings in the planner's portfolio, grouped by wedding, with the most at-risk wedding first.
Mode 2 — head planner: the briefing covers the single wedding the head planner manages.

---

**Story S3-2***As a professional planner, I want the portfolio-level briefing to tell me which of my weddings needs attention first, so that I can triage across multiple active weddings in one read.*

**Priority:** P0 — Mode 1

Given the planner has two or more active weddings,
When the weekly briefing is generated,
Then weddings are grouped within the briefing with the highest-risk wedding appearing first,
And each wedding section begins with a one-line summary: "Sharma wedding — 14 March — 2 overdue payments, 1 unconfirmed vendor",
And the detail for each wedding follows the summary,
And the planner can tap any wedding section in the in-app version to navigate directly to that wedding.

---

**Story S3-3***As a head planner or couple (Mode 2), I want the briefing language to be direct and specific, so that I know exactly what action to take without interpreting vague summaries.*

**Priority:** P0 — Mode 2

Given a briefing item refers to a specific vendor, payment, or task,
When the briefing is generated and delivered,
Then each item is written as a specific, actionable statement:
— Overdue: "Caterer advance of ₹1.8L was due on 5 March. 3 days overdue."
— At-risk: "Mehendi artist Priya Arts has not confirmed the 14 March booking. Last status update 18 days ago."
— Upcoming: "Photographer final payment of ₹2.2L is due on 20 March — 7 days away."
— Budget: "₹28.5L of ₹40L committed. 71% of budget allocated. Remaining: ₹11.5L."
And no item uses generic language such as "some vendors may need follow-up" or "a payment may be coming up soon".

---

**Story S3-4***As a professional planner or head planner, I want to configure the day and time my weekly briefing is delivered, so that it arrives when I am most likely to act on it.*

**Priority:** P1 — Both

Given the user is in wedding or account settings,
When they set a preferred briefing day and time,
Then all future briefings for their weddings are generated and delivered at the configured time,
And the default is Monday at 8:00am in the user's local timezone,
And WhatsApp delivery fires at the same configured time as in-app delivery.

---

**Story S3-5***As a professional planner or head planner, I want to access previous weekly briefings, so that I can review when a risk was first flagged and how long it has been outstanding.*

**Priority:** P1 — Both

Given at least two weekly briefings have been generated for a wedding,
When the user navigates to the briefing history,
Then all past briefings are listed in reverse chronological order,
And each past briefing is fully readable in its original form,
And the user can see how a specific vendor or payment item progressed across briefings — was it flagged last week, and the week before?

---

**Story S3-6***As a professional planner or head planner, I want the briefing to flag when a vendor has been silent for more than 14 days, so that I surface communication gaps before they become booking failures.*

**Priority:** P0 — Both

Given a vendor instance has not had a status change in more than 14 days and has a status below Confirmed,
When the weekly briefing is generated,
Then the vendor appears in the at-risk section with the number of days since the last update,
And the specific message format is: "[Vendor name] — [category] for [event name] — no update in [X] days. Currently: [status].",
And the vendor remains in the at-risk section of every subsequent briefing until their status advances or the event passes.

---

**Story S3-7***As a professional planner or head planner who has just set up a wedding, I want the briefing to give me a useful next step even when there is nothing overdue or at risk yet, so that the first briefing feels helpful rather than empty.*

**Priority:** P1 — Both

Given a weekly briefing is generated for a wedding with no overdue items, no at-risk vendors, and no stalled tasks,
When the briefing is delivered,
Then the briefing does not show empty sections or placeholder text,
And the briefing shows a positive status: "Your wedding is on track. Nothing overdue or at risk this week.",
And the briefing surfaces the next 1–3 upcoming tasks from the timeline as a "Coming up" section with their due dates,
And if no timeline exists yet, the briefing prompts: "Your timeline hasn't been generated yet. Generate it now to get proactive planning guidance.",
And the WhatsApp delivery of an all-clear briefing is sent as a short, positive message rather than a full four-section format.

---

## 6.13 Story Coverage Summary

| Feature | Stories | P0 | P1 | P2 |
| --- | --- | --- | --- | --- |
| S23 — Role and access setup | 10 | 2 | 8 | 0 |
| S5 — Vendor card | 9 | 5 | 4 | 0 |
| S28 — Onboarding wizard | 5 | 3 | 1 | 0 |
| S29 — India defaults | 3 | 3 | 0 | 0 |
| S12 — Payment calendar | 6 | 3 | 3 | 0 |
| S10 — Budget ledger | 5 | 2 | 3 | 0 |
| S14 — Confirmation tracker | 3 | 2 | 1 | 0 |
| S17 — Portfolio view | 4 | 2 | 2 | 0 |
| S18 — Client template | 4 | 1 | 1 | 2 |
| S1 — AI timeline | 6 | 3 | 3 | 0 |
| S3 — Weekly briefing | 7 | 4 | 3 | 0 |
| **Total** | **62** | **30** | **29** | **2** |