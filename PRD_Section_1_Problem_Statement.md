# Section 1: Problem Statement and How Might We

---

## 1.1 The Planning Reality No Platform Has Solved

Planning an Indian wedding is one of the most operationally complex personal projects a family will ever undertake. A typical wedding involves 5–6 distinct events across 3–5 days, 10–20 vendors across categories as different as catering, photography, florals, and sound, a budget averaging ₹36.5 lakh with contributions from two families, a guest list averaging 330 people, and a fixed, often auspicious, non-negotiable deadline.

None of that complexity is the problem. Indian families have always managed complex weddings. The problem is that the tools they use to manage them have not evolved — while the complexity has.

The scale of modern Indian weddings has grown. The vendor ecosystem has fragmented. The number of stakeholders with opinions, budgets, and decision rights has expanded across two families, an extended diaspora, and sometimes a professional planner as well. And the primary coordination tool for all of it remains a WhatsApp group.

---

## 1.2 Five Failure Modes of the Current State

The current state produces five distinct, recurring failure modes. These are not edge cases. They are the default experience.

### Failure Mode 1: Critical information lives in the wrong place

Vendor rates are in one person's DMs. Payment deadlines are in a notes app. The caterer's contact is saved under a nickname. The contract is a PDF buried in someone's email. The mehendi artist's cancellation terms were discussed verbally and not written down anywhere.

When the person who holds this information is unavailable — or when a decision needs to be made by someone else — the information is effectively inaccessible. Nothing is structured. Nothing is retrievable. Nothing is shared in a way that survives the person who entered it.

### Failure Mode 2: Budget visibility is always lagging

Most families track wedding spend in a shared Excel sheet or not at all. The sheet is updated in batches, not in real time. By the time someone adds the latest advance payment, two more commitments have been made verbally that no one has logged yet.

The result is that budget health is always unknown. Families routinely discover overspend at the end of the wedding, not during planning. There is no planned vs. committed vs. paid distinction — just a running total that is always out of date.

### Failure Mode 3: Vendor commitments have no accountability layer

A vendor is booked. An advance is paid. And then nothing — until the week before the wedding, when someone realises the confirmation was verbal and the vendor has taken another booking on the same date.

There is no system that tracks vendor confirmation status, monitors which vendors are unresponsive, flags when a payment is overdue, or surfaces when a deliverable deadline is approaching. The follow-up falls on one person, usually the couple or the planner, who is tracking all of it manually across separate conversations.

### Failure Mode 4: Stakeholder misalignment compounds at the worst time

Two families. Different budgets. Different vendor opinions. Different approval authority over different events. In practice, the bride's family controls the mehendi and haldi; the groom's family has views on the baraat; both families have opinions on the caterer; and the couple has their own priorities layered on top of all of it.

This is not just a communication problem. It is a budget and permission architecture problem. The bride's family may be funding three events; the groom's family two others. A vendor decision made by one family can create a budget commitment the other family did not sanction. Approval authority is implicit, event-specific, and almost never documented. When it surfaces as a conflict, it is usually too late to reverse.

There is no shared system that reflects this structure. Decisions made by one stakeholder are invisible to others until they become conflicts. Task ownership is unclear. Budget contributions from each side are not tracked separately. Nobody knows what has been confirmed and what is still pending until someone asks — and asking means a WhatsApp message that gets lost in the thread.

### Failure Mode 5: The planning timeline is driven by urgency, not foresight

In the absence of a structured timeline, planning is reactive. The next thing that gets done is the thing that feels most urgent right now, or the vendor who followed up most recently, or the task that someone happened to remember. The result is a lopsided plan — some categories over-managed, others forgotten until too late.

The muhurat is set. The wedding date is fixed. But the tasks that needed to happen 14 weeks out happen at 6 weeks out. The tasks that needed to happen at 6 weeks out happen in the final 10 days. The final 10 days become a crisis.

---

## 1.3 Why Existing Platforms Do Not Fix This

The three dominant platforms in the Indian wedding space — WedMeGood, WeddingWire India, and WeddingBazaar — are lead-generation marketplaces. Their business model is vendor acquisition and paid placement. Their product is optimised for the discovery phase: helping couples find vendors and helping vendors find couples.

This is useful. But it stops at the point where the real problem begins.

Once a vendor is shortlisted, quoted, and booked through one of these platforms, the platform has no further role. There is no contract tracking. No payment milestone management. No confirmation status. No proactive reminders. No budget ledger. No stakeholder access layer. No AI intelligence of any kind applied to the execution phase.

The platforms are passive directories. They are not planning tools. The shortlist-to-execution gap — the entire operational life of a wedding after the first vendor conversation — is completely unaddressed.

Planner-facing tools such as WedPlan exist but have no couple-facing layer and no AI execution intelligence. They are digital notebooks, not orchestrators.

The gap is not marginal. It is the entire post-discovery phase of every wedding — the phase where money is spent, commitments are made, deadlines are missed, and families either hold it together or fall apart.

---

## 1.4 The Planner's Unsolved Problem

Professional wedding planners carry the execution problem differently — but they carry it just as heavily.

