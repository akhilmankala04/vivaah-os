import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import PlannerDashboard from './PlannerDashboard';
import HeadPlannerDashboard from './HeadPlannerDashboard';

export interface Wedding {
  id: string;
  mode: 1 | 2;
  couple_name_1: string;
  couple_name_2: string | null;
  wedding_date: string;
  health_score: 'good' | 'at_risk' | 'critical';
  total_planned_budget: number;
  status: string;
}

export default function WeddingDashboard() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weddingId) return;
    async function fetchWedding() {
      const { data } = await supabase
        .from('weddings')
        .select('id, mode, couple_name_1, couple_name_2, wedding_date, health_score, total_planned_budget, status')
        .eq('id', weddingId)
        .is('deleted_at', null)
        .single();
      setWedding(data as Wedding | null);
      setLoading(false);
    }
    fetchWedding();
  }, [weddingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!wedding) return <Navigate to="/permission-denied" replace />;
  if (wedding.mode === 1) return <PlannerDashboard wedding={wedding} />;
  return <HeadPlannerDashboard wedding={wedding} />;
}
