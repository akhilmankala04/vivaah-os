# Vivaah OS — Design System v1.0

> This document is a living reference for all design and build decisions. It is the single source of truth for colour, typography, spacing, components, and India-specific UX rules. Every v0 prompt, every screen, and every component must conform to this specification. Decisions here supersede any tool defaults.

---

## DS-00 How to Use This Document

This design system has two audiences:

1. **v0 prompts** — paste the prompt block from DS-08 at the top of every screen prompt. It gives v0 the constraints it needs to produce on-brand output without deviation.
2. **Code review** — use the token tables and component specs to verify that generated output conforms before committing.

Sections are ordered from foundational (colour, type, spacing) to composite (components, patterns, India-specific rules). Read DS-01 through DS-04 once to understand the system. Return to DS-05 through DS-07 when building specific components.

---

## DS-01 Brand Identity

### Positioning rationale

The product is an execution-first operating system for Indian wedding planning. The visual language must read as **professional planning software**, not as a wedding marketplace, invitation platform, or consumer lifestyle app.

Indian wedding platforms uniformly use reds, golds, and pinks — the visual vocabulary of a shaadi invitation. This product deliberately does not. The brand colour is **Vivaah Purple** — culturally adjacent to the marigold-to-violet palette of Indian celebrations, but clearly differentiated from every competitor. On mobile, it reads as premium software. In the context of Indian weddings, it reads as intentional and modern without being cold.

### Colour philosophy

- **One primary colour.** Purple at a single stop (`#7C3AED`) is the primary interactive colour. Everything else is semantic (success / warning / danger / info) or neutral.
- **Semantic colours encode meaning, never decoration.** Green is always success. Amber is always at-risk. Red is always danger. These are not used for aesthetic variety.
- **India-specific event colours are fixed.** Each of the six Indian wedding events has a permanently assigned colour pair. These are not interchangeable. They create a consistent visual grammar across the product.

---

## DS-02 Colour Tokens

### Primary ramp — Vivaah Purple

| Token | Hex | Use |
|---|---|---|
| `purple-50` | `#F5F3FF` | Tinted backgrounds, hover fills on ghost elements |
| `purple-100` | `#EDE9FE` | Mode 1 tag backgrounds, selected chip fills |
| `purple-200` | `#DDD6FE` | Focus rings, subtle dividers, inactive tab indicators |
| `purple-400` | `#A78BFA` | Disabled state for primary buttons |
| `purple-600` | `#7C3AED` | **Primary CTA, active nav items, links, focus borders** |
| `purple-800` | `#5B21B6` | Button hover state, pressed states |
| `purple-950` | `#3B0764` | Text on purple-100 or purple-200 fills |

### Semantic colours — fixed function

These colours are never used decoratively. Each encodes exactly one type of meaning across the entire product.

| Token | Hex | Encodes |
|---|---|---|
| `success` | `#10B981` | On track, Confirmed, Done, Paid, health-good |
| `warning` | `#F59E0B` | At risk, Quoted, due soon, health-risk |
| `danger` | `#EF4444` | Overdue, Critical, delete actions, health-critical |
| `info` | `#3B82F6` | Booked status, informational notices |
| `neutral` | `#6B7280` | Shortlisted, view-only state, disabled elements |

### Surface and background

Use Tailwind's default surface tokens. Never hardcode background hex values.

| Role | Tailwind class | Use |
|---|---|---|
| Page background | `bg-gray-50` | All page backgrounds |
| Card surface | `bg-white` | Cards, modals, bottom sheets |
| Input background | `bg-white` | All form inputs |
| Elevated surface | `bg-white` with `shadow-sm` | Drawers, popovers (desktop only) |

### Indian event colours — fixed, non-interchangeable

Each event has a permanently assigned background, text, and border colour. These are used on event chips, event headers, and any event-tagged content throughout the product.

