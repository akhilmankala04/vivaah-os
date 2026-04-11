# Section 10: Edge Cases

---

## 10.1 How to Read This Section

Edge cases are the conditions under which the product is most likely to fail or behave unexpectedly. In a wedding planning context, failures are not cosmetic — a missed payment record, a lost vendor confirmation, or a permission error that locks out the head planner during the final two weeks before the wedding has real consequences for real people.

Each edge case is documented with:
- **Condition** — the specific situation that triggers the edge case
- **Risk** — what breaks or degrades if this is not handled
- **Resolution** — the defined product behaviour
- **Mode tag** — which mode(s) this applies to

Edge cases marked **[CRITICAL]** affect data integrity, financial records, or irreversible actions. These must be handled correctly at V1 launch — they are not post-launch iteration candidates.

---

## 10.2 Vendor Model Edge Cases

---

**EC-V01 — Vendor deleted from directory mid-wedding** [CRITICAL]

**Condition:** A planner deletes a vendor from their private VendorDirectory while an active VendorInstance linked to that directory entry exists on one or more weddings.

**Risk:** If VendorInstance records are linked by foreign key to VendorDirectory with a CASCADE delete, deleting the directory entry would orphan or destroy the wedding-specific vendor record — destroying rate, milestone, and confirmation data for an active booking.

**Resolution:** VendorDirectory deletions shall be soft-deletes only (deleted_at flag). VendorInstance records linked to a soft-deleted directory entry shall not be affected — they remain fully functional. The vendor name on the VendorInstance is stored as a denormalised field (per TR-02 schema), so directory deletion does not break the instance record. The directory entry simply no longer appears in future directory searches. No data is lost on any active wedding.

**Mode:** Both

---

**EC-V02 — Same vendor assigned to two events with conflicting payment schedules** [CRITICAL]

**Condition:** A vendor (e.g. a caterer managing both the sangeet and the wedding) is added to two events on the same wedding with separate payment milestone schedules that have conflicting due dates or overlapping amounts.

**Risk:** The budget ledger may double-count the vendor’s committed spend. The payment calendar may show duplicate entries that confuse the planner.

**Resolution:** A vendor added to multiple events on the same wedding is a single VendorInstance with multiple event assignments — not two separate VendorInstances. The negotiated rate and payment milestones belong to the single instance, applied across all assigned events. The payment calendar shows milestones once, with an “Assigned to: Sangeet, Wedding” label. The budget ledger counts the vendor’s rate once. If the planner requires separate rates for separate events (e.g. the caterer charges differently for each), they must create two separate VendorInstances — one per event — and the system does not prevent this, but it surfaces a warning: “This vendor already has a booking on this wedding. Creating a second entry? Confirm to proceed.”

**Mode:** Both

---

**EC-V03 — Vendor status reverted after payment is marked paid** [CRITICAL]

**Condition:** A payment milestone has been marked as paid. Subsequently, the planner attempts to revert the vendor’s confirmation status from Booked to Quoted (e.g. because the booking fell through).

**Risk:** The paid milestone amount remains in the budget ledger’s paid total even if the booking is cancelled. The budget ledger is overstated. The vendor may be removed from the active view but their financial record remains.

**Resolution:** When a vendor status is reverted from any status that has associated paid milestones, the system shows a specific warning before confirming the revert: “This vendor has [X] paid milestone(s) totalling ₹[Y]. Reverting the status will not remove these payment records. You will need to manually mark the milestones as disputed or write them off.” The revert proceeds (with the reason entry), but paid milestones are not automatically changed — they require a separate manual action to mark as disputed. A disputed milestone status is added to the PaymentMilestone status enum: upcoming / due / paid / overdue / disputed. Disputed milestones are excluded from the committed total but remain in the audit log and historical record.

**Mode:** Both

---

**EC-V04 — Vendor booked on the same date for two different weddings (planner’s directory)**

**Condition:** A planner adds the same vendor (from their directory) to two different weddings that share the same event date.

**Risk:** The planner may not realise they have committed the same vendor to two weddings on the same day. The vendor cannot deliver for both.

**Resolution:** When a directory vendor is added to a new wedding and their last-used date matches the event date on the new wedding, the system surfaces a soft warning: “This vendor was last used on [date] — the same date as [event name] on this wedding. Confirm they are available.” This is a warning, not a block — the planner may have already confirmed with the vendor, or the last-used date may be a coincidence. The warning is logged but does not prevent the vendor from being added.

**Mode:** Both

---

**EC-V05 — Vendor rate changed after milestones are already entered**

**Condition:** A planner edits the negotiated rate on a VendorInstance after payment milestones have already been entered. The existing milestones may now total more or less than the new rate.

**Risk:** The budget ledger’s committed total updates to the new rate, but existing milestones may no longer sum to the new rate — creating a discrepancy between the committed total and the milestone schedule.

**Resolution:** When a rate is edited and existing milestones exist, the system shows an inline warning: “Your milestone total (₹[X]L) no longer matches the updated rate (₹[Y]L). Review your milestones to ensure they add up correctly.” A link navigates to the milestones section. No automatic adjustment is made to milestones — the planner must reconcile them manually. The discrepancy is flagged in the completeness indicator until resolved.

**Mode:** Both

---

**EC-V06 — Vendor in directory has no contact information**

