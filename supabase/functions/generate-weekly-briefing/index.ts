// Edge Function: generate-weekly-briefing
// Trigger: called manually from WeeklyBriefing page (Phase 3: also via weekly cron)
// Purpose: assemble wedding context, call Google Gemini API,
//          parse response into structured briefing, store in briefings table,
//          queue WhatsApp message via messages_queue
// Auth: verifies caller JWT, uses SERVICE_ROLE_KEY for DB writes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const PROMPT_VERSION = 'v1.0-gemini'
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const TIMEOUT_MS = 45_000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BriefingItem {
  type: string
  label: string
  detail: string
  days_outstanding?: number
  flagged_last_week?: boolean
  days_stalled?: number
  due_date?: string | null
}

interface BudgetSection {
  planned_paise: number
  committed_paise: number
  paid_paise: number
  summary: string
}

interface AIBriefingOutput {
  overdue_section: BriefingItem[]
  at_risk_section: BriefingItem[]
  upcoming_section: BriefingItem[]
  budget_section: BudgetSection
  is_all_clear: boolean
}

interface OverduePayment {
  id: string
  description: string | null
  amount: number
  due_date: string
  status: string
  vendor_name: string
}

interface UnconfirmedVendor {
  id: string
  vendor_name: string
  category: string
  confirmation_status: string
  updated_at: string
  event_name: string | null
  event_date: string | null
}

interface StalledVendor {
  id: string
  vendor_name: string
  category: string
  confirmation_status: string
  updated_at: string
  days_since_update: number
}

interface OverdueTask {
  id: string
  title: string
  due_date: string | null
  status: string
}

interface BudgetData {
  planned_paise: number
  committed_paise: number
  paid_paise: number
}

interface PreviousBriefingItem {
  label: string
}

// ─── Gemini response schema ────────────────────────────────────────────────────

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    overdue_section: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          label: { type: 'string' },
          detail: { type: 'string' },
          days_outstanding: { type: 'integer' },
          flagged_last_week: { type: 'boolean' },
        },
        required: ['type', 'label', 'detail', 'days_outstanding', 'flagged_last_week'],
      },
    },
    at_risk_section: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          label: { type: 'string' },
          detail: { type: 'string' },
          days_stalled: { type: 'integer' },
        },
        required: ['type', 'label', 'detail', 'days_stalled'],
      },
    },
    upcoming_section: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          label: { type: 'string' },
          detail: { type: 'string' },
          due_date: { type: 'string' },
        },
        required: ['type', 'label', 'detail', 'due_date'],
      },
    },
    budget_section: {
      type: 'object',
      properties: {
        planned_paise: { type: 'integer' },
        committed_paise: { type: 'integer' },
        paid_paise: { type: 'integer' },
        summary: { type: 'string' },
      },
      required: ['planned_paise', 'committed_paise', 'paid_paise', 'summary'],
    },
    is_all_clear: { type: 'boolean' },
  },
  required: ['overdue_section', 'at_risk_section', 'upcoming_section', 'budget_section', 'is_all_clear'],
}

// ─── Rupee formatter (for prompt readability) ─────────────────────────────────