| Event | Background | Text | Border |
|---|---|---|---|
| Haldi | `#FFFBEB` | `#92400E` | `#FCD34D` |
| Mehendi | `#F0FDF4` | `#14532D` | `#86EFAC` |
| Sangeet | `#FAF5FF` | `#581C87` | `#C084FC` |
| Engagement | `#FFF7ED` | `#7C2D12` | `#FDBA74` |
| Wedding | `#FFF1F2` | `#9F1239` | `#FDA4AF` |
| Reception | `#EFF6FF` | `#1E3A5F` | `#93C5FD` |

---

## DS-03 Typography

### Font

**System font stack via Tailwind `font-sans`.** No custom typeface in V1. Rationale: reduces load time on Indian 4G connections; system fonts render at native quality on Android and iOS, which are the primary access devices.

### Type scale

Two weights only across the entire product: **400 (regular)** and **500 (medium)**. Never 600 or 700 — they render heavy on mobile at these sizes against the card-heavy layout.

| Role | Size | Weight | Line height | Tailwind | Use |
|---|---|---|---|---|---|
| Display | 28px | 500 | 1.2 | `text-[28px] font-medium leading-tight` | Screen headings, hero amounts on dashboards |
| Title | 20px | 500 | 1.3 | `text-xl font-medium` | Section titles, card headings, modal titles |
| Body strong | 17px | 500 | 1.4 | `text-[17px] font-medium` | Primary data, vendor names, event names |
| Body | 15px | 400 | 1.5 | `text-[15px]` | General body copy, descriptions, form labels with values |
| Small | 13px | 400 | 1.5 | `text-sm` | Metadata, secondary info, timestamps, helper text |
| Caption / label | 11px | 500 | 1.4 | `text-[11px] font-medium tracking-wide uppercase` | Section labels (all-caps), tag labels |

### Rules

- **Persistent labels on all inputs.** Labels sit above the field always. Placeholder-only labelling is forbidden — labels must remain visible when the field has a value.
- **Sentence case everywhere.** No title case on UI labels, button text, or navigation items. Exception: ALL-CAPS on caption/label role only.
- **No mid-sentence bolding in body copy.** Bold (500) is for headings and labels only.

---

## DS-04 Spacing and Layout

### Spacing scale

Base 4px. Use only these values throughout the product.

| Value | Tailwind | Primary use |
|---|---|---|
| 4px | `p-1` | Micro gaps, badge internal padding |
| 8px | `p-2` | Tight internal component spacing |
| 12px | `p-3` | Internal chip/badge padding |
| 16px | `p-4` | **Card internal padding (default)** |
| 24px | `p-6` | Section gaps within a card |
| 32px | `p-8` | Between-card gaps, section breaks |
| 40px | `p-10` | Major section dividers |
| 48px | `p-12` | Top-of-screen breathing room |
| 64px | `p-16` | Bottom padding for mobile scroll (above nav bar) |

### Page layout

| Context | Horizontal padding | Max width |
|---|---|---|
| Mobile (primary) | `px-4` (16px each side) | 390px viewport — no max-width constraint |
| Desktop (secondary) | `px-6` (24px each side) | `max-w-4xl` centered — portfolio and budget views get enhanced layouts |

### Border radius

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `radius-sm` | 6px | `rounded-md` | Chips, badges, small inline tags |
| `radius-md` | 10px | `rounded-xl` | Inputs, buttons, small controls |
| `radius-lg` | 14px | `rounded-2xl` | Cards, modals, confirmation dialogs |
| `radius-xl` | 20px | `rounded-3xl` | Bottom sheets, full-screen overlays, drawers |
| `radius-pill` | 9999px | `rounded-full` | Status pills, avatar rings, toggle tracks |

### Elevation

**No drop shadows in V1.** Flat cards (`bg-white border border-gray-100`) on a slightly tinted page background (`bg-gray-50`) create sufficient visual elevation without shadows. Shadow is permitted only on desktop popovers and drawers (`shadow-sm` maximum).

---

## DS-05 Components

### Buttons

All buttons have a minimum touch target of `44×44px` — enforced via `min-h-[44px] min-w-[44px]` on every button element.

