# Section 13: Success Metrics

---

## 13.1 How to Read This Section

Metrics are the feedback loop that tells us whether the product is delivering on its objectives. Each metric in this section is cross-referenced to the objective it validates — if an objective has no metric, it cannot be evaluated; if a metric has no objective, it is noise.

The section is organised into six categories mirroring the planned structure: adoption, engagement, retention, trust and quality, business, and AI-specific. Each metric entry contains:

- **What it measures** — the specific behaviour or outcome being tracked
- **Why it matters** — which objective (BO/PO/CO/QO from Section 4) it validates
- **How it is measured** — the data source and calculation
- **Frequency** — how often it is reviewed
- **Baseline** — expected value at launch (week 1), before any optimisation
- **3-month target** — the value the metric should reach by month 3 post-launch
- **6-month target** — the value the metric should reach by month 6 post-launch

A metric that is below its 3-month target at month 3 triggers a diagnostic review — not an automatic product change, but a structured investigation of the cause before deciding on a response.

**Metric ownership:** Each metric category has a designated owner from the founding team who is responsible for weekly review and monthly reporting. Metrics without an owner are not tracked reliably.

---

## 13.2 Adoption Metrics

Adoption metrics measure whether the product is reaching its intended users and whether they are completing the foundational actions that make the product useful.

---

**M-A01 — Planner onboarding completion rate**

**What it measures:** The percentage of planners who start the onboarding wizard and complete it (reach the wedding dashboard with at least one wedding created).

**Why it matters:** Validates PO2 (onboard a new client wedding in under 10 minutes) and BO2 (planner acquisition). An incomplete onboarding means the product never gets used.

**How it is measured:** (Completed onboarding wizard sessions / Started onboarding wizard sessions) × 100. A session is counted as started when the mode selection screen is reached. Tracked via Supabase event logs.

**Frequency:** Weekly

|  | Baseline (Week 1) | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Planner onboarding completion | 60% | 75% | 85% |

**Diagnostic trigger:** If below 60% at any point, investigate the step at which users drop off. If drop-off is concentrated at a specific wizard step, that step requires redesign. If drop-off is at the final confirmation screen, the issue is likely trust (price, data privacy concern) not UX.

---

**M-A02 — Weddings created per planner per month**

**What it measures:** Average number of new weddings created per paid planner account per month.

**Why it matters:** Validates BO2 (planner as distribution channel). A planner who uses the product but creates no new weddings is either not acquiring new clients or not onboarding existing clients to the platform. Both are problems.

**How it is measured:** Total new weddings created in the month / Total active planner accounts. Active = logged in within the past 14 days.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Weddings per planner per month | 0.5 | 1.0 | 1.5 |

**Note:** The baseline of 0.5 reflects the ramp-up period — planners onboard existing weddings first, then begin onboarding new clients. By month 3, a planner should be onboarding at least one new client wedding per month on the platform.

---

**M-A03 — Mode 2 onboarding completion rate**

**What it measures:** The percentage of Mode 2 users (couples and head planners) who start the onboarding wizard and complete it with at least one event and a wedding date entered.

**Why it matters:** Validates CO1 (get a complete plan from basic inputs). A Mode 2 user who abandons the wizard never reaches the AI timeline — the primary value delivery moment.

**How it is measured:** Two sub-metrics tracked separately:
- **Wizard completion rate:** (Mode 2 wizard sessions reaching the summary and confirm screen with ≥ 1 event entered / Total Mode 2 wizard sessions started) × 100
- **Timeline generation rate:** (Mode 2 weddings where an AI timeline is generated within 48 hours of wizard completion / Total Mode 2 weddings created with ≥ 1 event) × 100

The 3-month and 6-month targets below apply to wizard completion. Timeline generation rate is tracked separately — expected to be 85%+ of wizard completions with ≥ 1 event, since timeline generation is triggered automatically on wizard completion unless zero events are entered (EC-D09).

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Mode 2 wizard completion | 45% | 60% | 70% |
| Mode 2 timeline generation (of completions with ≥ 1 event) | 80% | 88% | 93% |

**Note:** Mode 2 baseline is lower than Mode 1 because self-planned couples have higher abandonment rates — they are exploring without a deadline. The 60% target reflects a well-optimised wizard with India-specific defaults reducing manual entry. The timeline generation rate tracks whether the automatic trigger is working and whether couples who complete the wizard are entering at least one event.

---

**M-A04 — AI timeline acceptance rate**

**What it measures:** The percentage of generated AI timelines that are accepted by the user without immediate bulk deletion or full replacement (i.e. the user does not trigger “Clear timeline and start fresh” within 24 hours of generation).

**Why it matters:** Validates CO1 (complete plan from basic inputs) and QO7 (AI output must be specific, India-calibrated, and actionable). A timeline that is immediately rejected is a signal that the AI output is not relevant or useful.

**How it is measured:** (Timelines where no clear-timeline action occurs within 24 hours of generation / Total timelines generated) × 100.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| AI timeline acceptance rate | 70% | 82% | 90% |

---

**M-A05 — Participant invitation rate per wedding**

**What it measures:** The percentage of weddings that have at least one participant (couple member or family member) invited within 7 days of wedding creation.