function formatRupees(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(2)} crore`
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(2)} lakh`
  return `₹${rupees.toLocaleString('en-IN')}`
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  weddingName: string,
  overduePayments: OverduePayment[],
  unconfirmedVendors: UnconfirmedVendor[],
  stalledVendors: StalledVendor[],
  overdueTasks: OverdueTask[],
  budget: BudgetData,
  previousOverdueLabels: string[],
  today: Date,
): { system: string; user: string } {
  const system = `You are an expert Indian wedding planning assistant generating a weekly briefing for a professional planner or head planner. Your briefing must be specific, actionable, and name every vendor, amount, and task explicitly. Never use generic language like "some vendors" or "a few payments".

BRIEFING RULES:
1. Use Indian wedding terminology: mehendi, baraat, sangeet, pandit, mandap, vidaai
2. Rupee amounts in Indian format (lakh/crore for large amounts)
3. Every overdue item must state the exact amount overdue and how many days it has been outstanding
4. Every stalled vendor must state exactly how many days since the last status update
5. Budget health summary: one sentence covering the key financial risk or confirmation ("X% of budget committed, Y upcoming in the next 30 days")
6. Upcoming section: 2–4 decisions or tasks that need attention in the next 2 weeks, sorted by urgency
7. If all three alert sections are empty, set is_all_clear to true and populate upcoming_section with the next 1–3 scheduled tasks
8. flagged_last_week: set to true only if the item label appears in the previous briefing's overdue section
9. All monetary values in paise (integer) in budget_section — the display layer converts to rupees`

  const todayStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  const overduePaymentsText = overduePayments.length > 0
    ? overduePayments.map(p => {
        const daysAgo = Math.round((today.getTime() - new Date(p.due_date).getTime()) / (24 * 60 * 60 * 1000))
        return `  - ${p.vendor_name}: ${formatRupees(p.amount)} due ${new Date(p.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })} (${daysAgo} days overdue, status: ${p.status})`
      }).join('\n')
    : '  - None'

  const unconfirmedVendorsText = unconfirmedVendors.length > 0
    ? unconfirmedVendors.map(v => {
        const eventInfo = v.event_name && v.event_date
          ? ` — event: ${v.event_name} on ${new Date(v.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })}`
          : ''
        return `  - ${v.vendor_name} (${v.category}, status: ${v.confirmation_status}${eventInfo})`
      }).join('\n')
    : '  - None'

  const stalledVendorsText = stalledVendors.length > 0
    ? stalledVendors.map(v =>
        `  - ${v.vendor_name} (${v.category}): ${v.days_since_update} days since last update, currently ${v.confirmation_status}`
      ).join('\n')
    : '  - None'

  const overdueTasksText = overdueTasks.length > 0
    ? overdueTasks.map(t => {
        const daysAgo = t.due_date
          ? Math.round((today.getTime() - new Date(t.due_date).getTime()) / (24 * 60 * 60 * 1000))
          : 0
        return `  - ${t.title}${t.due_date ? ` (due ${new Date(t.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })}, ${daysAgo} days overdue)` : ''}`
      }).join('\n')
    : '  - None'

  const previousOverdueText = previousOverdueLabels.length > 0
    ? previousOverdueLabels.map(l => `  - ${l}`).join('\n')
    : '  - None (first briefing)'

  const user = `Generate a weekly briefing for: ${weddingName}
Today: ${todayStr}

OVERDUE PAYMENTS (past due date):
${overduePaymentsText}

UNCONFIRMED VENDORS WITH EVENT WITHIN 30 DAYS:
${unconfirmedVendorsText}

STALLED VENDORS (14+ days since last status change, below Confirmed):
${stalledVendorsText}

OVERDUE TIMELINE TASKS:
${overdueTasksText}

BUDGET FIGURES (in paise — ÷100 for rupees):
  - Planned total: ${budget.planned_paise} paise (${formatRupees(budget.planned_paise)})
  - Committed (booked/confirmed/done): ${budget.committed_paise} paise (${formatRupees(budget.committed_paise)})
  - Paid to date: ${budget.paid_paise} paise (${formatRupees(budget.paid_paise)})

ITEMS FROM LAST WEEK'S OVERDUE SECTION (for flagged_last_week detection):
${previousOverdueText}

Generate the complete weekly briefing JSON following the schema provided. The budget_section.planned_paise, committed_paise, and paid_paise must exactly match the input figures above.`

  return { system, user }
}

// ─── Gemini API caller ────────────────────────────────────────────────────────