**Condition:** A planner has a vendor in their private directory with only a name and category — no phone number, no city — and adds this vendor to a wedding.

**Risk:** The WhatsApp communication flow, confirmation tracker, and out-of-cycle alerts all assume a vendor has a phone number. System functionality that depends on contact data may behave unexpectedly or show blank fields.

**Resolution:** A phone number is not a required field for creating a VendorDirectory entry or a VendorInstance — the data model accepts null for phone. When a vendor with no phone number is added to a wedding, the vendor card displays “No contact number added” in the phone field with an “Add number” link. The confirmation tracker lists this vendor normally but the out-of-cycle alert for unconfirmed vendors within 7 days (EC-W04) does not attempt to send a WhatsApp message to the vendor directly — it only alerts the planner. The completeness indicator flags missing phone number as an incomplete field. The vendor is not blocked from advancing through confirmation statuses.

**Mode:** Both

---

**EC-V07 — Vendor marked as Done before the event date**

**Condition:** A vendor’s confirmation status is advanced to Done before their assigned event has occurred — either accidentally (user misreads the status options) or intentionally (user is pre-recording a completion).

**Risk:** Done status implies the event is complete and the vendor has delivered. The vendor is removed from the 30-day confirmation tracker and from the at-risk section of the AI briefing. If the status is set prematurely, a real unconfirmed or undelivered vendor silently disappears from all monitoring surfaces.

**Resolution:** When a user attempts to advance a vendor’s status to Done and the assigned event date is more than 1 day in the future, the system shows a specific warning: “This vendor’s event ([event name]) is on [date] — [X] days away. Marking them as Done means their event is complete. Are you sure?” This is a confirmation prompt, not a block — the user may have a legitimate reason (e.g. the vendor completed early, or the event was moved offline). If confirmed, the status advances to Done and the vendor exits all monitoring views. The Done status is not revertable (per EC-V03 resolution and S5-9 story). The warning is logged in the audit trail with the pre-event date at the time of the Done status change.

**Mode:** Both

---

---

**EC-M01 — Wedding created as Mode 2 but couple later hires a professional planner** [CRITICAL]

**Condition:** A couple sets up their wedding in Mode 2 (self-planned). Three months in, they hire a professional planner and want to transfer operational control to that planner.

**Risk:** Mode 2 and Mode 1 have fundamentally different permission architectures. There is no clean upgrade path if mode is treated as immutable. The existing head planner (the couple or family member) has entered significant vendor, budget, and task data. A hard reset would destroy that data.

**Resolution:** Mode switching is not available as a self-serve action in V1. The defined resolution for this scenario is:
1. The planner creates a new wedding in Mode 1
2. The head planner exports a summary of the existing plan (vendor list, event dates, budget) via a PDF export (V1 capability to be confirmed during technical scoping)
3. The planner manually sets up the Mode 1 wedding using the exported summary as a reference
4. The Mode 2 wedding is archived by the head planner

This is a friction-heavy resolution, acknowledged as such. A clean mode migration path — preserving all vendor, payment, and timeline data while transitioning permission architecture — is a V2 feature. It is not attempted in V1 because the data migration complexity (converting six Mode 2 access levels to two Mode 1 access levels, re-establishing all participant records, preserving the audit log) exceeds the V1 scope. The limitation must be documented in user-facing help content.

**Mode:** Mode 2 (transition scenario)

---

**EC-M02 — Mode 1 wedding where the couple requests to take over planning**

**Condition:** A couple in a Mode 1 wedding wants to take over planning from their planner (e.g. the planner relationship has ended).

**Risk:** Couple-view access does not permit editing. The couple cannot take over without the planner granting them elevated access or transferring ownership — which Mode 1 does not support as a self-serve action.

**Resolution:** The planner must either: (a) upgrade the couple to a workaround by exporting data and helping them set up a new Mode 2 wedding, or (b) remain as a nominal planner account with the couple as the effective operator (not a clean solution). In V1, if the planner account is deleted, the wedding enters suspended state (EC-O01). The couple must contact support for a resolution path. This is a known V1 limitation. Mode 1 does not have a self-serve planner exit mechanism — this is a V2 roadmap item.

**Mode:** Mode 1

---

## 10.4 Access and Permission Edge Cases

---

**EC-A01 — Head planner role transferred mid-planning, incoming head planner is unfamiliar with the plan** [CRITICAL]

**Condition:** The head planner role is transferred to a participant who has had view-only access and is unfamiliar with the current state of the wedding plan.

**Risk:** The incoming head planner has full edit access immediately on accepting the transfer. They may make changes without understanding the existing vendor commitments, payment schedule, or timeline state.

**Resolution:** On role transfer completion, the incoming head planner’s first session shows an onboarding overlay: “You’re now the head planner for [couple names]’ wedding. Here’s where things stand:” followed by a summary — events, vendor count, committed budget, next payment due, most urgent timeline item. This overlay appears once and is dismissible. It is not a wizard — it is an orientation card that requires one tap to dismiss. The incoming head planner’s full edit access is active immediately; the overlay does not gate any actions. This is the defined balance between immediate capability and orientation support.

**Mode:** Mode 2

---

**EC-A02 — Full-access family member makes a vendor decision that the couple disputes**

**Condition:** In Mode 2, a family member with full access books a vendor (advances status to Booked) or adds a payment milestone that the couple did not sanction.

