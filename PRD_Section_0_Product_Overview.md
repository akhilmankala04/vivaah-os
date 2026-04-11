# Section 0: Product Overview and V1 Scope

---

## 0.1 What We Are Building

Vivaah OS is an AI-native wedding planning operating system built for the Indian market.

It replaces the tools Indian couples, families, and planners currently use to manage a wedding — WhatsApp threads, Excel sheets, physical notebooks, and disconnected reminders — with a single intelligent system that plans, tracks, coordinates, and proactively manages every aspect of an Indian wedding from the moment planning begins to the final payment cleared.

The product is not a vendor discovery marketplace. It is not a wedding inspiration platform. It is an execution orchestrator — the operating layer that takes over once a couple knows what they want and needs to get it done without things slipping.

The core value proposition is execution intelligence: knowing what is at risk before it becomes a problem, knowing which payments are due before the deadline passes, knowing which vendors need confirmation before they go to someone else, and surfacing all of it proactively — without the user having to go looking.

---

## 0.2 The Problem It Solves

Indian weddings are complex, multi-event, multi-family, multi-vendor operations managed almost entirely through informal channels. The average Indian wedding involves 330 guests, 5–6 distinct events (haldi, mehendi, sangeet, engagement, wedding, reception), 10–20 vendors across multiple categories, a budget averaging ₹36.5 lakh, and a planning window of 5–6 months.

That complexity is currently managed through:

- WhatsApp groups that mix decisions with memes and lose critical information
- Excel sheets that go stale the moment the next vendor is added
- Physical diaries that exist on one person's phone or desk
- Planners who carry everything in their head and charge accordingly

The result is missed payment deadlines, vendor double-bookings, last-minute confirmations, budget leakage with no audit trail, and family misalignment that surfaces at the worst possible moment.

Existing platforms — WedMeGood, WeddingWire India, WeddingBazaar — do not solve this. They are lead-generation marketplaces optimised for vendor discovery and paid placement. Once a couple has found a vendor, these platforms offer nothing. No contract tracking. No payment milestones. No confirmation reminders. No proactive intelligence. They are passive directories, not planning tools.

Vivaah OS enters at the point where every existing platform stops.

---

## 0.3 Two Operating Modes

The product is designed around a fundamental structural reality: some Indian weddings are managed by a professional planner, and others are managed directly by the couple and family. These two scenarios require a different product architecture, not just different feature flags.

**Mode 1 — Planner-led**
A professional wedding planner is the primary operator. They have full access to the system. The couple and family are added as limited-access stakeholders who can see progress and logistics but cannot edit, cannot see full budget detail, and cannot override planner decisions. The planner controls all access permissions. This mode is designed to make the planner more effective while keeping clients informed without creating noise or second-guessing.

**Mode 2 — Self-planned**
The couple and family plan without a professional planner. One person from within the couple or family is designated as the head planner with full admin access. Access for all other participants is open and configurable — six levels ranging from full access down to a guest-facing view. The head planner role is transferable. This mode is designed to give a family the structure of a professional operation without needing to hire one.

Mode is set at the wedding level during onboarding. A single user can manage multiple weddings across both modes.

---

## 0.4 Who It Is For

**Primary users (V1):**

- Professional wedding planners — independent operators or small agencies managing 5–20 weddings per year. The primary acquisition target. The B2B2C wedge.
- Couples — urban, tier-1 and tier-2 cities, planning their own wedding directly (Mode 2) or receiving access through their planner (Mode 1 limited view).
- Family members — both bride's and groom's families who have budget contributions, vendor opinions, and approval authority over different events.

**Market context:**

- India wedding services market: ₹228B by 2030, 14.3% CAGR
- Average wedding budget: ₹36.5 lakh
- Average guest count: 330
- 58.6% of couples use WhatsApp as their primary planning channel
- 52% rely on word of mouth for vendor discovery
- Planning horizon in practice: 5–6 months (8 months for destination weddings)

---

## 0.5 V1 Feature Set

V1 comprises 11 features across three build phases. The feature set was derived through a structured process: Jobs To Be Done mapping across both modes (8 JTBDs, 23 solutions generated), followed by a 2×2 Impact vs. Effort matrix, followed by RICE scoring on the high-impact, lower-effort quadrant. Phase order is not arbitrary — each phase depends on the data model established by the previous one. Vendor cards feed the payment calendar. The payment calendar feeds the budget ledger. The budget ledger feeds the weekly AI briefing.

### Phase 1 — Architecture (foundation layer)

| ID | Feature | Modes |
| --- | --- | --- |
| S23 | Role and access setup | Both |
| S5 | Vendor card with two-layer architecture | Both |
| S28 | Smart onboarding wizard | Both |
| S29 | India-specific vendor category defaults | Both |

### Phase 2 — Operating layer

| ID | Feature | Modes |
| --- | --- | --- |
| S12 | Payment milestone calendar | Both |
| S10 | Budget ledger — planned vs. committed vs. paid | Both |
| S14 | 30-day confirmation tracker | Both |
| S17 | Planner portfolio view with health scores | Mode 1 only |
| S18 | Client onboarding template — reusable workflow | Mode 1 only |

