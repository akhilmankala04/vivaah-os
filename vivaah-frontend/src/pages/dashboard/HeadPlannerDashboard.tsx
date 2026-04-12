import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { BottomNav } from '../../components/ui/BottomNav';
import { getMockRole } from '../../lib/mockAuth';
import type { Wedding } from './WeddingDashboard';

interface FinancialSummary {
  total_planned: number;
  total_committed: number;
  total_paid: number;
  upcoming_30_days: number;
}

interface OverdueMilestone {
  id: string;
  description: string | null;
  amount: number;
  due_date: string;
  vendor_name: string | null;
}

interface UpcomingMilestone {
  id: string;
  description: string | null;
  amount: number;
  due_date: string;
  vendor_name: string | null;
}

interface OverdueTask {
  id: string;
  title: string;
  due_date: string | null;
}

interface UnconfirmedVendor {
  id: string;
  vendor_name: string;
  confirmation_status: string;
}

interface Props {
  wedding: Wedding;
}

function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export default function HeadPlannerDashboard({ wedding }: Props) {
  const navigate = useNavigate();
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [overdueMilestones, setOverdueMilestones] = useState<OverdueMilestone[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<UpcomingMilestone[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
  const [unconfirmedVendors, setUnconfirmedVendors] = useState<UnconfirmedVendor[]>([]);
  const [vendorStats, setVendorStats] = useState<{ total: number; incomplete: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const daysUntil = Math.ceil(
    (new Date(wedding.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0];
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [vendorRatesResult, paidResult, overdueResult, upcomingResult, tasksResult, vendorsResult] =
        await Promise.all([
          // Committed = sum of negotiated_rate for booked/confirmed/done vendors
          supabase
            .from('vendor_instances_view')
            .select('negotiated_rate, confirmation_status')
            .eq('wedding_id', wedding.id)
            .in('confirmation_status', ['booked', 'confirmed', 'done'])
            .is('deleted_at', null),

          // Paid = sum of paid milestones
          supabase
            .from('payment_milestones')
            .select('amount')
            .eq('wedding_id', wedding.id)
            .eq('status', 'paid')
            .is('deleted_at', null),

          // Overdue milestones
          supabase
            .from('payment_milestones')
            .select('id, description, amount, due_date, vendor_instance_id')
            .eq('wedding_id', wedding.id)
            .eq('status', 'overdue')
            .is('deleted_at', null)
            .order('due_date', { ascending: true })
            .limit(5),

          // Upcoming milestones — due in next 7 days, not yet paid
          supabase
            .from('payment_milestones')
            .select('id, description, amount, due_date, vendor_instance_id')
            .eq('wedding_id', wedding.id)
            .neq('status', 'paid')
            .neq('status', 'overdue')
            .gte('due_date', today)
            .lte('due_date', in7Days)
            .is('deleted_at', null)
            .order('due_date', { ascending: true })
            .limit(5),

          // Overdue tasks
          supabase
            .from('tasks')
            .select('id, title, due_date')
            .eq('wedding_id', wedding.id)
            .eq('status', 'overdue')
            .is('deleted_at', null)
            .order('due_date', { ascending: true })
            .limit(5),

          // Unconfirmed vendors with events in next 30 days
          supabase
            .from('vendor_instances_view')
            .select('id, vendor_name, confirmation_status, negotiated_rate')
            .eq('wedding_id', wedding.id)
            .not('confirmation_status', 'in', '("confirmed","done")')
            .is('deleted_at', null)
            .limit(20),
        ]);

      // Compute budget figures directly
      const totalCommitted = (vendorRatesResult.data ?? [])
        .reduce((sum, v) => sum + (v.negotiated_rate ?? 0), 0)
      const totalPaid = (paidResult.data ?? [])
        .reduce((sum, m) => sum + (m.amount ?? 0), 0)
      setFinancials({
        total_planned: wedding.total_planned_budget ?? 0,
        total_committed: totalCommitted,
        total_paid: totalPaid,
        upcoming_30_days: 0,
      })

      // Enrich milestones with vendor names via vendor_instances_view
      const allMilestoneVendorIds = [
        ...(overdueResult.data ?? []),
        ...(upcomingResult.data ?? []),
      ].map(m => m.vendor_instance_id).filter(Boolean);

      let vendorNameMap: Record<string, string> = {};
      if (allMilestoneVendorIds.length > 0) {
        const { data: vData } = await supabase
          .from('vendor_instances_view')
          .select('id, vendor_name')
          .in('id', allMilestoneVendorIds)
          .is('deleted_at', null);
        vendorNameMap = Object.fromEntries((vData ?? []).map(v => [v.id, v.vendor_name]));
      }

      setOverdueMilestones(
        (overdueResult.data ?? []).map(m => ({
          ...m,
          vendor_name: vendorNameMap[m.vendor_instance_id] ?? null,
        }))
      );

      setUpcomingMilestones(
        (upcomingResult.data ?? []).map(m => ({
          ...m,
          vendor_name: vendorNameMap[m.vendor_instance_id] ?? null,
        }))
      );

      setOverdueTasks((tasksResult.data ?? []) as OverdueTask[]);

      // Unconfirmed vendors within 30 days — use events to check proximity
      const vendorList = (vendorsResult.data ?? []) as UnconfirmedVendor[];

      // Fetch events to find vendors linked to near-term events
      const { data: events } = await supabase
        .from('events')
        .select('event_date')
        .eq('wedding_id', wedding.id)
        .is('deleted_at', null)
        .lte('event_date', in30Days)
        .gte('event_date', today);

      // If any event is within 30 days, surface unconfirmed vendors
      const hasNearTermEvent = (events ?? []).length > 0;
      if (hasNearTermEvent) {
        setUnconfirmedVendors(vendorList.slice(0, 5));
      } else {
        setUnconfirmedVendors([]);
      }

      // Vendor completeness stats
      const { data: allVendors } = await supabase
        .from('vendor_instances_view')
        .select('id, negotiated_rate, confirmation_status')
        .eq('wedding_id', wedding.id)
        .is('deleted_at', null);

      if (allVendors) {
        const total = allVendors.length;
        const incomplete = allVendors.filter(
          v => !v.negotiated_rate || v.confirmation_status === 'shortlisted'
        ).length;
        setVendorStats({ total, incomplete });
      }

      setLoading(false);
    }
    fetchData();
  }, [wedding.id]);

  const budgetPct = financials && financials.total_planned > 0
    ? Math.round(financials.total_committed / financials.total_planned * 100)
    : 0;

  const showCompletenessSignal =
    vendorStats !== null &&
    vendorStats.total > 0 &&
    vendorStats.incomplete / vendorStats.total > 0.3;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard />
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

      {/* Budget snapshot */}
      {financials && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/budget`)}
          className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
        >
          <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-3">Budget</p>
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Planned</p>
              <p className="text-[17px] font-medium mt-0.5">{formatRupees(financials.total_planned)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Committed</p>
              <p className={`text-[17px] font-medium mt-0.5 ${budgetPct >= 100 ? 'text-red-600' : budgetPct >= 85 ? 'text-amber-600' : 'text-gray-900'}`}>
                {formatRupees(financials.total_committed)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">Paid</p>
              <p className="text-[17px] font-medium mt-0.5">{formatRupees(financials.total_paid)}</p>
            </div>
          </div>
          {financials.total_planned > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${budgetPct >= 100 ? 'bg-red-500' : budgetPct >= 85 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
          )}
          <p className="text-xs text-vivaah-600 mt-2">View full budget →</p>
        </button>
      )}

      {/* Overdue payments */}
      {overdueMilestones.length > 0 && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/payments`)}
          className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
        >
          <p className="text-[11px] font-medium tracking-wide uppercase text-red-700 mb-2">
            Overdue payments · {overdueMilestones.length}
          </p>
          <div className="space-y-2">
            {overdueMilestones.map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-red-900 truncate">
                    {m.vendor_name ?? m.description ?? 'Payment'}
                  </p>
                  <p className="text-sm text-red-700">Was due {formatDateDDMMYYYY(m.due_date)}</p>
                </div>
                <p className="text-[15px] font-medium text-red-800 ml-3 flex-shrink-0">
                  {formatRupees(m.amount)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-700 font-medium mt-2">View payments →</p>
        </button>
      )}

      {/* Upcoming payments — due in 7 days */}
      {upcomingMilestones.length > 0 && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/payments`)}
          className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
        >
          <p className="text-[11px] font-medium tracking-wide uppercase text-amber-700 mb-2">
            Due this week · {upcomingMilestones.length}
          </p>
          <div className="space-y-2">
            {upcomingMilestones.map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-amber-900 truncate">
                    {m.vendor_name ?? m.description ?? 'Payment'}
                  </p>
                  <p className="text-sm text-amber-700">Due {formatDateDDMMYYYY(m.due_date)}</p>
                </div>
                <p className="text-[15px] font-medium text-amber-800 ml-3 flex-shrink-0">
                  {formatRupees(m.amount)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2">View payments →</p>
        </button>
      )}

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/timeline`)}
          className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
        >
          <p className="text-[11px] font-medium tracking-wide uppercase text-amber-700 mb-2">
            Overdue tasks · {overdueTasks.length}
          </p>
          <div className="space-y-1.5">
            {overdueTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <p className="text-[15px] font-medium text-amber-900 truncate flex-1">{t.title}</p>
                {t.due_date && (
                  <p className="text-sm text-amber-700 ml-3 flex-shrink-0">
                    {formatDateDDMMYYYY(t.due_date)}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2">View timeline →</p>
        </button>
      )}

      {/* Unconfirmed vendors near event date */}
      {unconfirmedVendors.length > 0 && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/tracker`)}
          className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
        >
          <p className="text-[11px] font-medium tracking-wide uppercase text-amber-700 mb-2">
            Unconfirmed vendors · {unconfirmedVendors.length}
          </p>
          <div className="space-y-1.5">
            {unconfirmedVendors.map(v => (
              <div key={v.id} className="flex items-center justify-between">
                <p className="text-[15px] font-medium text-amber-900 truncate flex-1">{v.vendor_name}</p>
                <span className="text-xs font-medium text-amber-700 ml-3 capitalize flex-shrink-0">
                  {v.confirmation_status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2">View tracker →</p>
        </button>
      )}

      {/* Data completeness signal */}
      {showCompletenessSignal && (
        <button
          onClick={() => navigate(`/wedding/${wedding.id}/vendors`)}
          className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
        >
          <p className="text-sm text-gray-700">
            <span className="font-medium">
              {vendorStats!.incomplete} vendor{vendorStats!.incomplete !== 1 ? 's are' : ' is'} missing payment details.
            </span>
            {' '}Add milestones to keep your budget accurate.
          </p>
          <p className="text-sm text-vivaah-600 mt-1">View vendors →</p>
        </button>
      )}

      {/* Empty state */}
      {vendorStats !== null && vendorStats.total === 0 && (
        <div className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-3">
            No vendors added yet. Add your first vendor to start tracking payments and confirmations.
          </p>
          <Button variant="primary" onClick={() => navigate(`/wedding/${wedding.id}/vendors`)} className="w-full">
            Add vendor
          </Button>
        </div>
      )}

      {/* All clear state — nothing at risk */}
      {overdueMilestones.length === 0 &&
        upcomingMilestones.length === 0 &&
        overdueTasks.length === 0 &&
        unconfirmedVendors.length === 0 &&
        vendorStats !== null &&
        vendorStats.total > 0 && (
        <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-[11px] font-medium tracking-wide uppercase text-emerald-700 mb-1">All clear</p>
          <p className="text-sm text-emerald-800">No overdue payments, tasks, or unconfirmed vendors. Your wedding is on track.</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 mb-3 flex gap-3">
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

      {/* Madhu AI assistant entry point */}
      <button
        onClick={() => navigate(`/wedding/${wedding.id}/assistant`)}
        className="mx-4 mb-4 bg-vivaah-50 border border-vivaah-200 rounded-2xl p-4 text-left w-[calc(100%-2rem)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-vivaah-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🪷</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-vivaah-700">Questions about your wedding plan?</p>
            <p className="text-[15px] font-medium text-vivaah-900 flex items-center gap-1">
              Ask Madhu
              <svg viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5 text-vivaah-500 flex-shrink-0" aria-hidden="true">
                <path d="M5 0 C5 0 5.4 2.8 6.2 3.8 C7 4.8 10 5 10 5 C10 5 7 5.2 6.2 6.2 C5.4 7.2 5 10 5 10 C5 10 4.6 7.2 3.8 6.2 C3 5.2 0 5 0 5 C0 5 3 4.8 3.8 3.8 C4.6 2.8 5 0 5 0 Z" />
              </svg>
              <svg viewBox="0 0 10 10" fill="currentColor" className="w-1.5 h-1.5 text-vivaah-400 flex-shrink-0" aria-hidden="true">
                <path d="M5 0 C5 0 5.4 2.8 6.2 3.8 C7 4.8 10 5 10 5 C10 5 7 5.2 6.2 6.2 C5.4 7.2 5 10 5 10 C5 10 4.6 7.2 3.8 6.2 C3 5.2 0 5 0 5 C0 5 3 4.8 3.8 3.8 C4.6 2.8 5 0 5 0 Z" />
              </svg>
            </p>
          </div>
          <span className="text-vivaah-400 text-lg flex-shrink-0">→</span>
        </div>
      </button>

      <BottomNav
        weddingId={wedding.id}
        currentAccessLevel={getMockRole() === 'full' ? 'head_planner' : getMockRole()}
        currentPath={`/wedding/${wedding.id}`}
      />
    </div>
  );
}
