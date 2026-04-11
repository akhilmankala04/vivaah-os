# Section 11: Monetisation and Pricing

---

## 11.1 Revenue Model Overview

Vivaah OS is a subscription-first SaaS product. The primary revenue source is professional wedding planners (Mode 1). The secondary revenue source is self-planned couples and families (Mode 2 paid tier). Lead generation, vendor placement, and data monetisation are explicitly excluded from the revenue model — permanently, not as a V1 deferral.

The revenue model is built on three principles:

**Planner-first monetisation.** Planners are the paying anchor. They have a clear, quantifiable ROI case: a tool that saves 3 hours per wedding across 12 weddings per year is worth paying for. Their subscription revenue is recurring, predictable, and grows with their portfolio. Couple revenue is supplementary and conversion-dependent.

**Value before gate.** The product earns trust before it asks for payment. Planners get a free trial with real functionality — not a demo. Couples get a usable free tier — not a locked teaser. The paid tier unlocks more, not the basic product.

**Trust through what we never charge for.** Vendor rates, couple personal data, and cross-wedding vendor information are never monetised. This is a trust decision that enables the product to be positioned as a neutral operating system — not a marketplace with financial incentives to push certain vendors or expose certain data. The decision is locked and is not revisited in V2.

---

## 11.2 Mode 1 Pricing — Professional Planner Subscription

### Pricing philosophy

Planners pay for a tool that makes them more efficient, more reliable, and more capable of managing a larger portfolio. The pricing must be:
- Below the cost of the time saved in the first month
- Structured so the planner’s cost grows with their portfolio, not ahead of it
- Simple enough to adopt without a procurement conversation or sales cycle

### Tier structure

**Free trial — 14 days, full access**
All paid features unlocked. No credit card required at signup. Converts to a read-only restricted state at the end of 14 days if no paid plan is selected — not to Starter automatically. The planner receives three in-app and WhatsApp nudges during the trial: at day 7 (“You have 7 days left — here’s what you’ve built”), at day 12 (“2 days left — your weddings will become read-only if you don’t upgrade”), and at day 14 (“Your trial has ended. Upgrade to keep editing your weddings”).

**Trial expiry behaviour:** On day 15, if no paid plan is active, all wedding data is preserved but the planner cannot make any edits — vendor cards, payments, tasks, and participants are read-only. The wedding dashboards and portfolio view remain accessible. The planner can upgrade at any time to restore full edit access. Data is never deleted during the trial expiry period. If no upgrade occurs within 60 days of trial expiry, the account enters the standard inactive state (data retained per NFR-06-2).

**No permanent free planner tier:** There is no permanently free tier for professional planners. The product is a paid professional tool. A permanent free tier for planners would degrade the revenue model and signal insufficient value. Part-time or emerging planners who manage fewer than 2 weddings per year are served by the Starter tier — at ₹2,499/month, the cost is recoverable within the first client engagement. If pricing discovery reveals strong resistance to any paid tier among low-volume planners, a limited free tier (1 active wedding, no AI briefing) may be introduced as a V1.1 pricing experiment. This is explicitly not a V1 commitment.

---

**Starter — ₹2,499/month**

Designed for: independent planners managing 1–3 active weddings simultaneously.

Includes:
- Up to 3 active weddings simultaneously
- Full vendor card and two-layer directory — unlimited vendors
- Payment milestone calendar
- Budget ledger
- 30-day confirmation tracker
- AI timeline generation — up to 3 timelines per month
- Weekly AI briefing — all active weddings
- Client onboarding template — up to 3 saved templates
- Couple and family view access for all weddings
- WhatsApp delivery for all notifications and briefings
- Portfolio view — up to 3 weddings

Limits:
- 3 active weddings maximum
- 3 saved templates maximum
- AI timeline regenerations: 5 per wedding per month

---

**Growth — ₹4,999/month**

Designed for: planners managing 4–12 active weddings, growing their business.

Includes everything in Starter, plus:
- Up to 15 active weddings simultaneously
- Unlimited saved templates
- AI timeline regenerations: unlimited
- Priority briefing generation (briefing generated within 1 hour of scheduled time, vs. standard 4-hour window)
- Portfolio health score with full breakdown — all active weddings
- Client onboarding template with event-level task defaults

Limits:
- 15 active weddings maximum

---

**Agency — ₹9,999/month**

Designed for: boutique agencies and high-volume planners managing 15+ weddings simultaneously.