**Why it matters:** Validates PO4 (give clients the right visibility) and CO2 (keep family aligned). A wedding with no invited participants means the planner is using the product only as a personal tool — not activating the B2B2C flywheel.

**How it is measured:** (Weddings with ≥ 1 participant invited within 7 days of creation / Total weddings created) × 100.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Participant invitation rate | 40% | 65% | 80% |

---

## 13.3 Engagement Metrics

Engagement metrics measure whether users are using the product in the way it is designed to be used — not just logging in, but taking the actions that deliver value.

---

**M-E01 — Weekly briefing open rate**

**What it measures:** The percentage of generated weekly briefings that are opened (in-app) or read (WhatsApp — measured by link click if included, or delivery confirmation as a proxy).

**Why it matters:** Validates CO4 (know what needs to happen next) and PO3 (never miss a payment or deadline). A briefing that is not read is a briefing that is not creating the habit loop.

**How it is measured:** (Briefings where the in-app briefing view is opened within 48 hours of delivery / Total briefings delivered) × 100. WhatsApp delivery confirmation is used as a secondary proxy where in-app open is unavailable.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Briefing open rate | 50% | 70% | 80% |

---

**M-E02 — Briefing action rate**

**What it measures:** The percentage of briefing items (overdue, at-risk, upcoming decisions) that result in a user action within 7 days of briefing delivery.

**Why it matters:** Validates BO4 (execution data asset) and CO4 (proactive guidance). A briefing that is read but not acted on is not delivering value — it is producing anxiety without resolution.

**How it is measured:** (Briefing items where the referenced entity changes status within 7 days of briefing delivery / Total briefing items delivered across all briefings) × 100. Status change includes: milestone marked paid, vendor status advanced, task marked complete.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Briefing action rate | 30% | 50% | 65% |

---

**M-E03 — Vendor card completeness rate per wedding**

**What it measures:** The percentage of vendor cards on active weddings that meet the completeness definition (rate entered, at least one milestone, event assignment, status ≥ Booked).

**Why it matters:** Validates QO4 (data completeness feedback) and BO4 (execution data asset). Incomplete vendor cards degrade the budget ledger, the confirmation tracker, and the AI briefing. This metric is the primary indicator of product depth — whether planners are using the tool thoroughly or superficially.

**How it is measured:** (Vendor cards meeting all four completeness criteria / Total vendor cards created) × 100. Calculated per wedding and averaged across all active weddings.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Vendor card completeness rate | 35% | 55% | 70% |

---

**M-E04 — Payment milestones created per booked vendor**

**What it measures:** Average number of payment milestones added per vendor card at status Booked or higher.

**Why it matters:** Validates PO3 (never miss a payment) and S12 feature adoption. A vendor at Booked status with no milestones means the payment calendar is empty — the most operationally critical feature is not being used.

**How it is measured:** Total payment milestones created / Total vendor cards at status Booked or higher.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Milestones per booked vendor | 1.2 | 1.8 | 2.2 |

**Note:** Indian vendor payment schedules typically have 2–3 milestones (advance, mid-point, balance on wedding day). A target of 2.2 reflects most vendors having their full payment schedule entered.

---

**M-E05 — 30-day confirmation tracker resolution rate**

**What it measures:** The percentage of vendors appearing in the 30-day confirmation tracker that are marked Confirmed before their event date.

**Why it matters:** Directly validates PO3 (never miss a vendor confirmation) — the most concrete value proposition of the confirmation tracker feature.

**How it is measured:** (Vendors that appeared in the tracker and reached Confirmed status before their event date / Total vendors that appeared in the tracker) × 100.

**Frequency:** Monthly (requires completed events to measure)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Tracker resolution rate | 55% | 72% | 85% |

---

**M-E06 — AI timeline task completion rate**

**What it measures:** The percentage of AI-generated timeline tasks that are marked complete by their due date.

**Why it matters:** Validates CO4 (know what needs to happen next) and the quality of the AI-generated task sequence. Low completion rates may indicate tasks are unrealistic, the wrong priority, or not visible enough in the product.

**How it is measured:** (AI-generated tasks marked complete on or before their due date / Total AI-generated tasks with a due date in the past) × 100. Custom and user-modified tasks are excluded.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Timeline task completion rate | 30% | 48% | 60% |

---

**M-E07 — Out-of-cycle alert action rate**

**What it measures:** The percentage of out-of-cycle WhatsApp alerts (EC-W04 — vendor unconfirmed within 7 days, milestone newly overdue) that result in the user taking a relevant action within 24 hours of delivery.

**Why it matters:** Out-of-cycle alerts are the highest-stakes notification in the product — they surface imminent failures between weekly briefings. An alert that is delivered but not acted on means the most urgent escalation mechanism is not working. A high delivery rate with a low action rate signals that the alert format or content needs redesign.

**How it is measured:** (Out-of-cycle alerts where the referenced entity changes status within 24 hours of alert delivery / Total out-of-cycle alerts delivered) × 100. Tracked via Supabase event logs linking alert delivery records to subsequent status changes on the referenced VendorInstance or PaymentMilestone.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Out-of-cycle alert action rate | 35% | 55% | 70% |