**Risk:** The committed budget increases. A financial commitment is logged. The couple disputes the decision but the audit log shows it was made by a valid full-access participant.

**Resolution:** The audit log records who made every status change (actor_participant_id). The head planner can view the audit trail per vendor: “Status changed to Booked by [family member name] on [date].” The head planner can revert the status (with a reason entry) — this is a valid use of the status revert mechanism (EC-V03 applies if payments have been marked). The resolution is procedural, not technical: full access grants full authority, and the head planner is responsible for configuring access levels appropriately. The product surfaces the audit trail; it does not adjudicate disputes. This is documented in the onboarding wizard: “Full access lets participants add and edit vendors. Consider task access or event-specific access for family members who should have limited authority.”

**Mode:** Mode 2

---

**EC-A03 — Planner removes couple access during an active wedding (Mode 1)**

**Condition:** A professional planner removes a couple member’s access to their wedding view — whether intentionally (a difficult client relationship) or accidentally.

**Risk:** The couple loses visibility into a wedding they are paying for and have a legal interest in. This is a trust and ethical issue as much as a product issue.

**Resolution:** The system permits the planner to remove couple access (Mode 1 planner controls all access). When a couple-view participant’s access is revoked, they receive a WhatsApp notification — the same notification as any other revoked participant. The product does not prevent this action — it would be architecturally inconsistent to grant the planner full access control except in this one case. However, the ethical constraint is documented: the revoke action for couple members includes a specific warning in the confirmation prompt that does not appear for other participants: “Removing the couple’s access means they will no longer be able to see their wedding plan. This is not reversible without re-inviting them.” The planner must dismiss this warning to proceed.

**Mode:** Mode 1

---

**EC-A04 — Two full-access participants simultaneously edit the same vendor card**

**Condition:** In Mode 2, two participants with full access open the same vendor card at the same time and both attempt to save changes.

**Risk:** One participant’s changes overwrite the other’s — last-write-wins conflict, with no notification to the losing participant.

**Resolution:** V1 implements a last-write-wins strategy for concurrent edits — the same approach used by most SaaS tools at this stage. The product does not implement optimistic locking or conflict resolution in V1. The rationale: concurrent edits to the same vendor card by two participants are rare in practice (a wedding has at most a handful of full-access participants, and vendor card editing is not a high-frequency concurrent action). The audit log captures every change with timestamp and actor, so a lost change can be reconstructed. A warning is shown on save if the record was modified by another user since the current session loaded it: “This vendor card was updated by [name] while you were editing. Your save will overwrite their changes.” A V2 improvement would implement real-time collaborative editing with field-level conflict resolution.

**Mode:** Mode 2

---

**EC-A05 — Participant tries to access wedding data after access is revoked**

**Condition:** A participant whose access has been revoked attempts to access the wedding via their old invite link or a bookmarked URL.

**Risk:** If invite links are persistent tokens and access revocation is not propagated to the token validation layer, the participant may still be able to view data.

**Resolution:** Access revocation invalidates the participant’s session token and marks the invite link as revoked in the database. The invite link token validation checks the participant’s current status on every request — not just on initial load. A revoked participant who taps their old invite link sees: “This invitation is no longer active. Contact the wedding planner if you think this is an error.” No wedding data is returned. The RLS layer enforces this independently — even if a token somehow remained valid, a revoked participant record returns zero rows from all wedding data queries.

**Mode:** Both

---

**EC-A06 — Wrong access level granted and invite already accepted**

**Condition:** A planner or head planner invites a participant with an incorrect access level — for example, a family member is accidentally granted full access instead of view-only. The participant has already accepted the invite and may have taken actions under the elevated access before the error is noticed.

**Risk:** The participant has taken actions (adding vendors, editing budget entries, updating task statuses) under an access level they were not intended to have. Downgrading their access stops future actions but does not reverse past ones.

**Resolution:** Access level can be changed immediately per FR-S23-07 — the change takes effect on the participant’s next request with no grace period and no notification to the participant. Past actions taken under the elevated access level remain in the system and are recorded in the audit log with the actor’s participant ID — the head planner can review what was done and by whom. The head planner must manually reverse any unintended actions (reverting vendor statuses, editing budget entries) using the standard revert and edit mechanisms. The product does not automatically undo actions taken under a previously valid access level — retroactive permission enforcement is not implemented. The audit log is the sole mechanism for reconstructing what happened and who did it.

**Mode:** Both

---

---

**EC-AI01 — Wedding date entered with fewer than 30 days remaining** [CRITICAL]

**Condition:** A user enters a wedding date that is fewer than 30 days away during onboarding.

**Risk:** The AI timeline generation logic assumes a minimum planning horizon. A 30-day (or shorter) horizon cannot accommodate a standard task sequence — many critical vendor categories will be impossible to book at this stage.

**Resolution:** The late-start flag is set and the compressed timeline logic applies. For a horizon of fewer than 30 days, the AI generates a triage plan rather than a full planning timeline: tasks are limited to the most critical vendor confirmations (photographers, caterers, venue — the non-substitutable vendors), payment milestones due before the wedding date, and day-of logistics. The timeline does not include tasks for vendor categories that realistically cannot be sourced in under 30 days (e.g. custom invitations, long-lead décor). These tasks are shown in a separate “Post-wedding or future reference” section if applicable. The user is shown a clear message: “Your wedding is [X] days away. We’ve focused your plan on the most urgent items. Some standard planning steps may no longer be feasible.” No error is thrown — a useful but honest plan is generated.