Includes everything in Growth, plus:
- Unlimited active weddings
- Up to 3 planner seats — additional team members can log in under the same agency account with their own planner-level access (each seat sees only their assigned weddings by default; the account owner sees all)
- Dedicated onboarding support (1 setup call with the Vivaah OS team)
- Priority support response — 4-hour SLA vs. standard 48-hour SLA
- Early access to V2 features as they are released (shared vendor network, contract ingestion, quote comparison)
- Usage analytics — time saved per wedding, briefing action rates, portfolio health trends

Limits:
- None on weddings or features
- 3 planner seats included; additional seats at ₹2,499/seat/month

**Multi-seat note:** Starter and Growth tiers are single-seat plans — one login per account. An agency or team practice requiring multiple simultaneous planner logins must be on the Agency tier. Shared login credentials on single-seat plans are not permitted and may result in account suspension.

---

### Annual billing discount

All tiers are available on annual billing at a 20% discount (equivalent to getting approximately 2.4 months free):
- Starter annual: ₹23,990/year (equivalent to ₹1,999/month)
- Growth annual: ₹47,990/year (equivalent to ₹3,999/month)
- Agency annual: ₹95,990/year (equivalent to ₹7,999/month)

Annual billing is offered at checkout but not pushed as the default — monthly billing is the default to reduce friction at first conversion.

**Annual billing conversion incentive:** In addition to the price discount, annual billing subscribers receive:
- Early access to V2 features (all tiers, not just Agency) — specifically the shared vendor network beta when it launches
- Priority onboarding support — a 30-minute setup call with the Vivaah OS team (Starter and Growth annual subscribers; Agency already includes this)
- The annual billing choice is presented at the first paid plan selection with a clear side-by-side comparison: “Monthly: ₹2,499/month — Annual: ₹23,990/year (save ₹5,998 + get early V2 access)”

The combination of financial savings and early feature access is designed to make annual billing a meaningful choice rather than a passive discount. Target: ≥25% of paid planners on annual billing within 90 days of launch (per 11.8 post-launch pricing signals).

---

### Revenue derivation (cross-reference to BO3)

BO3 targets ₹50L ARR within 12 months. The derivation:

| Scenario | Planners | Average plan | Monthly revenue | ARR |
| --- | --- | --- | --- | --- |
| Conservative | 100 Starter + 30 Growth + 5 Agency | Blended ₹3,400/month | ₹4.6L/month | ₹54.8L |
| Base case | 80 Starter + 50 Growth + 10 Agency | Blended ₹4,100/month | ₹5.5L/month | ₹66.4L |
| Upside | 60 Starter + 70 Growth + 20 Agency | Blended ₹5,200/month | ₹7.8L/month | ₹93.6L |

The ₹50L ARR target is achievable at the conservative scenario. The base case produces ₹66L ARR — 32% above target. All scenarios assume 0 couple paid revenue, making couple monetisation a pure upside driver.

---

### Planner churn and retention

The primary retention mechanism is the private vendor directory. A planner who has built a 60-vendor directory over 8 weddings carries an asset they cannot export to a competitor without rebuilding it. This is the compounding switching cost described in BO5. The pricing model reinforces this: the directory is included at all tiers, so planners are always building the asset even on the free trial.

### Tier downgrade behaviour

When a planner downgrades from a higher tier to a lower tier — for example, from Growth (15 active weddings) to Starter (3 active weddings) — the following rules apply:

- **Active weddings above the new limit become read-only immediately on the billing cycle change.** A Growth planner with 12 active weddings who downgrades to Starter will have 9 weddings become read-only. They can view all data but cannot edit vendor cards, add milestones, or manage participants on read-only weddings.
- **The planner chooses which weddings remain active** up to the new tier limit. A selection screen is shown at downgrade time: “Choose up to 3 weddings to keep active. Others will become read-only.” If no selection is made within 48 hours, the system keeps the 3 most recently active weddings as active and marks the rest read-only.
- **Read-only weddings are not deleted.** All data is preserved. The planner can upgrade at any time to restore edit access to all weddings.
- **WhatsApp briefings continue for active weddings only** after downgrade. Read-only weddings are excluded from the briefing generation job.
- **Saved templates above the new limit** are marked as inactive. The planner can view them but cannot apply them to new weddings until they upgrade or manually delete templates to bring the total within the new limit.

---

## 11.3 Mode 2 Pricing — Couple and Family Freemium

### Pricing philosophy

