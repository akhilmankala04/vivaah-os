# Section 4: Objectives and Goals

---

## 4.1 How to Read This Section

Each objective is written in three parts: the goal statement, the rationale connecting it to the problem and architecture, and the validation metric reference from Section 13. Objectives are not feature descriptions — they are the outcomes the product must produce to be considered successful. Features exist to serve objectives. If a feature cannot be traced to an objective, it does not belong in V1.

Objectives are organised across three layers: business objectives (what the company needs the product to achieve), user objectives by mode (what each user type needs to accomplish), and quality objectives (the baseline product standards that all objectives depend on).

---

## 4.2 Business Objectives

### BO1 — Become the primary planning operating system for Indian weddings

**Goal:** Vivaah OS becomes the single place where wedding plans live — not one of several tools a planner or couple uses alongside WhatsApp and Excel, but the tool that replaces them. Success means the plan-of-record for a wedding exists in Vivaah OS, not in a spreadsheet on someone's laptop.

**Rationale:** The product has no value as a supplementary tool. A confirmation tracker that runs alongside a WhatsApp thread adds cognitive load, not intelligence. The product earns its place only when it is the operating layer — the thing that is open, active, and trusted as the source of truth throughout the planning window. This objective is the precondition for every other business objective.

**What it requires:** Sufficient feature completeness at launch that a planner or couple can genuinely replace their existing tools, not just try the product alongside them. This is why V1 includes the full operating layer (payment calendar, budget ledger, confirmation tracker) and not just the architecture features.

**Validation metric:** → S13: Weekly active usage rate among onboarded weddings; percentage of weddings where all vendors are entered into the system (not just a subset); churn rate at 30 and 90 days.

---

### BO2 — Acquire professional planners as the primary distribution channel

**Goal:** The first 100 paying users of Vivaah OS are professional wedding planners, not couples. Each planner who adopts the product brings an average of 8–12 client weddings onto the platform per year organically — making planners a B2B2C acquisition flywheel, not just a user segment.

**Rationale:** Direct-to-couple acquisition at scale requires brand recognition and word-of-mouth density that takes time to build. Planner acquisition is faster, more capital-efficient, and structurally compounding — one planner sale creates multiple couple touchpoints. The portfolio view (S17) and client onboarding template (S18) are the features that make planners switch from their current tools. They are the wedge, not the couple dashboard.

**What it requires:** The planner-facing features must be strong enough to justify a paid subscription before the couple-facing features are mature. A planner who tries the product and finds the portfolio view and onboarding template genuinely better than their current workflow will pay and will bring clients. A planner who finds the product incomplete will not return.

**Validation metric:** → S13: Number of planners acquired in first 90 days; average active weddings per planner account; couple accounts created via planner invitation vs. direct signup ratio.

---

### BO3 — Establish a recurring SaaS revenue base in India's wedding industry

**Goal:** Generate ₹50L in annualised recurring revenue within 12 months of launch, primarily from planner subscriptions. Demonstrate that Indian wedding professionals will pay for execution intelligence at a price point that makes the business viable.

**Derivation:** ₹50L ARR requires approximately 140 planners on a ₹3,000/month subscription, or 200 planners on a ₹2,000/month subscription, or a blended mix across tiers. At a target of 150 paying planner accounts within 12 months — consistent with BO2's first-100-planners objective plus a second cohort — this is achievable at a mid-tier price point without requiring couple paid upgrades to contribute materially. Pricing tiers are detailed in Section 11. This derivation is based on provisional pricing assumptions and will be revised after pricing discovery with the target planner segment.

**Rationale:** The Indian SaaS market has historically been price-sensitive, but the wedding planning segment has demonstrated willingness to pay — WedMeGood's ₹749–₹24,999 pricing for outcome-linked features is the reference point. The planner subscription model (per-month or per-wedding tier) provides predictable revenue that scales with planner portfolio size. Couple freemium drives volume and platform density. Paid couple upgrades are a secondary revenue stream that matures in V2.