**Note:** The 24-hour window is intentionally tight — out-of-cycle alerts are sent because the situation is urgent. An action rate below 35% at baseline triggers immediate review of the alert message format and delivery timing.

---

**M-E08 — Portfolio health score distribution**

**What it measures:** The distribution of active weddings across health score states (Good / At-risk / Critical) at any given point, measured across the full platform.

**Why it matters:** Validates PO1 (manage all weddings from one view) and BO1 (become the primary planning OS). If 50%+ of weddings are at Critical health score at month 3, the product is surfacing risk but planners are not resolving it — the briefing and tracker are not creating sufficient behaviour change. If 80%+ are at Good health score, the product may be over-scoring positively and missing real risks. The target distribution represents a healthy, actively managed portfolio.

**How it is measured:** Count of active VendorInstances grouped by health_score field (Good / At-risk / Critical). Expressed as a percentage of total active weddings. Measured as a platform-wide snapshot, not per-planner.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Weddings at Good health score | 30% | 45% | 58% |
| Weddings at At-risk health score | 45% | 40% | 32% |
| Weddings at Critical health score | 25% | 15% | 10% |

**Note:** The baseline distribution reflects a newly adopted tool where many weddings are incompletely set up. A shift from Critical toward Good over time is the primary signal that the product is creating operational improvement, not just awareness.

---

Retention metrics measure whether users stay on the platform through the planning window and whether planners return for subsequent weddings.

---

**M-R01 — Planner 30-day retention**

**What it measures:** The percentage of planners who are still active (logged in within the past 7 days) at 30 days after their first wedding creation.

**Why it matters:** Validates BO5 (retain planners across client weddings). The 30-day mark is the first signal of whether the product has become part of the planner’s workflow or is being treated as a trial.

**How it is measured:** (Planners who logged in within the past 7 days at day 30 / Total planners who created their first wedding 30 days ago) × 100.

**Frequency:** Monthly (cohort-based)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Planner 30-day retention | 55% | 70% | 80% |

---

**M-R02 — Planner 90-day retention**

**What it measures:** The percentage of planners still active at 90 days after their first wedding creation.

**Why it matters:** The 90-day mark is the definitive signal of workflow adoption. A planner who is still active at 90 days has onboarded multiple weddings and experienced a full briefing cycle. This is the retention signal that directly supports BO3 (recurring revenue) — a retained planner is a paying planner.

**How it is measured:** (Planners who logged in within the past 14 days at day 90 / Total planners who created their first wedding 90 days ago) × 100.

**Frequency:** Monthly (cohort-based)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Planner 90-day retention | 40% | 60% | 72% |

---

**M-R03 — Planner multi-wedding rate**

**What it measures:** The percentage of paid planners who have created 2 or more weddings on the platform within their first 90 days.

**Why it matters:** Validates BO5 (planners return for subsequent weddings). A planner who creates only one wedding is testing the product. A planner who creates multiple weddings has adopted it. Multi-wedding usage is also the primary mechanism for directory growth — the retention flywheel described in BO5.

**How it is measured:** (Paid planners with ≥ 2 weddings created within first 90 days / Total paid planners who have been active for 90+ days) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Planner multi-wedding rate | 25% | 45% | 60% |

---

**M-R04 — Couple return visit rate**

**What it measures:** The percentage of couple-view participants who access their wedding view at least once per week after their initial access.

**Why it matters:** Validates PO4 (give clients the right visibility) and CO2 (keep family aligned). A couple who visits once and never returns is not using the product — the planner’s client communication burden has not been reduced.

**How it is measured:** (Couple-view participants with ≥ 1 visit per week in the most recent 4 weeks / Total couple-view participants who accepted their invite) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Couple weekly return rate | 20% | 38% | 50% |

---

**M-R05 — Wedding completion rate**

**What it measures:** The percentage of weddings created on the platform that reach the “archived” state (all events completed, final statuses set) versus those abandoned mid-planning.

**Why it matters:** Validates BO1 (become the primary planning OS). A wedding that is abandoned mid-planning means the product was not retained through the full planning window — either the planner switched tools or the couple relationship ended.

**How it is measured:** (Weddings that reach archived state / Weddings created more than 30 days ago with a wedding date in the past) × 100.

**Frequency:** Monthly (requires past-wedding-date events to measure)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Wedding completion rate | 45% | 62% | 75% |

---

**M-R06 — Planner vendor directory growth rate**

**What it measures:** Average number of unique vendors in a planner’s private VendorDirectory at 30, 60, and 90 days after their first wedding creation.

**Why it matters:** Validates BO5 (retain planners across weddings). The vendor directory is the primary switching cost and the compounding retention asset. A planner whose directory is not growing is not building the asset that makes them sticky to the platform. A directory growing at fewer than 5 vendors per wedding suggests planners are not saving new vendors to their directory — either the save-to-directory prompt is being dismissed or the feature is not understood.

**How it is measured:** Average count of VendorDirectory entries per planner account, measured at 30, 60, and 90 days after first wedding creation. Expressed as growth rate: average new directory entries per wedding completed.

**Frequency:** Monthly (cohort-based)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Avg directory entries at 30 days | 5 | 8 | 12 |
| Avg directory entries at 90 days | 8 | 18 | 30 |
| New directory entries per wedding | 4 | 6 | 8 |