Couples are the largest eventual user base but the most price-sensitive and least commercially urgent. The Mode 2 pricing model is designed to:
- Provide genuine value for free — not a deliberately crippled free tier
- Gate features that require ongoing AI compute cost (briefing generation, timeline regeneration)
- Anchor paid pricing to the WedMeGood willingness-to-pay evidence (₹749–₹24,999 for outcome-linked execution help)
- Never gate features that would make the product feel broken or incomplete at the free tier

### Tier structure

**Free tier — ₹0, permanent**

Includes:
- 1 active wedding
- Smart onboarding wizard — full access
- AI timeline generation — 1 generation on setup, 1 regeneration per month
- Vendor card with two-layer directory — up to 15 vendors
- Payment milestone calendar — unlimited milestones
- Budget ledger — planned, committed, and paid
- 30-day confirmation tracker
- Participant management — up to 10 participants
- India-specific vendor category defaults
- WhatsApp delivery for invites and milestone alerts
- View-only and guest access for family members

Limits:
- 15 vendor cards maximum
- 1 AI timeline regeneration per month
- Weekly briefing: not included — replaced by a monthly summary (system-generated, no AI, lists overdue items and upcoming milestones)
- No briefing history

---

**Essential — ₹999 one-time payment**

Designed for: couples who want the weekly AI briefing and unlimited vendor cards for the duration of their planning window.

Includes everything in Free, plus:
- Unlimited vendor cards
- Weekly AI briefing — full four-section format, WhatsApp delivery
- Briefing history — all stored briefings accessible
- Unlimited AI timeline regenerations
- 20 participants maximum (up from 10)

One-time payment: the couple pays once for the duration of their wedding planning. The payment unlocks all Essential features until the wedding is marked complete and archived. This avoids subscription friction for a category where the engagement window is 5–6 months.

Rationale for ₹999: this is the mid-point of WedMeGood’s ₹749–₹24,999 willingness-to-pay range, positioned as a low-risk, outcome-linked purchase. At ₹36.5L average wedding spend, ₹999 is 0.003% of the total budget — well below the threshold where couples deliberate meaningfully.

---

**Complete — ₹2,499 one-time payment**

Designed for: couples managing complex multi-event weddings with large guest counts and multiple family stakeholders.

Includes everything in Essential, plus:
- Unlimited participants
- Priority AI briefing generation (briefing generated within 1 hour of scheduled time)
- Budget health projections — AI-generated spend trajectory based on current committed rate
- Multi-event budget allocation — set per-event budget targets within the total planned budget
- Exportable plan summary — PDF export of vendors, payment schedule, and event timeline (relevant to EC-M01 mode switching resolution)

One-time payment: same model as Essential.

Rationale for ₹2,499: top of the accessible willingness-to-pay range for self-planned couples, below the threshold that would require household budget approval. Targets couples managing weddings of ₹25L+ where the cost of a missed payment or vendor error far exceeds ₹2,499.

---

### Couple freemium conversion triggers

The free tier is designed to be genuinely useful. Conversion to paid is triggered by natural limits, not artificial crippling. The three highest-conversion moments are:

1. **15-vendor limit reached** — the couple has added 15 vendors and tries to add a 16th. The upgrade prompt appears: “You’ve reached the vendor limit on the free plan. Upgrade to Essential to add unlimited vendors and unlock weekly briefings.” This is the highest-intent conversion moment — the couple has engaged enough to fill the free tier.
2. **First weekly briefing week passes** — the couple receives a monthly summary instead of a weekly briefing. The summary includes a note: “Upgrade to Essential to receive a weekly briefing with overdue, at-risk, and upcoming decisions — delivered to your WhatsApp every Monday.” This is an education moment — the couple sees what they are missing.
3. **Complex wedding detected** — when a couple has 5+ events, 10+ vendors, and 8+ participants, the product surfaces a one-time upgrade prompt on the dashboard: “Your wedding is large. Upgrade to Complete for unlimited participants, per-event budgets, and priority briefings.” This targets the Complete tier directly.

---

### Couple pricing cross-reference

The couple pricing is deliberately simple — two tiers, one-time payment. It avoids:
- Monthly subscription friction (couples disengage from tools between planning sessions)
- Per-feature microtransactions (erodes trust and creates anxiety about using the product)
- A paywall on the core operating system features (budget ledger, payment calendar, confirmation tracker — these are always free)

### Couple one-time payment lifecycle

The one-time payment model requires clear rules about what “duration of wedding planning” means in edge cases:

**Wedding postponed:** If a couple’s wedding date changes to a later date after they have paid for Essential or Complete, their paid access continues without any additional charge. The one-time payment covers the planning window for that wedding regardless of how long the window extends. There is no expiry date on the paid access — it lasts until the wedding is marked as archived.

**Second ceremony or celebration:** Indian weddings frequently involve multiple ceremonies across different dates — sometimes spread across weeks or registered separately (civil ceremony, religious ceremony, reception). If all ceremonies are set up as events within the same wedding record, the one-time payment covers all of them. If a couple creates a second separate wedding record (a new wedding in the system), they would need to pay again for the new record. The product is clear about this at the point of creating a second wedding: “You already have an active wedding. Creating a new wedding will start a new planning window.” This is an edge case to be documented in user-facing help content.

**Upgrade from Essential to Complete:** If a couple on Essential upgrades to Complete, they pay the difference — ₹1,500 (₹2,499 minus ₹999 already paid). The upgrade is applied immediately. This is a top-up model, not a separate charge.

**Post-wedding access:** After the wedding date has passed and the wedding is marked as archived, paid access features (weekly briefing, unlimited vendors) are no longer active — the wedding is complete. Historical data remains accessible in read-only mode indefinitely at no additional charge.

---

## 11.4 Revenue Model Rationale

### Why subscription over lead-generation

Lead-generation is the dominant monetisation model in the Indian wedding market (WedMeGood, WeddingWire India, WeddingBazaar). It is also the model most responsible for eroding trust — fake leads, paid placement distorting search results, and vendor ghosting after platform-facilitated contact.

Subscription monetisation aligns incentives correctly: the product earns revenue when users find it valuable enough to keep paying. Lead-gen earns revenue when vendors pay for visibility — regardless of whether the leads are good or the couples are satisfied. The subscription model is the reason Vivaah OS can position as a neutral, couple-first operating system. Lead-gen would make that positioning a lie.

### Why planner-first over couple-first

Couples are a larger eventual market but a harder immediate acquisition. They need to hear about the product, trust it enough to try it, and convert — three steps with significant drop-off at each. Planners have a concentrated economic incentive: a tool that makes their business more efficient directly increases their revenue capacity. One planner conversion brings 8–12 couple touchpoints. The planner-first model scales acquisition without scaling the marketing spend proportionally.

Additionally, planners are the highest-quality data contributors. A planner who enters complete vendor data, payment milestones, and confirmation statuses across 12 weddings per year generates the execution data that makes the AI layer better. Couple-first acquisition risks onboarding users who enter partial data, generating lower-quality training signal and a less useful product for everyone.

### Why per-month over per-wedding for planners

A per-wedding model would charge planners ₹X per wedding created. This has intuitive appeal — planners only pay when they use the product. But it creates two problems: planners delay creating new weddings to avoid triggering a charge, which degrades the data quality and the briefing accuracy; and revenue becomes lumpy and unpredictable, dependent on the planner’s client intake rate rather than their ongoing platform engagement.

Per-month subscription decouples revenue from individual wedding creation events. The planner pays to access the platform, not to use individual features. This aligns with how planners think about their tools — as overhead costs of their business, not per-transaction costs.

### Per-wedding as an alternative (noted for pricing discovery)

Per-wedding pricing remains a valid alternative to test with planners during the pricing discovery process recommended in the BO3 derivation note. A per-wedding model at ₹1,999–₹3,999 per wedding (covering the active planning window) may appeal to planners who manage fewer than 4 weddings per year and resist monthly subscription overhead. If pricing discovery reveals strong preference for per-wedding billing, the Starter tier can be offered as both a monthly subscription and a per-wedding alternative. This is a pricing discovery decision, not a product architecture decision.

---

## 11.5 What Is Never Monetised

The following are permanently excluded from monetisation. These are trust decisions, not V2 roadmap items.

**Vendor rates.** A planner’s negotiated rates are the product of their vendor relationships and commercial judgement. They are not platform data. Monetising access to rate benchmarks or rate comparisons would create a direct conflict between the platform’s financial interest and the planner’s competitive advantage. Vendor rates stay private, stay wedding-specific, and are never aggregated or sold.

**Couple personal data.** Names, phone numbers, wedding dates, event details, and budget figures are operational data used to deliver the product. They are not an asset to be sold to advertisers, lead generators, or third parties. The platform earns money from the people whose data it holds — not from selling that data to others.