A planner managing 8–12 weddings simultaneously is tracking vendor payment timelines, confirmation statuses, task lists, client communications, and budget health across all of them — in their head, in WhatsApp, and in a combination of spreadsheets that differ by wedding. There is no single view across their portfolio. There is no system that tells them which wedding is most at risk right now and why.

The second problem is replication. Every new client requires rebuilding the same onboarding flow from scratch — collecting preferences, setting up events, briefing the couple on the planning process, establishing communication norms. A planner who has managed 40 weddings has done this 40 times, with no accumulated structure to show for it. Their expertise is real; their systems do not reflect it. There are no reusable templates, no intelligent defaults, no way to translate the knowledge of the last wedding into a faster start on the next one.

These two problems compound. A planner without portfolio visibility cannot triage across weddings. A planner without reusable onboarding cannot scale their client load without scaling their working hours proportionally. The result is a ceiling on how many weddings a planner can manage well — and a floor on how much they must charge to make that load viable.

The planner is the most capable person in the ecosystem, and the most underserved by tools.

---

## 1.5 The Two-Mode Problem

The planning problem is not uniform. It has two structurally different forms.

**When a professional planner is involved:** The problem is primarily one of system and visibility. The planner has the expertise. What they lack is a structured operating system that keeps all weddings organised, surfaces portfolio-level risk, and gives clients the right amount of visibility without creating noise or second-guessing.

**When no professional planner is involved:** The problem is one of capability and structure. The couple and family have the relationships and the decision authority. What they lack is the planning intelligence — knowing what needs to happen, in what order, by when, and what is at risk right now. They are attempting to do a professional's job without professional training or professional tools.

A single product architecture that does not account for this distinction will either over-engineer the self-planned experience or under-serve the planner. Vivaah OS is designed around this distinction from the ground up.

---

## 1.6 Jobs To Be Done

The following eight jobs represent the core functional demands of both user groups. Every V1 feature maps to one or more of these jobs.

| # | Job | Primary Actor | Mode |
| --- | --- | --- | --- |
| J1 | Set up the wedding structure — events, dates, families, and stakeholders — and assign the right access to the right people | Head planner / professional planner | Both |
| J2 | Add vendors to the wedding with their rates, payment terms, and deliverables — and retrieve that information reliably later | Professional planner / head planner | Both |
| J3 | Know exactly what money has been committed, what has been paid, and what is still outstanding — at all times, not in hindsight | Professional planner / head planner | Both |
| J4 | Know which vendors are confirmed, which are unresponsive, and which bookings are at risk — before it becomes a problem | Professional planner / head planner | Both |
| J5 | Have a structured planning timeline that accounts for the actual Indian wedding context — muhurats, multi-event structure, realistic booking windows | All planners | Both |
| J6 | Give the couple and family the visibility they need — progress, logistics, upcoming commitments — without pulling them into operational detail that creates confusion | Professional planner | Mode 1 |
| J7 | Manage multiple weddings simultaneously with a clear portfolio view — knowing which wedding needs attention right now | Professional planner | Mode 1 |
| J8 | Get proactive, intelligent guidance on what to do next, what is at risk, and whether the plan is on track — without having to audit the plan manually | Head planner / couple | Mode 2 |
| J9 | Make decisions I am not trained to make — what to book when, what a fair rate looks like, what I am likely to have forgotten — without hiring a professional planner to tell me | Head planner / couple | Mode 2 |

---

## 1.7 How Might We Statements

### Primary HMW

> How might we give Indian couples, families, and wedding planners a single AI-native operating system — that adapts to whether a professional planner is involved or not — keeping every event, vendor, budget, and stakeholder aligned, proactively surfacing what is at risk, and giving each person exactly the right level of access and information for their role?
> 

### Supporting HMWs by failure mode

| Failure Mode | HMW |
| --- | --- |
| Information lives in the wrong place | How might we make every vendor detail, payment term, and commitment instantly retrievable by anyone with the right access — regardless of who entered it or when? |
| Budget visibility is always lagging | How might we give planners and couples a real-time view of planned, committed, and paid spend — structured enough to catch overruns before they happen? |
| Vendor commitments have no accountability | How might we create a confirmation and payment tracking layer that proactively surfaces vendor risk — without requiring manual follow-up by the planner or couple? |
| Stakeholder misalignment | How might we give every family member exactly the access and information relevant to their role — so that decisions are visible, ownership is clear, and conflicts surface early? |
| Timeline driven by urgency, not foresight | How might we generate an AI-native planning timeline calibrated to the Indian wedding context — and update it proactively when circumstances change? |
| Planner portfolio management | How might we give a professional planner a single view of all active weddings — with health scores that surface which wedding needs attention before it escalates? |
| Planner onboarding replication | How might we let a planner translate the structure and knowledge of every past wedding into a faster, smarter start on the next one — without rebuilding from scratch each time? |
| Self-planned expertise gap | How might we give a couple planning without a professional planner the judgment they lack — surfacing what to do, when to do it, and what they are likely to have missed — before it costs them? |

---