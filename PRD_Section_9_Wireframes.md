# Section 9: Wireframes and Prototype

---

## 9.1 How to Read This Section

Section 9 is a design brief — it specifies every screen the product requires with enough precision that a designer can produce wireframes directly from this section without further briefing. Prototype links and annotated wireframe images are the output of the design process this section initiates, not inputs to it.

Each screen specification includes:
- **Mode tag** — Mode 1 / Mode 2 / Both / Both (mode-variant)
- **Primary actor** — who sees this screen
- **Entry point** — how the user arrives at this screen
- **Key UI elements** — the specific components that must appear
- **Interaction rules** — what happens when the user acts on elements
- **Story references** — the user stories whose acceptance criteria this screen must satisfy

The screen list is organised into four sets: Mode 1 screens, Mode 2 screens, Shared screens, and Shared (mode-variant) screens.

### Screen tags

| Tag | Meaning |
| --- | --- |
| Mode 1 | Screen exists only in planner-led weddings |
| Mode 2 | Screen exists only in self-planned weddings |
| Shared | Screen exists in both modes with identical content and behaviour |
| Shared (mode-variant) | Screen exists in both modes but content or behaviour differs by mode |

---

## 9.2 Screen List and Story Mapping Table

| # | Screen name | Mode tag | Primary actor | Stories covered |
| --- | --- | --- | --- | --- |
| 1 | Onboarding — mode selection | Shared | Planner / Head | S28-1 |
| 2 | Onboarding wizard — wedding details | Shared (mode-variant) | Planner / Head | S28-1, S28-2 |
| 3 | Onboarding wizard — events | Shared (mode-variant) | Planner / Head | S28-1, S28-4, S29-1, S29-3 |
| 4 | Onboarding wizard — budget | Shared | Planner / Head | S28-1 |
| 5 | Onboarding wizard — participant setup | Shared (mode-variant) | Planner / Head | S28-1, S23-1, S23-2, S23-5 |
| 6 | Onboarding wizard — template selection | Mode 1 | Planner | S28-3 |
| 7 | Onboarding wizard — summary and confirm | Shared | Planner / Head | S28-1, S28-5 |
| 7a | Post-wizard completion / timeline generating | Shared | Planner / Head | S28-1, S1-1, S1-6 |
| 8 | Planner portfolio view | Mode 1 | Planner | S17-1, S17-2, S17-3, S17-4 |
| 9 | Planner wedding dashboard | Mode 1 | Planner | S5-6, S12-4, S14-1, S10-2 |
| 10 | Head planner wedding dashboard | Mode 2 | Head planner | S5-6, S12-4, S14-1, S10-2, S3-8 |
| 11 | Vendor list view | Shared (mode-variant) | Planner / Head | S5-1, S5-6, S5-9, S29-1 |
| 11a | Event vendor section with category defaults | Shared | Planner / Head | S29-1, S29-2, S5-1 |
| 12 | Vendor card — add new vendor | Shared | Planner / Head | S5-1, S5-4, S5-9, S29-1 |
| 13 | Vendor card — directory preview | Shared | Planner / Head | S5-2 |
| 14 | Vendor card — detail view | Shared (mode-variant) | Planner / Head / Budget-access / Couple | S5-3, S5-4, S5-5, S5-6, S5-8 |
| 15 | Payment milestone calendar | Shared | Planner / Head | S12-1, S12-2, S12-3, S12-4, S12-5, S12-6 |
| 16 | Budget ledger | Shared (mode-variant) | Planner / Head / Budget-access | S10-1, S10-2, S10-3, S10-4, S10-5 |
| 17 | 30-day confirmation tracker | Shared | Planner / Head | S14-1, S14-2, S14-3 |
| 18 | Planner portfolio health score — breakdown | Mode 1 | Planner | S17-2 |
| 19 | Client template library | Mode 1 | Planner | S18-1, S18-2, S18-3, S18-4 |
| 20 | Participant management — Mode 1 | Mode 1 | Planner | S23-1, S23-2, S23-3, S23-9, S23-10 |
| 21 | Participant management — Mode 2 | Mode 2 | Head planner | S23-5, S23-6, S23-7, S23-8, S23-10 |
| 21a | Head planner role transfer confirmation | Mode 2 | Head planner / Target participant | S23-6 |
| 22 | AI timeline view | Shared (mode-variant) | Planner / Head | S1-1, S1-2, S1-3, S1-4, S1-5, S1-6 |
| 23 | Weekly briefing — in-app | Shared (mode-variant) | Planner / Head | S3-1, S3-2, S3-3, S3-4, S3-5, S3-7 |
| 24 | Couple view dashboard | Mode 1 | Couple | S23-4, S10-4, S12-3, S23-9 |
| 25 | Family / view-only view | Shared (mode-variant) | Family / View-only | S23-2, S23-4 |
| 26 | Invite link landing — first access | Shared (mode-variant) | Couple / Family / Guest | S23-1, S23-5 |
| 27 | Permission-denied state | Shared | Any restricted actor | S23-4 |
| 28 | Empty states (per feature) | Shared | Any actor | S17-4, S3-7 |
| 29 | Offline state | Shared | Any actor | TR-07-5, DR-11 |
| 30 | Account settings and briefing configuration | Shared (mode-variant) | Planner / Head | S3-4 |

---

## 9.3 Shared Screens

---

### Screen 1 — Onboarding Mode Selection

**Mode:** Shared
**Actor:** New user (planner or head planner)
**Entry point:** First login, or “Create new wedding” from an existing account

**Key UI elements:**
- Page heading: “How is this wedding being managed?”
- Two large selectable cards, full-width, stacked vertically:
- Card A: “I’m a professional planner managing this for a client” — subtitle: “You’ll get a full planner toolkit including portfolio view and client templates”
- Card B: “We’re planning this ourselves” — subtitle: “One person from your family or couple leads the plan. Everyone else gets the right level of access.”
- No default selection — user must make an active choice
- “Continue” button, disabled until a selection is made

**Interaction rules:**
- Selecting a card highlights it and enables the Continue button
- Tapping Continue sets the mode on the Wedding record and advances to Screen 2
- Mode cannot be changed after this step without creating a new wedding

**Story references:** S28-1

---

### Screen 2 — Onboarding Wizard: Wedding Details

**Mode:** Shared (mode-variant — muhurat label wording differs slightly by mode but behaviour is identical)
**Actor:** Planner / Head planner
**Entry point:** After mode selection (Screen 1), or after template selection (Screen 6)