**Mode:** Both

---

**EC-AI02 — AI generates a timeline but all critical vendor slots are already at risk**

**Condition:** The AI timeline is generated for a wedding where the vendor data shows multiple vendors in Shortlisted or Quoted status with events fewer than 30 days away — i.e. the plan is already behind at the moment of generation.

**Risk:** The AI may generate a timeline that assumes a planning trajectory starting from zero, when the real situation is that the wedding is already at risk.

**Resolution:** The AI generation pipeline reads the current state of VendorInstances as an input (per TR-01-3). If the input data shows vendors at risk, the AI prompt includes this context explicitly: “Note: the following vendor categories have events within 30 days and are not yet confirmed — [list]. Prioritise confirmation tasks for these vendors at the top of the generated timeline.” The generated timeline surfaces these as Week 1 items regardless of standard lead time. The briefing system also picks these up independently (S14, S3). The two systems are redundant by design — the timeline and the briefing both surface the same risk through different mechanisms.

**Mode:** Both

---

**EC-AI03 — User rejects the AI timeline entirely and wants to start from scratch**

**Condition:** After AI timeline generation, a user decides the generated timeline does not fit their wedding and wants to delete all generated tasks and start with a blank timeline.

**Risk:** There is no defined “clear timeline” action in the current feature set — only individual task deletion and regeneration with a diff.

**Resolution:** The user can select all tasks (or all pending tasks) and mark them as skipped in bulk. Alternatively, they can trigger a regeneration with a note that resets pending tasks. However, a “Clear timeline and start fresh” action shall be available from the timeline overflow menu — it removes all AI-generated pending and overdue tasks (not completed or custom tasks) and leaves the user with a blank timeline plus their completed tasks. The action requires a confirmation: “This will remove all [X] pending AI-generated tasks. Completed tasks and your custom tasks will be kept.” Custom tasks (user-created) are never removed by this action. After clearing, the user can add custom tasks manually or trigger a new AI generation.

**Mode:** Both

---

**EC-AI04 — AI briefing generated for a wedding with no vendor, payment, or timeline data**

**Condition:** A briefing is generated for a wedding that was set up but has no vendor cards, no payment milestones, and no timeline tasks — a newly created wedding that has not been populated yet.

**Risk:** The briefing inputs contain no data. The AI may produce a generic, unhelpful output or an error.

**Resolution:** The briefing generation pipeline checks for minimum data thresholds before calling the AI API. If the wedding has zero vendor instances, zero payment milestones, and zero timeline tasks, the system generates a no-data briefing without an API call — a static, pre-composed message: “Your wedding plan hasn’t been set up yet. Add vendors, payment milestones, and generate your timeline to start receiving weekly briefings.” This conserves AI API tokens and prevents a meaningless AI-generated output. The static message is stored as a briefing record and delivered via WhatsApp as usual.

**Mode:** Both

---

**EC-AI05 — AI timeline regenerated after significant manual edits**

**Condition:** A user has made 15+ manual edits to AI-generated tasks (editing titles, dates, categories) and then triggers a regeneration.

**Risk:** The diff preview may show a large number of changes — potentially overwhelming. User-modified tasks are excluded from regeneration, but the diff may still show 20+ items changing, which the user cannot meaningfully review.

**Resolution:** The diff preview groups changes by category (vendor tasks / budget tasks / event tasks / admin tasks) rather than listing them individually. If the diff contains more than 10 changes, a summary is shown first: “Regeneration will update [X] tasks across [Y] categories.” with a “Review all changes” expandable section. The user can accept all changes, review individually, or cancel. User-modified tasks are always shown in a separate “Protected — not changed” section of the diff so the user can see what is being preserved. Regeneration is never forced — the user always has the option to cancel and keep the current state.

**Mode:** Both

---

**EC-AI06 — Weekly briefing for a planner with 50 active weddings produces unreadable output**

**Condition:** A Mode 1 planner managing 50 simultaneous active weddings receives a weekly briefing. The briefing covers all active weddings grouped by risk — at 50 weddings, this could contain hundreds of individual items across all four sections, producing an in-app document of 15,000+ characters and a WhatsApp delivery requiring 5+ split messages.

**Risk:** The briefing is technically correct but practically unusable. A planner cannot meaningfully process 200 briefing items. The WhatsApp delivery becomes a wall of text that the planner ignores.

**Resolution:** The briefing applies a portfolio-level condensation rule when the active wedding count exceeds 10. Above this threshold:
- The briefing switches from full per-wedding detail to a two-tier structure: a portfolio summary header followed by per-wedding sections
- The portfolio summary header shows: total overdue payments across all weddings, total unconfirmed vendors within 30 days across all weddings, total weddings at Critical health score, total weddings at At-risk health score
- Per-wedding sections show only the single most urgent item per wedding — the item with the highest consequence severity (overdue payment before unconfirmed vendor before overdue task)
- A “Full details” deep link per wedding navigates to that wedding’s in-app briefing view for the complete breakdown
- The WhatsApp message uses the condensed format, targeting under 2,000 characters regardless of portfolio size
- Planners who prefer the full detail format can access it via the in-app briefing history for each individual wedding

**Mode:** Mode 1