| Variant | Tailwind classes | Use |
|---|---|---|
| Primary | `bg-purple-600 text-white h-11 px-5 rounded-xl font-medium hover:bg-purple-800 transition-colors` | Primary flow advances, confirm actions |
| Secondary | `border border-purple-600 text-purple-600 h-11 px-5 rounded-xl font-medium hover:bg-purple-50 transition-colors` | Secondary options, add actions |
| Ghost | `text-gray-500 h-11 px-5 rounded-xl font-medium hover:bg-gray-100 transition-colors` | Skip, cancel, dismiss |
| Danger | `bg-red-600 text-white h-11 px-5 rounded-xl font-medium hover:bg-red-700 transition-colors` | Delete, remove, revoke access |
| Small (in-card) | Add `h-9 px-3.5 rounded-lg text-sm` — replaces height and padding only | Actions inside cards, inline edit buttons |

**Disabled state:** `opacity-50 cursor-not-allowed` — applies to all variants.

### Form inputs

- **Height:** 44px (`h-11`)
- **Border:** `border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-0 outline-none`
- **Background:** `bg-white`
- **Padding:** `px-3`

**Rupee input fields:**
```
₹ prefix — displayed as a leading element, never entered by the user
inputmode="numeric" — triggers numeric keyboard on mobile
Accepts: 150000 or 1.5L or 1.5 lakh → normalise to integer on blur
Display on storage: convert integer → lakh/crore format for display
```

**Date input fields:**
```
Format: DD/MM/YYYY — no exceptions
Display: use DD/MM/YYYY string formatting on all date outputs
Muhurat toggle: add "Date set by pandit" label option on wedding date fields
  → No behavioural change when selected. Records muhurat flag on the Wedding record.
```

**Select / dropdown:**
- Use native `<select>` on mobile for accessibility and performance.
- Custom styled dropdown only where multi-select or search-within is required.

### Cards

```
bg-white border border-gray-100 rounded-2xl p-4
```

- No drop shadows.
- Card header: vendor/item name at `text-[17px] font-medium` + status badge right-aligned on the same row.
- Divider between header and body: `border-t border-gray-100 my-3`
- Body rows: `flex justify-between items-center text-sm text-gray-600 mb-1.5`
- Values in body: `text-[15px] font-medium text-gray-900`

### Vendor card — collapsed default view

The collapsed view shows exactly four data points. Full detail is behind a tap.

```
Row 1 (header): Vendor name + status badge
Divider
Row 2: Negotiated rate → ₹X.X lakh
Row 3: Next payment → ₹XL on DD MMM
Row 4: Remaining → ₹X.X lakh (amber if > 50% unpaid, red if overdue)
```

A vendor card is visually marked **incomplete** when it lacks: a rate, at least one milestone with a due date, or a Booked-or-above status. Incomplete cards show a faint amber left border (`border-l-2 border-amber-400`).

### Bottom sheet (mobile modal)

```
Fixed to bottom of viewport
rounded-t-3xl bg-white
Handle bar: w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4
Max height: 90vh with internal scroll
```

Never use centred modals on mobile. All overlays are bottom sheets on mobile, centred dialogs on desktop.

### Navigation — tab bar (mobile)

```
Fixed bottom bar: bg-white border-t border-gray-100
Height: 56px
Tab items: flex-1, icon (24px) + label (11px caption), active colour purple-600, inactive gray-400
```

Navigation items rendered are determined entirely by the user's access level. Hidden items are not rendered — not greyed, not locked, not present in the DOM.

### Navigation — sidebar (desktop)

```
Fixed left sidebar: w-56 bg-white border-r border-gray-100
Item height: 40px, px-4, rounded-lg on active
Active: bg-purple-50 text-purple-700 font-medium
Inactive: text-gray-600 hover:bg-gray-50
```

---

## DS-06 Status and State Tokens

### Vendor lifecycle badges

All badges: `inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5`