**Key UI elements:**
- Step indicator showing current position in wizard (e.g. “Step 2 of 6”)
- Field: Couple names (two text inputs — Partner 1, Partner 2)
- Field: Wedding date — date picker in DD/MM/YYYY format
- Toggle below date field: “Date chosen by pandit / muhurat” — when selected, adds a muhurat badge to the date display
- Field: City (text input with autocomplete)
- Toggle: “Destination wedding” — when on, changes city label to “Primary venue city” and adds a note: “We’ll use 8 months as your planning horizon”
- If planning horizon < 20 weeks: inline banner appears below the date field — “Your wedding is [X] weeks away. We’ll prioritise the most urgent tasks first.”
- “Skip” link (top right) and “Continue” button (bottom)

**Interaction rules:**
- Date picker defaults to today’s date, advances forward only
- Selecting muhurat toggle records the flag but does not change the date input behaviour
- Late-start banner is calculated dynamically as the date is entered — it appears as soon as the horizon drops below 20 weeks
- Skip marks this step as incomplete and advances to Step 3; skipped steps are flagged on the dashboard

**Story references:** S28-1, S28-2

---

### Screen 3 — Onboarding Wizard: Events

**Mode:** Shared (mode-variant — Mode 2 shows event descriptions; Mode 1 does not by default as planners are expected to know them)
**Actor:** Planner / Head planner
**Entry point:** After wedding details (Screen 2)

**Key UI elements:**
- Step indicator
- Section heading: “Which events are part of this wedding?”
- Default event list — six selectable chips or cards, pre-selected by default:
- Haldi, Mehendi, Sangeet, Engagement, Wedding, Reception
- Mode 2 only: each chip has a one-line description below it (e.g. Mehendi: “Henna ceremony, usually the evening before the wedding”)
- Each selected event shows a date/time input field below it when selected
- “Add custom event” option at the bottom of the list — opens a text input to name the event
- Custom events can be reordered by drag (desktop) or up/down arrows (mobile)

**Interaction rules:**
- All six defaults are pre-selected; user can deselect any
- Deselected events collapse their date/time inputs
- Custom events appear in the list with the same date/time input as defaults
- Event names are stored exactly as entered for custom events; default names use the system taxonomy
- Step can be skipped; skipped events can be added later from the wedding dashboard

**Story references:** S28-1, S28-4, S29-1, S29-3

---

### Screen 4 — Onboarding Wizard: Budget

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** After events (Screen 3)

**Key UI elements:**
- Step indicator
- Heading: “What’s your total wedding budget?”
- Single large rupee input field — ₹ prefix, numeric keyboard on mobile
- Input accepts both plain integers (3650000) and lakh-formatted values (36.5L); system normalises to integer on save
- Below the input: display showing the entered amount formatted in Indian denomination (e.g. “₹36.5 lakh”)
- Subtext: “You can update this anytime. Committed and paid amounts are calculated automatically.”
- Skip option

**Interaction rules:**
- Input validates on Continue — non-numeric characters rejected, zero or negative amounts rejected
- Formatted display updates in real time as the user types
- Skip records no planned budget; budget ledger shows “No budget set” until entered

**Story references:** S28-1

---

### Screen 5 — Onboarding Wizard: Participant Setup

**Mode:** Shared (mode-variant — access level options differ by mode)
**Actor:** Planner / Head planner
**Entry point:** After budget (Screen 4)

**Key UI elements:**
- Step indicator
- Mode 1 layout:
- Section: “Invite the couple” — two rows, each with name field and phone number field, access level locked to “Couple view” (not selectable)
- Section: “Invite family members (optional)” — repeating row: name, phone, access level dropdown (fixed to “Family view”)
- “+ Add family member” link
- Mode 2 layout:
- Section: “Invite participants” — repeating row: name, phone, access level dropdown (six options)
- Default access level pre-selected: “View only”
- Budget contributor toggle per row: when enabled, access level auto-suggests “Budget access” with a confirmable prompt
- “+ Add participant” link
- WhatsApp delivery note below participant list: “Invites will be sent via WhatsApp”

**Interaction rules:**
- Phone number field accepts 10-digit Indian mobile numbers; international format accepted with + prefix
- Access level dropdown in Mode 2 shows plain-language labels: “Can see everything”, “Budget only”, “Assigned tasks only”, “One event only”, “Can view everything”, “Schedule and logistics only”
- Adding a participant is optional — wizard can proceed with no participants added
- Budget contributor toggle (Mode 2): selecting it surfaces a prompt: “Give [name] budget visibility?” — Yes sets budget access, No leaves the dropdown selection unchanged

**Story references:** S28-1, S23-1, S23-2, S23-5

---

### Screen 7 — Onboarding Wizard: Summary and Confirm

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** After participant setup (Screen 5) or template selection (Screen 6)

**Key UI elements:**
- Summary card showing all wizard inputs:
- Wedding name (couple names), date, muhurat badge if applicable, city, destination flag
- Events list with dates
- Planned budget in ₹ lakh
- Participants list with names and access levels
- Skipped steps highlighted with a “Complete later” badge
- “Create wedding” primary button (full-width)
- “Edit” link on each summary section for in-place editing before submission

**Interaction rules:**
- Tapping “Edit” on any section scrolls back to that step with current values pre-filled
- Tapping “Create wedding” submits the wizard, creates all records, sends WhatsApp invites, and triggers AI timeline generation
- A loading state is shown post-submission: “Setting up your wedding…” followed by “Generating your planning timeline…”
- On completion: Mode 1 planner → portfolio view; Mode 2 head planner → wedding dashboard
- Timeline generation is asynchronous — the user is navigated away before generation completes; a banner on the destination screen shows “Timeline generating…” until complete

**Story references:** S28-1, S28-5

---

### Screen 6 — Onboarding Wizard: Template Selection

**Mode:** Mode 1
**Actor:** Professional planner
**Entry point:** Step presented between mode selection (Screen 1) and wedding details (Screen 2) when the planner has at least one saved template

**Key UI elements:**
- Step indicator: “Step 1 of 6 — Start from a template?”
- Two options presented as selectable cards:
- “Start from a template” — with a preview list of available templates below when selected
- “Start fresh” — blank wizard with India defaults only
- Template list (shown when “Start from a template” is selected):
- Each template card shows: template name, event count (e.g. “5 events”), last used date
- Tapping a template shows an expandable preview: event names in sequence, access level defaults
- “Use this template” button per card
- “Continue without template” text link at bottom

