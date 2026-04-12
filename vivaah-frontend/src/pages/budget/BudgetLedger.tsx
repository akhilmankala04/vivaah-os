import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { RupeeInput } from '../../components/ui/RupeeInput';
import { Button } from '../../components/ui/Button';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { getMockRole } from '../../lib/mockAuth';
import { BottomNav } from '../../components/ui/BottomNav';

interface CommittedVendor {
  id: string;
  vendor_name: string;
  category: string;
  negotiated_rate: number | null;
  confirmation_status: string;
}

interface PaidMilestone {
  amount: number;
  paid_date: string | null;
  description: string | null;
  vendor_instances_view: { vendor_name: string }[] | null;
}

function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

function statusColour(status: string): string {
  switch (status) {
    case 'booked':    return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-emerald-100 text-emerald-800';
    case 'done':      return 'bg-vivaah-100 text-vivaah-800';
    default:          return 'bg-gray-100 text-gray-600';
  }
}

export default function BudgetLedger() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getMockRole();

  const isBudgetOrFull = ['planner_full', 'full', 'budget', 'head_planner'].includes(role);
  if (!isBudgetOrFull) return <Navigate to="/permission-denied" replace />;

  const [loading, setLoading] = useState(true);
  const [planned, setPlanned] = useState(0);
  const [committed, setCommitted] = useState(0);
  const [paid, setPaid] = useState(0);
  const [committedVendors, setCommittedVendors] = useState<CommittedVendor[]>([]);
  const [paidMilestones, setPaidMilestones] = useState<PaidMilestone[]>([]);

  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState<number | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);

  async function fetchData() {
    if (!weddingId) return;
    setLoading(true);
    const [weddingRes, vendorsRes, milestonesRes] = await Promise.all([
      supabase.from('weddings').select('total_planned_budget').eq('id', weddingId).single(),
      supabase
        .from('vendor_instances_view')
        .select('id, vendor_name, category, negotiated_rate, confirmation_status')
        .eq('wedding_id', weddingId)
        .in('confirmation_status', ['booked', 'confirmed', 'done'])
        .is('deleted_at', null),
      supabase
        .from('payment_milestones')
        .select('amount, paid_date, description, vendor_instances_view!vendor_instance_id(vendor_name)')
        .eq('wedding_id', weddingId)
        .eq('status', 'paid')
        .is('deleted_at', null)
        .order('paid_date', { ascending: false }),
    ]);

    const vendors: CommittedVendor[] = vendorsRes.data ?? [];
    const milestones = (milestonesRes.data as unknown as PaidMilestone[]) ?? [];
    const planVal = weddingRes.data?.total_planned_budget ?? 0;
    const committedVal = vendors.reduce((s, v) => s + (v.negotiated_rate ?? 0), 0);
    const paidVal = milestones.reduce((s, m) => s + m.amount, 0);

    setPlanned(planVal);
    setCommitted(committedVal);
    setPaid(paidVal);
    setCommittedVendors(vendors);
    setPaidMilestones(milestones);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [weddingId]);

  const remaining = planned - committed;
  const committedPct = planned > 0 ? Math.round((committed / planned) * 100) : 0;
  const paidPct = planned > 0 ? Math.round((paid / planned) * 100) : 0;

  const barColour = committedPct >= 100 ? 'bg-red-500' : committedPct >= 85 ? 'bg-amber-400' : 'bg-emerald-500';

  async function handleBudgetSave() {
    if (!weddingId || !newBudget) return;
    setSavingBudget(true);
    await Promise.all([
      supabase.from('weddings').update({ total_planned_budget: newBudget }).eq('id', weddingId),
      supabase.from('budget_ledger').update({ total_planned_budget: newBudget }).eq('wedding_id', weddingId),
    ]);
    setSavingBudget(false);
    setEditingBudget(false);
    fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 -ml-2"
        >
          ←
        </button>
        <h1 className="text-xl font-medium flex-1">Budget</h1>
        {!editingBudget && role !== 'budget' && (
          <button
            onClick={() => { setNewBudget(planned); setEditingBudget(true); }}
            className="text-sm text-vivaah-600 min-h-[44px] px-2 flex items-center"
          >
            Edit budget
          </button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* Edit budget inline */}
        {editingBudget && (
          <div className="bg-white border border-vivaah-200 rounded-2xl p-4 space-y-3">
            <p className="text-[11px] font-medium tracking-wide uppercase text-vivaah-700">Update planned budget</p>
            <RupeeInput label="Total planned budget" value={newBudget ?? planned} onChange={setNewBudget} />
            <div className="flex gap-2">
              <Button variant="primary" size="small" onClick={handleBudgetSave} disabled={savingBudget || !newBudget} className="flex-1">
                {savingBudget ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="ghost" size="small" onClick={() => setEditingBudget(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Hero budget card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          {/* Planned budget — hero figure */}
          <div className="mb-4">
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-1">Planned budget</p>
            <p className="text-[28px] font-medium leading-tight">{formatRupees(planned)}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-1">
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              {/* Paid layer (underneath) */}
              <div className="relative h-2.5">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.min(paidPct, 100)}%` }}
                />
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all opacity-80 ${barColour}`}
                  style={{ width: `${Math.min(committedPct, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-400">{committedPct}% committed</p>
              <p className="text-xs text-gray-400">{paidPct}% paid</p>
            </div>
          </div>

          {/* Three stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-1">Committed</p>
              <p className={`text-[17px] font-medium ${committedPct >= 100 ? 'text-red-600' : committedPct >= 85 ? 'text-amber-600' : 'text-gray-900'}`}>
                {formatRupees(committed)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-1">Paid</p>
              <p className="text-[17px] font-medium text-emerald-600">{formatRupees(paid)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-1">
                {remaining < 0 ? 'Over by' : 'Remaining'}
              </p>
              <p className={`text-[17px] font-medium ${remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatRupees(Math.abs(remaining))}
              </p>
            </div>
          </div>
        </div>

        {/* Over-budget alert */}
        {committedPct >= 100 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-[11px] font-medium tracking-wide uppercase text-red-700 mb-1">Over budget</p>
            <p className="text-[15px] text-red-800">
              Committed spend exceeds your planned total by <span className="font-medium">{formatRupees(committed - planned)}</span>. Review vendor rates or increase your budget.
            </p>
          </div>
        )}

        {/* 85% warning */}
        {committedPct >= 85 && committedPct < 100 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-[11px] font-medium tracking-wide uppercase text-amber-700 mb-1">Approaching limit</p>
            <p className="text-[15px] text-amber-800">
              <span className="font-medium">{committedPct}%</span> of your budget is committed. Only <span className="font-medium">{formatRupees(remaining)}</span> left to allocate.
            </p>
          </div>
        )}

        {/* Committed vendors */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="text-xl font-medium">Committed vendors</p>
              <p className="text-sm text-gray-500 mt-0.5">{committedVendors.length} vendor{committedVendors.length !== 1 ? 's' : ''}</p>
            </div>
            <p className="text-[17px] font-medium text-gray-900">{formatRupees(committed)}</p>
          </div>

          {committedVendors.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No booked or confirmed vendors yet.</p>
              <button
                onClick={() => navigate(`/wedding/${weddingId}/vendors`)}
                className="text-sm text-vivaah-600 mt-1 min-h-[44px] flex items-center mx-auto"
              >
                Add vendors →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {committedVendors.map(v => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/wedding/${weddingId}/vendors/${v.id}`)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left min-h-[44px] hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-gray-900 truncate">{v.vendor_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-gray-500">{v.category}</p>
                      <span className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full ${statusColour(v.confirmation_status)}`}>
                        {v.confirmation_status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[15px] font-medium text-gray-900 ml-3 flex-shrink-0">
                    {formatRupees(v.negotiated_rate ?? 0)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payments made */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="text-xl font-medium">Payments made</p>
              <p className="text-sm text-gray-500 mt-0.5">{paidMilestones.length} payment{paidMilestones.length !== 1 ? 's' : ''}</p>
            </div>
            <p className="text-[17px] font-medium text-emerald-600">{formatRupees(paid)}</p>
          </div>

          {paidMilestones.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
              <button
                onClick={() => navigate(`/wedding/${weddingId}/payments`)}
                className="text-sm text-vivaah-600 mt-1 min-h-[44px] flex items-center mx-auto"
              >
                View payment calendar →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paidMilestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-gray-900 truncate">
                      {m.vendor_instances_view?.[0]?.vendor_name ?? 'Payment'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {m.description && (
                        <p className="text-sm text-gray-500 truncate">{m.description}</p>
                      )}
                      {m.paid_date && (
                        <p className="text-sm text-gray-400 flex-shrink-0">{formatDateDDMMYYYY(m.paid_date)}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0 text-right">
                    <p className="text-[15px] font-medium text-emerald-600">{formatRupees(m.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={role}
        currentPath={location.pathname}
      />
    </div>
  );
}