| Status | Background | Text | Tailwind approx |
|---|---|---|---|
| Shortlisted | `#F3F4F6` | `#4B5563` | `bg-gray-100 text-gray-600` |
| Quoted | `#FEF3C7` | `#92400E` | `bg-yellow-50 text-yellow-900` |
| Booked | `#DBEAFE` | `#1E40AF` | `bg-blue-100 text-blue-800` |
| Confirmed | `#D1FAE5` | `#065F46` | `bg-emerald-100 text-emerald-800` |
| Done | `#F3E8FF` | `#6B21A8` | `bg-purple-100 text-purple-800` |

### Health state indicators (portfolio view)

Three states, distinguishable by colour alone. Must include a text label alongside the dot for accessibility.

| State | Dot colour | Hex | Trigger condition |
|---|---|---|---|
| On track | Green | `#10B981` | No overdue items. No unconfirmed vendors within 30 days. Budget within plan. |
| At risk | Amber | `#F59E0B` | 1–2 overdue items OR a payment due within 7 days unactioned. |
| Critical | Red | `#EF4444` | 3+ overdue items OR any event within 30 days with unconfirmed vendors. |

Dot size: `w-2.5 h-2.5 rounded-full` with label at `text-sm font-medium` in matching text colour.

### Payment status badges

| Status | Background | Text |
|---|---|---|
| Upcoming | `#EFF6FF` | `#1E40AF` |
| Due soon (≤7 days) | `#FEF3C7` | `#92400E` |
| Overdue | `#FEE2E2` | `#991B1B` |
| Paid | `#D1FAE5` | `#065F46` |

### Mode tags

Used on all internal screens, feature specs, and developer-facing labels.

| Mode | Background | Text | Label |
|---|---|---|---|
| Mode 1 | `#EDE9FE` | `#5B21B6` | Mode 1 — Planner-led |
| Mode 2 | `#ECFDF5` | `#065F46` | Mode 2 — Self-planned |
| Both | `#F3F4F6` | `#374151` | Both modes |

### Budget bar — three-state fill

The budget bar shows three segments in a single horizontal track.

```
Track: bg-gray-100 h-2 rounded-full overflow-hidden
Paid segment: bg-emerald-500 (left, fills first)
Committed segment: bg-amber-400 (middle)
Remaining segment: bg-gray-100 (right, implicit — track shows through)

Labels below: Paid (emerald), Committed (amber), Remaining (gray-400)
```

If committed + paid exceeds planned, the bar overflows red: replace track with `bg-red-100` and fill with `bg-red-500`.

---

## DS-07 India-Specific UX Rules

These are non-negotiable product constraints derived from the PRD. They must appear correctly in every screen.

### DS-07-1 Rupee formatting

All financial figures use Indian denomination. Never use Western number formatting (₹3,65,000 alone without a lakh label is not acceptable).

```
< ₹1 lakh       →  ₹75,000            (comma-formatted integer, no lakh suffix)
≥ ₹1 lakh       →  ₹1.50 lakh         (two decimal places)
≥ ₹10 lakh      →  ₹36.5 lakh         (one decimal if clean, two if not)
≥ ₹1 crore      →  ₹1.2 crore
```

**Storage:** always raw rupee integer. Display formatting is a presentation function — never stored.

**Input:** accepts `150000` or `1.5L` or `1.5 lakh` — normalise to integer on blur, display as lakh-formatted value.

**₹ symbol:** always displayed as a prefix by the UI — never entered by the user.

### DS-07-2 Date formatting

```
Display format: DD/MM/YYYY — always, no exceptions
Input format: date picker, displayed as DD/MM/YYYY
Muhurat dates: show "Date set by pandit" toggle on wedding date fields
  → Selecting it records the muhurat flag. No other behaviour changes.
```

### DS-07-3 Indian event naming

Use Indian event names natively in all UI text, AI-generated content, placeholder text, system messages, and WhatsApp notifications.

**Permitted names:** Haldi · Mehendi · Sangeet · Engagement · Wedding · Reception