**Interaction rules:**
- If no templates exist, this screen is skipped entirely — the wizard proceeds directly from mode selection to wedding details
- Selecting a template and tapping “Use this template” pre-fills events and access configuration in subsequent steps; the planner can edit any pre-filled value
- “Start fresh” or “Continue without template” proceeds to Screen 2 with no pre-fill
- Template preview is read-only — no editing from this screen; template editing happens in Screen 19

**Story references:** S28-3

---

### Screen 7a — Post-Wizard: Timeline Generating

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** Immediately after tapping “Create wedding” on Screen 7 (summary and confirm)

**Key UI elements:**
- Full-screen transitional state — not a modal, not a banner
- Wedding name and date shown at top (confirms the wedding was created)
- Animated progress indicator (not a spinner — a pulsing or sequential animation suggesting active work)
- Heading: “Setting up your wedding”
- Sub-steps shown as they complete — each step ticks off sequentially:
1. “Wedding created” ✓
2. “Invites sent to [X] participants” ✓
3. “Generating your planning timeline…” (animated, in-progress)
- Estimated time note below: “This takes about 30 seconds”
- Background: the user cannot interact with this screen — it is a transitional state, not a blocking modal
- On timeline completion: *System:* navigates automatically to the destination screen (portfolio for Mode 1, dashboard for Mode 2)
- On timeline failure: sub-step 3 shows “Timeline generation failed. You can try again from your dashboard.” with a “Go to dashboard” button

**Interaction rules:**
- User cannot dismiss or skip this screen
- If timeline generation succeeds within 30 seconds: auto-navigates without user input
- If generation takes longer than 45 seconds: screen shows the failure state with “Go to dashboard” — the retry mechanism runs in the background; a banner on the dashboard will surface the manual retry button
- The sub-step list communicates progress without requiring the user to wait passively at a blank screen

**Story references:** S28-1, S1-1, S1-6

---

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** “Add vendor” button from vendor list or event view

**Key UI elements:**
- Sheet or full-screen modal (full-screen on mobile)
- Field: Vendor name — text input; as the user types, matching directory entries appear as suggestions below
- If a directory match is selected → transitions to Screen 13 (directory preview)
- If no match / user continues typing → “New vendor” state:
- Field: Category — dropdown showing India-specific defaults for this event, plus “Custom” option
- Field: City — text input
- Field: Phone number — numeric input
- Field: Negotiated rate — ₹ input with lakh formatting
- Field: Event assignment — multi-select from the wedding’s events
- Expandable section: “Payment milestones” — add milestone rows (amount, due date, description)
- Expandable section: “Deliverables” — free text
- Expandable section: “Notes” — free text, private to planner
- Save button (primary) and Cancel (secondary)
- After save: prompt appears — “Save [name] to your directory for future weddings?” with Yes / No

**Interaction rules:**
- Directory search fires on each keystroke with a 300ms debounce
- Rate field: ₹ prefix shown, numeric keyboard, lakh formatting applied on blur
- Event assignment: multi-select chips from the wedding’s event list; at least one event should be assigned (warning, not block, if none selected)
- Advancing to Booked without a rate entered: Save is permitted at Shortlisted, but the status cannot advance to Booked until rate is entered — enforced at the status update action, not at the add step
- Directory save prompt appears after the vendor card is saved, not before

**Story references:** S5-1, S5-4, S5-9, S29-1

---

### Screen 13 — Vendor Card: Directory Preview

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** User selects a directory match from the vendor name field in Screen 12

**Key UI elements:**
- Preview card overlaying the add form:
- Vendor name (bold)
- Category, city, phone
- Planner notes from directory (if any)
- “Used in [X] weddings” — wedding count
- “Last used: [Month Year]”
- Label: “For reference only — enter this wedding’s rate below”
- Rate field below the preview card: blank, ₹ prefix, numeric keyboard
- “Use this vendor” button and “Not this vendor” link

**Interaction rules:**
- Rate field is always blank — no pre-fill from any previous wedding
- “Use this vendor” creates a VendorInstance linked to the directory entry and advances to the full add form (Screen 12) with name, category, city, phone pre-filled from directory
- “Not this vendor” dismisses the preview and returns to the name field in Screen 12
- Preview card cannot be edited — it is read-only reference data

**Story references:** S5-2

---

### Screen 11a — Event Vendor Section with Category Defaults

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** Tapping an event name from the vendor list or wedding dashboard — opens that event’s vendor management view

**Key UI elements:**
- Event name and date as page header (e.g. “Mehendi — 14 March”)
- Suggested vendor categories for this event type — presented as empty category slots, each with:
- Category name (e.g. “Mehendi artist”, “Photographer”, “Caterer (snacks)”, “Décor”)
- Status: “Not added” with a “+ Add vendor” action per slot
- Once a vendor is added to a slot: the slot shows vendor name and confirmation status badge
- “Add custom category” option at the bottom of the slot list — opens a text input
- Dismissed suggestion slots do not reappear; a “Show dismissed suggestions” link at the bottom allows recovery

**Interaction rules:**
- Tapping “+ Add vendor” on any slot opens Screen 12 (add new vendor) with the category pre-filled from the slot
- Tapping an existing vendor in a slot navigates to Screen 14 (vendor card detail)
- Tapping “Add custom category” opens an inline text input; confirmed custom category creates a new slot
- Slots for the default categories are shown in a recommended order (photographer first for visual events, caterer first for meal-heavy events) — order is editable by drag
- The suggested categories for each event type are defined in S29 defaults; this screen is the primary surface where those defaults appear

**Story references:** S29-1, S29-2, S5-1

---

### Screen 14 — Vendor Card: Detail View

**Mode:** Shared (mode-variant — planner/head planner sees full view with edit; budget-access family sees full view read-only; couple-view participant sees name and category only for confirmed vendors)
**Actor:** Planner / Head planner / Budget-access family / Couple (limited)
**Entry point:** Tapping a vendor from the vendor list (Screen 11), event vendor section (Screen 11a), or confirmation tracker (Screen 17)

**Key UI elements — Planner / Head planner view (full):**
- Header: vendor name (large), category badge, event assignment chips
- Status control: current status badge with “Update status” button — advances to next status in sequence; “Revert” link for backward movement
- Rate section: negotiated rate in ₹ lakh; “Edit” link
- Payment milestones section: list of milestones with amount, due date, status badge; “+ Add milestone” action; “Edit” and “Mark paid” per milestone
- Deliverables section: free text, editable
- Notes section: free text, private to planner/head planner, not visible to any other participant
- Directory link (if vendor is in directory): “View in your directory” — shows directory entry metadata (read-only)
- Completeness indicator: shows which of the four completeness criteria are met (status ≥ Booked, rate entered, milestone added, event assigned)
- “Archive vendor” option in overflow menu (soft delete)

