# Vivaah OS — Claude Code Project Context

This file is read automatically by Claude Code on every session.
It contains the full context needed to work on this project without re-explanation.
Read this entire file before making any changes to any file in this project.

---

## What this product is

Vivaah OS is an AI-native wedding planning operating system built exclusively for
the Indian market. It replaces WhatsApp threads, Excel sheets, and physical diaries
with a single intelligent system that plans, tracks, coordinates, and proactively
manages every Indian wedding.

This is NOT a vendor discovery marketplace. It is an execution orchestrator —
the operating layer that takes over once vendors are shortlisted.

Core value: knowing what is at risk before it becomes a problem. Proactive,
not reactive. Specific, not generic.

---

## Project structure

```
vivaah-os/
├── CLAUDE.md                          ← this file
├── PRD_Section_*.md                   ← full PRD — source of truth for all decisions
├── Design_System_v1_0.md              ← source of truth for all UI decisions
│
├── vivaah-schema/
│   ├── migrations/                    ← Supabase SQL migrations (run in Supabase SQL Editor)
│   └── functions/                     ← Supabase Edge Functions (Deno/TypeScript)
│
├── vivaah-auth/
│   └── policies/                      ← RLS policy migrations
│
└── vivaah-frontend/
    ├── src/
    │   ├── components/ui/             ← base UI components (Button, Input, RupeeInput, BottomSheet, Badge, EventChip, SkeletonCard, BottomNav)
    │   ├── components/vendors/        ← vendor-specific components
    │   ├── components/templates/      ← template components
    │   ├── components/participants/   ← participant components
    │   ├── pages/onboarding/          ← S28 wizard screens
    │   ├── pages/vendors/             ← S5 vendor card screens
    │   ├── pages/participants/        ← S23 participant management
    │   ├── pages/dashboard/           ← wedding dashboards (Mode 1 + Mode 2)
    │   ├── pages/payments/            ← S12 payment milestone calendar
    │   ├── pages/budget/              ← S10 budget ledger
    │   ├── pages/tracker/             ← S14 confirmation tracker
    │   ├── pages/portfolio/           ← S17 planner portfolio (Mode 1 only)
    │   ├── pages/templates/           ← S18 template library (Mode 1 only)
    │   ├── pages/invite/              ← invite landing page
    │   ├── hooks/                     ← useAuthRedirect, useOffline, etc.
    │   └── lib/                       ← supabase.ts, formatDate.ts, formatRupees.ts, navigation.ts
    └── public/
        ├── sw.js                      ← service worker (PWA)
        └── manifest.json
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend / DB | Supabase (Postgres) |
| Auth | Supabase Auth |
| Permissions | Supabase Row Level Security (RLS) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Hosting | Netlify |
| AI (Phase 3) | Anthropic claude-sonnet-4-20250514 |
| WhatsApp (Phase 3) | Twilio or Gupshup (not yet configured) |

---

## Build phases and current state

### Phase 1 — Architecture (COMPLETE)
- S28 Smart onboarding wizard
- S23 Role and access setup
- S5 Vendor card with two-layer architecture
- S29 India-specific vendor category defaults

### Phase 2 — Operating layer (COMPLETE)
- S12 Payment milestone calendar
- S10 Budget ledger
- S14 30-day confirmation tracker
- S17 Planner portfolio view with health scores (Mode 1 only)
- S18 Client onboarding template (Mode 1 only)

### Phase 3 — AI and habit layer (NOT YET BUILT)
- S1 AI multi-event timeline generation (Anthropic API)
- S3 Weekly AI briefing (Anthropic API + WhatsApp delivery)
- Scheduled Edge Functions (cron: overdue milestone flagging, stalled vendor detection, briefing generation)
- WhatsApp Business API provider integration
- Sentry error monitoring

### Fix pass in progress
A Phase 1+2 code review identified 15 issues. A fix agent was executing them when
the session ended. Check the current state of these files before assuming fixes are applied:
- src/pages/dashboard/PlannerDashboard.tsx (yellow → amber tokens)
- src/pages/dashboard/HeadPlannerDashboard.tsx (yellow → amber tokens)
- src/pages/vendors/VendorList.tsx (CSS variable → Tailwind token, border colour, empty state copy)
- src/components/vendors/AddVendorSheet.tsx (SELECT queries → vendor_instances_view)
- src/lib/navigation.ts (may not exist yet — needs creating)
- src/components/ui/BottomNav.tsx (may not exist yet — needs creating)
- src/pages/participants/ParticipantList.tsx (SkeletonCard, typed event handlers)
- src/pages/budget/BudgetLedger.tsx (rounded-xl → rounded-2xl, text-[15px] → text-xl)
- src/components/ui/Button.tsx (min-w-[44px] on small variant)
- src/components/ui/Badge.tsx (text-[11px] → text-xs, keep uppercase and tracking-wide)
- src/pages/vendors/VendorDetail.tsx (any[] → EventRef[])
- src/pages/onboarding/ParticipantSetup.tsx (any → specific union type)
- src/pages/onboarding/EventSetup.tsx (typed event handlers)
- src/components/vendors/CategoryDefaults.tsx (typed event handlers)

---

## Two operating modes — the most important architectural concept

Mode is set at the wedding level during onboarding. Never at the user level.
A single user can have multiple weddings across different modes.

### Mode 1 — Planner-led
- Professional planner is primary operator with full access
- Two fixed access levels: couple_view, family_view
- Planner controls all access — couple cannot escalate their own permissions
- Features exclusive to Mode 1: S17 portfolio view, S18 client templates
- If planner account is deleted: wedding enters 'suspended' state

### Mode 2 — Self-planned
- Head planner (from couple or family) has full admin access
- Six configurable access levels: full, budget, task, event_specific, view_only, guest
- Default access for new participants: view_only
- Head planner role is transferable (atomic DB transaction, requires acceptance)
- No portfolio view, no client templates

---

## Permission model — enforce at DB layer, never UI layer

### Access levels and what each sees

| Access level | Mode | Rate visible | Budget visible | Tasks visible | Vendors visible |
|---|---|---|---|---|---|
| planner_full | 1 | ✓ | ✓ full | ✓ | All |
| couple_view | 1 | ✗ | Aggregate only via function | ✗ | Confirmed/done only |
| family_view | 1 | ✗ | ✗ | ✗ | ✗ (schedule only) |
| full | 2 | ✓ | ✓ full | ✓ | All |
| budget | 2 | ✓ | ✓ full | ✗ | All (read only) |
| task | 2 | ✗ | ✗ | Assigned only | Confirmed only |
| event_specific | 2 | ✗ | ✗ | Their event only | Their event only |
| view_only | 2 | ✗ | ✗ | ✓ (read) | Confirmed only |
| guest | 2 | ✗ | ✗ | ✗ | ✗ (schedule only) |

### Critical permission rules
1. RLS at Supabase layer enforces all permissions — frontend is never the sole gatekeeper
2. `vendor_instances_view` handles negotiated_rate visibility via CASE statement (NULL for restricted roles)
3. couple_view financial data comes ONLY from `couple_view_financial_summary()` RPC function
4. Hidden navigation items are NOT in the DOM — not hidden with CSS, not greyed, absent entirely
5. Permission changes take effect immediately — no grace period, no session cache
6. Navigation rendered from `NAV_ITEMS` data structure in `src/lib/navigation.ts` keyed by access_level

---

## Vendor architecture — two-layer model (critical to understand)

### Layer 1: vendor_directory (persistent, belongs to planner)
- Stores: vendor name, category, city, phone, notes, wedding_count, last_used_date
- NEVER stores: rates, amounts, prices, fees, costs, payment terms, deliverables
- Scoped to planner: owner_user_id = auth.uid() — no cross-planner visibility
- Grows with every wedding. Persists when wedding is archived.

### Layer 2: vendor_instances (per-wedding, contextual)
- Stores: negotiated_rate, payment schedule, deliverables, contract_status, confirmation_status
- Linked to wedding_id — all data scoped to one wedding
- Rate data NEVER crosses weddings — enforced at RLS query layer
- Status lifecycle: shortlisted → quoted → booked → confirmed → done
  - Advance only forward (DB trigger enforces)
  - Revert requires reason entry (logged to audit_log)
  - Done status: not revertable under any circumstance
  - Booked requires negotiated_rate to be non-null (DB trigger enforces)

### Vendor queries
All SELECT queries must use `vendor_instances_view` not `vendor_instances`:
```ts
// CORRECT
supabase.from('vendor_instances_view').select('*')
// WRONG — never do this for SELECT
supabase.from('vendor_instances').select('*')
```
INSERT and UPDATE operations correctly go to the base `vendor_instances` table.

---

## Data model — core entities

### weddings
Fields: id, mode (1|2), couple_name_1, couple_name_2, wedding_date, planning_start_date,
destination_flag, city, total_planned_budget (paise), muhurat_flag, late_start_flag,
late_start_weeks, status (active|suspended|archived), created_by, health_score (good|at_risk|critical),
health_score_updated_at, template_id, prompt_version, deleted_at

### events
Fields: id, wedding_id, event_name (Indian names only), event_date, start_time, end_time,
venue_name, venue_address, dress_code, notes, is_custom, status (planned|confirmed|complete), deleted_at

### participants
Fields: id, user_id (nullable), wedding_id, name, phone, role, access_level, event_scope_id,
invited_by, invited_at, invite_status (pending|sent|failed|accepted), last_active,
status (active|revoked), created_at, updated_at
Note: NO deleted_at on participants — use status = 'revoked' for removal

### vendor_directory (Layer 1)
Fields: id, owner_user_id, vendor_name, category, city, phone, notes, wedding_count,
last_used_date, deleted_at
NEVER HAS: rate, amount, price, fee, cost, or any financial field

### vendor_instances (Layer 2)
Fields: id, wedding_id, directory_reference_id (nullable), vendor_name, category, city, phone,
negotiated_rate (paise, nullable), deliverables, contract_status, confirmation_status,
planner_notes, deleted_at

### payment_milestones
Fields: id, vendor_instance_id, wedding_id, amount (paise), due_date, paid_date,
status (upcoming|due|paid|overdue|disputed), description, deleted_at

### budget_ledger
Fields: id, wedding_id, total_planned_budget (paise)
NEVER HAS: committed or paid columns — these are always computed, never stored
committed = SUM(vendor_instances_view.negotiated_rate WHERE status IN ('booked','confirmed','done'))
paid = SUM(payment_milestones.amount WHERE status = 'paid')

### tasks
Fields: id, wedding_id, event_id (nullable), title, description, assigned_to, due_date,
status (not_started|in_progress|complete|overdue), created_by, deleted_at

### timelines
Fields: id, wedding_id, generated_at, planning_horizon_months, late_start_flag,
late_start_weeks, prompt_version, items (jsonb), deleted_at

### audit_log
Fields: id, entity_type, entity_id, wedding_id, actor_participant_id, changed_at,
previous_value, new_value, reason
PERMANENT — no deleted_at, never deleted by any user action

### messages_queue
Fields: id, recipient_phone, message_type, payload (jsonb), status, retry_count,
retry_after, sent_at, failed_at
Message types: participant_invite, role_transfer_request, access_revoked,
weekly_briefing, wedding_suspended, invite_delivery_failure

### wedding_templates (Phase 2)
Fields: id, owner_user_id, template_name, event_sequence (jsonb), access_config (jsonb),
task_category_defaults (jsonb), usage_count, last_used_date, deleted_at
NEVER HAS: couple names, wedding date, vendor data, rates, payment milestones, client notes

---

## Non-negotiable data rules

1. **No hard deletes anywhere** — all deletions set deleted_at timestamp
   CORRECT: `.update({ deleted_at: new Date().toISOString() })`
   WRONG: `.delete()` on any primary entity
   Exception: participants use status = 'revoked', not deleted_at

2. **No rate data on vendor_directory** — vendor_directory must never have
   rate, amount, price, fee, or cost column — ever

3. **Budget figures computed, never stored** — committed and paid are always
   computed from vendor_instances and payment_milestones respectively.
   Never write committed or paid to budget_ledger.

4. **All monetary values in paise** — storage is always integer paise (rupees × 100)
   Display converts to lakh/crore format. Never store rupees as floats.

5. **Audit log is permanent** — frontend never writes to audit_log
   DB triggers write to it. Never INSERT/UPDATE/DELETE audit_log from frontend.

6. **Rate isolation** — every vendor query must include wedding_id filter
   Rate data from one wedding must never appear in queries for another.

7. **Soft delete filter** — every SELECT on primary entities must include
   WHERE deleted_at IS NULL (or Supabase .is('deleted_at', null))

8. **Health score is cached** — weddings.health_score is updated by DB triggers
   on payment_milestones, vendor_instances, and tasks status changes.
   Portfolio reads from the cache. Does not compute live on portfolio load.

---

## India-specific UX rules — all non-negotiable

### Rupee formatting
```
Storage:  always integer paise (e.g. 3650000 = ₹36.5 lakh)
Display:  < ₹1 lakh  →  ₹75,000        (Indian comma format)
          ≥ ₹1 lakh  →  ₹36.50 lakh    (two decimal places)
          ≥ ₹1 crore →  ₹1.20 crore