**What it requires:** A pricing architecture that is simple enough to adopt without a sales conversation, valuable enough at the free tier to demonstrate product quality, and clearly worth paying for at the paid tier. Pricing is detailed in Section 11.

**Validation metric:** → S13: MRR at 30, 60, 90, and 180 days post-launch; planner plan conversion rate from free trial; average revenue per planner account; couple paid upgrade rate.

---

### BO4 — Build the execution data asset that compounds over time

**Goal:** Every wedding managed through Vivaah OS contributes structured data on planning timelines, vendor categories, budget patterns, and task completion rates. This data makes the AI layer progressively more accurate and differentiates the product in a way that cannot be replicated by a new entrant.

**Rationale:** The AI briefing and timeline features are valuable at launch based on general wedding planning intelligence. They become significantly more valuable as the system accumulates India-specific execution data — which vendor categories get booked latest, which payment deadlines are most commonly missed, which tasks are most often skipped in 4-month planning windows vs. 6-month windows. This is the long-term moat. It compounds with every wedding on the platform.

**What it requires:** Data model discipline from day one. Wedding, event, vendor, and task data must be structured consistently across all users and modes so it is aggregable. This is an argument for standardised category defaults (S29), standardised status lifecycles, and standardised timeline item categories — not just for UX consistency but for data quality.

**Validation metric:** → S13: Total weddings managed on platform (data asset proxy); timeline generation accuracy score (user-reported); briefing action rate (percentage of briefing items acted on within 7 days).

---

### BO5 — Retain planners across client weddings, not just within them

**Goal:** A planner who completes their first wedding on Vivaah OS returns to create their next client wedding on the platform without re-evaluating alternatives. The product becomes the default tool for every new client engagement, not a trial that gets reassessed after each wedding.

**Rationale:** Wedding planning has a natural engagement cliff — a wedding ends, the user's immediate need is resolved, and without a reason to return, churn is the default. For professional planners, the next client wedding is the retention trigger. If the product has genuinely replaced the planner's previous tools, re-evaluation is friction they have no reason to introduce. If it has not, every completed wedding is a churn opportunity. The private vendor directory is the primary retention mechanism — it accumulates value with every wedding a planner manages, making the cost of leaving higher over time. A planner who has built a 60-vendor directory in Vivaah OS will not migrate to a new tool without a significant reason.

**What it requires:** The vendor directory must grow visibly and usefully with every wedding. The planner must feel the accumulated value — seeing the wedding count on a vendor entry, seeing that onboarding the next client is faster because the defaults are pre-populated, seeing that the briefing is more accurate because the category data is richer. This is not a feature — it is a product experience that needs to be designed deliberately.

**Validation metric:** → S13: Planner retention rate at 6 months (percentage of planners who create a second wedding after completing their first); average weddings per planner account at 3, 6, and 12 months; vendor directory size growth per planner over time.

---

## 4.3 User Objectives — Mode 1 (Professional Planner)

### PO1 — Manage all active client weddings from a single view

**Goal:** A planner managing 8–12 simultaneous weddings can see the health of every active wedding in one dashboard, identify which wedding needs attention today without opening each one individually, and act on the most urgent item without losing context on the others.

**Rationale:** The portfolio view (S17) exists entirely to serve this objective. Without it, the product requires a planner to context-switch across 8–12 separate wedding views to assess their overall risk exposure. The health score must be meaningful — not a vanity metric, but a signal derived from overdue payments, unconfirmed vendors, and stalled tasks that tells the planner where to focus.

**What it requires:** S17 must be the first screen a planner sees after login, not a secondary view. Health scores must be computed in real time from the underlying data model. The portfolio view must be fast — a planner checking in for 5 minutes between client calls should not wait for data to load.

**Validation metric:** → S13: Portfolio view session frequency per planner; time from login to first action on a flagged wedding; planner-reported reduction in missed deadlines.

---

### PO2 — Onboard a new client wedding in under 10 minutes

**Goal:** From the moment a planner begins setting up a new client wedding to the point where the AI timeline is generated, events are configured, and the couple has been invited with the correct access level — the process takes no more than 10 minutes.