**Never use:** Ceremony · Party · Event 1 · Function · Celebration · Pre-wedding event

This applies to: navigation labels, event chips, AI timeline tasks, briefing items, WhatsApp messages, onboarding defaults, empty state copy, and all system-generated text.

### DS-07-4 WhatsApp-native formatting

WhatsApp is a primary delivery surface, not a secondary notification channel. Every notification type must have a WhatsApp-deliverable format. WhatsApp rendering rules:

```
Bold text: *text enclosed in asterisks*
Line breaks: blank line between paragraphs
Lists: dash (—) at line start
Emoji: one per section header maximum, used for scanning not decoration
Character limit: 4,096 per message — split longer content into numbered messages
```

All notification copy must be written and tested in WhatsApp format, not just email format.

### DS-07-5 Touch target enforcement

```
Minimum interactive element size: 44×44px
Enforced via: min-h-[44px] min-w-[44px] on all buttons, links, and tap targets
No exceptions — even icon-only buttons in dense table rows
```

### DS-07-6 Mobile-first viewport

```
Primary design viewport: 390px (iPhone 14 equivalent)
All features must be fully functional at 390px — no desktop-only functionality
Desktop (≥1024px): enhanced layouts for Portfolio view and Budget ledger only
  → Additional columns, side-by-side panels, expanded data density
  → Not a separate design — an enhancement of the mobile layout
```

### DS-07-7 Role-aware UI rendering

Hidden tabs and navigation items are not rendered. They do not appear as disabled, greyed, or locked — they do not exist in the DOM for participants who lack access.

```
Mode 1 — Planner:       Portfolio → Wedding → Vendors → Payments → Tracker → Briefings → Settings
Mode 1 — Couple view:   Plan status → Schedule → Upcoming payments
Mode 1 — Family view:   Schedule only
Mode 2 — Head planner:  Dashboard → Vendors → Budget → Payments → Timeline → Briefings → Participants → Settings
Mode 2 — Full access:   Same as head planner
Mode 2 — Budget only:   Budget → Payments
Mode 2 — Task access:   Tasks (assigned only)
Mode 2 — View only:     Plan → Schedule → Vendors (confirmed only)
Mode 2 — Guest:         Schedule → Dress code → Venue map
```

Permission-denied states when accessed via direct URL: friendly message explaining the access level and suggesting the user contact their planner. Not an error code, not a blank screen.

### DS-07-8 Progressive disclosure

Default views show the most critical information, not the most complete information. Detail is always available on demand.

```
Vendor card default:    Name, category, status, next payment milestone
Vendor card expanded:   Rate, all milestones, deliverables, notes, contract
Budget ledger default:  Planned total, committed total, paid total, remaining
Budget ledger expanded: Per-vendor, per-milestone breakdown
Portfolio card:         Wedding name, date, health score, days to wedding
Portfolio expanded:     Health score breakdown on tap
```

### DS-07-9 Empty states

Empty states are informative and action-oriented. Never show a blank screen or a generic "No data" message.

```
Template: [Context-specific message] + [Primary CTA]

Examples:
  No vendors added:   "Add your first vendor to start tracking payments and confirmations." → [Add vendor]
  No briefing items:  "Your wedding is on track. No actions needed this week." (positive, not a failure state)
  New planner:        [Value proposition] + [Create first wedding] (welcoming, not clinical)
```

---

## DS-08 v0 Prompt Block

Paste this block at the top of every v0 screen prompt. Do not abbreviate it.

