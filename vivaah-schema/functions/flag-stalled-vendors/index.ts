// Edge Function: flag-stalled-vendors
// Schedule: daily at 06:00 via Supabase cron
// Purpose: Detect vendors with no status update in 14+ days (status below Confirmed)
// and recalculate health scores for their weddings so the portfolio view stays accurate.
// Note: This function detects + alerts via health score — actual stall badge is computed client-side
// from audit_log data. This function ensures weddings with stalled vendors stay flagged in health.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const cutoffISO = fourteenDaysAgo.toISOString()

  // Find weddings with stalled vendors (no update in 14+ days, status below confirmed)
  // Idempotent: running twice produces the same result
  const { data: stalledVendors, error } = await supabase
    .from('vendor_instances')
    .select('wedding_id')
    .in('confirmation_status', ['shortlisted', 'quoted', 'booked'])
    .is('deleted_at', null)
    .lt('updated_at', cutoffISO)

  if (error) {
    console.error('flag-stalled-vendors error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Deduplicate and recalculate health scores for all affected weddings
  const affectedWeddingIds = [...new Set(stalledVendors?.map(v => v.wedding_id) ?? [])]

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
    stalled_vendor_weddings_checked: affectedWeddingIds.length,
    health_score_errors: healthErrors.length > 0 ? healthErrors : undefined,
  }

  console.log('flag-stalled-vendors complete:', JSON.stringify(response))

  return new Response(
    JSON.stringify(response),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  )
})
