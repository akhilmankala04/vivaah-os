// Edge Function: generate-ai-timeline
// Trigger: called from WizardConfirm after wedding creation
// Purpose: assemble wedding context, call Google Gemini API,
//          parse response into Timeline record + Task records
// Auth: verifies caller JWT, then uses SERVICE_ROLE_KEY for DB writes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const PROMPT_VERSION = 'v1.0-gemini'
const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
const TIMEOUT_MS = 45_000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AITimelineItem {
  week_offset: number
  title: string
  description: string
  category: 'vendor' | 'budget' | 'event' | 'admin'
  linked_vendor_category: string | null
}

interface TimelineItem extends AITimelineItem {
  id: string
  linked_task_id: string | null
  is_ai_generated: true
}

interface Wedding {
  id: string
  couple_name_1: string
  couple_name_2: string | null
  wedding_date: string | null
  planning_start_date: string | null
  destination_flag: boolean
  city: string | null
  late_start_flag: boolean
  late_start_weeks: number
  mode: number
}

interface Event {
  id: string
  event_name: string
  event_date: string | null
}

interface VendorInstance {
  id: string
  vendor_name: string
  category: string
  confirmation_status: string
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  wedding: Wedding,
  events: Event[],
  vendors: VendorInstance[],
  weeksRemaining: number | null,
): { system: string; user: string } {
  const coupleNames = [wedding.couple_name_1, wedding.couple_name_2].filter(Boolean).join(' & ')
  const weddingDateDisplay = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'TBD'

  const eventList = events.length > 0
    ? events.map(e => {
        const dateStr = e.event_date
          ? new Date(e.event_date).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })
          : 'date TBD'
        return `  - ${e.event_name} on ${dateStr}`
      }).join('\n')
    : '  - Wedding ceremony (only event)'

  const vendorList = vendors.length > 0
    ? vendors.map(v => `  - ${v.category}: ${v.vendor_name} (${v.confirmation_status})`).join('\n')
    : '  - None yet'

  const system = `You are an expert Indian wedding planner with 15+ years of experience planning multi-event Indian weddings across metropolitan cities. You create precise, sequenced planning timelines that account for Indian vendor availability, payment norms, and ceremony logistics.

INDIAN WEDDING PLANNING RULES:
1. Terminology: use mehendi (never henna), baraat, sangeet, pandit (never officiant), mandap, vidaai, shaadi, milni
2. Standard booking windows from the wedding date:
   - Venue: 20 weeks (books first — all other dates follow from venue confirmation)
   - Photographer + Videographer: 16 weeks (premium photographers book 6 months out in major cities)
   - DJ + Band/Baraat: 14 weeks
   - Makeup artist: 12 weeks
   - Mehendi artist: 10 weeks
   - Pandit/Priest: 8 weeks (confirm muhurat timing at booking)
   - Invitation cards: order at 8 weeks, dispatch at 6 weeks
   - Caterer: shortlist at 8 weeks, confirm headcount at 6 weeks, finalise menu at 4 weeks
   - Decor: brief at 6 weeks, confirm at 4 weeks
3. Generate 28–38 tasks covering the full planning horizon
4. Include tasks for EACH event listed (haldi setup, mehendi logistics, sangeet rehearsal, etc.)
5. Budget tasks: advance deposits, balance payments, budget review at 8 weeks and 4 weeks
6. Event tasks: finalise guest list at 12 weeks, dietary requirements at 6 weeks, seating at 3 weeks
7. Admin tasks: accommodation for outstation guests, transport, day-of coordination schedule
8. Always include 2–3 tasks in the final 1–2 weeks: final vendor brief, day-of schedule distribution, emergency contact list
9. week_offset in your response must ALWAYS be a positive integer representing weeks BEFORE the wedding date. week_offset=1 means 1 week before wedding. week_offset=20 means 20 weeks before wedding. Never use 0 or negative values.`

  const lateStartNote = wedding.late_start_flag && wedding.late_start_weeks > 0
    ? `\nLATE START ALERT: This couple is ${wedding.late_start_weeks} weeks behind the standard planning horizon. Resequence by CONSEQUENCE SEVERITY — vendor bookings that risk unavailability (venue, photographer, caterer) must appear in the earliest available weeks. Compress lower-priority tasks (decor details, invitation wording) to allow critical bookings first.`
    : ''

  const user = `Generate a wedding planning timeline for:

Couple: ${coupleNames}
Wedding date: ${weddingDateDisplay}${weeksRemaining !== null ? ` (${weeksRemaining} weeks from today)` : ''}
City: ${wedding.city ?? 'not specified'}
Destination wedding: ${wedding.destination_flag ? 'Yes — include tasks for venue scouting trip, accommodation blocks, travel logistics' : 'No'}
${lateStartNote}
Events planned:
${eventList}

Vendors already in pipeline:
${vendorList}

Return the planning timeline as a JSON array following the schema provided.`

  return { system, user }
}

// ─── Gemini API caller with 45s timeout ───────────────────────────────────────