**Rationale:** Planner onboarding friction is the primary adoption barrier. If creating a new wedding in Vivaah OS takes longer than opening a new Excel sheet or Notion page, planners will not switch. The 10-minute target is the benchmark: it needs to be faster than the planner's current process, not just comparable. The client onboarding template (S18) is the mechanism — a reusable configuration that pre-fills events, access structure, and task defaults from previous weddings.

**What it requires:** The onboarding wizard must be fast, intelligent, and skip-friendly. India-specific defaults (S29) must reduce manual entry. The template system must pre-fill enough that a planner is editing, not creating from scratch. Timeline generation must be near-instant — a spinner that runs for 30 seconds on a first impression will kill adoption.

**Validation metric:** → S13: Median time to complete onboarding wizard per new wedding; template usage rate among planners with 2+ weddings on the platform; planner-reported time savings vs. previous onboarding process.

---

### PO3 — Never miss a vendor payment or confirmation deadline

**Goal:** Zero vendor payment deadlines missed due to lack of visibility. Zero vendor confirmations dropped because no one followed up. The system surfaces every at-risk item before it becomes a problem — not after.

**Rationale:** This is the single most concrete value proposition of the product for planners. A planner who misses a vendor payment risks losing the booking. A planner who fails to confirm a vendor 30 days out risks a vendor no-show. These are not occasional risks — they are the most common source of wedding day failures. The payment milestone calendar (S12), confirmation tracker (S14), and weekly briefing (S3) collectively own this objective.

**What it requires:** Payment and confirmation status must be surfaced proactively, not reactively. The briefing must arrive before the deadline, not on it. WhatsApp delivery is not optional — a planner who misses an in-app notification because they were on a site visit must still receive the briefing via WhatsApp.

**Validation metric:** → S13: Percentage of payment milestones marked paid before due date; percentage of vendors confirmed before the 30-day window closes; planner-reported missed deadlines before vs. after adoption.

---

### PO4 — Give clients the right visibility without creating operational noise

**Goal:** The couple and family assigned to a planner's wedding feel informed and confident — they can see that the plan is progressing, upcoming payments are accounted for, and the schedule is in order — without being pulled into vendor details, budget breakdowns, or operational decisions that are the planner's responsibility.

**Rationale:** Client management is a significant part of a planner's workload. Every time a client asks "what's happening with the caterer?" or "how much have we spent so far?" the planner must stop and respond. The couple view and family view are designed to answer those questions automatically — reducing the inbound load on the planner while increasing client confidence. This is a planner productivity feature as much as a client experience feature.

**What it requires:** The couple view must be genuinely informative — not so restricted that the couple feels in the dark, not so open that they start questioning vendor decisions. The design of what is visible vs. hidden in couple view is a deliberate editorial choice, not a default permission setting.

**Validation metric:** → S13: Planner-reported reduction in client check-in messages per week; couple-reported confidence score at the 30-day and 60-day mark.

---

## 4.4 User Objectives — Mode 2 (Couple and Family)

### CO1 — Get a complete, structured wedding plan from basic inputs

**Goal:** A couple who enters their wedding date, events, and approximate budget into the onboarding wizard leaves with a complete AI-generated planning timeline — sequenced, prioritised, and calibrated to their specific planning window — without needing to know what a good planning timeline looks like.

**Rationale:** This is the J9 job from Section 1: making decisions the couple is not trained to make. The AI timeline (S1) is the product's most visible intelligence feature for Mode 2 users. If it produces a generic, Western-template output that does not account for a 5-month Indian planning window and a 6-event structure, it will be dismissed immediately. If it produces a plan that feels like it was made for this specific wedding, it earns trust and drives continued engagement.

**What it requires:** India-specific timeline defaults are not optional. The late-start resequencing must be meaningful — a couple starting with 14 weeks to go needs a fundamentally different task ordering than one starting with 24 weeks. Muhurat-based dates must be handled natively, not as edge cases.

**Validation metric:** → S13: Percentage of Mode 2 onboarding completions that result in a generated timeline; user-reported timeline relevance score; timeline items completed on schedule at 30 days.