async function callGemini(apiKey: string, system: string, user: string): Promise<AIBriefingOutput> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.4,
          response_mime_type: 'application/json',
          response_schema: RESPONSE_SCHEMA,
        },
      }),
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if ((err as Error).name === 'AbortError') throw new Error('AI generation timed out after 45 seconds')
    throw err
  }

  clearTimeout(timeoutId)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason
    throw new Error(`Empty response from Gemini (finishReason: ${finishReason ?? 'unknown'})`)
  }

  let parsed: AIBriefingOutput
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Could not parse briefing JSON from Gemini response')
  }

  // Validate required sections exist
  if (!parsed.overdue_section || !parsed.at_risk_section || !parsed.upcoming_section || !parsed.budget_section) {
    throw new Error('Gemini response missing required briefing sections')
  }

  // Ensure arrays
  parsed.overdue_section = Array.isArray(parsed.overdue_section) ? parsed.overdue_section : []
  parsed.at_risk_section = Array.isArray(parsed.at_risk_section) ? parsed.at_risk_section : []
  parsed.upcoming_section = Array.isArray(parsed.upcoming_section) ? parsed.upcoming_section : []

  // Recalculate is_all_clear from actual data (don't trust AI for this boolean)
  parsed.is_all_clear = parsed.overdue_section.length === 0 && parsed.at_risk_section.length === 0

  // Enforce correct budget figures — never let AI invent these
  parsed.budget_section.planned_paise = Number(parsed.budget_section.planned_paise) || 0
  parsed.budget_section.committed_paise = Number(parsed.budget_section.committed_paise) || 0
  parsed.budget_section.paid_paise = Number(parsed.budget_section.paid_paise) || 0

  return parsed
}

// ─── Main handler ─────────────────────────────────────────────────────────────