₹ symbol: always displayed as prefix element — never typed by user
Input:    accepts 150000, 1.5L, 1.5 lakh → normalises to paise on blur
Keyboard: inputMode="numeric" on all rupee input fields
```

### Date formatting
```
Display:  DD/MM/YYYY everywhere — no exceptions
Input:    date picker, displayed as DD/MM/YYYY
Never:    ISO strings shown to users (2026-03-15 → must format to 15/03/2026)
Never:    MM/DD/YYYY anywhere
```

### Event naming
Permitted: haldi, mehendi, sangeet, engagement, wedding, reception
Never use: ceremony (as event name), party, event 1, function, pre-wedding event,
           henna (use mehendi), officiant (use priest/pandit), processional (use baraat)

### Muhurat dates
Wedding date fields include "Date set by pandit / muhurat" toggle.
When selected: records muhurat_flag = true on Wedding record.
No other behaviour change — date input still accepts value normally.
No alternative date suggestions when muhurat is selected.

### WhatsApp as first-class channel
All participant invites, access changes, role transfers, and briefings
must be deliverable via WhatsApp. WhatsApp is not a fallback — it is primary.
Messages go to messages_queue table. Provider integration is Phase 3.

---

## Design system — non-negotiable rules

Read Design_System_v1_0.md for the full specification.
These are the most commonly violated rules:

### Colours
```
Primary CTA:        bg-vivaah-600 (#7C3AED), hover: bg-vivaah-800 (#5B21B6)
Never use:          purple-500, purple-600, purple-700, purple-800 (Tailwind defaults)
Page background:    bg-gray-50
Cards:              bg-white border border-gray-100 rounded-2xl p-4
NO drop shadows:    shadow-md, shadow-lg, shadow-xl are banned in V1
                    shadow-sm permitted only on desktop popovers

Success (green):    #10B981 — only for confirmed, paid, on-track, done, good health
Warning (amber):    #F59E0B — only for at-risk, quoted, due-soon, 85%+ budget
Danger (red):       #EF4444 — only for overdue, critical, delete actions
Info (blue):        #3B82F6 — only for booked status, informational notices
```

### Typography — two weights ONLY
```
font-medium (500): headings, labels, primary data
default (400):     body copy, descriptions, metadata
NEVER USE: font-semibold, font-bold, font-600, font-700

Type scale:
  Display:     text-[28px] font-medium leading-tight  (screen headings)
  Title:       text-xl font-medium                    (section titles, modal titles)
  Body strong: text-[17px] font-medium                (vendor names, amounts)
  Body:        text-[15px]                            (body copy — weight 400)
  Small:       text-sm                                (metadata, timestamps)
  Label:       text-[11px] font-medium tracking-wide uppercase  (section labels)
```

### Components
```
Buttons:     min-h-[44px] min-w-[44px] on every button — no exceptions
             Primary:   bg-vivaah-600 text-white h-11 px-5 rounded-xl font-medium
             Secondary: border border-vivaah-600 text-vivaah-600 h-11 px-5 rounded-xl
             Ghost:     text-gray-500 h-11 px-5 rounded-xl
             Danger:    bg-danger text-white h-11 px-5 rounded-xl
             Small:     h-9 px-3.5 rounded-lg text-sm (keep min-h/min-w)
             Disabled:  opacity-50 cursor-not-allowed

Inputs:      h-11 border border-gray-300 rounded-xl focus:border-vivaah-600
             focus:ring-0 outline-none bg-white px-3
             Labels: always visible above field — never placeholder-only

Cards:       bg-white border border-gray-100 rounded-2xl p-4 (no shadows)

Overlays:    BottomSheet on mobile (rounded-t-3xl, max-h-[90vh], handle bar)
             NEVER centred modals on mobile viewport
             Handle bar: w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4
```

### Vendor status badges
All badges: `inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5`
```
Shortlisted: bg-gray-100 text-gray-600
Quoted:      bg-yellow-50 text-yellow-900
Booked:      bg-blue-100 text-blue-800
Confirmed:   bg-emerald-100 text-emerald-800
Done:        bg-vivaah-100 text-vivaah-800
Overdue:     bg-red-100 text-red-800
```

### Event chip colours (FIXED — never swap between events)
```
Haldi:      bg-[#FFFBEB] text-[#92400E] border-[#FCD34D]
Mehendi:    bg-[#F0FDF4] text-[#14532D] border-[#86EFAC]
Sangeet:    bg-[#FAF5FF] text-[#581C87] border-[#C084FC]
Engagement: bg-[#FFF7ED] text-[#7C2D12] border-[#FDBA74]
Wedding:    bg-[#FFF1F2] text-[#9F1239] border-[#FDA4AF]
Reception:  bg-[#EFF6FF] text-[#1E3A5F] border-[#93C5FD]
Custom:     bg-gray-100 text-gray-600 border-gray-200
```

### Navigation
Mode 1 planner:    Portfolio → Vendors → Payments → Tracker → Briefings → Participants → Settings
Mode 1 couple:     Plan status → Schedule → Upcoming payments
Mode 1 family:     Schedule only
Mode 2 head:       Dashboard → Vendors → Budget → Payments → Tracker → Timeline → Briefings → Participants → Settings
Mode 2 full:       Same as head planner
Mode 2 budget:     Budget → Payments
Mode 2 task:       Tasks (assigned only)
Mode 2 view_only:  Plan → Schedule → Vendors (confirmed only)
Mode 2 guest:      Schedule → Dress code → Venue

Navigation items for restricted roles do NOT exist in the DOM.
Not hidden. Not greyed. Completely absent.

---

## Security rules — never violate

1. No Anthropic API key, Supabase service role key, or WhatsApp credentials in client code
2. All secrets come from `import.meta.env.VITE_*` on frontend
3. Supabase Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` from Deno.env — never anon key
4. Supabase client instantiated ONLY in `src/lib/supabase.ts` — never createClient elsewhere
5. No audit_log INSERT/UPDATE/DELETE from frontend — DB triggers write to it
6. All AI API calls server-side only (Edge Functions) — never client-side

---

## Empty states and loading states — required on every list view

Every view that fetches data must have:
- Skeleton loading state using `<SkeletonCard />` during fetch
- Designed empty state with directive text and action button when data is empty
- Never a blank screen, never a full-page spinner, never "No data"

Empty state copy (exact text):
```
Vendor list:          "Add your first vendor to start tracking payments and confirmations."
Payment calendar:     "No payments scheduled. Add payment milestones to your vendor cards."
Confirmation tracker: "All clear. All vendors with upcoming events are confirmed."
Portfolio:            "Create your first wedding to get started. Every wedding you manage will appear here with a live health score."
Template library:     "No templates yet."
Briefing (all clear): "Your wedding is on track. No actions needed this week."
```

---

## Phase 3 — what is NOT yet built

Do not implement Phase 3 features unless explicitly instructed. When working near
Phase 3 boundary code, add TODO comments, do not implement.

Phase 3 items:
- S1: AI timeline generation (Anthropic API call from Edge Function)
- S3: Weekly AI briefing generation and delivery
- WhatsApp Business API provider integration (Twilio or Gupshup)
- Scheduled Edge Functions (cron jobs via Supabase pg_cron or external scheduler)
  - flag-overdue-milestones: daily at 00:01
  - flag-stalled-vendors: daily at 06:00
  - weekly-briefing-generation: weekly on user-configured day
- Sentry error monitoring integration

Data model for Phase 3 is already in place:
- timelines table exists
- messages_queue table exists with all required message types
- prompt_version field on weddings and timelines exists

---

## How to work on this project

### Before making any change
1. Read the relevant PRD section for the feature you are touching
2. Read Design_System_v1_0.md if making any UI changes
3. Check what already exists before creating new files

### When writing Supabase queries
```ts
// Always use vendor_instances_view for SELECT
const { data } = await supabase
  .from('vendor_instances_view')
  .select('*')
  .eq('wedding_id', weddingId)
  .is('deleted_at', null)

// Always include wedding_id filter on financial data
// Always include .is('deleted_at', null) on primary entities

// Soft delete pattern (never .delete())
await supabase
  .from('vendor_instances')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', vendorId)

// couple_view financial data — only via RPC
const { data } = await supabase
  .rpc('couple_view_financial_summary', { p_wedding_id: weddingId })
```

### When writing TypeScript
- No `any` types on Supabase query results — define interfaces
- Typed event handlers: `(e: React.ChangeEvent<HTMLInputElement>) =>`
- null from Supabase, not undefined — handle null throughout
- Run `npx tsc --noEmit` before declaring any change complete

### When writing SQL migrations
- File naming: YYYYMMDDXXXXXX_description.sql
- All changes additive — no DROP TABLE, DROP COLUMN on existing data
- All monetary amounts as bigint (paise)
- All new tables need: soft delete guard trigger, set_updated_at trigger, RLS enabled
- All new tables owned by a user need owner isolation RLS (same pattern as vendor_directory)

### When running builds
```powershell
cd vivaah-frontend
npx tsc --noEmit    # TypeScript check
npm run build       # production build
npm run dev         # development server (localhost:5173)
```

---

## Key files to know

| File | Purpose |
|---|---|
| `src/lib/supabase.ts` | Single Supabase client — import from here everywhere |
| `src/lib/formatDate.ts` | `formatDateDDMMYYYY()` — use for all date displays |
| `src/lib/formatRupees.ts` | `formatRupees()` — use for all financial displays |
| `src/lib/navigation.ts` | `NAV_ITEMS` — navigation data structure by access level |
| `src/components/ui/Button.tsx` | All buttons — min-h/min-w-[44px] enforced |
| `src/components/ui/Input.tsx` | All text inputs — persistent labels enforced |
| `src/components/ui/RupeeInput.tsx` | All financial inputs — paise normalisation |
| `src/components/ui/BottomSheet.tsx` | All mobile overlays |
| `src/components/ui/Badge.tsx` | All status badges |
| `src/components/ui/EventChip.tsx` | All event colour chips |
| `src/components/ui/SkeletonCard.tsx` | All loading states |
| `src/components/ui/BottomNav.tsx` | Data-driven bottom navigation |
| `src/hooks/useAuthRedirect.ts` | Login routing by mode |
| `src/hooks/useOffline.ts` | Offline state detection |
| `src/pages/invite/InviteLanding.tsx` | No-auth invite link view — min 16px font |
| `src/pages/dashboard/WeddingDashboard.tsx` | Mode router → PlannerDashboard or HeadPlannerDashboard |
| `vivaah-schema/migrations/20260409000000_vivaah_os_phase1_schema.sql` | Phase 1 schema |
| `vivaah-schema/migrations/20260410000010_phase2_schema_additions.sql` | Phase 2 additions |

---

## Migrations run order in Supabase SQL Editor

Run in this order — do not skip or reorder:
1. `vivaah-schema/migrations/20260409000000_vivaah_os_phase1_schema.sql`
2. `vivaah-schema/migrations/20260410000001_fix_timelines_soft_delete.sql`
3. `vivaah-auth/policies/rls_final.sql`
4. `vivaah-schema/migrations/20260410000010_phase2_schema_additions.sql`
5. `vivaah-schema/migrations/20260411000002_fix_audit_trigger_security.sql`
6. `vivaah-schema/migrations/20260412000001_briefings_table.sql`
7. `vivaah-schema/migrations/20260413000001_fix_tasks_created_by_nullable.sql`

Archived (superseded — do not run on fresh installs):
- `vivaah-schema/migrations/archive/20260409000001_vivaah_os_phase1_rls.sql`
- `vivaah-schema/migrations/archive/20260410000002_fix_financial_summary_security.sql`
- `vivaah-auth/policies/archive/20260410000003_fix_couple_view_vendors.sql`
- `vivaah-schema/migrations/archive/20260411000001_fix_onboarding_bootstrap.sql`
- `vivaah-schema/migrations/archive/20260412000003_fix_vendor_directory_rls.sql`

---

## V2 roadmap (out of scope — do not implement)

- Shared vendor network across planners
- Contract ingestion (PDF/photo → AI extracts payment milestones)
- Vendor communication log (WhatsApp forward → auto-attached to vendor card)
- Quote comparison tool
- WhatsApp bot for family/guest queries
- Day-of runsheet builder
- Logistics and transport coordination
- Planner team task delegation
- Family portal shareable links
- Conversational AI planning assistant for self-planned couples
- Dual-family budget attribution (bride's family vs groom's family separate ledgers)
- Mode switching (Mode 2 → Mode 1 migration)
- Platform-level vendor network with trust signals