**Note:** A planner managing their first wedding on the platform typically has 8–15 vendors. If the save-to-directory prompt is consistently acted on, the directory should grow by 6–10 entries per wedding after the first. By month 6, a planner on their 4th or 5th wedding should have a directory of 25–40 vendors.

---

Trust and quality metrics measure whether the product is doing what it claims — keeping planners and couples informed, preventing missed deadlines, and maintaining data integrity.

---

**M-T01 — Payment milestones marked paid on time**

**What it measures:** The percentage of payment milestones that are marked paid on or before their due date (before the system automatically flags them as overdue).

**Why it matters:** Directly validates PO3 (never miss a vendor payment). This is the most operationally significant metric in the product — it measures whether the payment calendar is actually preventing missed payments.

**How it is measured:** (PaymentMilestones marked paid on or before due_date / Total PaymentMilestones with a due_date in the past) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Milestones paid on time | 50% | 68% | 80% |

**Note:** The baseline of 50% is conservative — it assumes roughly half of milestones are being tracked in the system but the tool is not yet fully embedded in the planner’s workflow. A 3-month target of 68% represents a meaningful improvement over the pre-tool baseline (estimated at 35–40% based on reported missed payment rates in the market).

---

**M-T02 — Vendor confirmation rate within 30 days of event**

**What it measures:** The percentage of vendors that reach Confirmed status at least 30 days before their event date — the confirmation window that S14 tracks.

**Why it matters:** The most direct measure of whether the confirmation tracker (S14) is preventing the most common vendor risk — an unconfirmed booking discovered too late to fix.

**How it is measured:** (VendorInstances that reached Confirmed status ≥ 30 days before their event date / Total VendorInstances with a past event date) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| 30-day confirmation rate | 40% | 60% | 75% |

---

**M-T03 — AI timeline India-calibration score**

**What it measures:** User-reported relevance of the AI-generated timeline, specifically whether the tasks, timing, and terminology feel appropriate for an Indian wedding — not a generic Western template.

**Why it matters:** Validates QO7 (AI output must be specific, India-calibrated, and actionable). This is a subjective metric that requires a structured question, not a star rating.

**How it is measured:** At timeline generation, the user is shown a single in-product prompt (displayed once per wedding, not on every generation): “Does this timeline feel right for your wedding?” with three options: “Yes, it fits well” / “Mostly, with some adjustments” / “No, it needs significant changes.” The percentage of “Yes” responses is the India-calibration score. This prompt is shown only to users who have not triggered a bulk clear within 24 hours (i.e. users who have engaged with the timeline).

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| India-calibration score | 55% | 70% | 80% |

---

**M-T04 — Permission integrity rate**

**What it measures:** The number of confirmed RLS bypass incidents — instances where a participant accessed data above their access level.

**Why it matters:** Validates QO3 (permission integrity under all conditions) and NFR-02-4 (zero tolerance for permission bypass). This metric has a target of zero — any confirmed bypass is a P0 security incident.

**How it is measured:** Count of incidents where a participant’s access log shows data retrieval that should have been blocked by their RLS policy. Detected via Sentry error monitoring (NFR-07) and periodic security audits.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| RLS bypass incidents | 0 | 0 | 0 |

**Note:** If this metric is ever above 0, it triggers an immediate P0 incident response regardless of how many users were affected.

---

**M-T05 — Data completeness signal dismissal rate**

**What it measures:** The percentage of data completeness signals (QO4) that result in the user completing the missing data (within 48 hours of the signal appearing) versus dismissing without action.

**Why it matters:** Validates QO4 (data completeness feedback) and BO4 (execution data quality). A completeness signal that is consistently ignored is either incorrectly timed, poorly written, or surfacing data gaps that users do not consider important. Understanding the dismissal rate helps distinguish between a signal that is working and one that is creating noise.

**How it is measured:** (Completeness signals that result in at least one vendor card field being completed within 48 hours / Total completeness signals surfaced) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Completeness signal action rate | 25% | 40% | 55% |

---

**M-T06 — Contract status completion rate**

**What it measures:** The percentage of vendor cards at status Booked or higher that have a contract_status field set to “uploaded” or “reviewed” (as opposed to “not uploaded”).

**Why it matters:** Named explicitly in the planned structure brief as a trust and quality metric. Contract documentation is a trust signal — a planner who records that a contract has been uploaded or reviewed has closed the most common source of vendor dispute. While V1 does not support contract file upload (that is S6, a V2 feature), the contract_status field exists on VendorInstance and can be manually updated. Tracking this metric establishes the baseline before V2 contract ingestion is built.

**How it is measured:** (VendorInstances at status ≥ Booked where contract_status ≠ “not uploaded” / Total VendorInstances at status ≥ Booked) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Contract status completion rate | 15% | 30% | 45% |

**Note:** The low baseline reflects that contract documentation is a secondary behaviour — planners focus on rate and milestone entry first. The 3-month target of 30% is realistic given that contract file upload is not yet available (V2). The metric primarily tracks awareness and manual status updates at V1.

---

**M-T07 — WhatsApp delivery rate**

