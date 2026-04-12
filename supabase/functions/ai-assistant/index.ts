import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'date not set'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function formatRupees(paise: number): string {
  if (!paise || paise === 0) return '₹0'
  const rupees = paise / 100
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`
  return `₹${rupees.toLocaleString('en-IN')}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { weddingId, userMessage, conversationHistory } = await req.json()

    if (!weddingId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'weddingId and userMessage are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Auth check using user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Verify user has access to this wedding
    const { data: participant } = await supabase
      .from('participants')
      .select('access_level, role')
      .eq('wedding_id', weddingId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this wedding' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Fetch wedding basics
    const { data: wedding } = await supabase
      .from('weddings')
      .select('couple_name_1, couple_name_2, wedding_date, planning_start_date, city, destination_flag, total_planned_budget, mode, late_start_flag, late_start_weeks, muhurat_flag')
      .eq('id', weddingId)
      .single()

    if (!wedding) {
      return new Response(
        JSON.stringify({ error: 'Wedding not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Fetch events
    const { data: events } = await supabase
      .from('events')
      .select('event_name, event_date, start_time, venue_name, venue_address, dress_code, status')
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .order('event_date', { ascending: true })

    // Fetch vendors via view (handles rate visibility)
    const { data: vendors } = await supabase
      .from('vendor_instances_view')
      .select('vendor_name, category, confirmation_status, negotiated_rate, planner_notes, city')
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)

    // Fetch payment milestones
    const { data: milestones } = await supabase
      .from('payment_milestones')
      .select('amount, due_date, status, description, paid_date, vendor_instance_id')
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .order('due_date', { ascending: true })

    // Fetch tasks (capped to avoid context overflow)
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, due_date, status, description')
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .order('due_date', { ascending: true })
      .limit(30)

    // Compute budget figures
    const committed = vendors
      ?.filter(v => ['booked', 'confirmed', 'done'].includes(v.confirmation_status))
      .reduce((sum: number, v: { negotiated_rate: number | null }) => sum + (v.negotiated_rate ?? 0), 0) ?? 0

    const paid = milestones
      ?.filter(m => m.status === 'paid')
      .reduce((sum: number, m: { amount: number }) => sum + m.amount, 0) ?? 0

    const planned = wedding.total_planned_budget ?? 0

    // Weeks remaining
    const weeksRemaining = Math.floor(
      (new Date(wedding.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)
    )

    // Build vendor map for milestone vendor name lookup
    const vendorIdToName: Record<string, string> = {}
    if (vendors) {
      vendors.forEach((v: { vendor_name: string }) => {
        // We can't map by id from vendor_instances_view easily without the id field
        // So we'll reference milestone descriptions instead
        void v
      })
    }

    // Build context string
    const weddingContext = `
WEDDING DETAILS
Couple: ${wedding.couple_name_1} & ${wedding.couple_name_2}
Wedding date: ${formatDate(wedding.wedding_date)}
City: ${wedding.city}${wedding.destination_flag ? ' (destination wedding)' : ''}
Planning started: ${formatDate(wedding.planning_start_date)}
Weeks remaining: ${weeksRemaining}
${wedding.late_start_flag ? `Late start: Yes — started ${wedding.late_start_weeks} weeks behind standard horizon` : ''}
${wedding.muhurat_flag ? 'Date selected by pandit (muhurat date)' : ''}

BUDGET
Planned: ${formatRupees(planned)}
Committed: ${formatRupees(committed)} (${planned > 0 ? Math.round(committed / planned * 100) : 0}% of planned)
Paid: ${formatRupees(paid)}
Remaining budget: ${formatRupees(planned - committed)}

EVENTS (${events?.length ?? 0} events)
${events?.map(e => `- ${e.event_name}: ${formatDate(e.event_date)}${e.start_time ? ' at ' + e.start_time : ''}${e.venue_name ? ', ' + e.venue_name : ''} [${e.status}]`).join('\n') ?? 'No events added yet'}

VENDORS (${vendors?.length ?? 0} vendors)
${vendors?.map((v: { vendor_name: string; category: string; confirmation_status: string; negotiated_rate: number | null }) => `- ${v.vendor_name} (${v.category}): ${v.confirmation_status}${v.negotiated_rate ? ', ' + formatRupees(v.negotiated_rate) : ', rate not entered'}`).join('\n') ?? 'No vendors added yet'}

PAYMENT MILESTONES
${milestones?.map(m => `- ${m.description ?? 'Payment'}: ${formatRupees(m.amount)} due ${formatDate(m.due_date)} [${m.status}]${m.paid_date ? ' paid on ' + formatDate(m.paid_date) : ''}`).join('\n') ?? 'No milestones added yet'}

UPCOMING/OVERDUE TASKS
${tasks?.filter((t: { status: string }) => t.status !== 'complete').slice(0, 15).map((t: { title: string; status: string; due_date: string | null }) => `- ${t.title}: ${t.status}${t.due_date ? ' by ' + formatDate(t.due_date) : ''}`).join('\n') ?? 'No tasks yet'}
`

    // System prompt
    const systemPrompt = `You are a wedding planning assistant for Vivaah OS, an AI-native wedding planning system for Indian weddings.

You are helping ${wedding.couple_name_1} & ${wedding.couple_name_2} plan their wedding on ${formatDate(wedding.wedding_date)} — ${weeksRemaining} weeks away.

CORE RULES — follow these without exception:

1. ALWAYS answer using the specific data from this wedding. Never give generic advice when you have real data to reference. Say "Your photographer Ravi Studios is booked at ₹2.5 lakh" not "photographers typically cost ₹1-3 lakh".

2. When answering budget questions, use the actual figures: planned ${formatRupees(planned)}, committed ${formatRupees(committed)}, paid ${formatRupees(paid)}.

3. When asked about vendors, reference their actual status. "Your mehendi artist is still at Shortlisted — they haven't been booked yet. Your sangeet is in ${weeksRemaining - 2} weeks."

4. When answering "is this price reasonable" questions, you may use general Indian wedding market knowledge as context, but always relate it back to their specific budget situation.

5. ALWAYS use Indian terminology:
   - Event names: haldi, mehendi, sangeet, engagement, wedding, reception
   - Currency: ₹ with lakh/crore denomination (₹2.5 lakh, not ₹250,000 or $3000)
   - Dates: DD/MM/YYYY format

6. Keep answers concise and actionable. Maximum 3-4 sentences for simple questions, up to 6-8 for complex ones. Never write essays.

7. If asked something outside wedding planning scope, politely redirect: "I'm focused on helping you plan your wedding — let me know if you have any wedding planning questions."

8. If data is missing (e.g. no vendors added yet), say so clearly and suggest what to do: "You haven't added any vendors yet — start with your venue and caterer since those have the longest lead times."

9. Tone: warm, knowledgeable, like a trusted friend who knows weddings well. Not formal. Not robotic.

10. When the wedding has ${weeksRemaining} weeks remaining:
${weeksRemaining < 8 ? '- The wedding is very close — prioritise confirmations and payments above all else' : ''}
${weeksRemaining >= 8 && weeksRemaining < 16 ? '- In the critical booking window — focus on confirming vendors and setting up payment schedules' : ''}
${weeksRemaining >= 16 ? '- Good planning horizon — focus on getting vendors shortlisted and quoted' : ''}

Here is the complete wedding plan data you have access to:

${weddingContext}

Use this data to give specific, grounded answers. If the user asks about something not in the data, say what you don't know rather than guessing.`

    // Call Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            ...(conversationHistory ?? []).map((turn: { role: string; content: string }) => ({
              role: turn.role === 'user' ? 'user' : 'model',
              parts: [{ text: turn.content }]
            })),
            {
              role: 'user',
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.8,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        })
      }
    )

    const geminiData = await geminiResponse.json()

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', JSON.stringify(geminiData))
      return new Response(
        JSON.stringify({ error: 'AI service error', details: geminiData.error?.message ?? 'Unknown error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const assistantMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ??
      'Sorry, I could not generate a response. Please try again.'

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        tokensUsed: geminiData.usageMetadata?.totalTokenCount ?? 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('ai-assistant error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