**Key UI elements — Budget-access family view:**
- Same as planner view with all edit controls hidden
- Rate visible, milestones visible, deliverables visible
- Notes section hidden — notes are private to planner/head planner
- Status badge shown but “Update status” control hidden

**Key UI elements — Couple view (Mode 1 — confirmed vendors only):**
- Vendor name and category only
- No rate, no milestones, no deliverables, no notes, no status control
- A brief “Confirmed for [event name]” label
- No edit capability — the entire card is read-only reference information

**Interaction rules:**
- “Update status” → advances status one step forward; if advancing to Booked with no rate, shows inline prompt to enter rate first
- “Revert” → opens confirmation sheet requiring a reason entry (S5-8)
- “Mark paid” on a milestone → opens paid date confirmation sheet
- Couple-view participants who navigate to a vendor below Confirmed status → Screen 27 (permission-denied)
- “Archive vendor” → confirmation prompt; vendor soft-deleted; removed from all active views but retained in audit log

**Story references:** S5-3, S5-4, S5-5, S5-6, S5-8

---

### Screen 15 — Payment Milestone Calendar

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** “Payments” tab on wedding dashboard

**Key UI elements:**
- Summary bar at top: “₹[X] lakh due in the next 30 days” — tappable to filter to next-30-days view
- Calendar grouped by month — each month is a collapsible section
- Each milestone row shows: vendor name, milestone description, amount (₹ lakh), due date, status badge (Upcoming / Due / Paid / Overdue)
- Overdue rows: visually distinguished (border or background treatment — designer’s discretion, must be immediately perceivable)
- Paid rows: shown in a muted style with paid date
- Per row action: “Mark paid” button for upcoming/overdue milestones; “Edit” for unpaid milestones; “View” for paid milestones
- Floating “+ Add milestone” button — opens milestone add sheet linked to a vendor selection

**Interaction rules:**
- Tapping “Mark paid”: opens a confirmation sheet with paid date pre-filled as today; user can edit the date; confirmation updates status and refreshes budget ledger
- Tapping “Edit”: opens milestone edit sheet with current values pre-filled; due date changes to a past date automatically trigger overdue status on save
- Overdue status is set by the system at 00:01 the day after due date — not by user action
- Paid milestones: no delete or edit of amount/due date — only paid date is editable

**Story references:** S12-1, S12-2, S12-3, S12-4, S12-5, S12-6

---

### Screen 17 — 30-Day Confirmation Tracker

**Mode:** Shared
**Actor:** Planner / Head planner
**Entry point:** “Confirmations” tab on wedding dashboard, or dashboard at-risk section

**Key UI elements:**
- Page heading: “Vendors needing confirmation” with event date filter showing “Next 30 days”
- Empty state if no unconfirmed vendors within 30 days: “All vendors confirmed for upcoming events.” with a green indicator
- Each row shows: vendor name, category, event name, event date, current status badge, days until event
- Stalled vendors (no status update in 14+ days): additional badge “No update in [X] days” in a warning treatment
- Per row: “Mark confirmed” button and “View vendor” link
- Rows sorted by days until event (ascending — most urgent first)

**Interaction rules:**
- Tapping “Mark confirmed”: updates vendor status to Confirmed inline without navigation; row animates out of the list
- Tapping “View vendor”: navigates to the full vendor card (Screen 14)
- If an event date changes and a vendor drops outside the 30-day window, they leave the tracker automatically on the next load
- Stalled badge appears automatically — not manually settable

**Story references:** S14-1, S14-2, S14-3

---

### Screen 22 — AI Timeline View

**Mode:** Shared (mode-variant — late-start banner only when applicable; planner view includes vendor-linked tasks)
**Actor:** Planner / Head planner
**Entry point:** “Timeline” tab on wedding dashboard; auto-displayed after onboarding wizard completion

**Key UI elements:**
- Late-start banner (conditional): “Your wedding is [X] weeks away. Tasks are prioritised by urgency.” — dismissible, reappears on regeneration if still applicable
- Timeline items grouped by week: “12 weeks to go”, “11 weeks to go”, etc.
- Each task row: category icon, task title, due date, status badge (Pending / Complete / Overdue / Skipped)
- AI-generated tasks: standard treatment
- User-modified tasks: subtle indicator (e.g. pencil icon) distinguishing them from AI-generated tasks
- Custom tasks: distinct visual treatment (e.g. tag or colour)
- Per task: checkbox to mark complete; “Edit” on tap; “Skip” option on long-press or swipe
- Toolbar: “Regenerate timeline” button — opens diff preview before applying
- Overdue tasks: shown at the top of their week group with overdue treatment

**Interaction rules:**
- Tapping the checkbox marks the task complete — instant update, no confirmation required
- Tapping the task row opens an edit sheet: title, category, due date, assignment
- Regenerate: shows diff screen listing tasks to be added, removed, or rescheduled; user confirms or cancels; completed and custom tasks are excluded from the diff
- If timeline generation is in progress (post-onboarding): a skeleton loading state with “Generating your timeline…” message; when complete, timeline items animate in
- If generation failed: “Timeline generation failed. Try again.” with a manual trigger button

**Story references:** S1-1, S1-2, S1-3, S1-4, S1-5, S1-6

---

### Screen 27 — Permission-Denied State

**Mode:** Shared
**Actor:** Any participant attempting to access a restricted view
**Entry point:** Direct URL, deep link, or navigation to a view above the participant’s access level

**Key UI elements:**
- Simple, clean layout — no navigation chrome for the restricted section
- Icon: a padlock or equivalent non-alarming visual
- Heading: “This section isn’t available to you”
- Body: “Your [planner / the person who set up this wedding] manages this part of the plan. If you have questions, reach out to them directly.”
- Primary action: “Go back to your view” — returns to the highest-access view available to this participant
- No “Request access” button — access escalation is not a self-serve action

**Interaction rules:**
- This screen must render for any URL that maps to a restricted view — including direct URL entry, shared links, and browser back navigation
- The heading and body text must never reveal what the restricted section contains
- The “Go back” action navigates to the participant’s home view (couple dashboard, family schedule, etc.)

**Story references:** S23-4

---

### Screen 28 — Empty States

**Mode:** Shared
**Actor:** Any actor on a view with no data
**Entry point:** Any feature view when the underlying data set is empty

Each empty state below is a distinct design component:

**Portfolio — no active weddings (S17-4):**
- Illustration area (designer’s discretion — should feel welcoming, not clinical)
- Heading: “Your wedding portfolio”
- Body: “Create your first wedding to get started. Every wedding you manage will appear here with a live health score.”
- Primary CTA: “Create wedding”
- Secondary (if templates exist): “Start from a template”

**Vendor list — no vendors added:**
- Heading: “No vendors added yet”
- Body: “Add your first vendor to start tracking payments and confirmations.”
- Primary CTA: “Add vendor”

**Payment calendar — no milestones:**
- Heading: “No payments scheduled”
- Body: “Add payment milestones to your vendor cards to see them here.”
- Primary CTA: “Go to vendors”

**Confirmation tracker — all vendors confirmed:**
- Heading: “All clear”
- Body: “All vendors with upcoming events are confirmed. We’ll let you know if anything changes.”
- No CTA required

**Timeline — not yet generated:**
- Heading: “Your timeline is being prepared”
- Body: “We’re generating a planning timeline based on your wedding details. This takes about 30 seconds.”
- Animated progress indicator

**Briefing — all clear (S3-7):**
- Heading: “Your wedding is on track”
- Body: “Nothing overdue or at risk this week.”
- Section: “Coming up” — shows next 1–3 tasks from timeline with due dates
- Tone: positive, not neutral

**Story references:** S17-4, S3-7

---

### Screen 29 — Offline State

**Mode:** Shared
**Actor:** Any actor when device has no network connection
**Entry point:** App opened or used without connectivity

**Key UI elements:**
- Persistent banner at top of screen (not full-screen takeover): “You’re offline — viewing saved data. Last updated [time/date].”
- Banner colour: muted — not red, not alarming
- All write controls (add vendor, mark paid, update status, save, confirm) are visually disabled
- Disabled controls show a tooltip on tap: “Reconnect to make changes”
- Cached read data is displayed normally — the rest of the screen functions as usual

**Interaction rules:**
- Banner appears within 2 seconds of network loss detection
- Banner disappears automatically when connectivity is restored — no user action required
- Write controls re-enable automatically on reconnect
- Cached data timestamp reflects the last successful data load, not the current time

**Story references:** TR-07-5, DR-11

---

## 9.4 Mode 1 Screens

---

### Screen 8 — Planner Portfolio View

**Mode:** Mode 1
**Actor:** Professional planner
**Entry point:** Default landing screen after login for Mode 1 planner accounts

**Key UI elements:**
- Page heading: “Your weddings”
- Sort control: “By urgency” (default) / “By date”
- Wedding cards — each card contains:
- Couple names (large, prominent)
- Wedding date and days until wedding
- Health score indicator (three states: Good / At-risk / Critical — visually unambiguous without reading)
- Event count and next event name + date
- Floating “+” button: “Add wedding”
- Empty state: Screen 28 (portfolio variant)

**Interaction rules:**
- Tapping a health score indicator → Screen 18 (health score breakdown)
- Tapping anywhere else on the card → planner wedding dashboard (Screen 9) for that wedding
- Tapping “+” → onboarding wizard (Screen 1)
- Default sort is by health score — Critical weddings first, then At-risk, then Good; within each tier, sorted by days until wedding (ascending)
- Health scores update in real time — a score change does not require a manual refresh; cards reorder if sort changes

**Story references:** S17-1, S17-2, S17-3, S17-4

---

### Screen 9 — Planner Wedding Dashboard

**Mode:** Mode 1
**Actor:** Professional planner
**Entry point:** Tapping a wedding card in the portfolio view (Screen 8)

**Key UI elements:**
- Wedding name and date (header)
- At-risk summary strip (conditional): shows count of overdue payments, unconfirmed vendors within 30 days, and overdue tasks — tappable, navigates to relevant feature
- Data completeness signal (conditional): appears when >30% of vendor cards are incomplete or any event within 60 days has no Booked+ vendors — shows specific message and links to vendor list
- Navigation tabs: Vendors / Payments / Confirmations / Timeline / Briefings / Participants / Settings
- Quick action strip: “Add vendor”, “Add payment”, “View briefing” — most common actions without tab navigation

**Interaction rules:**
- At-risk strip items are individually tappable — each navigates to the relevant feature view
- Completeness signal is informational only — tapping it navigates to the vendor list
- Tab navigation is persistent — selected tab is remembered when returning from a feature view

**Story references:** S5-6, S12-4, S14-1, S10-2

---

### Screen 18 — Portfolio Health Score Breakdown

**Mode:** Mode 1
**Actor:** Professional planner
**Entry point:** Tapping a health score indicator on a portfolio card (Screen 8)

**Key UI elements:**
- Sheet or modal overlay (does not navigate away from portfolio)
- Wedding name at top
- Health score state: Good / At-risk / Critical with icon
- Contributing factors list — each factor shows:
- Factor label (e.g. “Overdue payments”)
- Count (e.g. “2 overdue”)
- One-line description (e.g. “Sharma wedding caterer — ₹1.5L due 5 March”)
- “View” link navigating to the relevant feature
- If all-clear: single line “All vendors confirmed, no overdue payments, budget on track”
- “Open wedding” button at bottom

**Interaction rules:**
- Tapping any “View” link closes the sheet and navigates to the relevant feature view within that wedding
- Tapping “Open wedding” closes the sheet and navigates to the planner wedding dashboard (Screen 9)
- Sheet can be dismissed by swiping down or tapping outside

**Story references:** S17-2

---

### Screen 19 — Client Template Library

**Mode:** Mode 1
**Actor:** Professional planner
**Entry point:** Account settings → “My templates”; or wizard step (Screen 6)

**Key UI elements:**
- Page heading: “My templates”
- Template cards — each shows: template name, event count, usage count (“Used for 3 weddings”), last used date
- Sort: by usage count (default) / by last used / by name
- Per card actions: “Use in new wedding” / “Edit” / “Delete”
- “Save current wedding as template” — accessible from a wedding’s settings screen (not this list)
- Empty state: “No templates saved yet. After setting up a wedding, save it as a template to reuse the structure for future clients.”

**Interaction rules:**
- Tapping “Use in new wedding” → launches the onboarding wizard (Screen 1) with this template pre-selected
- Tapping “Edit” → opens template edit view showing event sequence, access defaults, and task defaults — all editable; couple names, dates, vendor data shown as locked/absent
- Tapping “Delete” → confirmation prompt: “Delete [name]? Weddings created from this template won’t be affected.” → soft delete on confirm
- Usage count and last used date are read-only — system-maintained

**Story references:** S18-1, S18-2, S18-3, S18-4

---

### Screen 20 — Participant Management: Mode 1