**What it measures:** The percentage of WhatsApp messages sent by the platform that are successfully delivered to the recipient’s device within 10 minutes of the send trigger.

**Why it matters:** Validates QO1 (WhatsApp-first delivery) and NFR-02-3 (≥ 95% delivery within 10 minutes for registered numbers). WhatsApp is the primary notification channel. A delivery rate below 90% means critical briefings, invites, and alerts are routinely not reaching their recipients.

**How it is measured:** (WhatsApp messages with confirmed delivery status within 10 minutes / Total WhatsApp messages sent) × 100. Delivery confirmation tracked via provider webhooks per TR-05-4. Unregistered numbers are excluded from the denominator — only messages sent to verified WhatsApp numbers are counted.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| WhatsApp delivery rate | 90% | 94% | 96% |

**Diagnostic trigger:** If delivery rate falls below 88% in any week, investigate by message type (invite vs. briefing vs. alert) to identify whether the issue is systemic or type-specific. If invite delivery is failing at high rates, the participant invite flow is broken. If briefing delivery is failing, the scheduled job infrastructure needs attention.

---

**M-T08 — Head planner role transfer frequency**

**What it measures:** The number of head planner role transfers per 100 active Mode 2 weddings per month.

**Why it matters:** Validates the stability of the initial access configuration at onboarding. A high transfer rate (more than 5 per 100 weddings per month) signals that the head planner designation is being made incorrectly — either the product is not making the role clear during onboarding, or real-world circumstances (family dynamics, logistics) are causing frequent leadership changes. This is also an early indicator for EC-A01 (incoming head planner unfamiliar with the plan) occurring at scale.

**How it is measured:** Count of completed head planner role transfers in the period / Total active Mode 2 weddings × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Role transfers per 100 weddings | — | ≤ 5 | ≤ 3 |

**Note:** No baseline at launch (no completed transfers at week 1). The target is a ceiling, not a floor — lower is better. Above 5 per 100 weddings triggers a review of the head planner onboarding explanation and the role transfer UX to understand whether transfers are deliberate or accidental.

---

Business metrics measure whether the product is generating sustainable revenue and whether the monetisation model is working as designed.

---

**M-B01 — Monthly Recurring Revenue (MRR)**

**What it measures:** Total monthly subscription revenue from paid planner accounts.

**Why it matters:** Validates BO3 (establish recurring SaaS revenue). MRR is the primary business health indicator.

**How it is measured:** Sum of all active planner subscription monthly charges in the period. Annual subscriptions are counted as MRR by dividing the annual charge by 12. Couple one-time payments are not included in MRR — they are tracked separately as one-time revenue.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Planner MRR | ₹0 | ₹3.5L | ₹5.5L |
| One-time couple revenue | ₹0 | ₹50K | ₹2L |

**Note:** The 3-month MRR target of ₹3.5L represents approximately 50 Starter-equivalent planners (consistent with the Phase 1 planner acquisition target of 50 paid planners within 90 days). The 6-month target of ₹5.5L is revised from the original ₹8.5L to align with the Section 11 revenue derivation — the conservative scenario projects ₹4.57L/month and the base case projects ₹5.53L/month at steady state. The ₹5.5L target reflects the base case trajectory at 6 months, not the upside scenario. The original ₹8.5L figure was inconsistent with Section 11 and is corrected here. ₹8.5L MRR is a 12-month target, not a 6-month target.

---

**M-B02 — Trial-to-paid conversion rate**

**What it measures:** The percentage of planners who complete the 14-day free trial and convert to a paid plan within 7 days of trial expiry.

**Why it matters:** Validates BO2 (planner acquisition) and BO3 (revenue). Trial conversion is the most critical monetisation moment — a trial that does not convert is an acquisition cost with no return.

**How it is measured:** (Planners who select a paid plan within 7 days of trial expiry / Total planners whose trial expired) × 100.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Trial-to-paid conversion | — | 30% | 40% |

**Note:** No baseline at launch (no expired trials at week 1). The 30% 3-month target is set in Section 11.8 as a pricing discovery signal. Below 30% triggers a pricing and onboarding review.

---

**M-B03 — Average Revenue Per Planner (ARPP)**

**What it measures:** Average monthly revenue per paid planner account.

**Why it matters:** Tracks whether planners are upgrading to higher tiers as their portfolios grow — the key signal of the growth tier’s effectiveness. If ARPP is flat at Starter-equivalent (₹2,499) at month 6, the Growth tier is not converting.

**How it is measured:** Total planner MRR / Total paid planner accounts.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Average Revenue Per Planner | — | ₹2,800 | ₹3,400 |

**Note:** The 3-month target of ₹2,800 is slightly above Starter (₹2,499) — reflecting a small number of Growth and Agency conversions in the first cohort. The 6-month target of ₹3,400 reflects meaningful Growth tier uptake as planner portfolios expand.

---

**M-B04 — Couple free-to-paid conversion rate**

**What it measures:** The percentage of free-tier Mode 2 couples who upgrade to Essential or Complete.

**Why it matters:** Validates the couple freemium model and the conversion trigger design (Section 11.3). Below 10% suggests the free tier is too generous or the triggers are not compelling. Above 25% may suggest the free tier is too restrictive.