---

### CO2 — Keep all family members aligned without group calls or WhatsApp threads

**Goal:** Every family member with access to the wedding plan has exactly the information they need — no more, no less — and can answer their own questions about schedule, vendors, and upcoming commitments without asking the head planner.

**Rationale:** The coordination cost of a self-planned Indian wedding falls almost entirely on one or two people. Every family member who asks "what time is the sangeet?" or "have we confirmed the photographer?" is adding to that load. The access level system (view only, event-specific, guest) is designed to distribute information to the right person at the right level — so the question gets answered by the system, not by the head planner.

**What it requires:** The access levels must be genuinely differentiated in what they show — a view-only participant should see enough to stay informed; a guest-access participant should see exactly what they need for the day. Onboarding for non-technical family members must be friction-free — a WhatsApp invite link that requires no app download or account setup for guest-access participants is the right model.

**Validation metric:** → S13: Number of unique participants active per wedding; head planner-reported reduction in coordination messages per week; guest access link click-through and engagement rate.

---

### CO3 — Replace spreadsheets and notes apps as the budget tracking tool

**Goal:** The budget ledger in Vivaah OS becomes the couple's single source of financial truth for the wedding — the place they check when they want to know how much has been committed, how much has been paid, and how much remains. Not a spreadsheet. Not a mental estimate.

**Rationale:** Budget anxiety is one of the top reported stressors in Indian wedding planning. The anxiety is not primarily about overspending — it is about not knowing. A couple who can see at any point that ₹18L of their ₹36L budget is committed, ₹11L is paid, and ₹7L is due in the next 6 weeks is in control. A couple who is guessing is not. The budget ledger (S10) owns this objective, but it only works if vendor instances are kept complete — which connects directly to data quality as a user habit.

**What it requires:** The budget view must be immediately readable — planned, committed, and paid as three clear numbers, with the remaining figure prominent. Rupee formatting in lakh denomination throughout. No jargon. The ledger must update automatically as vendor statuses change — the couple should never need to manually reconcile the budget.

**Validation metric:** → S13: Budget ledger session frequency per wedding; percentage of weddings where committed spend is within 10% of planned budget at 60 days; user-reported budget confidence score.

---

### CO4 — Know what needs to happen next without having to figure it out

**Goal:** At any point in the planning process, the head planner or couple can open the product and immediately know the three most important things that need to happen in the next 7–14 days — without auditing the full plan to figure it out themselves.

**Rationale:** This is the J8 job: proactive execution guidance without manual auditing. The weekly briefing (S3) delivers this on a scheduled basis. But the dashboard must also surface the top priorities at a glance — the couple should not need to wait for Monday's briefing to know that the mehendi artist deposit is due in 3 days. The briefing and the dashboard together own this objective.

**What it requires:** The primary dashboard view for Mode 2 must prioritise actionable items over status summaries. The weekly briefing must be delivered via WhatsApp for couples who do not open the app every day. The language must be direct and specific — "Your caterer advance of ₹1.5L is due on 14 March" not "a payment may be coming up soon."

**Validation metric:** → S13: Weekly briefing open rate; percentage of briefing action items completed within 7 days; dashboard session depth (how far users navigate from the primary action items).

---

## 4.5 Quality Objectives

Quality objectives are the baseline standards that all features must meet. They are not success metrics — they are preconditions. A feature that meets its functional requirements but fails a quality objective is not shippable.

### QO1 — WhatsApp-first delivery

Every notification, invite, briefing, and reminder must be deliverable via WhatsApp. In-app delivery is additive. WhatsApp delivery is non-negotiable. A planner on a site visit, a family member with low smartphone engagement, and a couple who hasn't opened the app in a week must all receive critical information without requiring an app session.

### QO2 — India-native formatting throughout

All financial figures in ₹, denominated in lakh and crore. All event names use Indian terminology natively. Date inputs accommodate muhurat-based selection. No Western planning assumptions (12-month timeline, Western event vocabulary, dollar or euro formatting) appear anywhere in the product.