**Mode:** Mode 1
**Actor:** Professional planner
**Entry point:** “Participants” tab on wedding dashboard (Screen 9)

**Key UI elements:**
- Section: “Couple” — shows both couple members with name, phone (masked), and access level badge (“Couple view”)
- Section: “Family” — shows all family participants with name, phone (masked), access level badge (“Family view”)
- Per participant: “Change access” dropdown (planner only) and “Remove” option
- Invite status badge per participant: “Invite sent” / “Invite failed” / “Accepted”
- “Failed” badge: accompanied by “Resend” button and “Copy invite link” option
- “+ Add participant” button at bottom of each section

**Interaction rules:**
- “Change access”: opens a dropdown — for Mode 1, options are “Couple view” and “Family view” only
- “Remove”: confirmation prompt with name — removes participant, sends WhatsApp notification to removed participant
- “Resend”: sends a new WhatsApp invite to the same number; if same number continues to fail, “Copy invite link” copies a direct link for manual sharing
- Suspended state (planner account deleted): shown as a banner above participant list with instructions for the couple

**Story references:** S23-1, S23-2, S23-3, S23-9, S23-10

---

### Screen 24 — Couple View Dashboard

**Mode:** Mode 1
**Actor:** Couple member (couple view access)
**Entry point:** Invite link, or account login for couple members who created an account

**Key UI elements:**
- Wedding name and date (header)
- Three summary cards, full-width, stacked:
- “Plan status” — e.g. “4 of 6 events have confirmed vendors”
- “Budget committed” — total committed and total paid as two figures; no breakdown
- “Next payment” — amount due and due date (aggregate, no vendor name)
- Events section: confirmed events only, each showing name, date, time, venue
- No navigation tabs — this is a single-page view
- Footer: “Questions about your plan? Contact [planner name]” — taps to open WhatsApp DM to planner

**Interaction rules:**
- All elements are read-only — no edit controls visible
- Tapping an event card shows event detail: venue address, dress code, and any logistics notes the planner has marked as couple-visible
- No budget breakdown, no vendor rates, no task list accessible from any tap
- If a couple member accesses a restricted URL: Screen 27 (permission-denied)

**Suspended state variant (S23-9):**
When the planner’s account has been deleted and the wedding is in a suspended state, Screen 24 shows a modified layout:
- A prominent banner at the top (full-width, muted warning treatment — not red): “Your wedding plan is currently suspended. Your planner’s account has been closed.”
- Body below banner: “All your wedding information is safe. Contact your planner directly, or reach out to Vivaah OS support to transfer this wedding to a new planner.”
- The rest of the couple view content remains visible and readable below the banner — events, budget summary, plan status — so the couple is not locked out of their own data
- No edit controls are shown — the wedding is read-only during suspension
- A “Contact support” link opens a pre-formatted WhatsApp message to the Vivaah OS support number

**Story references:** S23-4, S10-4, S12-3, S23-9

---

## 9.5 Mode 2 Screens

---

### Screen 10 — Head Planner Wedding Dashboard

**Mode:** Mode 2
**Actor:** Head planner
**Entry point:** Default screen after onboarding wizard completion; login destination

**Key UI elements:**
- Wedding name and date (header)
- At-risk summary strip (conditional): overdue payments, unconfirmed vendors within 30 days, overdue tasks — tappable per item
- Data completeness signal (conditional): same logic as Mode 1 dashboard
- Budget snapshot: planned / committed / paid as three figures — always visible on the dashboard, not behind a tab
- Next briefing countdown: “Next briefing: Monday, [date]” with a “View last briefing” link
- Navigation tabs: Vendors / Payments / Budget / Confirmations / Timeline / Briefings / Participants / Settings
- Quick actions: “Add vendor”, “Add payment”, “Mark task complete”

**Interaction rules:**
- Budget snapshot figures link to the full budget ledger (Screen 16)
- At-risk strip items navigate to the relevant feature
- The head planner dashboard shows budget prominently because Mode 2 has no separate planner managing finances — the head planner needs financial visibility at a glance

**Story references:** S5-6, S12-4, S14-1, S10-2, S3-8

---

### Screen 21 — Participant Management: Mode 2

**Mode:** Mode 2
**Actor:** Head planner
**Entry point:** “Participants” tab on wedding dashboard (Screen 10)

**Key UI elements:**
- Section: “Head planner” — shows current head planner with full-access badge and “Transfer role” option
- Section: “Participants” — all other participants with name, phone (masked), access level badge in plain language, and invite status
- Per participant: “Change access” (opens six-option dropdown) / “Remove”
- Access level labels (plain language): “Full access” / “Budget only” / “Their tasks only” / “One event only” / “Can view everything” / “Schedule only”
- “+” button: “Add participant”
- Budget contributor indicator: a small “₹” badge on participants with budget access

**Interaction rules:**
- “Transfer role”: opens a confirmation sheet identifying the target participant; sends a WhatsApp confirmation request to the target; transfer completes only on target’s acceptance
- “Change access” to a lower level: immediate, no notification to participant
- “Remove”: confirmation prompt; participant notified via WhatsApp
- “Add participant”: opens an add sheet with name, phone, access level dropdown, and budget contributor toggle

**Story references:** S23-5, S23-6, S23-7, S23-8, S23-10

---

### Screen 21a — Head Planner Role Transfer Confirmation

**Mode:** Mode 2
**Actor:** Head planner (outgoing) / Target participant (incoming)
**Entry point:** Tapping “Transfer role” on Screen 21 and selecting a target participant

**Key UI elements — Outgoing head planner confirmation sheet:**
- Sheet slides up from bottom
- Heading: “Transfer head planner role?”
- Body: “You are about to transfer full control of this wedding to [target name]. You will become a full-access participant. [Target name] will need to accept before the transfer is complete.”
- Warning note: “This cannot be undone without [target name]’s agreement.”
- Two buttons: “Send transfer request” (primary) and “Cancel” (secondary)

**Key UI elements — Target participant WhatsApp message:**
- Message sent via WhatsApp to target participant’s phone number
- Content: “[Head planner name] is transferring the head planner role for [couple names]’ wedding to you. Accept?”
- Two reply options embedded as WhatsApp quick reply buttons (if supported by provider) or instructions to reply “Yes” or “No”
- If quick replies are not supported: “Reply YES to accept or NO to decline”

**Key UI elements — Pending transfer state (Screen 21 while awaiting response):**
- Target participant’s row shows “Transfer pending — awaiting [name]’s confirmation”
- “Cancel transfer” option on that row — cancels the pending request

