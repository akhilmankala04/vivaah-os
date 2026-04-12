import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { BottomNav } from '../../components/ui/BottomNav';
import { getMockRole } from '../../lib/mockAuth';
import type { Wedding } from './WeddingDashboard';

interface HealthBreakdown {
  state: string;
  overdue_payments_count: number;
  unconfirmed_vendors_within_30_days: number;
  overdue_tasks_count: number;
  budget_committed_pct: number;
}

interface Props {
  wedding: Wedding;
}

export default function PlannerDashboard({ wedding }: Props) {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthBreakdown | null>(null);
  const [vendorStats, setVendorStats] = useState<{ total: number; incomplete: number } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const daysUntil = Math.ceil(
    (new Date(wedding.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    async function fetchData() {
      // Health breakdown from DB function
      const { data: healthData } = await supabase
        .rpc('wedding_health_score', { p_wedding_id: wedding.id });
      if (healthData && healthData.length > 0) setHealth(healthData[0]);

      // Vendor completeness: total vs incomplete (no rate, no milestone, no event assignment)
      const { data: vendors } = await supabase
        .from('vendor_instances_view')
        .select('id, negotiated_rate, confirmation_status')
        .eq('wedding_id', wedding.id)
        .is('deleted_at', null);

      if (vendors) {
        const total = vendors.length;
        // Incomplete: no rate entered OR status is still shortlisted (never advanced)
        const incomplete = vendors.filter(
          v => !v.negotiated_rate || v.confirmation_status === 'shortlisted'
        ).length;
        setVendorStats({ total, incomplete });
      }
      setLoadingHealth(false);
    }
    fetchData();
  }, [wedding.id]);

  const showAtRiskStrip =
    wedding.health_score === 'at_risk' || wedding.health_score === 'critical';

  const showCompletenessSignal =
    vendorStats !== null &&
    vendorStats.total > 0 &&
    vendorStats.incomplete / vendorStats.total > 0.3;

  if (loadingHealth) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[28px] font-medium leading-tight">
          {wedding.couple_name_1}
          {wedding.couple_name_2 ? ` & ${wedding.couple_name_2}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {formatDateDDMMYYYY(wedding.wedding_date)} · {daysUntil > 0 ? `${daysUntil} days away` : 'Today'}
        </p>
      </div>

      {/* At-risk strip (conditional) */}
      {showAtRiskStrip && health && (
        <div className={`mx-4 rounded-xl p-3 mb-3 border ${
          wedding.health_score === 'critical'
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${
            wedding.health_score === 'critical' ? 'text-red-700' : 'text-amber-800'
          }`}>
            {wedding.health_score === 'critical' ? 'Needs immediate attention' : 'At risk'}
          </p>
          <div className="space-y-1.5">
            {health.overdue_payments_count > 0 && (
              <button
                onClick={() => navigate(`/wedding/${wedding.id}/payments`)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm text-gray-800">Overdue payments</span>
                <span className="text-sm font-medium text-red-700">{health.overdue_payments_count}</span>
              </button>
            )}
            {health.unconfirmed_vendors_within_30_days > 0 && (
              <button
                onClick={() => navigate(`/wedding/${wedding.id}/tracker`)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm text-gray-800">Unconfirmed vendors needing attention</span>
                <span className="text-sm font-medium text-amber-800">{health.unconfirmed_vendors_within_30_days}</span>
              </button>
            )}
            {health.overdue_tasks_count > 0 && (
              <button
                onClick={() => navigate(`/wedding/${wedding.id}/timeline`)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm text-gray-800">Overdue tasks</span>
                <span className="text-sm font-medium text-amber-800">{health.overdue_tasks_count}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Data completeness signal (conditional) */}
      {showCompletenessSignal && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/vendors`)}
          className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl p-4 text-left"
        >
          <p className="text-sm text-gray-700">
            <span className="font-medium">{vendorStats!.incomplete} vendor{vendorStats!.incomplete !== 1 ? 's are' : ' is'} missing payment details.</span>
            {' '}Add milestones to keep your budget accurate.
          </p>
          <p className="text-sm text-vivaah-600 mt-1">View vendors →</p>
        </button>
      )}

      {/* Empty state — no vendors yet */}
      {vendorStats !== null && vendorStats.total === 0 && (
        <div className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-3">No vendors added yet. Add your first vendor to start tracking payments and confirmations.</p>
          <Button variant="primary" onClick={() => navigate(`/wedding/${wedding.id}/vendors`)} className="w-full">
            Add vendor
          </Button>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 mb-4 flex gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate(`/wedding/${wedding.id}/vendors`)}
          className="flex-1"
        >
          Add vendor
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/wedding/${wedding.id}/payments`)}
          className="flex-1"
        >
          Add payment
        </Button>
      </div>

      {/* Bottom tab bar */}
      <BottomNav 
        weddingId={wedding.id}
        currentAccessLevel={getMockRole() === 'full' ? 'planner_full' : getMockRole()}
        currentPath={`/wedding/${wedding.id}`}
      />
    </div>
  );
}