### Phase 3 — AI and habit layer

| ID | Feature | Modes |
| --- | --- | --- |
| S1 | AI multi-event timeline generation | Both |
| S3 | Weekly AI briefing — overdue, at-risk, upcoming decisions, budget health | Both |

---

## 0.6 What Is Explicitly Out of V1 Scope

The following are confirmed out of scope for V1, regardless of demand signals or feasibility:

- Vendor discovery marketplace or search
- Shared vendor network across planners (V2 roadmap)
- Contract ingestion or AI document parsing (V2 roadmap)
- Vendor communication log or WhatsApp forwarding (V2 roadmap)
- Quote comparison tool (V2 roadmap)
- WhatsApp bot for family and guest queries (V2 roadmap)
- Day-of runsheet builder (V2 roadmap)
- Logistics and transport coordination (V2 roadmap)
- Planner team task delegation (V2 roadmap)
- Guest-facing social or inspiration experience
- Wedding content, mood boards, or style guides
- Travel or accommodation booking engine
- Family portal shareable links (V2 roadmap)
- Conversational AI planning assistant for self-planned couples (V2 roadmap)

The rationale for exclusion is one of two things: the feature depends on V1 data infrastructure that does not yet exist, or it is a different product category entirely and including it dilutes the execution-orchestration positioning.

---

## 0.7 Key Product Decisions (Locked)

These decisions are architectural and not subject to re-evaluation at the feature level.

**Planning horizon:** 6-month default for all AI-generated timelines. 8 months for destination weddings. The AI flags when a user is starting late and reprioritises the task sequence accordingly. The 12-month global template used by Western planning tools is not used — it does not reflect how Indian couples plan.

**Vendor rates:** Never stored at the directory level. Rates are always wedding-specific and must be entered fresh for every wedding. This is a privacy and trust decision. A planner's past negotiated rates are not their client's business, and cross-wedding rate data would create liability.

**Vendor directory:** Private to each planner in V1. No cross-planner visibility. The shared platform-level vendor network is a V2 feature to be scoped separately with explicit trust architecture design.

**Monetisation:** Subscription-first. Planners are the primary revenue source (SaaS, per-month or per-wedding tiers). Couples are freemium. Vendor rates, couple personal data, and cross-wedding information are never monetised — these are trust decisions, not just ethical positions.

**Notifications and communication:** WhatsApp is a first-class interface. Any notification, invite, or stakeholder communication must be deliverable via WhatsApp. Email and push notification are secondary.

**Financial formatting:** All figures in Indian Rupees (₹), denominated in lakh and crore. No thousands or millions formatting anywhere in the product.

**Event naming:** Indian wedding event names are used natively throughout — haldi, mehendi, sangeet, engagement, wedding, reception. No anglicised substitutes.

**Date inputs:** The onboarding wizard accommodates muhurat-based date selection as a valid and primary input. Many Indian families determine wedding dates through pandit consultation, not personal preference. The product treats this as a first-class input, not an edge case.

**Multi-family structure:** The product accounts for two families — bride's and groom's — who may have separate budget contributions, separate vendor opinions, and separate approval authority over different events. This is a structural constraint on permission design, budget architecture, and stakeholder communication, not a UX preference.

---

## 0.8 How Might We Statement

> How might we give Indian couples, families, and wedding planners a single AI-native operating system — that adapts to whether a professional planner is involved or not — keeping every event, vendor, budget, and stakeholder aligned, proactively surfacing what is at risk, and giving each person exactly the right level of access and information for their role?
> 

---

## 0.9 Document Scope and Structure

This PRD covers the full V1 product. It is structured across 13 sections:

| Section | Content |
| --- | --- |
| 0 | Product overview and V1 scope (this section) |
| 1 | Problem statement and HMW |
| 2 | Context — market, current state, limitations |
| 3 | Product architecture — modes, permissions, vendor model, data model |
| 4 | Objectives and goals — business and user, both modes |
| 5 | User personas — 4 actor types, prioritised |
| 6 | User stories — by feature, mode-tagged, P0/P1/P2 |
| 7 | User flows — master map and all 11 feature flows |
| 8 | Requirements — technical, design, functional, non-functional |
| 9 | Wireframes and prototype |
| 10 | Edge cases — mode-aware |
| 11 | Monetisation and pricing |
| 12 | Go-to-market and launch phasing |
| 13 | Success metrics — dual-sided |

## 0.10 Go-To-Market Wedge

The primary acquisition channel is the professional wedding planner. Planners are the B2B2C flywheel — every planner who adopts the product brings their clients onto the platform organically. Planner acquisition therefore precedes couple acquisition as a deliberate strategy, not an afterthought.

This sequencing has direct implications for feature prioritisation. S17 (planner portfolio view) and S18 (client onboarding template) are higher GTM priority than the couple-facing dashboard, even though the couple dashboard serves a larger eventual user base. The portfolio view and onboarding template are the features that make a planner's daily operation meaningfully better — and they are the reason a planner recommends the product to the next client.

Direct-to-couple (Mode 2) is a parallel acquisition channel. It is not the primary V1 bet. Mode 2 scales once the planner channel has established product credibility and platform density.