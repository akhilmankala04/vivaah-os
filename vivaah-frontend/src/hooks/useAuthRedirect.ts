import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles smart post-login routing:
 * - Mode 1 planners with active weddings → /portfolio
 * - Mode 2 / new users → most recent active wedding dashboard or /onboarding
 */
export function useAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is a Mode 1 planner with at least one active wedding
      const { data: plannerWeddings } = await supabase
        .from('weddings')
        .select('id')
        .eq('created_by', user.id)
        .eq('mode', 1)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(1);

      if (plannerWeddings && plannerWeddings.length > 0) {
        navigate('/portfolio');
        return;
      }

      // Mode 2 or new user — most recent active wedding or onboarding
      const { data: recentWedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('created_by', user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      navigate(recentWedding ? `/wedding/${recentWedding.id}` : '/onboarding');
    }
    redirect();
  }, [navigate]);
}