```
Tech stack: React + Tailwind CSS
Design system: Vivaah OS v1.0

COLOURS
Primary: purple-600 (#7C3AED), hover: purple-800 (#5B21B6)
Success: #10B981 | Warning: #F59E0B | Danger: #EF4444 | Info: #3B82F6
Page bg: bg-gray-50 | Card bg: bg-white | Border: border-gray-100

TYPOGRAPHY
Font: font-sans (system). Weights: 400 and 500 only — never 600 or 700.
Display: text-[28px] font-medium | Title: text-xl font-medium
Body strong: text-[17px] font-medium | Body: text-[15px]
Small: text-sm | Label: text-[11px] font-medium uppercase tracking-wide

SPACING
Base 4px. Cards: p-4 internal padding. Page: px-4 mobile, px-6 desktop.

BORDER RADIUS
Chips/badges: rounded-md (6px) | Inputs/buttons: rounded-xl (10px)
Cards: rounded-2xl (14px) | Bottom sheets: rounded-t-3xl (20px)
Pills: rounded-full

COMPONENTS
Buttons: h-11 min-h-[44px] min-w-[44px] — all interactive elements minimum 44×44px
Primary btn: bg-purple-600 text-white h-11 px-5 rounded-xl font-medium
Secondary btn: border border-purple-600 text-purple-600 h-11 px-5 rounded-xl font-medium
Cards: bg-white border border-gray-100 rounded-2xl p-4 — no drop shadows
Inputs: h-11 border border-gray-300 rounded-xl px-3 focus:border-purple-500
Bottom sheets (mobile modals): fixed bottom-0, rounded-t-3xl, max-h-[90vh]

INDIA-SPECIFIC — NON-NEGOTIABLE
All rupee amounts: Indian denomination (lakh / crore) — never Western thousands
  < ₹1L → ₹75,000 | ≥ ₹1L → ₹1.5 lakh | ≥ ₹1Cr → ₹1.2 crore
  ₹ symbol displayed as prefix, never entered by user
  Rupee inputs: inputmode="numeric", accepts 1.5L shorthand
All dates: DD/MM/YYYY — no MM/DD anywhere
Wedding date fields: include "Date set by pandit" toggle option
All event names: Haldi / Mehendi / Sangeet / Engagement / Wedding / Reception
  Never: ceremony / party / event 1 / function
Hidden navigation items must not be rendered — not greyed, not locked, absent from DOM

VENDOR STATUS BADGES (rounded-full text-xs font-medium px-2.5 py-0.5)
Shortlisted: bg-gray-100 text-gray-600
Quoted: bg-yellow-50 text-yellow-900
Booked: bg-blue-100 text-blue-800
Confirmed: bg-emerald-100 text-emerald-800
Done: bg-purple-100 text-purple-800
Overdue: bg-red-100 text-red-800

EVENT CHIPS (rounded-full text-sm font-medium px-3 h-[30px] border)
Haldi: bg-[#FFFBEB] text-[#92400E] border-[#FCD34D]
Mehendi: bg-[#F0FDF4] text-[#14532D] border-[#86EFAC]
Sangeet: bg-[#FAF5FF] text-[#581C87] border-[#C084FC]
Engagement: bg-[#FFF7ED] text-[#7C2D12] border-[#FDBA74]
Wedding: bg-[#FFF1F2] text-[#9F1239] border-[#FDA4AF]
Reception: bg-[#EFF6FF] text-[#1E3A5F] border-[#93C5FD]

VIEWPORT
Primary: 390px mobile. Every feature must be fully functional on mobile.
Desktop (≥1024px): enhanced layouts for Portfolio and Budget only.
```

---

## DS-09 What Is Intentionally Out of Scope

These decisions are locked out of V1 to preserve build focus:

| Excluded | Reason |
|---|---|
| Custom typeface | Load time on Indian 4G; system fonts are native-quality on target devices |
| Drop shadows | Flat card on tinted bg creates sufficient elevation; shadows add visual noise |
| Dark mode | V1 ships light mode only. Dark mode is a V1.1 item. |
| Animation / transitions | `transition-colors` on buttons only. No page transitions, skeleton loaders, or motion design in V1. |
| Illustration / iconography system | Use Lucide React for all icons. No custom illustration in V1. |
| Gradient fills | Flat fills only. Gradients introduce rendering inconsistency across Android devices. |

---

*Design System v1.0 — locked alongside PRD completion. All downstream screens and components build from this document.*