**Cross-wedding vendor information.** The fact that a specific vendor has been used across multiple weddings on the platform is platform metadata. It is not surfaced to other users, sold to vendors for marketing, or used to create a vendor rating system without explicit opt-in. In V2, a shared vendor network will be built with explicit planner consent and vendor opt-in — not by surfacing existing data without permission.

**Access levels and permissions.** The permission model is not a monetisation lever. Couple-view access, family-view access, and the six Mode 2 access levels are free at all tiers. The product does not charge for adding more participants or for giving them more visibility. Gatekeeping access would undermine the product’s core value of keeping all stakeholders aligned.

---

## 11.6 V2 Monetisation Hooks

The following are out of V1 scope but represent the primary incremental revenue opportunities once the platform has sufficient scale and data density.

**Shared vendor network access — planner add-on**
In V2, planners can opt their directory into a platform-level shared vendor network. Access to the aggregated network (vendor discovery with trust signals, booking frequency data, planner endorsements) becomes a premium add-on on top of the existing planner subscription. Estimated pricing: ₹1,500–₹2,500/month additional. Requires separate scoping of trust architecture and vendor opt-in mechanics.

**Premium AI features — planner add-on**
Contract ingestion (S6), quote comparison (S9), and proactive vendor deadline nudges (S8) are AI-intensive features that require significant per-wedding API compute. These will be offered as a premium add-on rather than included in base subscriptions — likely ₹999–₹1,999/wedding or as a monthly add-on. Requires V1 data model foundation to be in place before scoping.

**Conversational AI assistant — couple paid feature**
S27 (conversational AI planning assistant for Mode 2 couples — “Is ₹8L for catering reasonable for 300 guests?”) is a high-value, high-compute feature. In V2 it becomes a paid feature on the Complete tier or a standalone add-on at ₹499–₹999 for a planning-window access pass.

**Concierge add-on — couple paid feature**
A human-assisted planning service for couples who want the product plus access to a verified planner for advice calls. Priced at ₹4,999–₹9,999 for a fixed number of advisory sessions. Not a product build — a service layer on top of the existing platform.

**WhatsApp bot for families — freemium unlock**
S11 (WhatsApp bot answering family queries in real time using live plan data) is computationally inexpensive but operationally complex to set up. In V2 it becomes a premium feature on the Complete tier or an add-on for Mode 2 users who want to deflect family queries without giving them app access.

**Family portal — couple paid feature**
S21 (shareable no-login family portal with full schedule, venue details, dress codes, travel information, and logistics pack) extends the basic family view into a richer, branded experience. The basic family view (event schedule, venue, dress code) is free at all tiers. The enhanced family portal — with a custom URL, logistics pack, accommodation details, transport assignments, and a downloadable PDF for each family member — becomes a paid feature on the Complete tier or a standalone add-on at ₹499–₹799 for the planning window. This is a natural upsell for weddings with out-of-town guests or multi-city logistics.

---

## 11.7 Pricing Summary

| Plan | Who | Price | Active weddings | Weekly AI briefing | Vendor limit | Participant limit |
| --- | --- | --- | --- | --- | --- | --- |
| Planner free trial | Planner | ₹0 / 14 days | 3 | Yes | Unlimited | Unlimited |
| Planner Starter | Planner | ₹2,499/month | 3 | Yes | Unlimited | Unlimited |
| Planner Growth | Planner | ₹4,999/month | 15 | Yes | Unlimited | Unlimited |
| Planner Agency | Planner | ₹9,999/month | Unlimited | Yes | Unlimited | Unlimited |
| Couple free | Couple / Family | ₹0 | 1 | No (monthly summary) | 15 | 10 |
| Couple Essential | Couple / Family | ₹999 one-time | 1 | Yes | Unlimited | 20 |
| Couple Complete | Couple / Family | ₹2,499 one-time | 1 | Yes (priority) | Unlimited | Unlimited |

*Planner participant limits are per-wedding, not per-account. There is no cap on participants per wedding on any planner tier.*

---

## 11.8 Pricing Discovery Requirements

The prices above are launch anchors, not locked-in figures. The following pricing discovery activities must be completed before the V1 launch date to validate or adjust these anchors:

**Planner pricing discovery (required before launch):**
- 20 interviews with target planner personas (independent planners, 5–20 weddings/year, tier-1 and tier-2 cities)
- Van Westendorp Price Sensitivity Meter for the Starter tier: identify “too cheap to be credible”, “good value”, “expensive but acceptable”, and “too expensive” price points
- Test monthly vs. per-wedding billing preference directly — offer both options and measure conversion
- Target: confirm or adjust the ₹2,499 Starter anchor within ±30% before launch