**How it is measured:** (Mode 2 couples who have made a one-time payment / Total Mode 2 couples with a free account who have been active for 30+ days) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Couple free-to-paid rate | — | 12% | 20% |

---

**M-B05 — Annual billing uptake rate**

**What it measures:** The percentage of paid planner subscribers on annual billing.

**Why it matters:** Annual billing improves revenue predictability and reduces churn risk. It is also a signal of planner commitment — an annual subscriber is significantly less likely to churn than a monthly subscriber. The 25% target is set in Section 11.8.

**How it is measured:** (Planner accounts on annual billing / Total paid planner accounts) × 100.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Annual billing uptake | — | 15% | 28% |

---

**M-B06 — Revenue from referrals**

**What it measures:** The percentage of new paid planner accounts that are attributed to the referral programme.

**Why it matters:** The referral programme is identified as the highest-priority acquisition channel in Section 12.4. If referral-attributed revenue is below 30% of new planner revenue, the referral programme is underperforming and alternative channels need more investment.

**How it is measured:** (Paid planners acquired via referral code / Total new paid planners in the period) × 100. Referral attribution tracked via unique referral codes generated per planner.

**Frequency:** Monthly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Referral-attributed new planners | — | 25% | 35% |

---

**M-B07 — Planner Net Promoter Score (NPS)**

**What it measures:** The likelihood of paid planner subscribers to recommend Vivaah OS to a professional peer, measured on the standard 0–10 NPS scale. NPS = % Promoters (9–10) minus % Detractors (0–6).

**Why it matters:** Referenced twice in the GTM section as a critical gate metric — pilot NPS ≥ 40 at week 8 (Section 12.4 pilot success criteria) and planner NPS ≥ 45 at 90 days (Section 12.6 V1-to-V2 gate). NPS is the most reliable leading indicator of word-of-mouth growth — the primary acquisition mechanism for a product with no paid acquisition budget. A planner NPS below 30 means the referral flywheel will not spin at the rate the GTM plan assumes.

**How it is measured:** In-product NPS survey sent to all paid planner accounts who have been active for ≥ 30 days. Survey shown once per quarter — not more frequently. A single question: “How likely are you to recommend Vivaah OS to another wedding planner?” NPS calculated from responses. Survey is delivered in-app and via WhatsApp (for planners who may not open the app). Minimum response rate target: 40% of eligible accounts.

**Frequency:** Quarterly (with a pilot measurement at week 8 of the pilot phase)

|  | Pilot target (week 8) | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Planner NPS | ≥ 40 | ≥ 45 | ≥ 55 |

**Note:** The pilot target of ≥ 40 is a gate condition from Section 12.4. The V1-to-V2 expansion gate requires ≥ 45 at 90 days (Section 12.6, Gate 6). A score below 40 at the pilot measurement triggers a structured diagnosis of the detractor responses before any GTM expansion proceeds.

---

**M-B08 — Couple post-wedding referral conversion rate**

**What it measures:** The percentage of post-wedding referral links (sent via the automated referral mechanism in Section 12.5) that result in a new Mode 2 account being created within 30 days of the link being sent.

**Why it matters:** The post-wedding referral mechanism (triggered when a wedding is archived, delivers a WhatsApp referral link to the couple) is a key component of the Mode 2 organic acquisition flywheel. If the referral link is delivered but not converting, either the incentive (₹200 Amazon voucher + one month Essential free) is insufficient or the landing experience for the referred couple is not compelling.

**How it is measured:** (New Mode 2 accounts created via a post-wedding referral link within 30 days of link send / Total post-wedding referral links sent) × 100. Attribution via unique referral link per couple.

**Frequency:** Monthly (requires weddings to have been archived to measure)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Referral link conversion rate | — | 8% | 15% |

**Note:** No baseline at launch (no archived weddings at week 1). The 8% 3-month target reflects a realistic conversion rate for a cold WhatsApp referral link — the couple receiving it knows the product but their friend does not. The 15% 6-month target assumes the product has developed enough word-of-mouth awareness in the target cities that referral links land in a warmer context.

---

AI-specific metrics measure the quality and reliability of the two AI features in V1 — S1 (timeline generation) and S3 (weekly briefing). These metrics are distinct from the engagement and trust metrics because they measure the AI system’s performance, not just user behaviour.

---

**M-AI01 — AI generation success rate**

**What it measures:** The percentage of AI generation calls (timeline and briefing combined) that return a valid, parseable response within the 45-second timeout.

**Why it matters:** Validates NFR-01-1 (30-second AI generation target) and FR-S1-06 (45-second timeout with retry). A success rate below 95% means users are encountering generation failures too frequently — each failure degrades trust in the AI features.

**How it is measured:** (AI API calls that return a response parseable into the Timeline or Briefing data model within 45 seconds / Total AI API calls initiated) × 100. Measured via Supabase Edge Function logs.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| AI generation success rate | 92% | 96% | 98% |

**Note:** The baseline of 92% reflects typical API reliability for Anthropic’s claude-sonnet model. The 8% failure rate at baseline is addressed by the retry mechanism — the reported success rate after retry should be ≥ 97% from week 1.

---

**M-AI02 — AI generation latency (P95)**