---

**EC-AI07 — Timeline diff shows zero changes on manual regeneration**

**Condition:** A user triggers a manual timeline regeneration and the system determines that no changes are needed — all pending tasks already reflect the current wedding state, no new tasks are required, and no tasks need rescheduling.

**Risk:** The diff preview shows an empty confirmation dialog. The user sees a blank list and does not understand whether the action succeeded or whether something went wrong.

**Resolution:** When regeneration produces zero changes, the diff preview screen is bypassed entirely. Instead, the system shows a single informational message directly on the timeline view: “Your timeline is already up to date. No changes needed.” This message appears as a brief toast notification that auto-dismisses after 3 seconds — not a modal requiring confirmation. No API call is made to the Anthropic API if the pre-generation input comparison determines that the current timeline already reflects the current wedding state — this comparison is done server-side before the API call to conserve tokens.

**Mode:** Both

---

---

**EC-D01 — Wedding date changed after AI timeline is generated** [CRITICAL]

**Condition:** After the AI timeline has been generated and tasks have been created with specific due dates (week offsets from the original wedding date), the wedding date is changed — either pushed forward or pulled back.

**Risk:** All timeline task due dates become incorrect — they were calculated as offsets from the original date. The payment calendar milestones entered by the user may also become misaligned with the new timeline.

**Resolution:** When the wedding date is changed, the system detects that an active timeline exists and shows a prompt: “Your wedding date has changed. Would you like to update your timeline tasks to reflect the new date?” Two options: “Update timeline” (recalculates all pending task due dates as offsets from the new date, preserving the week structure) or “Keep current dates” (timeline tasks retain their original due dates, which may now be past the wedding date for some tasks). If “Update timeline” is selected, completed tasks are not recalculated — only pending and overdue tasks. Payment milestones are not automatically recalculated — they are vendor-specific financial commitments that the planner must update manually. A note is shown: “Payment milestones are not automatically updated. Review your payment calendar to ensure due dates still make sense.” The date change is logged in the audit log.

**Mode:** Both

---

**EC-D02 — Budget reduced below already-committed vendor total** [CRITICAL]

**Condition:** The head planner or planner reduces the planned budget figure to a value below the current committed total (sum of Booked+ vendor rates).

**Risk:** The budget ledger immediately shows an overspend state. The overspend alert fires. But no vendor commitments are changed — the committed total is a computed figure based on existing vendor instances.

**Resolution:** When a planned budget edit results in a committed total that equals or exceeds the new planned total, the system shows a specific warning before saving: “Reducing your budget to ₹[X]L means you are already ₹[Y]L over budget based on current vendor commitments. Are you sure you want to proceed?” The edit is permitted — the system does not block the user from setting a lower planned budget. On save, the overspend alert fires immediately. The weekly briefing includes the overspend in its budget health section. No vendor data is changed. The user must resolve the overspend by either reverting the budget edit, renegotiating vendor rates, or removing vendor bookings.

**Mode:** Both

---

**EC-D03 — Two payment milestones due on the same day**

**Condition:** Multiple payment milestones from different vendors fall due on the same date — a common occurrence when vendors use standard advance payment schedules (e.g. 50% 30 days before the event).

**Risk:** The payment calendar may be confusing if multiple milestones on the same date are not clearly grouped. The user may miss one if they mark one as paid and assume they are done.

**Resolution:** The payment calendar groups milestones by date. All milestones due on the same date are shown as a grouped cluster with: a date header (“14 March — ₹[X]L due across [Y] vendors”), individual milestone rows below, and a “Mark all paid” option for the date group. Marking individual milestones within the group is also supported. The date group remains visible as a partially-paid group until all milestones within it are marked paid. The budget ledger updates per milestone as each is marked, not in batch.

**Mode:** Both

---

**EC-D04 — Vendor payment milestone due date falls after the wedding date**

**Condition:** A payment milestone is entered with a due date that is after the wedding date (e.g. a balance payment due 7 days after the wedding day, which is a common vendor payment term).

**Risk:** The system may flag this as an anomaly or the confirmation tracker may not handle post-wedding milestones correctly.

**Resolution:** Post-wedding payment milestones are valid and supported. The system accepts any due date — past, present, or future relative to the wedding date. Post-wedding milestones are labelled in the payment calendar with a “Post-wedding” badge so they are visually distinct from pre-wedding milestones. They are included in the budget ledger’s committed total. They appear in the weekly briefing until marked paid. The confirmation tracker does not include them (the confirmation tracker only surfaces pre-event vendor status — not post-event payments). No warning is shown for post-wedding due dates.

**Mode:** Both

---

**EC-D05 — Timeline task due date falls after the wedding date**

**Condition:** A timeline task (AI-generated or custom) has a due date that falls after the wedding date — for example, a thank-you card task or a photographer final payment task.

**Risk:** The timeline view may not handle tasks after the wedding date clearly — the week grouping structure (“X weeks to go”) breaks down once the wedding has passed.

**Resolution:** Timeline tasks with due dates after the wedding date are grouped in a “Post-wedding” section at the bottom of the timeline — not in the week countdown structure. This section shows: task title, due date (absolute date, not a week offset), and status. Post-wedding tasks are included in the weekly briefing until marked complete. The timeline generation AI does not create post-wedding tasks by default — they may be added manually by the user.

**Mode:** Both