async function callGemini(apiKey: string, system: string, user: string): Promise<AITimelineItem[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system }],
        },
        contents: [
          { role: 'user', parts: [{ text: user }] },
        ],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          response_mime_type: 'application/json',
          response_schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                week_offset: { type: 'integer', description: 'Weeks BEFORE the wedding date when this task should be completed. Always a positive integer. Example: 20 means 20 weeks before the wedding.' },
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string', enum: ['vendor', 'budget', 'event', 'admin'] },
                linked_vendor_category: { type: 'string' },
              },
              required: ['week_offset', 'title', 'description', 'category', 'linked_vendor_category'],
            },
          },
        },
      }),
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if ((err as Error).name === 'AbortError') {
      throw new Error('AI generation timed out after 45 seconds')
    }
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

  let items: AITimelineItem[]
  try {
    items = JSON.parse(text)
  } catch {
    throw new Error('Could not parse timeline JSON from Gemini response')
  }

  if (!Array.isArray(items)) {
    throw new Error('Gemini response was not a JSON array')
  }

  // Validate and sanitise
  const VALID_CATEGORIES = ['vendor', 'budget', 'event', 'admin']
  const valid: AITimelineItem[] = []

  console.log(`Gemini returned ${items.length} raw items, first: ${JSON.stringify(items[0] ?? null)}`)

  for (const item of items) {
    const weekOffset = Number(item.week_offset)
    const category = String(item.category ?? '').toLowerCase().trim()

    if (!isNaN(weekOffset) && item.title && item.description && VALID_CATEGORIES.includes(category)) {
      valid.push({
        week_offset: Math.round(weekOffset),
        title: String(item.title).slice(0, 80),
        description: String(item.description).slice(0, 400),
        category: category as AITimelineItem['category'],
        linked_vendor_category: item.linked_vendor_category || null,
      })
    } else {
      console.warn('Skipping invalid item:', JSON.stringify(item))
    }
  }

  if (valid.length === 0) {
    throw new Error(`No valid items. Raw count: ${items.length}. First: ${JSON.stringify(items[0] ?? null)}`)
  }

  return valid
}

// ─── Task creation ────────────────────────────────────────────────────────────

async function createTasksForItems(
  supabase: ReturnType<typeof createClient>,
  weddingId: string,
  weddingDate: string | null,
  items: AITimelineItem[],
): Promise<TimelineItem[]> {
  const result: TimelineItem[] = []

  for (const item of items) {
    let dueDate: string | null = null
    if (weddingDate) {
      const wedding = new Date(weddingDate)
      const due = new Date(wedding)
      // week_offset is weeks BEFORE the wedding (positive = earlier than wedding date)
      due.setDate(due.getDate() - item.week_offset * 7)
      dueDate = due.toISOString().split('T')[0]
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        wedding_id: weddingId,
        title: item.title,
        description: item.description,
        due_date: dueDate,
        status: 'not_started',
        created_by: null,
      })
      .select('id')
      .single()

    if (error || !task) {
      console.error('Failed to create task for:', item.title, error?.message)
      result.push({
        ...item,
        id: crypto.randomUUID(),
        linked_task_id: null,
        is_ai_generated: true,
      })
    } else {
      result.push({
        ...item,
        id: crypto.randomUUID(),
        linked_task_id: task.id,
        is_ai_generated: true,
      })
    }
  }

  return result
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    return await handleRequest(req)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Unhandled error in generate-ai-timeline:', msg)
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})

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

  // Verify caller JWT — resolve the calling user if a real session token is present.
  // Falls back gracefully when the anon key is used (e.g. local dev without full auth flow).
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

  // Verify caller is a participant of this wedding (only when a real user JWT was provided)
  if (callerUserId) {
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
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
  }

  // Fetch wedding
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('id, couple_name_1, couple_name_2, wedding_date, planning_start_date, destination_flag, city, late_start_flag, late_start_weeks, mode')
    .eq('id', weddingId)
    .is('deleted_at', null)
    .single()

  if (weddingError || !wedding) {
    return new Response(
      JSON.stringify({ success: false, error: 'Wedding not found' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const { data: events } = await supabase
    .from('events')
    .select('id, event_name, event_date')
    .eq('wedding_id', weddingId)
    .is('deleted_at', null)
    .order('event_date')

  const { data: vendors } = await supabase
    .from('vendor_instances')
    .select('id, vendor_name, category, confirmation_status')
    .eq('wedding_id', weddingId)
    .is('deleted_at', null)

  const today = new Date()
  const weddingDateObj = wedding.wedding_date ? new Date(wedding.wedding_date) : null
  const weeksRemaining = weddingDateObj
    ? Math.round((weddingDateObj.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000))
    : null

  const { system, user: userMsg } = buildPrompt(
    wedding as Wedding,
    (events ?? []) as Event[],
    (vendors ?? []) as VendorInstance[],
    weeksRemaining,
  )

  let aiItems: AITimelineItem[]
  try {
    aiItems = await callGemini(geminiApiKey, system, userMsg)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI generation failed'
    console.error('Gemini call failed:', msg)
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const timelineItems = await createTasksForItems(
    supabase,
    weddingId,
    wedding.wedding_date,
    aiItems,
  )

  const planningHorizonMonths = weeksRemaining !== null
    ? Math.round(weeksRemaining / 4.33)
    : null

  // Upsert so weddings created before the placeholder insert step still work
  const { data: timelineRecord, error: updateError } = await supabase
    .from('timelines')
    .upsert({
      wedding_id: weddingId,
      generated_at: new Date().toISOString(),
      planning_horizon_months: planningHorizonMonths,
      late_start_flag: wedding.late_start_flag,
      late_start_weeks: wedding.late_start_weeks ?? 0,
      prompt_version: PROMPT_VERSION,
      items: timelineItems,
    }, { onConflict: 'wedding_id' })
    .select('id')
    .single()

  if (updateError || !timelineRecord) {
    console.error('Failed to upsert timelines record:', updateError?.message)
    return new Response(
      JSON.stringify({ success: false, error: `Failed to save timeline: ${updateError?.message ?? 'no record returned'}` }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  console.log(`generate-ai-timeline: wedding=${weddingId} items=${timelineItems.length} tasks_created=${timelineItems.filter(i => i.linked_task_id).length}`)

  return new Response(
    JSON.stringify({
      success: true,
      timeline_id: timelineRecord.id,
      task_count: timelineItems.length,
    }),
    { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  )
}