**Interaction rules:**
- Transfer only completes when the target participant replies to accept the WhatsApp message
- If target declines: both parties receive an in-app notification; the participant list returns to its previous state
- If no response within 48 hours: transfer request expires automatically; outgoing head planner retains their role; both parties notified
- Transfer completion: outgoing head planner’s role changes to full access immediately; target’s role changes to head planner immediately; both parties receive WhatsApp confirmation

**Story references:** S23-6

---

### Screen 16 — Budget Ledger

**Mode:** Shared (mode-variant — Mode 1 planner has full view; couple view is aggregate only; budget-access family has full view; Mode 2 head planner has full view with edit)
**Actor:** Planner / Head planner / Budget-access family
**Entry point:** “Budget” tab on wedding dashboard

**Key UI elements:**
- Three headline figures (large, prominent): Planned / Committed / Paid — in ₹ lakh
- Remaining figure below: Planned minus Committed
- Progress bar: committed as a percentage of planned — colour changes at 85% (warning) and 100% (alert)
- Overspend alert (conditional): banner when committed ≥ 100% of planned
- “Edit planned budget” link — opens inline edit for the planned figure only
- Vendor breakdown accordion: each vendor with Booked+ status shows name, category, and rate — expandable
- Paid milestones accordion: each paid milestone shows vendor name, amount, paid date

**Interaction rules:**
- Progress bar is read-only — committed and paid update automatically
- “Edit planned budget”: opens a ₹ input inline; save triggers immediate recalculation and overspend check
- Vendor breakdown: tapping a vendor row navigates to that vendor’s card (Screen 14)
- Budget-access family member view: identical to head planner view with all edit controls hidden
- Couple view: shows only three aggregate figures — Committed, Paid, and “Next 30 days due” — with no vendor breakdown and no planned total

**Story references:** S10-1, S10-2, S10-3, S10-4, S10-5

---

### Screen 25 — Family / View-Only Participant View

**Mode:** Shared (mode-variant — Mode 1 family view is schedule-only; Mode 2 view-only sees full plan without budget)
**Actor:** Family member / View-only participant
**Entry point:** Invite link, or account login

**Key UI elements — Mode 1 family view:**
- Wedding name and date
- Events list: each event shows name, date, time, venue name, venue address, dress code
- Logistics notes (planner-marked as family-visible only)
- No vendor information, no budget, no tasks
- Share button per event: generates a WhatsApp-shareable event summary

**Key UI elements — Mode 2 view-only:**
- Wedding name and date
- Events section: all events with full details
- Vendors section: confirmed vendors only (name and category — no rates)
- Tasks section: all tasks (no assignment or budget detail)
- No budget ledger, no payment milestones

**Interaction rules:**
- All elements read-only — no edit controls
- Share button: generates a pre-formatted WhatsApp message with event name, date, time, venue, and dress code
- Attempting to access a restricted section via URL → Screen 27

**Story references:** S23-2, S23-4

---

## 9.6 Shared (Mode-Variant) Screens

---

### Screen 23 — Weekly Briefing: In-App

**Mode:** Shared (mode-variant — Mode 1 briefing is multi-wedding; Mode 2 is single-wedding)
**Actor:** Planner / Head planner
**Entry point:** “Briefings” tab on dashboard; WhatsApp link (if app installed); push notification

**Key UI elements:**
- Header: “Weekly briefing — [date]”
- Mode 1 multi-wedding layout:
- Wedding tabs or accordion sections — each wedding as a collapsible section
- Most at-risk wedding expanded by default
- Each section header shows the one-line summary: “[Couple names] — [wedding date] — [X overdue, Y unconfirmed]”
- Mode 2 single-wedding layout:
- No wedding grouping — four sections displayed directly
- Four sections (both modes):
1. **Overdue** — items past their due date; red/critical visual treatment
2. **At-risk** — vendors unconfirmed within 30 days, stalled vendors, payments due within 7 days
3. **Upcoming decisions** — the 3–5 most consequential actions in the next 7–14 days
4. **Budget health** — planned / committed / paid summary with percentage committed
- All-clear variant: replaces the four sections with a positive status and “Coming up” task list
- Each item in sections 1–3 has a “Take action” link navigating directly to the relevant feature view

**Interaction rules:**
- “Take action” links are deep links — they navigate to the exact record (e.g. the specific vendor card or payment milestone)
- Marking an item resolved from within the briefing is not supported — the user is navigated to the feature to take the action there
- Previous briefings accessible via “View past briefings” — list of all stored briefings in reverse chronological order
- Briefing configuration (day/time) accessible via gear icon in the header

**Story references:** S3-1, S3-2, S3-3, S3-4, S3-5, S3-7

---

### Screen 26 — Invite Link Landing: First Access

**Mode:** Shared (mode-variant — content shown depends on participant’s access level)
**Actor:** Couple / Family / Guest (non-account participant)
**Entry point:** WhatsApp invite link

**Key UI elements:**
- No login wall — content loads immediately on link tap
- A single, scrollable page — no navigation, no tab bar
- Content determined by access level:
- Couple view: plan status summary, events (confirmed), upcoming payments (aggregate)
- Family view: events (all, with venue and dress code)
- View-only: events, confirmed vendors (name/category only), tasks
- Guest: events (name, date, time, venue, dress code only)
- After content loads (3–5 seconds): a subtle bottom sheet appears: “Create an account to get notified of updates” — dismissible
- Minimum font size: 16px throughout this view

**Interaction rules:**
- Account creation prompt: non-blocking; can be dismissed; reappears once per session only
- If the participant creates an account, they are linked to their existing participant record — no re-invitation required
- If the invite link has been revoked: a clean message — “This invitation is no longer active. Contact [planner name] if you think this is an error.” — no login prompt, no product chrome

**Story references:** S23-1, S23-5

---

### Screen 30 — Account Settings and Briefing Configuration

**Mode:** Shared (mode-variant — Mode 1 planner sees portfolio-level briefing settings; Mode 2 sees single-wedding settings)
**Actor:** Planner / Head planner
**Entry point:** Settings icon from any dashboard

**Key UI elements:**
- Section: “Briefing schedule”
- Day selector: Mon–Sun (default: Monday)
- Time selector: hour and AM/PM (default: 8:00am)
- Timezone: auto-detected, editable
- Section: “Notifications”
- WhatsApp briefing: toggle (default on)
- In-app briefing: toggle (default on)
- Section: “Account”
- Name, phone number (editable)
- Password change
- Delete account (with warning: “Deleting your account will suspend all active weddings”)
- Mode 1 additional section: “My templates” — link to Screen 19

