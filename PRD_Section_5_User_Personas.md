# Section 5: User Personas

---

## 5.1 How to Read This Section

Four personas cover the full actor set for V1. Each persona is written with enough specificity to make design decisions from — not marketing archetypes, but operational portraits of real users whose behaviour and constraints should be traceable in every feature decision.

Each persona includes: role and context, demographic snapshot, current tools and workflow, primary jobs to be done (cross-referenced to Section 1.6), key frustrations, what success looks like for them, and design implications — the product decisions that follow directly from this person's specific situation.

The section closes with a prioritisation justification: why Persona 1 is the primary design anchor for V1, and what that means for feature sequencing and interface decisions.

---

## 5.2 Persona 1 — The Professional Wedding Planner

**Name:** Kavya Menon
**Role:** Independent wedding planner, Bangalore
**Mode:** Mode 1 primary operator

### Context

Kavya has been planning weddings for seven years. She runs a one-person operation with two part-time coordinators she brings in for large events. She manages between 10 and 14 weddings per year — at any given time, 6 to 8 are in active planning at different stages. Two might be in the final 30 days. Three might be in the middle 60-day operational window. Two or three more might be newly onboarded, still in the vendor shortlisting phase.

She is not managing weddings one at a time. She is managing a portfolio of weddings simultaneously, each at a different stage of completion, each with its own vendor set, budget, and family dynamics. The cognitive load of holding all of them in parallel — knowing which wedding has a payment due this week, which vendor has gone quiet, which family is getting anxious — is the central operational challenge of her professional life.

Her clients are primarily urban, upper-middle-class families in Bangalore, Hyderabad, and Chennai. Weddings range from ₹25L to ₹90L. Most involve 4–6 events. She manages an average of 15 vendors per wedding.

### Demographic snapshot

- Age: 34
- City: Bangalore, with destination weddings 3–4 times per year
- Business structure: sole proprietor, no formal office
- Annual revenue: ₹28–45L
- Tech comfort: high — uses iPhone, comfortable with web and app tools, but has no patience for tools that require significant setup time per client

### Current tools and workflow

- **WhatsApp:** Primary channel for everything — vendor negotiations, client updates, coordinator briefings, payment confirmations. Has 40–60 active WhatsApp conversations at any time related to current weddings.
- **Google Sheets:** One sheet per wedding, structured differently for each. Tracks vendors, payments, and tasks. Updated manually, usually once every 2–3 days. Falls out of sync with reality quickly.
- **Google Calendar:** Payment deadlines and event dates. Not linked to any other system.
- **Notes app / physical diary:** Vendor contacts, negotiation notes, personal observations about clients and families.
- **Email:** Formal vendor contracts and quotes. Completely disconnected from the rest of her workflow.
- **Memory:** The actual system of record. She knows, for most weddings, what is at risk and what needs to happen next. When she is sick, on a site visit, or simply overloaded, this system fails.

### Primary jobs to be done

- J7: Manage multiple weddings simultaneously with a clear portfolio view — knowing which wedding needs attention right now
- J2: Add vendors with rates, payment terms, and deliverables — and retrieve that information reliably
- J3: Know what money has been committed, paid, and is outstanding — at all times
- J4: Know which vendors are confirmed and which bookings are at risk — before it becomes a problem
- J6: Give clients the right visibility without pulling them into operational detail
- J5: Have a planning timeline calibrated to Indian wedding structure and the actual time available

### Key frustrations

**The portfolio problem.** There is no single view that tells her which of her 8 active weddings needs attention today. She has to open each one, scan her notes, check her calendar, and reconstruct the picture from scratch every morning. This takes 45–60 minutes that should take 5.

**The client check-in load.** Couples message her multiple times a week asking for status updates — "have you confirmed the caterer?", "what's the current total we've spent?" — questions the system should answer automatically. She estimates 30–40% of her client communication time is answering questions that a shared view would eliminate.

**The rebuild problem.** Every new client engagement starts from scratch. She has no reusable template for her preferred event structure, access configuration, or vendor category checklist. Her 7 years of experience has not produced a faster onboarding process — just a more experienced person running the same slow process.

