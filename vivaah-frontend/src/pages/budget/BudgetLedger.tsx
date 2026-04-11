import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { RupeeInput } from '../../components/ui/RupeeInput';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { getMockRole } from '../../lib/mockAuth';
import { BottomNav } from '../../components/ui/BottomNav';

interface CoupleFinancials {
  total_planned: number;
  total_committed: number;
  total_paid: number;
  upcoming_30_days: number;
}

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

// Format paise to ₹ display
function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export default function BudgetLedger() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getMockRole();

  // Access-level gate
  // Allowed: planner_full, full, budget, couple_view (restricted)
  // couple_view (Mode 1): couple_view_financial_summary only — no planned, no breakdown
  const isCoupleView = role === 'couple_view';
  const isBudgetOrFull = ['planner_full', 'full', 'budget', 'head_planner'].includes(role);
  if (!isCoupleView && !isBudgetOrFull) {
    return <Navigate to="/permission-denied" replace />;
  }

  const [loading, setLoading] = useState(true);
  // Couple-view state
  const [coupleFinancials, setCoupleFinancials] = useState<CoupleFinancials | null>(null);
  // Full view state
  const [planned, setPlanned] = useState(0);
  const [committed, setCommitted] = useState(0);
  const [paid, setPaid] = useState(0);
  const [committedVendors, setCommittedVendors] = useState<CommittedVendor[]>([]);
  const [paidMilestones, setPaidMilestones] = useState<PaidMilestone[]>([]);
  const [vendorsExpanded, setVendorsExpanded] = useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);

  // Inline budget edit
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState<number | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);

  async function fetchData() {
    if (!weddingId) return;
    setLoading(true);

    if (isCoupleView) {
      const { data } = await supabase
        .rpc('couple_view_financial_summary', { p_wedding_id: weddingId });
      if (data && data.length > 0) setCoupleFinancials(data[0]);
      setLoading(false);
      return;
    }

    // Full view: compute all figures live (FR-S10-01, FR-S10-02)
    const [weddingRes, vendorsRes, milestonesRes] = await Promise.all([
      supabase
        .from('weddings')
        .select('total_planned_budget')
        .eq('id', weddingId)
        .single(),
      supabase
        .from('vendor_instances_view')
        .select('id, vendor_name, category, negotiated_rate, confirmation_status')
        .eq('wedding_id', weddingId)
        .in('confirmation_status', ['booked', 'confirmed', 'done'])
        .is('deleted_at', null),
      supabase
        .from('payment_milestones')
        .select(`
          amount, paid_date, description,
          vendor_instances_view!vendor_instance_id (vendor_name)
        `)
        .eq('wedding_id', weddingId)
        .eq('status', 'paid')
        .is('deleted_at', null),
    ]);

    const planedVal = weddingRes.data?.total_planned_budget ?? 0;
    const vendors: CommittedVendor[] = vendorsRes.data ?? [];
    const milestones = (milestonesRes.data as unknown as PaidMilestone[]) ?? [];

    const committedVal = vendors.reduce((s, v) => s + (v.negotiated_rate ?? 0), 0);
    const paidVal = milestones.reduce((s, m) => s + m.amount, 0);

    setPlanned(planedVal);
    setCommitted(committedVal);
    setPaid(paidVal);
    setCommittedVendors(vendors);
    setPaidMilestones(milestones);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [weddingId]);

  const remaining = planned - committed;
  const committedPct = planned > 0 ? Math.round((committed / planned) * 100) : 0;

  async function handleBudgetSave() {
    if (!weddingId || !newBudget) return;
    setSavingBudget(true);
    // Update both weddings record and budget_ledger for consistency
    await supabase
      .from('weddings')
      .update({ total_planned_budget: newBudget })
      .eq('id', weddingId);
    await supabase
      .from('budget_ledger')
      .update({ total_planned_budget: newBudget, last_updated_at: new Date().toISOString() })
      .eq('wedding_id', weddingId);
    setSavingBudget(false);
    setEditingBudget(false);
    await fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  // ── Couple view (Mode 1) — restricted ─────────────────────────────────────
  if (isCoupleView && coupleFinancials) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 min-h-[44px] flex items-center">
          ← Back
        </button>
        <h1 className="text-[28px] font-medium mb-6">Budget</h1>
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500">Committed</p>
              <p className="text-[28px] font-medium mt-1">{formatRupees(coupleFinancials.total_committed)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500">Paid</p>
              <p className="text-[28px] font-medium mt-1">{formatRupees(coupleFinancials.total_paid)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500">Due 30 days</p>
              <p className="text-[28px] font-medium mt-1">{formatRupees(coupleFinancials.upcoming_30_days)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Full view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center text-sm text-gray-500">
          ←
        </button>
        <h1 className="text-[28px] font-medium">Budget</h1>
      </div>

      {/* Three headline figures */}
      <div className="mx-4 bg-white border border-gray-100 rounded-2xl p-4 mb-3">
        <div className="flex justify-between items-start">
          {/* Planned — editable */}
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500">Planned</p>
            {editingBudget ? (
              <div className="mt-1 space-y-2">
                <RupeeInput label="" value={newBudget ?? planned} onChange={setNewBudget} />
                <div className="flex gap-2">
                  <Button variant="primary" size="small" onClick={handleBudgetSave} disabled={savingBudget || !newBudget}>
                    {savingBudget ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => setEditingBudget(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-medium mt-1">{formatRupees(planned)}</p>
                {role !== 'budget' && (
                  <button
                    onClick={() => { setNewBudget(planned); setEditingBudget(true); }}
                    className="text-xs text-vivaah-600 min-h-[44px] flex items-center"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500">Committed</p>
            <p className="text-[28px] font-medium mt-1">{formatRupees(committed)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500">Paid</p>
            <p className="text-[28px] font-medium mt-1">{formatRupees(paid)}</p>
          </div>
        </div>

        {/* Remaining */}
        <p className={`text-sm mt-3 ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
          {remaining < 0
            ? `${formatRupees(Math.abs(remaining))} over budget`
            : `${formatRupees(remaining)} remaining`
          }
        </p>

        {/* Progress bar (FR-S10-03, FR-S10-04) */}
        <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
          <div
            className={`h-2 rounded-full transition-all ${
              committedPct >= 100 ? 'bg-red-500' :
              committedPct >= 85  ? 'bg-amber-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(committedPct, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">{committedPct}% committed</p>
      </div>

      {/* 100% alert */}
      {committedPct >= 100 && (
        <div className="mx-4 mb-3 bg-red-50 border border-red-400 rounded-2xl p-3">
          <p className="text-sm font-medium text-red-700">
            Budget exceeded — committed spend is over your planned total by {formatRupees(committed - planned)}.
          </p>
        </div>
      )}

      {/* 85% warning */}
      {committedPct >= 85 && committedPct < 100 && (
        <div className="mx-4 mb-3 bg-amber-50 border border-amber-400 rounded-2xl p-3">
          <p className="text-sm font-medium text-amber-800">
            You've committed {formatRupees(committed)} — {committedPct}% of your planned budget.
          </p>
        </div>
      )}

      {/* Committed vendors accordion */}
      <div className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setVendorsExpanded(v => !v)}
          className="flex items-center justify-between w-full px-4 py-3 min-h-[44px]"
        >
          <p className="text-xl font-medium">Committed vendors</p>
          <p className="text-sm text-gray-500">{formatRupees(committed)}</p>
        </button>
        {vendorsExpanded && (
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {committedVendors.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No committed vendors yet.</p>
            ) : committedVendors.map(v => (
              <button
                key={v.id}
                onClick={() => navigate(`/wedding/${weddingId}/vendors/${v.id}`)}
                className="flex items-center justify-between w-full px-4 py-3 text-left min-h-[44px]"
              >
                <div>
                  <p className="text-[15px] text-gray-900">{v.vendor_name}</p>
                  <p className="text-xs text-gray-500">{v.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatRupees(v.negotiated_rate ?? 0)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Paid milestones accordion */}
      <div className="mx-4 mb-3 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setPaymentsExpanded(v => !v)}
          className="flex items-center justify-between w-full px-4 py-3 min-h-[44px]"
        >
          <p className="text-xl font-medium">Payments made</p>
          <p className="text-sm text-gray-500">{formatRupees(paid)}</p>
        </button>
        {paymentsExpanded && (
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {paidMilestones.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No payments recorded yet.</p>
            ) : paidMilestones.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[15px] text-gray-900">
                    {m.vendor_instances_view?.[0]?.vendor_name ?? 'Unknown'}
                  </p>
                  {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                  {m.paid_date && <p className="text-xs text-gray-400">{formatDateDDMMYYYY(m.paid_date)}</p>}
                </div>
                <p className="text-sm font-medium text-gray-900">{formatRupees(m.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={role}
        currentPath={location.pathname}
      />
    </div>
  );
}
