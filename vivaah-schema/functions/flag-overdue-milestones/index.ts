// Edge Function: flag-overdue-milestones
// Schedule: daily at 00:01 via Supabase cron
// Purpose: Set PaymentMilestone status to 'overdue' where due_date < today and status != paid
// Then recalculate health scores for all affected weddings
// Uses SERVICE_ROLE_KEY — bypasses RLS for system-level writes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const today = new Date().toISOString().split('T')[0]

  // Idempotent: only updates milestones that are not already overdue/paid and are past due
  const { data, error } = await supabase
    .from('payment_milestones')
    .update({ status: 'overdue' })
    .lt('due_date', today)
    .in('status', ['upcoming', 'due'])
    .is('deleted_at', null)
    .select('id, wedding_id')

  if (error) {
    console.error('flag-overdue-milestones error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Recalculate and cache health scores for all affected weddings
  // Deduplicate wedding IDs before calling RPC
  const affectedWeddingIds = [...new Set(data?.map(m => m.wedding_id) ?? [])]

  const healthErrors: string[] = []
  for (const weddingId of affectedWeddingIds) {
    const { error: healthError } = await supabase
      .rpc('cache_wedding_health_score_for', { p_wedding_id: weddingId })
    if (healthError) {
      healthErrors.push(`${weddingId}: ${healthError.message}`)
      console.error(`Health score recalc failed for wedding ${weddingId}:`, healthError.message)
    }
  }

  const response = {
    milestones_flagged: data?.length ?? 0,
    weddings_affected: affectedWeddingIds.length,
    health_score_errors: healthErrors.length > 0 ? healthErrors : undefined,
  }

  console.log('flag-overdue-milestones complete:', JSON.stringify(response))

  return new Response(
    JSON.stringify(response),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  )
})