---

**EC-D06 — Planned budget never entered (wizard skipped)**

**Condition:** The user skips the budget step in the onboarding wizard and never enters a planned budget figure.

**Risk:** The budget ledger has no planned total to compare against. The committed and paid figures are computed correctly, but the remaining figure and overspend thresholds cannot be calculated. The budget health section of the briefing cannot produce a meaningful output.

**Resolution:** When no planned budget has been entered, the budget ledger shows committed and paid figures only, with a prominent prompt: “Add your planned budget to track your spending.” The remaining figure and progress bar are not shown — they require a planned total to be meaningful. The briefing’s budget health section shows: “No planned budget set. Add a budget total to track overspend.” The briefing is not withheld — it is delivered with an honest statement of the missing data. The completeness signal (QO4) flags the missing budget as an incomplete setup item.

**Mode:** Both

---

**EC-D07 — Onboarding wizard abandoned mid-completion** [CRITICAL]

**Condition:** A user starts the onboarding wizard, completes several steps, and then closes the app, loses connectivity, or navigates away before reaching the summary and confirm screen (Screen 7).

**Risk:** A partial wedding record may or may not have been created. If the wizard is non-atomic (saves incrementally), a partial record exists in the database with incomplete data. If the wizard is atomic (saves only on final confirmation), no record exists and the user must restart from scratch.

**Resolution:** The onboarding wizard is atomic. No Wedding record, Event records, or Participant records are created until the user taps “Create wedding” on the summary screen (Screen 7). All wizard state is held in client-side session storage during the wizard flow. If the user closes the app mid-wizard, the session state is preserved for 24 hours — on returning to the app, the user is shown: “You have an unfinished wedding setup. Continue where you left off?” with options to resume or discard. After 24 hours, the draft wizard state is discarded and the user must start again. This approach eliminates partial records in the database while providing a reasonable resumption window for interrupted sessions. The 24-hour window covers the common case of a planner who starts setup on their phone and continues on desktop, or who is interrupted by a client call.

**Mode:** Both

---

**EC-D08 — Duplicate wedding created accidentally**

**Condition:** A planner or head planner accidentally creates the same wedding twice — same couple names, same date. Two separate wedding records now exist with separate vendor lists, payment calendars, and AI timelines.

**Risk:** Data is split across two records. The planner adds vendors to one, the couple is invited on the other. There is no native merge capability.

**Resolution:** When a new wedding is submitted with couple names and a wedding date that match an existing active wedding on the same planner or head planner account, the system surfaces a soft warning before creating the record: “You already have a wedding for [couple names] on [date]. Are you sure you want to create another?” This is a warning, not a block — destination weddings, same-name coincidences, or a planner managing two separate ceremonies for the same couple on the same date are legitimate scenarios. If the user proceeds, two separate wedding records are created. No automatic merge capability exists in V1 — if the duplicate is accidental, the user must archive one record manually. The archived record’s data is not migrated — the user must re-enter any data from the duplicate into the correct record. This is a V1 limitation. A merge or transfer tool is a V2 consideration.

**Mode:** Both

---

**EC-D09 — Wedding created with zero events**

**Condition:** A user completes the onboarding wizard but deselects all default events and adds no custom events. The wedding record is created with no Event records linked to it.

**Risk:** The AI timeline generator has no events to create tasks against. The confirmation tracker has no event dates to filter by. The vendor category defaults (S29) have no events to attach to. The product is partially broken for this wedding.

**Resolution:** Zero events is a valid wizard completion — the system does not block it, as some couples may be planning a single ceremony they intend to name and configure later. On landing at the wedding dashboard with zero events, a prominent prompt is shown: “Add your first event to get started. Your timeline and vendor tracking depend on having at least one event.” The prompt is informational, not a blocker — the user can still add vendors (they will have no event assignment) and enter a budget. The AI timeline generation is deferred: when the user taps “Generate timeline” with zero events, the system shows: “Add at least one event before generating your timeline.” Timeline generation is not triggered automatically on wizard completion if zero events exist — only the wedding record is created. Once the user adds an event, a “Generate timeline” button appears on the dashboard and the user can trigger generation manually.

**Mode:** Both

---

**EC-D10 — Payment milestone marked paid with a future date**

**Condition:** A user marks a payment milestone as paid and enters a paid date that is in the future — for example, they are pre-recording a payment they have committed to make in 3 days.

**Risk:** The budget ledger’s paid total includes money not yet actually transferred. The paid total overstates real expenditure. Financial planning based on the paid total becomes inaccurate.

**Resolution:** When a user enters a paid date that is more than 1 day in the future, the system shows an inline warning: “The paid date you’ve entered is in the future. Marking this as paid now will include it in your paid total before the payment is made. Are you sure?” This is a warning, not a block — a user may legitimately want to pre-record a scheduled bank transfer or post-dated cheque. If confirmed, the milestone is marked paid with the future date. The budget ledger’s paid total includes it. A visual indicator on the milestone row distinguishes it: “Scheduled — paid date [date]” rather than the standard paid treatment, until the paid date arrives. On the paid date, the indicator resolves to the standard paid style automatically.

**Mode:** Both

---

---

**EC-W01 — Participant does not have WhatsApp on their registered number**

**Condition:** A participant is added with a phone number that does not have WhatsApp registered — common among older family members who use a basic phone or a separate number for WhatsApp.

