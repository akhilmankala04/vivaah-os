import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Input } from '../../components/ui/Input';
import { RupeeInput } from '../../components/ui/RupeeInput';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { BottomNav } from '../../components/ui/BottomNav';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { getMockRole } from '../../lib/mockAuth';

interface VendorRef {
  vendor_name: string;
  confirmation_status: string;
  negotiated_rate: number | null;
}

interface Milestone {
  id: string;
  vendor_instance_id: string;
  wedding_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'upcoming' | 'due' | 'paid' | 'overdue';
  description: string | null;
  vendor_instances_view: VendorRef | null;
}

interface GroupedMilestones {
  [yearMonth: string]: Milestone[];
}

// Format paise to ₹X.XX lakh/crore
function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

function monthHeading(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('en-IN', {
    month: 'long', year: 'numeric'
  });
}

function statusVariant(status: string): 'shortlisted' | 'quoted' | 'booked' | 'done' | 'confirmed' {
  if (status === 'overdue') return 'shortlisted'; // red-ish
  if (status === 'due') return 'quoted';           // amber
  if (status === 'paid') return 'done';            // muted
  return 'booked';                                  // blue upcoming
}

export default function PaymentCalendar() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getMockRole();
  const isCoupleView = role === 'couple_view';

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter30Days, setFilter30Days] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  // Mark paid sheet
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [paidDate, setPaidDate] = useState('');
  const [marking, setMarking] = useState(false);

  // Edit sheet
  const [showEdit, setShowEdit] = useState(false);
  const [editAmount, setEditAmount] = useState<number | null>(null);
  const [editDueDate, setEditDueDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Add milestone sheet
  const [showAdd, setShowAdd] = useState(false);
  const [vendors, setVendors] = useState<{ id: string; vendor_name: string; negotiated_rate: number | null }[]>([]);
  const [addVendorId, setAddVendorId] = useState('');
  const [addAmount, setAddAmount] = useState<number | null>(null);
  const [addDueDate, setAddDueDate] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addWarning, setAddWarning] = useState('');
  const [adding, setAdding] = useState(false);

  // Couple view summary
  const [summary30, setSummary30] = useState<number>(0);

  async function fetchMilestones() {
    if (!weddingId) return;
    const { data } = await supabase
      .from('payment_milestones')
      .select(`
        *,
        vendor_instances_view!vendor_instance_id (vendor_name, confirmation_status, negotiated_rate)
      `)
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .order('due_date', { ascending: true });
    setMilestones((data as Milestone[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (isCoupleView) {
      // couple_view: only show aggregate from RPC
      supabase
        .rpc('couple_view_financial_summary', { p_wedding_id: weddingId })
        .then(({ data }) => {
          if (data && data.length > 0) setSummary30(data[0].upcoming_30_days ?? 0);
          setLoading(false);
        });
      return;
    }
    fetchMilestones();
    // Fetch vendors for add milestone dropdown
    supabase
      .from('vendor_instances_view')
      .select('id, vendor_name, negotiated_rate')
      .eq('wedding_id', weddingId!)
      .is('deleted_at', null)
      .then(({ data }) => setVendors(data ?? []));
  }, [weddingId, isCoupleView]);

  // Compute 30-day total
  const today = new Date();
  const cutoff30 = new Date(today); cutoff30.setDate(today.getDate() + 30);
  const cutoff30Str = cutoff30.toISOString().split('T')[0];

  const due30Total = milestones
    .filter(m => (m.status === 'upcoming' || m.status === 'due') && m.due_date <= cutoff30Str)
    .reduce((sum, m) => sum + m.amount, 0);

  // Group milestones
  const displayMilestones = filter30Days
    ? milestones.filter(m => m.due_date <= cutoff30Str && m.status !== 'paid')
    : milestones;

  const grouped: GroupedMilestones = displayMilestones.reduce((acc, m) => {
    const key = m.due_date.slice(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as GroupedMilestones);

  function toggleMonth(key: string) {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function openMarkPaid(m: Milestone) {
    setSelected(m);
    setPaidDate(new Date().toISOString().split('T')[0]);
    setShowMarkPaid(true);
  }

  function openEdit(m: Milestone) {
    setSelected(m);
    setEditAmount(m.amount);
    setEditDueDate(m.due_date);
    setEditDescription(m.description ?? '');
    setShowEdit(true);
  }

  async function handleMarkPaid() {
    if (!selected || !paidDate) return;
    setMarking(true);
    await supabase
      .from('payment_milestones')
      .update({ status: 'paid', paid_date: paidDate })
      .eq('id', selected.id);
    setMarking(false);
    setShowMarkPaid(false);
    await fetchMilestones();
  }

  async function handleEditSave() {
    if (!selected || !editDueDate || !editAmount) return;
    setSaving(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const newStatus = editDueDate < todayStr ? 'overdue' : selected.status;
    await supabase
      .from('payment_milestones')
      .update({
        amount: editAmount,
        due_date: editDueDate,
        description: editDescription,
        status: newStatus,
      })
      .eq('id', selected.id);
    setSaving(false);
    setShowEdit(false);
    await fetchMilestones();
  }

  async function handleSoftDelete() {
    if (!selected || selected.status === 'paid') return;
    const ok = window.confirm('Delete this milestone? This cannot be undone from the UI.');
    if (!ok) return;
    await supabase
      .from('payment_milestones')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', selected.id);
    setShowEdit(false);
    await fetchMilestones();
  }

  function handleAddAmountChange(val: number | null) {
    setAddAmount(val);
    if (!val || !addVendorId) { setAddWarning(''); return; }
    const vendor = vendors.find(v => v.id === addVendorId);
    if (!vendor?.negotiated_rate) { setAddWarning(''); return; }
    const existing = milestones
      .filter(m => m.vendor_instance_id === addVendorId && m.status !== 'paid')
      .reduce((s, m) => s + m.amount, 0);
    const newTotal = existing + val;
    if (newTotal > vendor.negotiated_rate) {
      setAddWarning(
        `Milestone total (${formatRupees(newTotal)}) exceeds negotiated rate (${formatRupees(vendor.negotiated_rate)})`
      );
    } else {
      setAddWarning('');
    }
  }

  async function handleAddMilestone() {
    if (!addVendorId || !addAmount || !addDueDate || !weddingId) return;
    setAdding(true);
    const todayStr = new Date().toISOString().split('T')[0];
    await supabase.from('payment_milestones').insert({
      vendor_instance_id: addVendorId,
      wedding_id: weddingId,
      amount: addAmount,
      due_date: addDueDate,
      description: addDescription || null,
      status: addDueDate < todayStr ? 'overdue' : 'upcoming',
    });
    setAdding(false);
    setShowAdd(false);
    setAddVendorId(''); setAddAmount(null); setAddDueDate(''); setAddDescription(''); setAddWarning('');
    await fetchMilestones();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  // ── Couple view: aggregate only ──────────────────────────────────────────
  if (isCoupleView) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 min-h-[44px] flex items-center">
          ← Back
        </button>
        <h1 className="text-[28px] font-medium mb-4">Payments</h1>
        <div className="bg-vivaah-50 border border-vivaah-200 rounded-xl p-3">
          <p className="text-sm text-gray-600">Due in the next 30 days</p>
          <p className="text-[28px] font-medium mt-1 text-vivaah-800">{formatRupees(summary30)}</p>
        </div>
      </div>
    );
  }

  // ── Full view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center text-sm text-gray-500">
          ←
        </button>
        <h1 className="text-[28px] font-medium">Payments</h1>
      </div>

      {/* 30-day summary bar */}
      <button
        onClick={() => setFilter30Days(f => !f)}
        className={`mx-4 mb-4 w-[calc(100%-2rem)] text-left rounded-xl p-3 border transition-colors ${
          filter30Days
            ? 'bg-vivaah-100 border-vivaah-400'
            : 'bg-vivaah-50 border-vivaah-200'
        }`}
      >
        <p className="text-sm text-vivaah-700">
          {formatRupees(due30Total)} due in the next 30 days
          {filter30Days && ' · Showing filtered view'}
        </p>
      </button>

      {/* Grouped milestones */}
      {Object.keys(grouped).length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-gray-500 text-sm">No payment milestones yet.</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {Object.entries(grouped).map(([yearMonth, items]) => {
            const monthTotal = items
              .filter(m => m.status !== 'paid')
              .reduce((s, m) => s + m.amount, 0);

            return (
              <div key={yearMonth}>
                {/* Month heading */}
                <button
                  onClick={() => toggleMonth(yearMonth)}
                  className="flex items-center justify-between w-full mb-2 min-h-[44px]"
                >
                  <p className="text-[15px] font-medium text-gray-900">{monthHeading(yearMonth)}</p>
                  <p className="text-sm text-gray-500">{formatRupees(monthTotal)}</p>
                </button>

                {!collapsedMonths.has(yearMonth) && (
                  <div className="space-y-3">
                    {items.map(m => {
                      const isPaid = m.status === 'paid';
                      const isOverdue = m.status === 'overdue';
                      return (
                        <div
                          key={m.id}
                          className={`bg-white border border-gray-100 rounded-2xl p-4 ${
                            isOverdue ? 'border-l-2 border-l-red-400 bg-red-50/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className={`text-[15px] font-medium ${isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                              {m.vendor_instances_view?.vendor_name ?? 'Unknown vendor'}
                            </p>
                            <Badge variant={statusVariant(m.status)}>
                              {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                            </Badge>
                          </div>
                          {m.description && (
                            <p className={`text-sm mb-1 ${isPaid ? 'text-gray-400' : 'text-gray-500'}`}>
                              {m.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className={`text-sm ${isPaid ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isPaid
                                  ? `Paid ${m.paid_date ? formatDateDDMMYYYY(m.paid_date) : ''}`
                                  : formatDateDDMMYYYY(m.due_date)
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className={`text-[15px] font-medium ${isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                                {formatRupees(m.amount)}
                              </p>
                              {!isPaid && (
                                <>
                                  <Button variant="secondary" size="small" onClick={() => openMarkPaid(m)}>
                                    Mark paid
                                  </Button>
                                  <Button variant="ghost" size="small" onClick={() => openEdit(m)}>
                                    Edit
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 z-40 bg-vivaah-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl border border-vivaah-800"
        aria-label="Add milestone"
      >
        +
      </button>

      {/* Mark paid sheet */}
      <BottomSheet isOpen={showMarkPaid} onClose={() => setShowMarkPaid(false)} title="Mark as paid">
        <p className="text-sm text-gray-500 mb-4">
          {selected?.vendor_instances_view?.vendor_name}
          {selected?.description ? ` — ${selected.description}` : ''}
        </p>
        <Input
          label="Payment date (DD/MM/YYYY)"
          type="date"
          value={paidDate}
          onChange={e => setPaidDate(e.target.value)}
        />
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="primary" onClick={handleMarkPaid} disabled={!paidDate || marking} className="w-full">
            {marking ? 'Saving…' : 'Confirm payment'}
          </Button>
          <Button variant="ghost" onClick={() => setShowMarkPaid(false)} className="w-full">Cancel</Button>
        </div>
      </BottomSheet>

      {/* Edit milestone sheet */}
      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit milestone">
        <div className="space-y-4">
          <RupeeInput label="Amount" value={editAmount} onChange={setEditAmount} />
          <Input
            label="Due date"
            type="date"
            value={editDueDate}
            onChange={e => setEditDueDate(e.target.value)}
          />
          <Input
            label="Description"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            placeholder="e.g. 50% advance"
          />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="primary" onClick={handleEditSave} disabled={saving || !editAmount || !editDueDate} className="w-full">
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          <Button variant="ghost" onClick={() => setShowEdit(false)} className="w-full">Cancel</Button>
          {selected?.status !== 'paid' && (
            <Button variant="ghost" onClick={handleSoftDelete} className="w-full text-red-600">
              Delete milestone
            </Button>
          )}
        </div>
      </BottomSheet>

      {/* Add milestone sheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add milestone">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-normal text-gray-700 block mb-1">Vendor</label>
            <select
              value={addVendorId}
              onChange={e => setAddVendorId(e.target.value)}
              className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600"
            >
              <option value="">Select vendor…</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.vendor_name}</option>
              ))}
            </select>
          </div>
          <RupeeInput label="Amount" value={addAmount} onChange={handleAddAmountChange} />
          {addWarning && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">{addWarning}</p>
          )}
          <Input
            label="Due date"
            type="date"
            value={addDueDate}
            onChange={e => setAddDueDate(e.target.value)}
          />
          <Input
            label="Description (optional)"
            value={addDescription}
            onChange={e => setAddDescription(e.target.value)}
            placeholder="e.g. 50% advance"
          />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={handleAddMilestone}
            disabled={adding || !addVendorId || !addAmount || !addDueDate}
            className="w-full"
          >
            {adding ? 'Adding…' : 'Add milestone'}
          </Button>
          <Button variant="ghost" onClick={() => setShowAdd(false)} className="w-full">Cancel</Button>
        </div>
      </BottomSheet>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={role}
        currentPath={location.pathname}
      />
    </div>
  );
}