### QO3 — Permission integrity under all conditions

Access level enforcement must hold under all conditions — direct API calls, deep links, shared URLs, and browser inspect tools included. A family-view participant must never be able to access budget or vendor rate data regardless of how they attempt to access it. Enforcement is at the Supabase RLS layer, not the UI layer.

### QO4 — Data completeness feedback

Because the quality of the AI features depends directly on the completeness of the underlying vendor and payment data, the product must actively surface data gaps to the head planner or professional planner. An incomplete vendor card must be visually distinguished from a complete one. A wedding plan with significant data gaps must show a completeness signal — not a blocking error, but a visible indication that the AI briefing and budget ledger are operating on incomplete information.

A vendor card is considered complete when it has: a confirmed status of Booked or higher, a negotiated rate entered, at least one payment milestone with a due date, and an event assignment. A vendor card at Shortlisted or Quoted with no rate is incomplete. A wedding plan is considered to have significant data gaps when more than 30% of vendor cards are incomplete, or when any event occurring within 60 days has no vendors in a Booked or higher status. These thresholds trigger the completeness signal on the dashboard. They do not block any action — they inform.

### QO5 — Mobile-first interface

The primary users of this product — planners on site visits, couples in vendor meetings, family members checking the schedule — access it from a mobile device. Every feature must be fully functional on mobile. Desktop is a valid secondary surface, particularly for the planner portfolio view and budget ledger. Nothing is desktop-only.

### QO6 — Zero-friction participant onboarding for non-technical family members

Getting a participant onto the platform must not require them to create an account, download an app, or navigate a sign-up flow — particularly for guest-access and view-only participants. A family member receiving a WhatsApp invite link must be able to see their relevant information within two taps. Account creation is optional for lower-access participants and should never be presented as a prerequisite to viewing the schedule or logistics. This is a hard UX constraint, not a design preference — a blocked family member who cannot see the sangeet schedule will call the head planner, defeating the purpose of CO2 entirely.

### QO7 — AI output must be specific, India-calibrated, and actionable

The AI features (S1 and S3) must produce output that meets three standards. Specific: every briefing item names the vendor, amount, date, or task it refers to — no generalities. India-calibrated: timelines use Indian event names, Indian booking windows, and Indian payment norms — not Western defaults. Actionable: every briefing item corresponds to a concrete next action the user can take — not an observation without a recommended response. Output that fails any of these three standards is not shippable regardless of technical correctness. This quality objective applies to prompt engineering, output parsing, and the briefing delivery format.

---

## 4.6 Objective-to-Feature Mapping

Each V1 feature maps to one or more objectives. This table confirms that every feature has a clear purpose and every objective has at least one feature delivering against it.

**Global quality objectives:** QO1 (WhatsApp-first delivery), QO2 (India-native formatting), and QO5 (mobile-first interface) apply to every feature in V1 and are not repeated per row. QO3, QO4, QO6, and QO7 are feature-specific and noted where they apply.

| Feature | Business Objective | User Objective | Quality Objective |
| --- | --- | --- | --- |
| S23 — Role and access setup | BO1 | PO4, CO2 | QO3, QO6 |
| S5 — Vendor card (two-layer) | BO1, BO4, BO5 | PO3, CO3 | QO4 |
| S28 — Smart onboarding wizard | BO2 | PO2, CO1 | QO6 |
| S29 — India-specific category defaults | BO1, BO4 | CO1 | QO2 |
| S12 — Payment milestone calendar | BO1 | PO3, CO3 | QO4 |
| S10 — Budget ledger | BO1, BO3 | PO3, CO3 | QO4 |
| S14 — 30-day confirmation tracker | BO1 | PO3 | QO4 |
| S17 — Planner portfolio view | BO2, BO5 | PO1 | — |
| S18 — Client onboarding template | BO2, BO5 | PO2 | — |
| S1 — AI timeline generation | BO1, BO4 | CO1, CO4 | QO7 |
| S3 — Weekly AI briefing | BO1, BO4 | PO3, CO4 | QO7 |