**Risk:** The invite never arrives. The participant has no way to access their wedding view. The planner or head planner may not realise the invite failed.

**Resolution:** WhatsApp delivery failure is detected within 24 hours via provider webhook (TR-05-4). The planner or head planner receives an in-app notification: “[Name]’s invite could not be delivered via WhatsApp.” The participant management screen shows “Invite failed” with two options: “Resend to a different number” (opens a phone number edit field for that participant) and “Copy invite link” (copies a shareable URL the planner can send via SMS, email, or any other channel). The participant is not blocked from being added to the wedding — they remain as a pending participant until the invite is successfully delivered and accepted.

**Mode:** Both

---

**EC-W02 — Weekly briefing not delivered due to WhatsApp outage**

**Condition:** The WhatsApp Business API or the provider is experiencing an outage at the scheduled briefing delivery time. The briefing is generated successfully but the WhatsApp message cannot be sent.

**Risk:** The planner misses their weekly briefing the week before the wedding — the highest-stakes week.

**Resolution:** The briefing generation and the WhatsApp delivery are decoupled. The briefing is generated and stored in the database regardless of WhatsApp delivery status. If WhatsApp delivery fails, the briefing is still available in-app. An in-app notification is created: “Your weekly briefing is ready. WhatsApp delivery failed — view it in-app.” The WhatsApp send is queued for retry via the messages_queue system (TR-05-8). If the WhatsApp outage resolves within 4 hours, the briefing is delivered. If not, the briefing is delivered in-app only and the user is notified. The briefing is never withheld — only the delivery channel is affected.

**Mode:** Both

---

**EC-W03 — Participant blocks the WhatsApp Business number after receiving an invite**

**Condition:** A participant receives their invite via WhatsApp but blocks the sender (the Vivaah OS WhatsApp Business number) — either deliberately or accidentally.

**Risk:** All future WhatsApp messages to this participant fail silently. The planner receives no notification. The participant receives no briefings, updates, or notifications.

**Resolution:** WhatsApp message delivery to a blocked number returns a failure status from the provider. This is treated identically to EC-W01 delivery failure — the planner is notified via in-app notification and the “Invite failed” status is shown. The system cannot distinguish between a blocked number and an unregistered number at the provider level. The resolution is the same: offer the planner an alternative delivery method (invite link via another channel). Future notifications to this participant are not automatically suppressed — each delivery attempt returns a failure and is logged. The participant can still access their data via their invite link if they have one.

**Mode:** Both

---

**EC-W04 — Critical briefing item requires immediate action but the next briefing is 6 days away**

**Condition:** A vendor goes unconfirmed with 3 days until their event — well after the most recent weekly briefing and before the next one. The confirmation tracker shows the risk but the planner may not be checking the app daily.

**Risk:** The planner misses the vendor confirmation window. The wedding day approaches with an unconfirmed vendor.

**Resolution:** The 30-day confirmation tracker (S14) and the dashboard at-risk strip both surface this in-app. However, for urgent conditions that arise between briefings, the system sends an out-of-cycle WhatsApp alert for two specific triggers:
1. A vendor’s event is fewer than 7 days away and their status is below Confirmed
2. A payment milestone becomes overdue (the scheduled overdue flag at 00:01 the day after the due date)

These out-of-cycle alerts are distinct from the weekly briefing. They use a shorter, more urgent format (WA-07 — to be added to Section 9.8 in a subsequent update). They are not configurable — they are always on. This is the one category of notification the user cannot turn off, because it covers scenarios where a missed notification has direct operational consequences.

**Mode:** Both

---

**EC-W05 — Out-of-cycle urgent alert fails to deliver**

**Condition:** An out-of-cycle WhatsApp alert (triggered by EC-W04 conditions — vendor unconfirmed within 7 days or milestone newly overdue) fails to deliver to the planner or head planner’s phone number.

**Risk:** The most urgent notification category — the one covering imminent operational failures — fails silently. The planner does not know a critical action is needed. The wedding day arrives with an unconfirmed vendor or a missed payment.

**Resolution:** Out-of-cycle alert delivery is treated with higher priority than briefing delivery. The following cascade applies when an out-of-cycle alert fails:
1. Retry immediately after 15 minutes (shorter than the standard briefing retry interval)
2. Retry again after 1 hour if the first retry fails
3. If both retries fail: create a prominent in-app notification that appears as a red banner on the dashboard on next load — not a standard notification badge, but a full-width banner that cannot be missed
4. The in-app banner persists until the user dismisses it — it does not auto-clear
5. The engineering team is alerted via the error monitoring system (NFR-07) if more than 3 out-of-cycle alert delivery failures occur within a single hour — this pattern suggests a provider-level issue requiring immediate attention
6. Unlike standard briefing failures, out-of-cycle alert failures are logged as high-priority events in the error monitoring system regardless of count

**Mode:** Both

---

---

**EC-F01 — One family commits a vendor the other family disputes**

**Condition:** In Mode 2, a participant from the bride’s family (with full or event-specific access) adds and books a vendor for the reception that the groom’s family disputes — either the choice of vendor or the price.

**Risk:** A financial commitment is recorded (VendorInstance status = Booked). A dispute exists between stakeholders. The product has no dispute resolution mechanism.