**Vendor accountability without infrastructure.** Following up with unresponsive vendors is entirely manual. She sends a WhatsApp message, waits, sends another, and has no system that tells her which vendors have been silent for more than 10 days across all active weddings simultaneously.

**The handoff gap.** When a wedding gets close to the date and the intensity increases, she relies on her coordinators for follow-through. She has no structured way to delegate tasks with clear ownership and deadline visibility — she forwards WhatsApp messages and hopes.

### What success looks like

Kavya opens the product at 9am and in under 3 minutes knows: which of her active weddings has the highest risk today, which payment is due in the next 5 days, and which vendor across any wedding has gone quiet. She spends the rest of her morning acting on those three things, not figuring out what they are.

A new client calls at 11am. By 11.45am she has created the wedding, configured the events and access levels, invited the couple, and generated the AI timeline — using a template from a similar previous wedding as the starting point. She makes 8 edits, not 80 entries.

### Design implications

1. **The portfolio view is the first screen, not a secondary menu item.** Every login begins with the portfolio. The planner should never have to navigate to a separate section to see their full picture.
2. **Onboarding a new wedding must be faster than a blank spreadsheet.** The template system and India-specific defaults are not nice-to-haves — they are the reason a planner switches. The wizard must require fewer than 15 manual inputs for a standard 5-event wedding when a template is applied.
3. **The product must work during a site visit.** Mobile is not secondary for this persona. Kavya is frequently on-site, in vendor meetings, or in transit. Critical actions — marking a payment made, flagging a vendor unresponsive, checking a briefing item — must be completable in under 3 taps on a mobile screen.
4. **The briefing must arrive before the deadline, via WhatsApp.** Kavya will not open the app every day. The weekly briefing via WhatsApp is the mechanism that keeps her from missing something across 8 simultaneous weddings. It cannot be in-app only.
5. **Data entry must be fast and forgiveness-tolerant.** A planner who is adding a vendor mid-conversation should not need to complete all fields before saving. Required fields should be minimal — name, category, and rate are enough to create a functional vendor card. Everything else can be completed later, with the completeness signal making the gap visible.

---

## 5.3 Persona 2 — The Couple in a Planner-Led Wedding

**Name:** Arjun and Priya Sharma
**Role:** Couple, Mode 1 limited-access stakeholders
**Mode:** Mode 1 — couple view access

### Context