**What it measures:** The 95th percentile end-to-end latency for AI generation — from user trigger to timeline or briefing visible in the UI. Measured in seconds.

**Why it matters:** Validates NFR-01-1 (30-second AI generation target). The P95 is used rather than the average because the average can be misleading — a tool that is fast 90% of the time but takes 90 seconds on the remaining 10% fails the user experience test.

**How it is measured:** End-to-end latency logged per generation event: wizard completion timestamp → timeline first-render timestamp. P95 calculated over all generation events in the measurement period.

**Frequency:** Weekly

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| AI generation P95 latency | 28s | 22s | 18s |

---

**M-AI03 — Briefing specificity rate**

**What it measures:** The percentage of briefing items (overdue, at-risk, upcoming decisions) that reference a specific named entity — a vendor name, a payment amount, a task name — rather than a generic statement.

**Why it matters:** Validates QO7 (AI output must be specific, India-calibrated, and actionable) and FR-S3-03 (each briefing item names the specific vendor, amount, task, or date). Generic briefing items are a failure of the AI prompt design.

**How it is measured:** A post-generation parser evaluates each briefing item against a specificity rubric: does the item contain at least one of — a vendor name, a ₹ amount, a date, or a task name? Items that contain none of these are flagged as generic. (Non-generic briefing items / Total briefing items) × 100.

**Frequency:** Weekly (automated)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| Briefing specificity rate | 80% | 90% | 96% |

---

**M-AI04 — Timeline India-vocabulary compliance rate**

**What it measures:** The percentage of AI-generated timeline tasks that use Indian wedding terminology (haldi, mehendi, sangeet, baraat, etc.) rather than anglicised equivalents (turmeric ceremony, henna night, etc.).

**Why it matters:** Validates QO2 (India-native formatting throughout) and FR-S1-04 (all event names in timeline use Indian terminology). A compliance rate below 95% indicates the AI prompt is not enforcing the vocabulary constraint reliably.

**How it is measured:** A post-generation parser scans all generated task titles and descriptions for a predefined list of anglicised event vocabulary. (Tasks with no anglicised vocabulary / Total generated tasks) × 100.

**Frequency:** Weekly (automated)

|  | Baseline | 3-month target | 6-month target |
| --- | --- | --- | --- |
| India-vocabulary compliance | 88% | 95% | 99% |

---

**M-AI05 — Prompt version distribution**

**What it measures:** The distribution of active timelines and briefings across prompt versions — specifically, what percentage of generated content is using the most current prompt version.

**Why it matters:** Validates TR-01-9 (prompt version tagging on generated content). When a prompt is updated, this metric shows how quickly the new version propagates (regenerated timelines will use the new version; existing timelines retain their original version). It also enables debugging — if a quality degradation is observed, this metric shows whether it correlates with a prompt version change.

**How it is measured:** Count of Timeline and Briefing records grouped by prompt_version field. Percentage of records using the current prompt version.

**Frequency:** Monthly (or immediately following any prompt update)

|  | Target |
| --- | --- |
| Active content on current prompt version | ≥ 80% within 30 days of any prompt update |

---

## 13.8 Metric Summary Table

| ID | Metric | Category | Frequency | 3-month target | 6-month target |
| --- | --- | --- | --- | --- | --- |
| M-A01 | Planner onboarding completion | Adoption | Weekly | 75% | 85% |
| M-A02 | Weddings per planner per month | Adoption | Monthly | 1.0 | 1.5 |
| M-A03 | Mode 2 wizard completion | Adoption | Weekly | 60% | 70% |
| M-A03b | Mode 2 timeline generation rate | Adoption | Weekly | 88% | 93% |
| M-A04 | AI timeline acceptance rate | Adoption | Weekly | 82% | 90% |
| M-A05 | Participant invitation rate | Adoption | Weekly | 65% | 80% |
| M-E01 | Weekly briefing open rate | Engagement | Weekly | 70% | 80% |
| M-E02 | Briefing action rate | Engagement | Weekly | 50% | 65% |
| M-E03 | Vendor card completeness rate | Engagement | Weekly | 55% | 70% |
| M-E04 | Milestones per booked vendor | Engagement | Monthly | 1.8 | 2.2 |
| M-E05 | Tracker resolution rate | Engagement | Monthly | 72% | 85% |
| M-E06 | Timeline task completion rate | Engagement | Monthly | 48% | 60% |
| M-E07 | Out-of-cycle alert action rate | Engagement | Weekly | 55% | 70% |
| M-E08 | Portfolio health — Good % | Engagement | Monthly | 45% | 58% |
| M-R01 | Planner 30-day retention | Retention | Monthly | 70% | 80% |
| M-R02 | Planner 90-day retention | Retention | Monthly | 60% | 72% |
| M-R03 | Planner multi-wedding rate | Retention | Monthly | 45% | 60% |
| M-R04 | Couple weekly return rate | Retention | Monthly | 38% | 50% |
| M-R05 | Wedding completion rate | Retention | Monthly | 62% | 75% |
| M-R06 | Directory entries at 90 days | Retention | Monthly | 18 avg | 30 avg |
| M-T01 | Milestones paid on time | Trust / Quality | Monthly | 68% | 80% |
| M-T02 | 30-day vendor confirmation rate | Trust / Quality | Monthly | 60% | 75% |
| M-T03 | India-calibration score | Trust / Quality | Monthly | 70% | 80% |
| M-T04 | RLS bypass incidents | Trust / Quality | Weekly | 0 | 0 |
| M-T05 | Completeness signal action rate | Trust / Quality | Monthly | 40% | 55% |
| M-T06 | Contract status completion rate | Trust / Quality | Monthly | 30% | 45% |
| M-T07 | WhatsApp delivery rate | Trust / Quality | Weekly | 94% | 96% |
| M-T08 | Role transfers per 100 weddings | Trust / Quality | Monthly | ≤ 5 | ≤ 3 |
| M-B01 | Planner MRR | Business | Weekly | ₹3.5L | ₹5.5L |
| M-B02 | Trial-to-paid conversion | Business | Weekly | 30% | 40% |
| M-B03 | Average Revenue Per Planner | Business | Monthly | ₹2,800 | ₹3,400 |
| M-B04 | Couple free-to-paid rate | Business | Monthly | 12% | 20% |
| M-B05 | Annual billing uptake | Business | Monthly | 15% | 28% |
| M-B06 | Referral-attributed planners | Business | Monthly | 25% | 35% |
| M-B07 | Planner NPS | Business | Quarterly | ≥ 45 | ≥ 55 |
| M-B08 | Couple referral link conversion | Business | Monthly | 8% | 15% |
| M-AI01 | AI generation success rate | AI | Weekly | 96% | 98% |
| M-AI02 | AI generation P95 latency | AI | Weekly | 22s | 18s |
| M-AI03 | Briefing specificity rate | AI | Weekly | 90% | 96% |
| M-AI04 | India-vocabulary compliance | AI | Weekly | 95% | 99% |
| M-AI05 | Prompt version distribution | AI | Monthly | ≥80% on current | ≥80% on current |