async function handleRequest(req: Request): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const geminiApiKey = Deno.env.get('GOOGLE_AI_API_KEY') ?? ''

  if (!geminiApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'GOOGLE_AI_API_KEY not configured' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Verify caller JWT
  const authHeader = req.headers.get('Authorization') ?? ''
  const callerToken = authHeader.replace('Bearer ', '')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  let callerUserId: string | null = null

  if (callerToken && callerToken !== anonKey) {
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${callerToken}` } },
    })
    const { data: { user } } = await callerClient.auth.getUser()
    callerUserId = user?.id ?? null
  }

  // Parse request body
  let weddingId: string
  try {
    const body = await req.json()
    weddingId = body.wedding_id
    if (!weddingId) throw new Error('missing wedding_id')
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'wedding_id required' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Verify caller is a participant with planner/head/full access
  if (callerUserId) {
    const { data: participant } = await supabase
      .from('participants')
      .select('id, access_level')
      .eq('wedding_id', weddingId)
      .eq('user_id', callerUserId)
      .eq('status', 'active')
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not a participant of this wedding' }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }

    // Only planner_full, head_planner, or full access can generate briefings (FR-S3-11)
    const allowed = ['planner_full', 'head_planner', 'full']
    if (!allowed.includes(participant.access_level)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient access level for briefing generation' }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }
  }

  // Fetch wedding
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('id, couple_name_1, couple_name_2, wedding_date, total_planned_budget')
    .eq('id', weddingId)
    .is('deleted_at', null)
    .single()

  if (weddingError || !wedding) {
    return new Response(
      JSON.stringify({ success: false, error: 'Wedding not found' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

  // ── Fetch overdue payments ─────────────────────────────────────────────────
  const { data: overduePaymentsRaw } = await supabase
    .from('payment_milestones')
    .select('id, description, amount, due_date, status, vendor_instance_id')
    .eq('wedding_id', weddingId)
    .in('status', ['upcoming', 'due', 'overdue'])
    .lt('due_date', today.toISOString().split('T')[0])
    .is('deleted_at', null)
    .order('due_date')

  // Join vendor names for overdue payments
  const overduePayments: OverduePayment[] = []
  for (const pm of (overduePaymentsRaw ?? [])) {
    const { data: vi } = await supabase
      .from('vendor_instances')
      .select('vendor_name')
      .eq('id', pm.vendor_instance_id)
      .single()
    overduePayments.push({
      ...pm,
      vendor_name: vi?.vendor_name ?? 'Unknown vendor',
    })
  }

  // ── Fetch unconfirmed vendors with event within 30 days ────────────────────
  const { data: eventsWithin30 } = await supabase
    .from('events')
    .select('id, event_name, event_date')
    .eq('wedding_id', weddingId)
    .gte('event_date', today.toISOString().split('T')[0])
    .lte('event_date', thirtyDaysLater.toISOString().split('T')[0])
    .is('deleted_at', null)

  const eventIds = (eventsWithin30 ?? []).map(e => e.id)
  const eventMap: Record<string, { event_name: string; event_date: string }> = {}
  for (const e of (eventsWithin30 ?? [])) {
    eventMap[e.id] = { event_name: e.event_name, event_date: e.event_date }
  }

  // Get vendor_instances for this wedding that are below Confirmed
  const { data: allVendors } = await supabase
    .from('vendor_instances')
    .select('id, vendor_name, category, confirmation_status, updated_at, event_id')
    .eq('wedding_id', weddingId)
    .not('confirmation_status', 'in', '("confirmed","done")')
    .is('deleted_at', null)

  const unconfirmedVendors: UnconfirmedVendor[] = (allVendors ?? [])
    .filter(v => !v.event_id || eventIds.includes(v.event_id))
    .map(v => ({
      id: v.id,
      vendor_name: v.vendor_name,
      category: v.category,
      confirmation_status: v.confirmation_status,
      updated_at: v.updated_at,
      event_name: v.event_id ? (eventMap[v.event_id]?.event_name ?? null) : null,
      event_date: v.event_id ? (eventMap[v.event_id]?.event_date ?? null) : null,
    }))

  // ── Fetch stalled vendors (14+ days no update, below Confirmed) ────────────
  const stalledVendors: StalledVendor[] = (allVendors ?? [])
    .filter(v => new Date(v.updated_at) <= fourteenDaysAgo)
    .map(v => ({
      id: v.id,
      vendor_name: v.vendor_name,
      category: v.category,
      confirmation_status: v.confirmation_status,
      updated_at: v.updated_at,
      days_since_update: Math.round((today.getTime() - new Date(v.updated_at).getTime()) / (24 * 60 * 60 * 1000)),
    }))

  // ── Fetch overdue tasks ────────────────────────────────────────────────────
  const { data: overdueTasksRaw } = await supabase
    .from('tasks')
    .select('id, title, due_date, status')
    .eq('wedding_id', weddingId)
    .in('status', ['not_started', 'in_progress', 'overdue'])
    .lt('due_date', today.toISOString().split('T')[0])
    .is('deleted_at', null)
    .order('due_date')

  const overdueTasks: OverdueTask[] = (overdueTasksRaw ?? []) as OverdueTask[]

  // ── Budget figures ─────────────────────────────────────────────────────────
  const plannedBudget = wedding.total_planned_budget ?? 0

  // Committed = SUM of negotiated_rate for booked/confirmed/done vendors
  const { data: committedVendors } = await supabase
    .from('vendor_instances')
    .select('negotiated_rate')
    .eq('wedding_id', weddingId)
    .in('confirmation_status', ['booked', 'confirmed', 'done'])
    .is('deleted_at', null)
    .not('negotiated_rate', 'is', null)

  const committedPaise = (committedVendors ?? []).reduce((sum, v) => sum + (v.negotiated_rate ?? 0), 0)

  // Paid = SUM of paid payment milestones
  const { data: paidMilestones } = await supabase
    .from('payment_milestones')
    .select('amount')
    .eq('wedding_id', weddingId)
    .eq('status', 'paid')
    .is('deleted_at', null)

  const paidPaise = (paidMilestones ?? []).reduce((sum, m) => sum + (m.amount ?? 0), 0)

  const budget: BudgetData = {
    planned_paise: plannedBudget,
    committed_paise: committedPaise,
    paid_paise: paidPaise,
  }

  // ── Previous briefing's overdue labels (for flagged_last_week) ─────────────
  const { data: previousBriefing } = await supabase
    .from('briefings')
    .select('overdue_section')
    .eq('wedding_id', weddingId)
    .is('deleted_at', null)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  const previousOverdueLabels: string[] = []
  if (previousBriefing?.overdue_section) {
    const prevItems = previousBriefing.overdue_section as PreviousBriefingItem[]
    for (const item of prevItems) {
      if (item.label) previousOverdueLabels.push(item.label)
    }
  }

  // ── Build couple name ──────────────────────────────────────────────────────
  const weddingName = [wedding.couple_name_1, wedding.couple_name_2].filter(Boolean).join(' & ')

  // ── Call Gemini ────────────────────────────────────────────────────────────
  const { system, user: userMsg } = buildPrompt(
    weddingName,
    overduePayments,
    unconfirmedVendors,
    stalledVendors,
    overdueTasks,
    budget,
    previousOverdueLabels,
    today,
  )

  let aiOutput: AIBriefingOutput
  try {
    aiOutput = await callGemini(geminiApiKey, system, userMsg)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI generation failed'
    console.error('Gemini briefing call failed:', msg)
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Override budget figures with the actual DB values (never trust AI-invented numbers)
  aiOutput.budget_section.planned_paise = budget.planned_paise
  aiOutput.budget_section.committed_paise = budget.committed_paise
  aiOutput.budget_section.paid_paise = budget.paid_paise

  // ── Store briefing record ──────────────────────────────────────────────────
  const { data: briefingRecord, error: briefingError } = await supabase
    .from('briefings')
    .insert({
      wedding_id: weddingId,
      planner_id: callerUserId,
      generated_at: today.toISOString(),
      overdue_section: aiOutput.overdue_section,
      at_risk_section: aiOutput.at_risk_section,
      upcoming_section: aiOutput.upcoming_section,
      budget_section: aiOutput.budget_section,
      is_all_clear: aiOutput.is_all_clear,
      prompt_version: PROMPT_VERSION,
    })
    .select('id')
    .single()

  if (briefingError || !briefingRecord) {
    console.error('Failed to insert briefing record:', briefingError?.message)
    return new Response(
      JSON.stringify({ success: false, error: `Failed to save briefing: ${briefingError?.message ?? 'no record returned'}` }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // ── Queue WhatsApp message (Phase 3 — provider not yet integrated) ─────────
  // Assembles full briefing text for WhatsApp delivery when provider is configured
  if (!aiOutput.is_all_clear) {
    const whatsappPayload = {
      briefing_id: briefingRecord.id,
      wedding_id: weddingId,
      wedding_name: weddingName,
      overdue_count: aiOutput.overdue_section.length,
      at_risk_count: aiOutput.at_risk_section.length,
      upcoming_count: aiOutput.upcoming_section.length,
      budget_summary: aiOutput.budget_section.summary,
    }

    // Get planner phone from participants table
    const { data: plannerParticipant } = callerUserId
      ? await supabase
          .from('participants')
          .select('phone')
          .eq('wedding_id', weddingId)
          .eq('user_id', callerUserId)
          .eq('status', 'active')
          .single()
      : { data: null }

    if (plannerParticipant?.phone) {
      await supabase
        .from('messages_queue')
        .insert({
          recipient_phone: plannerParticipant.phone,
          message_type: 'weekly_briefing',
          payload: whatsappPayload,
          status: 'pending',
          retry_count: 0,
        })
    }
  }

  console.log(
    `generate-weekly-briefing: wedding=${weddingId} briefing=${briefingRecord.id} ` +
    `overdue=${aiOutput.overdue_section.length} at_risk=${aiOutput.at_risk_section.length} ` +
    `all_clear=${aiOutput.is_all_clear}`,
  )

  return new Response(
    JSON.stringify({
      success: true,
      briefing_id: briefingRecord.id,
      is_all_clear: aiOutput.is_all_clear,
      overdue_count: aiOutput.overdue_section.length,
      at_risk_count: aiOutput.at_risk_section.length,
    }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    return await handleRequest(req)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error'
    console.error('generate-weekly-briefing unhandled error:', msg)
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})