**Interaction rules:**
- Day/time changes apply to all future briefings immediately
- **Mode 1 — briefing configuration is account-level, not per-wedding.** A planner’s briefing schedule applies to the single multi-wedding briefing they receive each week. There is no per-wedding briefing schedule for Mode 1 planners — one briefing covers all active weddings. The day/time selector in Screen 30 sets the delivery time for this consolidated briefing.
- **Mode 2 — briefing configuration is per-wedding.** A head planner receives one briefing per wedding. If they manage multiple weddings (unusual but possible in Mode 2), each wedding has its own briefing schedule. The day/time selector in Screen 30, when accessed from a specific wedding’s settings, sets that wedding’s briefing schedule only.
- WhatsApp toggle off: briefing still generated and stored in-app, not delivered via WhatsApp
- Delete account: two-confirmation flow — first confirmation prompt, second confirmation requires typing “DELETE”; on confirm, account suspended for 90-day recovery window

**Story references:** S3-4

---

## 9.7 Prototype and Wireframe Delivery Notes

**Design deliverables this section initiates:**

The screen specifications in this section are the source of truth for wireframe production. A designer working from this section should produce:

1. **Low-fidelity wireframes** for all 35 screens listed in the mapping table (Section 9.2) — layout and information hierarchy, no visual design
2. **Annotated mid-fidelity wireframes** for the nine highest-priority screens — the screens covering the most P0 user stories:
    - Screen 8 — Portfolio view
    - Screen 9 — Planner wedding dashboard
    - Screen 10 — Head planner wedding dashboard
    - Screen 12 — Add new vendor
    - Screen 14 — Vendor card detail view
    - Screen 15 — Payment calendar
    - Screen 22 — AI timeline view
    - Screen 23 — Weekly briefing
    - Screen 26 — Invite link landing
3. **Interactive prototype** covering the primary Mode 1 planner flow: login → portfolio → open wedding → add vendor → add milestone → view briefing, and the primary Mode 2 head planner flow: onboarding wizard → dashboard → add vendor → view timeline → view briefing

**Prototype link:** [To be added when Figma prototype is complete]

**Annotation standard:** Each wireframe annotation shall reference the FR- code from Section 8.3 that the annotated element satisfies, and the story ID from Section 6 that the screen is designed to support. This creates a traceable chain from requirement to wireframe to user story to acceptance criterion.

---

## 9.8 WhatsApp Message Format Specifications

WhatsApp messages are a primary delivery surface for this product — not a secondary notification channel. The format of each message type must be specified precisely because WhatsApp Business API templates require pre-approval, and the message format directly affects how useful the content is to the recipient.

**WhatsApp formatting conventions used throughout:**
- Bold text: *text enclosed in asterisks* renders as bold in WhatsApp
- Line breaks: a blank line between paragraphs creates visual separation
- Bullet points: a dash (—) at the start of a line creates a visual list item
- Emojis: used sparingly for visual scanning — one per section header maximum
- Character limit: 4,096 characters per message; longer briefings split into numbered messages

---

### WA-01 — Participant Invite Message

**Trigger:** Participant added to a wedding
**Recipient:** New participant

```
*[Couple names]' wedding — you're invited*

[Planner/Head planner name] has added you to the wedding plan on Vivaah OS.

Tap the link below to see your [schedule / plan / updates]:
[invite link]

No account needed — just tap and view.
```

**Mode-variant note:** The word in brackets (“schedule” for family view / guest, “plan” for couple view / view-only) is determined by the participant’s access level at invite time.

---

### WA-02 — Weekly Briefing Message (Standard — single wedding)

**Trigger:** Scheduled briefing generation (Mode 2 head planner, or Mode 1 planner with one active wedding)
**Recipient:** Head planner / Planner
**Character target:** Under 2,000 characters for a typical briefing; split at 4,096 if needed

```
*Weekly briefing — [Couple names] — [date]*

🔴 *Overdue*
— [Vendor name]: ₹[X]L due [date]. [X] days overdue.
— [Task name]: due [date]. [X] days overdue.

⚠️ *At risk*
— [Vendor name] — [category] for [event]: no update in [X] days. Currently: [status].
— [Vendor name]: ₹[X]L payment due in [X] days.

📋 *Upcoming this week*
— [Action]: due [date]
— [Action]: due [date]

💰 *Budget*
₹[X]L committed of ₹[X]L planned ([X]%). ₹[X]L remaining.

---
Open your plan: [app link]
```

**All-clear variant:**

```
*Weekly briefing — [Couple names] — [date]*

✅ *Your wedding is on track*
Nothing overdue or at risk this week.

*Coming up*
— [Task]: due [date]
— [Task]: due [date]

Open your plan: [app link]
```

---

### WA-03 — Weekly Briefing Message (Portfolio — multiple weddings, Mode 1)

**Trigger:** Scheduled briefing generation (Mode 1 planner with 2+ active weddings)
**Recipient:** Professional planner
**Structure:** One summary block per wedding, most at-risk first; split into multiple messages if >4,096 characters

```
*Weekly briefing — [date]*
[X] active weddings

---
⚠️ *[Couple names] — [X] days to go*
— [Most urgent item]
— [Second item]
View: [deep link to this wedding]

---
✅ *[Couple names] — [X] days to go*
All clear. Next: [upcoming task] due [date].
View: [deep link]

---
[Additional weddings follow same pattern]

Open portfolio: [app link]
```

---

### WA-04 — Role Transfer Request

**Trigger:** Head planner initiates role transfer (Mode 2)
**Recipient:** Target participant

```
*Wedding plan — role transfer request*

[Head planner name] would like to transfer the head planner role for [Couple names]' wedding to you.

As head planner, you'll have full control over the wedding plan.

Reply *YES* to accept or *NO* to decline.

This request expires in 48 hours.
```

---

### WA-05 — Access Revoked Notification

**Trigger:** Planner or head planner revokes a participant’s access
**Recipient:** Removed participant

```
*[Couple names]' wedding — access removed*

[Planner/head planner name] has removed your access to this wedding plan.

If you think this is an error, contact them directly.
```

---

### WA-06 — Wedding Suspended Notification

**Trigger:** Mode 1 planner account deleted
**Recipient:** Couple members

```
*[Couple names]' wedding — action needed*

Your wedding planner's account has been closed.

Your wedding plan is safe — all your information has been preserved. However, no changes can be made until the plan is transferred to a new planner.

Contact your planner directly, or reach out to Vivaah OS support:
[support link or WhatsApp number]
```

---