---

## 13.9 Objective-to-Metric Cross-Reference

Each business and user objective from Section 4 maps to at least one metric. This table confirms the measurement coverage is complete.

| Objective | Metric(s) |
| --- | --- |
| BO1 — Become primary planning OS | M-R05 (wedding completion), M-E03 (vendor completeness), M-E01 (briefing open rate), M-E08 (portfolio health distribution) |
| BO2 — Acquire planners as distribution channel | M-A01 (onboarding completion), M-A02 (weddings per planner), M-B02 (trial conversion), M-B06 (referral rate), M-B07 (NPS) |
| BO3 — Establish recurring SaaS revenue | M-B01 (MRR), M-B02 (trial conversion), M-B03 (ARPP), M-B05 (annual billing) |
| BO4 — Build execution data asset | M-E03 (vendor completeness), M-E02 (briefing action rate), M-AI04 (vocabulary compliance), M-R06 (directory growth) |
| BO5 — Retain planners across weddings | M-R01 (30-day retention), M-R02 (90-day retention), M-R03 (multi-wedding rate), M-R06 (directory growth) |
| PO1 — Manage all weddings from one view | M-A02 (weddings per planner), M-R03 (multi-wedding rate), M-E08 (portfolio health distribution) |
| PO2 — Onboard a new wedding in under 10 minutes | M-A01 (onboarding completion rate — correlates with speed) |
| PO3 — Never miss a payment or confirmation | M-T01 (milestones paid on time), M-T02 (30-day confirmation rate), M-E05 (tracker resolution), M-E07 (out-of-cycle alert action rate) |
| PO4 — Give clients the right visibility | M-A05 (participant invitation rate), M-R04 (couple return rate), M-T07 (WhatsApp delivery rate) |
| CO1 — Get a complete plan from basic inputs | M-A03 (Mode 2 wizard completion), M-A04 (timeline acceptance), M-T03 (India-calibration) |
| CO2 — Keep family aligned | M-A05 (participant invitation rate), M-R04 (couple return rate), M-T07 (WhatsApp delivery rate) |
| CO3 — Replace spreadsheets as budget tracker | M-E04 (milestones per booked vendor), M-T01 (milestones paid on time) |
| CO4 — Know what needs to happen next | M-E01 (briefing open rate), M-E02 (briefing action rate), M-E06 (task completion), M-E07 (out-of-cycle alert action rate) |
| QO1 — WhatsApp-first delivery | M-T07 (WhatsApp delivery rate) |
| QO3 — Permission integrity | M-T04 (RLS bypass incidents) |
| QO4 — Data completeness feedback | M-T05 (completeness signal action rate), M-E03 (vendor completeness), M-T06 (contract status completion) |
| QO7 — AI output specific and India-calibrated | M-T03 (India-calibration score), M-AI03 (briefing specificity), M-AI04 (vocabulary compliance) |
| GTM pilot gate (Section 12.4) | M-B07 (NPS ≥ 40 at week 8) |
| GTM V1-to-V2 gate (Section 12.6) | M-B07 (NPS ≥ 45), M-R01 (planner retention ≥ 70%), M-E03 (data quality ≥ 60%), M-R04 (couple engagement ≥ 50%), M-B01 (MRR ≥ ₹10L) |

---

*Section 13 complete.PRD V1 Draft — all 13 sections complete.*