Arjun (31) and Priya (29) are getting married in Hyderabad in five months. They are both working professionals — Arjun in fintech, Priya in product management at a startup. They have hired a wedding planner (Kavya's equivalent in their city) because they do not have the time or the operational bandwidth to manage a 5-event, 350-guest wedding themselves.

They are not passive participants. They care deeply about the outcome — the vendors, the aesthetic, the budget — but they have consciously delegated the execution to a professional. What they want is confidence that things are on track without having to be pulled into the operational detail they hired someone else to manage.

Priya is the more digitally engaged of the two. She tracks the wedding budget mentally and worries about it. Arjun wants to be informed at a summary level and trusts Priya to flag anything that needs his input. Both are active WhatsApp users and check their phones constantly.

### Demographic snapshot

- Ages: 31 and 29
- City: Hyderabad
- Combined household income: ₹28L/year
- Wedding budget: ₹45L, shared between both families
- Tech comfort: high — both use smartphones as their primary computing device
- Planning involvement: engaged but delegated — they want visibility, not control

### Current experience without the product

Without a shared view, Priya messages the planner 3–4 times per week for updates. She maintains her own mental model of the wedding's status — partly from what the planner tells her, partly from what she has observed in conversations, partly from what she has inferred. This mental model is often wrong. She does not know the current committed budget total. She does not know which vendors are confirmed and which are still pending. She finds out about issues when they have already become problems.

### Primary jobs to be done

- Want to know the plan is on track without having to ask
- Want to see the committed budget total without requesting a spreadsheet
- Want to know which vendors are confirmed before they worry about it
- Want family members to be able to see the schedule without calling them

### Key frustrations

**The anxiety of not knowing.** Not knowing whether the photographer has confirmed, whether the catering deposit has been paid, whether the total spend is within budget — produces a background anxiety that persists through the planning window. Information exists; it is just inaccessible without asking.

**Over-communication to stay informed.** The only way to get information is to ask for it. Asking feels like micromanaging the planner they hired to not be micromanaged. There is no middle path between asking and not knowing.

**Family visibility management.** Both sets of parents want to know what is happening. Priya fields calls from her mother asking about the mehendi arrangements. Arjun's father wants to know the reception venue details. Managing family questions is an additional coordination layer that should not fall on the couple.

### What success looks like

Priya opens the product on a Tuesday evening and sees: three events confirmed with vendors, one event with a vendor still pending, total committed spend of ₹31L against a ₹45L budget, and the next payment due — ₹2.5L to the caterer on 18th March. She forwards the schedule view to her mother via WhatsApp. She closes the app reassured. She does not message the planner.

### Design implications

1. **The couple view must answer the three questions they always ask:** Is everything on track? How much have we spent? What is coming up next? These three answers must be on the first screen, without any navigation.
2. **No rates in the couple view — but totals are visible.** Priya does not need to know the photographer costs ₹3.5L. She needs to know that ₹31L of ₹45L is committed. The distinction between itemised rates (hidden) and aggregate totals (visible) is a deliberate design constraint, not a permission oversight.
3. **Sharing schedule information with family must be a single tap.** The couple should not need to navigate to a settings menu to share the sangeet schedule with a parent. A share action on any event should produce a WhatsApp-ready message or link immediately.
4. **Permission-denied states must be graceful.** When Priya encounters something she cannot access — the detailed budget breakdown, a vendor rate — she must not see an error. She sees a clear explanation of what is visible at her access level and a suggestion to ask her planner if she needs more detail. The wall must not feel like a broken product.

---

## 5.4 Persona 3 — The Head Planner in a Self-Planned Wedding

**Note on this persona:** In Mode 2, the head planner role is filled by two distinct types of people. Persona 3A is a family elder — a parent or senior sibling who has been designated as the operational lead. Persona 3B is a member of the couple who takes on the head planner role directly. Both hold the same system permissions. The design implications differ.

---

### Persona 3A — The Family Elder as Head Planner

**Name:** Suresh Iyer
**Role:** Father of the bride, designated head planner
**Mode:** Mode 2 head planner

### Context

Suresh (58) is a retired civil engineer in Chennai. His daughter Meera is getting married in four months. There is no professional planner — Suresh has taken on the coordination role because he is the most organised person in the family, he has the time, and the family trusts him.

He has never planned a wedding at this scale before. He is capable, methodical, and detail-oriented — but he is also the father of the bride, which means he is emotionally invested in every decision, fielding opinions from both families, and managing his wife's anxiety alongside his own. He is doing a professional's job while simultaneously being a participant in the event.

He uses WhatsApp constantly but is not a power user of productivity software. He has tried using Google Sheets for the vendor list and abandoned it after three weeks because it required too much manual maintenance. He is accustomed to structured processes from his engineering career — he responds well to checklists, sequences, and explicit task ownership. He does not know what he does not know about wedding planning, and this uncertainty is a source of stress.

### Demographic snapshot

- Age: 58
- City: Chennai
- Occupation: retired
- Tech comfort: moderate — comfortable with WhatsApp, basic smartphone apps, and web browsing; not comfortable with complex software interfaces
- Role tension: operational lead and emotionally invested family member simultaneously

### Current tools and workflow

- WhatsApp groups: one for each family side, one for vendors, one for the immediate family
- A notebook for vendor contacts and payment notes
- Memory for everything else
- No structured budget tracking — running total in his head, cross-checked with his wife periodically

### Primary jobs to be done

- J1: Set up the wedding structure and assign the right access to the right people
- J5: Have a structured planning timeline that accounts for Indian wedding structure and the actual time available
- J8: Get proactive guidance on what to do next without having to audit the plan manually
- J9: Make decisions he is not trained to make — what to book when, what a fair rate looks like, what he is likely to have forgotten

### Key frustrations

**He does not know what he does not know.** A professional planner knows that the mehendi artist books out 3 months in advance in Chennai. Suresh does not. He will find out when he tries to book one with 6 weeks to go. The AI timeline is the mechanism that solves this — but only if it is genuinely calibrated to Chennai, to a 4-month horizon, and to the specific event structure he has selected.

**The emotional load compounds the operational load.** Every vendor decision becomes a family discussion. His wife has opinions. Meera has opinions. The groom's family has opinions. Managing the decision-making process while also being a participant in it is exhausting. He needs a system that records decisions so they do not need to be re-litigated, and that makes task ownership explicit so he is not the default answer to every question.

**Two families, two sets of expectations.** The groom's family has different ideas about the reception. His wife and the groom's mother disagree about the caterer. Suresh is in the middle. He needs the system to give each family the right level of visibility without making him the information relay.

### What success looks like

Suresh opens the product on Sunday morning and sees a briefing that tells him three things he needs to do this week — one vendor to follow up, one payment to make, one decision to get confirmed before the groom's family changes their mind again. The timeline has already told him that this week is the right time for these three things. He did not have to figure that out.

His wife can see the event schedule and the total budget committed. She does not need to ask him. The groom's family can see the reception details. They do not need to call.

### Design implications

1. **The onboarding wizard must be Suresh-friendly, not Kavya-friendly.** A 58-year-old retired engineer with moderate tech comfort should be able to complete the onboarding wizard without assistance. Steps must be explicit, jargon-free, and one-decision-at-a-time. The India-specific defaults reduce cognitive load — he should not need to know that he needs a mehendi vendor; the system should suggest it.
2. **The AI timeline is the product's primary value for this persona.** Suresh does not need execution automation — he can follow instructions. What he needs is to know what the instructions are. The timeline must be clear, sequenced, and accompanied by enough context that he understands why each item is due when it is.
3. **Task ownership must be explicit and visible.** Every task must have a named owner. Suresh should be able to assign "confirm reception menu" to the groom's father and know, without following up, whether it has been done.
4. **The interface must tolerate moderate tech comfort.** No jargon, no dense information architecture, no multi-level navigation. The primary actions — check what is next, mark something done, add a vendor — should be reachable in two taps from any screen.

---

### Persona 3B — The Couple as Head Planner

**Name:** Nisha Kapoor
**Role:** Bride and head planner
**Mode:** Mode 2 head planner

### Context

Nisha (27) is getting married in Mumbai in five months. She and her fiancé Rohit have decided not to hire a professional planner — they want full control over the decisions and believe they can manage the coordination themselves. Nisha has taken on the head planner role because she is more organised, more detail-oriented, and more comfortable with digital tools than Rohit.

She is a project manager at a consulting firm. She is accustomed to managing complexity, tracking deliverables, and coordinating across stakeholders. She knows what a good project plan looks like. What she does not know is Indian wedding planning specifically — the vendor booking windows, the advance payment norms, the order in which things need to happen.

She is planning this wedding alongside a full-time job. She has roughly 4–6 hours per week to dedicate to wedding planning. She cannot afford to spend those hours figuring out what to do — she needs to spend them doing it.

### Demographic snapshot

- Age: 27
- City: Mumbai
- Occupation: project manager, consulting firm
- Tech comfort: very high — power user of productivity tools, comfortable with complex software
- Time constraint: 4–6 hours per week available for wedding planning
- Planning style: systematic, goal-oriented, high tolerance for information density

### Primary jobs to be done

- J1: Set up the wedding structure efficiently and configure family access correctly
- J3: Know exactly what money has been committed and paid — at all times
- J8: Get proactive guidance on what is at risk and what needs to happen next
- J9: Make decisions she is not trained to make — specifically, knowing what she does not know about Indian wedding planning norms

### Key frustrations

**Time poverty.** Nisha's planning time is limited and finite. Every hour spent figuring out what to do is an hour not spent doing it. She needs the product to front-load the thinking — give her a clear plan and let her execute against it.

**Knowing what she does not know.** She is confident in her ability to execute. She is not confident that she has identified everything that needs to be executed. The gap between "things on her list" and "things that should be on her list" is her primary anxiety.

**Coordinating Rohit and both families without becoming the bottleneck.** Rohit is engaged but not detail-oriented. Both families have opinions and varying levels of digital comfort. Nisha cannot be the information relay for everyone — she needs the system to give each person the right access so they can answer their own questions.

### What success looks like

Nisha spends 90 minutes on Sunday evening processing the week's wedding planning — reviewing the briefing, marking two tasks complete, adding one new vendor, and checking that the budget is still on track. She does not spend any of that time figuring out what to do next. The product has already told her. She shares the updated event schedule with both families via WhatsApp without navigating away from the screen she is on.

### Design implications

1. **Nisha can handle information density that would overwhelm Suresh.** The product must not be designed exclusively for Persona 3A's moderate tech comfort. Power users should have access to the full data model without being shielded from complexity. The interface must accommodate both — simple default views with progressive disclosure for users who want more.
2. **The briefing is her weekly planning session.** For Nisha, the Monday briefing is the trigger for her weekly planning block. It must arrive via WhatsApp before she starts work, contain exactly what she needs to act on, and be structured so she can process it in under 10 minutes.
3. **Budget tracking must be real-time and automatic.** Nisha will not manually reconcile a spreadsheet. The committed and paid figures must update automatically as she adds vendor data. Any manual step between entering a vendor rate and seeing the budget ledger update is friction she will not tolerate.

---

## 5.5 Persona 4 — The Family Stakeholder

**Name:** Anita Iyer (Suresh's wife) / Vikram Sharma (Arjun's father)
**Role:** Family participant — view-only or event-specific access
**Mode:** Both modes (Mode 1 family view / Mode 2 view-only or event-specific)

### Context

Anita is Meera's mother. She is deeply involved in the wedding emotionally and has strong opinions about vendors, décor, and the menu. She is not the operational lead — Suresh is — but she is a constant presence in every decision. She is 54, moderately comfortable with WhatsApp, and not comfortable with unfamiliar apps.

Vikram is Arjun's father. He is less emotionally invested in the details but wants to know the plan — the schedule, the venues, what is expected of him, what he has agreed to fund. He is 62, uses WhatsApp for family communication, and does not want to learn a new tool.

These two represent the range of the family stakeholder persona — from the emotionally involved co-decision-maker (Anita) to the logistically-oriented informed participant (Vikram). Both receive the same access level in V1. The design must serve both.

### Demographic snapshot

- Ages: 54–62
- Tech comfort: low to moderate — WhatsApp-native, unfamiliar with new apps
- Involvement: high emotional investment, limited operational authority
- Primary channel: WhatsApp — any engagement with the product begins with a WhatsApp message

### Access level in V1

**Mode 1:** Family view — event schedule, venues, dress codes, logistics notes. Nothing else.
**Mode 2:** View-only (default) — full plan visible, no editing. Or event-specific, if the head planner assigns them to one event.

**Budget-access variant:** In Mode 2, a family member who is contributing a significant portion of the budget may be granted budget access by the head planner. This variant has full visibility of the budget ledger and payment schedule but cannot edit vendor cards or tasks. This is a distinct use case and should be noted in the access configuration UI — the head planner should be prompted to consider budget access when adding a family member who is a budget contributor.

### Primary jobs to be done

- Know what is happening without having to ask
- Know what the schedule is and what is expected of them
- Know the wedding is on track without understanding the operational detail
- (Budget-access variant) Know how much has been committed from their contribution

### Key frustrations

**Being out of the loop until something goes wrong.** Anita finds out about vendor changes when Meera mentions them in passing. Vikram finds out about schedule changes when his wife asks him about something he has not heard of. Both feel peripheral to a process they are deeply invested in.

**The WhatsApp group is too noisy.** The family WhatsApp group mixes critical information with casual conversation, jokes, and food photos. Anita cannot reliably find the mehendi time in 400 messages. Vikram does not read the group carefully enough to catch the important updates.

**Being asked for opinions on things they cannot see.** Anita is asked "what do you think of this caterer?" via WhatsApp, with no context about what other caterers are being considered, what the budget for catering is, or what the other events' catering arrangements are. Without structured information, her opinions are uninformed and her involvement creates noise rather than value.

### What success looks like

Anita receives a WhatsApp message from the product when the mehendi arrangements are confirmed — vendor name, time, venue, dress code. She does not need to ask Suresh. She opens the event view and sees everything she needs to know about her day. She forwards the dress code to her sister without calling anyone.

Vikram checks the schedule link once a week to see if anything has changed. He does not attend a single planning call. He shows up knowing exactly where to be and when.

### Design implications

1. **WhatsApp is the only reliable delivery channel for this persona.** Anita and Vikram will not open an app proactively. Any information they need must arrive via WhatsApp, unsolicited, at the moment it is relevant. A confirmation notification, a schedule update, a dress code reminder — all via WhatsApp. The app is supplementary for this persona, not primary.
2. **The onboarding experience must require zero learning.** A WhatsApp invite link that opens a clean, single-purpose view with no navigation, no login prompt, and no unfamiliar interface elements is the only viable onboarding path for this persona. If there is any friction between receiving the invite and seeing the schedule, this persona will not complete the flow.
3. **Event-specific access is the right default for operationally involved family members.** A family member who is managing one event — the groom's family managing the baraat, the bride's family managing the haldi — should receive event-specific access that gives them full visibility and editing rights for their event only. This is the access level that matches their real authority structure.
4. **Budget-access prompt for contributors.** When a head planner adds a family member who is identified as a budget contributor, the access configuration screen should surface a prompt: "This person is contributing to the wedding budget. Would you like to give them budget visibility?" This prevents the common omission of giving a major budget contributor view-only access with no financial information.

---

## 5.6 Prioritised Persona: Why Persona 1 Is the Primary Design Anchor

### The four reasons

**1. Distribution leverage.** Every planner who adopts the product brings an average of 8–12 client weddings onto the platform per year. 100 planners equals 800–1,200 couple and family users acquired without a single direct-to-couple marketing campaign. No other persona generates this kind of compounding acquisition. The couple will use the product because the planner put them on it — not because they found it independently.

**2. Highest daily active use.** A professional planner managing 8–12 simultaneous weddings is in the product every day. A couple uses it for 5–6 months and then stops. A family stakeholder uses it intermittently. The planner is the only user whose engagement is daily, sustained, and multi-wedding. Daily active use drives the retention metrics, the data quality, and the product feedback loop that makes V2 decisions possible.

**3. Data quality.** The planner is the most data-complete user. A planner who enters all vendor records, all payment milestones, all confirmation statuses, and all task assignments is the user whose data feeds the AI layer most effectively. The AI briefing is only as good as the data it reads. The timeline is only as accurate as the vendor and event data behind it. Designing for the planner's data entry habits — fast input, low required fields, high completeness signalling — is designing for the intelligence quality of the entire product.

**4. Commercial anchor.** The planner is the paying subscriber. Couple accounts are freemium. A product designed primarily for the couple's free experience, at the expense of the planner's paid experience, is a product that does not generate revenue. The planner must feel the value before they pay. The portfolio view, the client onboarding template, and the weekly briefing are the features that make a planner reach for their card.

### What this means for design decisions

Designing for Persona 1 as the primary anchor produces the following specific decisions:

- The portfolio view is the default landing screen after login, not a secondary view
- The onboarding wizard is optimised for planner speed, with templates and defaults reducing manual input
- The vendor card data model is designed for planner data entry patterns — fast, forgiveness-tolerant, with clear completeness signalling
- The weekly briefing is tuned for a planner managing multiple weddings simultaneously — it must be scannable across weddings, not just detailed within one
- The mobile experience is a primary surface, not a responsive afterthought

### What this does not mean

Designing for Persona 1 first does not mean designing only for Persona 1. The couple view (Persona 2) must be genuinely useful — a planner whose clients find the product confusing or insufficient will stop recommending it. The self-planned experience (Persona 3) must be accessible to non-professional users — the product fails Mode 2 if it assumes Kavya-level sophistication from Suresh.

The design anchor determines which persona's requirements resolve conflicts when they arise — not which persona's needs are the only ones that matter.