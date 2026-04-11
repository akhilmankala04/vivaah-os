import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const event_type = url.searchParams.get('event_type')

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: 'event_type parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const validEventTypes = ['haldi', 'mehendi', 'sangeet', 'engagement', 'wedding', 'reception']
    if (!validEventTypes.includes(event_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid event_type. Must be one of: haldi, mehendi, sangeet, engagement, wedding, reception' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase Client
    // This function does not perform sensitive DB writes so using the authorization header representing the user calling the function is appropriate
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify User has a valid session token
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Fetch the defaults from the database using the user's client. 
    // Assumes read access is granted to authenticated users via RLS in the target environment
    const { data, error } = await supabaseClient
      .from('event_category_defaults')
      .select('category_name')
      .eq('event_type', event_type)
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    // Return the flat list of category names based on the prompt instructions
    const categoryNames = data.map(item => item.category_name)

    return new Response(
      JSON.stringify(categoryNames),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
