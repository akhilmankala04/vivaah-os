# Agent: Frontend Agent
# Owns: /src only
# Do not write SQL, migrations, or RLS policies
# All data access via Supabase JS client only

# Vivaah OS — Project Rules (All Agents Must Follow)

## Product context
AI-native wedding planning OS for the Indian market. Two operating modes:
Mode 1 = planner-led. Mode 2 = self-planned.

## Non-negotiable rules — never violate these

### Data
- vendor_directory must NEVER have a rate, amount, price, fee, or cost column
- budget_ledger committed and paid are computed views — NEVER stored columns
- All monetary values stored as integers in paise (₹1 = 100 paise)
- All deletions are soft deletes (deleted_at timestamp). Hard deletes are blocked.
- Every status change writes to audit_log immediately
- WHERE deleted_at IS NULL on every query reading primary entities

### Permissions
- RLS enforcement happens at Supabase DB layer — never at application layer
- Frontend never makes permission decisions — it renders what the API returns
- Hidden UI elements are NOT rendered at all — not greyed, not disabled, not in DOM

### India-specific UX — no exceptions
- All event names: haldi, mehendi, sangeet, engagement, wedding, reception
- No anglicised substitutes anywhere (no "ceremony", no "henna", no "officiant")
- All dates in DD/MM/YYYY format — no MM/DD/YYYY anywhere
- All amounts display in ₹ lakh or crore (never raw thousands)
- ₹ symbol is a display prefix — never typed by the user
- inputmode="numeric" on all rupee input fields

### Frontend design system
- Primary colour: bg-purple-600 (#7C3AED), hover: bg-purple-800
- Page background: bg-gray-50 | Cards: bg-white border border-gray-100 rounded-2xl p-4
- NO drop shadows anywhere in V1
- All buttons: min-h-[44px] min-w-[44px]
- Mobile overlays: bottom sheets only — never centred modals on mobile
- Two font weights only: 400 and 500. Never 600 or 700.

### Tech stack
- Database: Supabase (Postgres)
- Frontend: React + Tailwind CSS
- Hosting: Netlify
- AI: Anthropic claude-sonnet-4-20250514 (Phase 3)
- All AI API calls server-side only — never client-side

## Colour rules — non-negotiable

Never use Tailwind default colour classes for purple.
Always use vivaah-600 for primary CTA, vivaah-800 for hover.

Correct:   bg-vivaah-600 text-white
Incorrect: bg-purple-600 text-white

Never use semantic colours decoratively:
- success (#10B981) = only for confirmed/paid/on-track states
- warning (#F59E0B) = only for at-risk/due-soon states  
- danger  (#EF4444) = only for overdue/delete/critical states
- info    (#3B82F6) = only for booked status

Event colours are fixed — never reassign:
- Haldi bg is always #FFFBEB. Never use it for Mehendi or any other event.
- Same rule applies to all six events.

Font weights: 400 and 500 only. Never write font-semibold, font-bold, 
font-600, font-700 anywhere in any component.