**Resolution:** The audit log records who booked the vendor and when. The head planner can view this and use it to mediate the dispute. The head planner can revert the vendor’s status from Booked to Shortlisted or Quoted (with a reason entry) — this removes the committed spend from the budget ledger and allows the decision to be revisited. If an advance payment has already been made, EC-V03 applies — the paid milestone must be manually marked as disputed. The product does not adjudicate between families — it provides the audit trail and the revert mechanism. Access level management is the preventive measure: if the groom’s family should not be able to commit vendors for the reception without the bride’s family’s approval, they should be given event-specific access rather than full access.

**Mode:** Mode 2

---

**EC-F02 — Wedding event cancelled after advance payments are made**

**Condition:** One of the wedding events is cancelled — for example, the sangeet is cancelled due to a family bereavement or a venue cancellation. Advance payments have already been made to vendors booked for that event.

**Risk:** Paid milestones for the cancelled event’s vendors remain in the budget ledger. Vendor statuses need to be updated to reflect the cancellation. The AI timeline may still contain tasks for the cancelled event.

**Resolution:** Cancelling an event is a multi-step process:
1. The user marks the event as cancelled from the event settings
2. The system shows a summary: “Cancelling [event name] affects [X] vendors and [Y] paid milestones totalling ₹[Z]L. These records will be retained but marked as cancelled.”
3. On confirmation: the event status changes to Cancelled; associated VendorInstances are marked with a “Event cancelled” note but not archived (the financial record must be retained for the couple’s reference); paid milestones are marked with a “Cancelled event” note but not deleted; timeline tasks for this event are marked as Skipped
4. The budget ledger does not automatically reverse paid amounts — the money may or may not be recoverable from vendors depending on their cancellation terms. The planner/head planner must manually mark recovered amounts as adjustments.
5. A note appears on each affected vendor card: “Event cancelled — confirm refund or credit with this vendor.”

**Mode:** Both

---

**EC-F03 — Two family members with full access simultaneously invite conflicting vendors for the same category and event**

**Condition:** In Mode 2, the bride’s father and the bride’s aunt both independently add different photographers for the same event within minutes of each other — each unaware the other was doing the same.

**Risk:** The wedding now has two vendor instances in the same category for the same event. The budget ledger counts both rates. The planner doesn’t immediately notice.

**Resolution:** When a vendor is added to an event in a category that already has a vendor assigned, the system surfaces a warning: “You already have a [Photographer] for [Wedding]. Adding another will create two bookings in this category. Do you want to continue?” This is a warning, not a block — some events legitimately have multiple vendors in the same category (e.g. two photographers, a primary caterer and a dessert caterer). The user must explicitly confirm to proceed. The warning is logged. The head planner sees a “Duplicate category” indicator on the vendor list for that event, flagging that two vendors share the same category.

**Mode:** Mode 2

---

## 10.9 Offboarding Edge Cases

---

**EC-O01 — Planner account deleted with active weddings in progress** [CRITICAL]

**Condition:** A Mode 1 planner deletes their account while one or more client weddings are in the active planning phase.

**Risk:** The planner’s data is gone. The couple loses access to their operational plan. All vendor, payment, and timeline data is at risk.

**Resolution:** When a planner initiates account deletion, the system checks for active weddings. If any exist, the deletion flow shows a blocking warning: “You have [X] active weddings. Deleting your account will suspend all of them. Your clients will be notified and their data will be preserved for 90 days.” The deletion requires typing “DELETE” to confirm (per the Screen 30 interaction rules). On deletion:
- All active weddings enter suspended state
- All couple participants receive the WA-06 WhatsApp message (wedding suspended)
- The couple can still read their wedding data in couple view during the suspension
- No data is deleted for 90 days — the 90-day recovery window (NFR-06-2) allows account reactivation or data export via support
- After 90 days, data is permanently deleted per the retention policy

**Mode:** Mode 1

---

**EC-O02 — Head planner account deleted before wedding date (Mode 2)**

**Condition:** The head planner of a Mode 2 wedding deletes their account with the wedding still upcoming.

**Risk:** If the head planner is the only full-access participant, no one else can manage the wedding. The wedding is effectively leaderless.

**Resolution:** When a head planner initiates account deletion:
1. If there is another full-access participant: the system prompts the head planner to transfer the head planner role before deleting. If they proceed without transferring, the role automatically transfers to the next full-access participant (earliest created full-access participant record).
2. If there are no other full-access participants: the deletion is blocked with a message: “You are the only person with full access to this wedding. Add another full-access participant and transfer the head planner role before deleting your account.” Deletion is not permitted until either a transfer is completed or the wedding is archived.
3. If the wedding is archived first: deletion proceeds without restriction — there is no active wedding to protect.

**Mode:** Mode 2

---

**EC-O03 — Couple member account deleted before wedding date (Mode 1)**

**Condition:** One member of the couple in a Mode 1 wedding deletes their Vivaah OS account before the wedding.

**Risk:** Their couple-view access is revoked. The other couple member’s access is unaffected.

**Resolution:** Couple-view account deletion is handled identically to participant access revocation — the participant record is marked as revoked, the invite link is invalidated, and no wedding data is affected. The planner receives an in-app notification: “[Name] has deleted their account and no longer has access to the wedding view.” The planner can re-invite the same person (with a new account) if needed. The wedding itself is not affected — it is owned by the planner, not the couple.

**Mode:** Mode 1

---