import { SupabaseClient } from '@supabase/supabase-js';

// ALWAYS use this — never query vendor_instances directly
export const vendorInstancesQuery = (supabase: SupabaseClient, weddingId: string) =>
  supabase.from('vendor_instances_view').select('*').eq('wedding_id', weddingId);