**Couple pricing discovery (required before launch):**
- 15 interviews with Mode 2 couple personas (self-planned, urban, 25–32 years old)
- Willingness-to-pay survey anchored to specific feature descriptions, not general “planning help”
- Test one-time payment vs. monthly subscription preference
- Target: confirm or adjust the ₹999 Essential anchor within ±50% before launch

**Post-launch pricing signals to monitor:**
- Planner free-trial-to-paid conversion rate (target: ≥ 30% within 14 days)
- Couple free-to-Essential upgrade rate at the 15-vendor limit trigger (target: ≥ 20%)
- Planner plan distribution at 90 days (target: ≥ 40% on Growth or above)
- Annual billing uptake rate among planners (target: ≥ 25% of paid planners)

---

## 11.9 Payment Infrastructure and Billing Operations

### Payment gateway

**Razorpay** is the recommended payment gateway for V1. Rationale: Razorpay is the dominant Indian payment infrastructure provider, supports UPI, net banking, credit/debit cards, and EMI options natively, has a well-documented API compatible with the Supabase + Netlify stack, and handles INR billing without currency conversion complexity. Stripe India is an acceptable alternative if Razorpay integration presents a technical constraint. PayU is a secondary fallback.

The payment gateway selection must be confirmed during technical scoping and before subscription billing is built. Gateway credentials shall be stored as Netlify environment variables — never in source code.

### GST applicability

Vivaah OS is a SaaS product delivered electronically to Indian customers. GST at 18% applies to all subscription and one-time payment revenue once the business crosses the mandatory registration threshold (₹20L annual turnover for most Indian states; ₹10L for special category states).

- All displayed prices in Section 11.2 and 11.3 are **exclusive of GST**. At checkout, 18% GST is added and displayed separately before payment confirmation.
- Tax invoices must be issued automatically for every transaction — planner subscriptions (monthly and annual) and couple one-time payments. The invoice must include: business name and GSTIN, customer name and GSTIN (if a registered business — optional for couples), invoice date, subscription period, amount before GST, GST amount (18%), and total amount.
- Planner accounts must have an option to enter their GSTIN for business invoicing — this is a common requirement for planners who expense their tools against their registered business.
- Razorpay handles GST invoice generation natively. This must be configured before the first paid transaction.

### Subscription billing mechanics

**Monthly subscriptions:**
- Billing date is anchored to the signup date. A planner who signs up on the 14th is billed on the 14th of each subsequent month.
- Failed payments trigger a 3-day grace period with daily retry attempts. If payment fails after 3 days, the account enters a payment-failed state — read-only access, same as trial expiry behaviour. The planner receives WhatsApp and in-app notifications on each failed attempt.
- Cancelled subscriptions retain access until the end of the current billing period. Data is preserved per NFR-06-2 after cancellation.

**Annual subscriptions:**
- Billed in full at the start of the annual period.
- Cancellation mid-year does not trigger a pro-rated refund (see refund policy below).

**Couple one-time payments:**
- Charged immediately at purchase. Access unlocks within 60 seconds of payment confirmation.
- No recurring billing — no subscription to cancel.

### Refund policy

**Planner monthly subscriptions:**
- No refund for the current billing period if the planner cancels mid-month. Access continues until the period end.
- If a planner is charged in error (e.g. a duplicate charge due to a payment gateway error), a full refund is issued within 5 business days.

**Planner annual subscriptions:**
- No pro-rated refund for unused months if cancelled mid-year. The annual plan is a committed annual engagement.
- Exception: if the product experiences a material service failure (downtime exceeding 99.9% uptime threshold per NFR-02-1 for more than 72 consecutive hours), a pro-rated credit is issued for the affected period.

**Couple one-time payments:**
- No refund after payment, as the features are unlocked immediately and used during the planning window.
- Exception: if the couple’s wedding is cancelled entirely (not postponed), a full refund may be requested within 30 days of the cancellation date, subject to manual review. This is a goodwill policy, not a contractual obligation, and is processed via support.

**All refund requests** are handled via the in-app support channel or WhatsApp support number. Refunds are processed via the original payment method within 5–7 business days through Razorpay.

The refund policy must be displayed clearly on the pricing page, at checkout, and in the terms of service before V1 launch. This is a legal requirement under Indian consumer protection regulations for digital services.

---