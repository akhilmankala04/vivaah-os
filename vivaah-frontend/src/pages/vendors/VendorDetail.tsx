import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EventChip } from '../../components/ui/EventChip';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { RupeeInput } from '../../components/ui/RupeeInput';
import { Input } from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { getMockRole } from '../../lib/mockAuth';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';

interface EventRef {
  id: string;
  event_name: 'haldi' | 'mehendi' | 'sangeet' | 'engagement' | 'wedding' | 'reception' | 'custom';
  event_date: string;
}

interface Milestone {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'upcoming' | 'due' | 'paid' | 'overdue';
  description: string | null;
}

interface VendorData {
  id: string;
  vendor_name: string;
  category: string;
  city: string | null;
  phone: string | null;
  confirmation_status: string;
  negotiated_rate: number | null;
  deliverables: string | null;
  planner_notes: string | null;
}

function formatDisplayRate(paise: number | null): string {
  if (paise === null || paise === 0) return 'Not set';
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

const STATUS_CHAIN = ['shortlisted', 'quoted', 'booked', 'confirmed', 'done'];

const NEXT_STATUS_LABEL: Record<string, string> = {
  shortlisted: 'Move to Quoted',
  quoted: 'Mark as Booked',
  booked: 'Mark Confirmed',
  confirmed: 'Mark Done',
};

export default function VendorDetail() {
  const navigate = useNavigate();
  const { weddingId, vendorId } = useParams<{ weddingId: string; vendorId: string }>();

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [events, setEvents] = useState<EventRef[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Rate editing
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState<number | null>(null);
  const [savingRate, setSavingRate] = useState(false);

  // Status
  const [advancingStatus, setAdvancingStatus] = useState(false);
  const [showDoneWarning, setShowDoneWarning] = useState(false);
  const [showRevertSheet, setShowRevertSheet] = useState(false);
  const [revertReason, setRevertReason] = useState('');
  const [reverting, setReverting] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Add milestone
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneLabel, setMilestoneLabel] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState<number | null>(null);
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Mark paid
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [paidDate, setPaidDate] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);

  const role = getMockRole();
  const canEdit = role !== 'couple_view' && role !== 'family_view' && role !== 'view_only';

  const fetchData = useCallback(async () => {
    if (!vendorId) return;
    setLoading(true);

    const [vendorRes, eventsRes, milestonesRes] = await Promise.all([
      supabase
        .from('vendor_instances_view')
        .select('id, vendor_name, category, city, phone, confirmation_status, negotiated_rate, deliverables, planner_notes')
        .eq('id', vendorId)
        .is('deleted_at', null)
        .single(),

      supabase
        .from('vendor_instance_events')
        .select('events (id, event_name, event_date)')
        .eq('vendor_instance_id', vendorId),

      supabase
        .from('payment_milestones')
        .select('id, amount, due_date, paid_date, status, description')
        .eq('vendor_instance_id', vendorId)
        .is('deleted_at', null)
        .order('due_date', { ascending: true }),
    ]);

    if (vendorRes.error || !vendorRes.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setVendor(vendorRes.data as VendorData);

    // Supabase returns the FK join as array — flatten and deduplicate
    const linkedEvents = (eventsRes.data ?? [])
      .flatMap((row: { events: EventRef | EventRef[] | null }) => {
        if (!row.events) return [];
        return Array.isArray(row.events) ? row.events : [row.events];
      })
      .filter((e): e is EventRef => e !== null);
    setEvents(linkedEvents);

    setMilestones((milestonesRes.data as Milestone[]) ?? []);
    setLoading(false);
  }, [vendorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSaveRate() {
    if (!vendor || !vendorId) return;
    setSavingRate(true);
    const { error } = await supabase
      .from('vendor_instances')
      .update({ negotiated_rate: rateInput ?? null })
      .eq('id', vendorId);
    setSavingRate(false);
    if (!error) {
      setVendor(prev => prev ? { ...prev, negotiated_rate: rateInput ?? null } : prev);
      setIsEditingRate(false);
    }
  }

  async function handleAdvanceStatus() {
    if (!vendor || !vendorId) return;
    const currentIdx = STATUS_CHAIN.indexOf(vendor.confirmation_status);
    if (currentIdx === -1 || currentIdx >= STATUS_CHAIN.length - 1) return;

    // Block advance to booked if rate is not set
    if (vendor.confirmation_status === 'quoted' && !vendor.negotiated_rate) {
      setStatusError('Enter rate before booking.');
      return;
    }

    // Warn before marking done
    if (vendor.confirmation_status === 'confirmed') {
      setShowDoneWarning(true);
      return;
    }

    setStatusError('');
    setAdvancingStatus(true);
    const nextStatus = STATUS_CHAIN[currentIdx + 1];
    const { error } = await supabase
      .from('vendor_instances')
      .update({ confirmation_status: nextStatus })
      .eq('id', vendorId);
    setAdvancingStatus(false);
    if (!error) {
      setVendor(prev => prev ? { ...prev, confirmation_status: nextStatus } : prev);
    } else {
      setStatusError(error.message);
    }
  }

  async function handleConfirmDone() {
    if (!vendor || !vendorId) return;
    setAdvancingStatus(true);
    const { error } = await supabase
      .from('vendor_instances')
      .update({ confirmation_status: 'done' })
      .eq('id', vendorId);
    setAdvancingStatus(false);
    setShowDoneWarning(false);
    if (!error) {
      setVendor(prev => prev ? { ...prev, confirmation_status: 'done' } : prev);
    }
  }

  async function handleRevert() {
    if (!vendor || !vendorId || !revertReason.trim()) return;
    const currentIdx = STATUS_CHAIN.indexOf(vendor.confirmation_status);
    if (currentIdx <= 0) return;
    const previousStatus = STATUS_CHAIN[currentIdx - 1];

    setReverting(true);
    const { error } = await supabase
      .from('vendor_instances')
      .update({ confirmation_status: previousStatus })
      .eq('id', vendorId);
    setReverting(false);

    if (!error) {
      // TODO Phase 3: Route through Edge Function to write audit_log with reason
      setVendor(prev => prev ? { ...prev, confirmation_status: previousStatus } : prev);
      setShowRevertSheet(false);
      setRevertReason('');
    }
  }

  async function handleAddMilestone() {
    if (!vendorId || !weddingId || !milestoneLabel.trim() || !milestoneAmount || !milestoneDueDate) return;
    setAddingMilestone(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('payment_milestones').insert({
      vendor_instance_id: vendorId,
      wedding_id: weddingId,
      amount: milestoneAmount,
      due_date: milestoneDueDate,
      description: milestoneLabel.trim(),
      status: milestoneDueDate < todayStr ? 'overdue' : 'upcoming',
    });
    setAddingMilestone(false);
    if (!error) {
      setShowAddMilestone(false);
      setMilestoneLabel('');
      setMilestoneAmount(null);
      setMilestoneDueDate('');
      await fetchData();
    }
  }

  async function handleMarkPaid() {
    if (!selectedMilestone || !paidDate) return;
    setMarkingPaid(true);
    const { error } = await supabase
      .from('payment_milestones')
      .update({ status: 'paid', paid_date: paidDate })
      .eq('id', selectedMilestone.id);
    setMarkingPaid(false);
    if (!error) {
      setShowMarkPaid(false);
      setSelectedMilestone(null);
      await fetchData();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 max-w-md mx-auto">
        <p className="text-gray-500">Vendor not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">← Back</Button>
      </div>
    );
  }

  const statusIdx = STATUS_CHAIN.indexOf(vendor.confirmation_status);
  const hasMilestone = milestones.length > 0;
  const rateSet = (vendor.negotiated_rate ?? 0) > 0;
  const isBookedOrHigher = statusIdx >= STATUS_CHAIN.indexOf('booked');
  const isRateMissingError = vendor.confirmation_status === 'quoted' && !rateSet;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-28 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/wedding/${weddingId}/vendors`)}
          className="text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-[28px] font-medium leading-none">{vendor.vendor_name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-100 text-gray-700">
              {vendor.category}
            </span>
            {events.map(ev => (
              <EventChip key={ev.id} eventType={ev.event_name} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* COMPLETENESS CHECKLIST */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <ul className="text-[15px] space-y-2">
            <li className="flex gap-2 items-center">
              <span className={rateSet ? 'text-emerald-600' : 'text-gray-400'}>
                {rateSet ? '✓' : '✗'}
              </span>
              <span className={rateSet ? 'text-gray-900' : 'text-gray-500'}>Rate entered</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className={isBookedOrHigher ? 'text-emerald-600' : 'text-gray-400'}>
                {isBookedOrHigher ? '✓' : '✗'}
              </span>
              <span className={isBookedOrHigher ? 'text-gray-900' : 'text-gray-500'}>Booked or higher status</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className={hasMilestone ? 'text-emerald-600' : 'text-gray-400'}>
                {hasMilestone ? '✓' : '✗'}
              </span>
              <span className={hasMilestone ? 'text-gray-900' : 'text-gray-500'}>At least one milestone</span>
            </li>
            <li className="flex gap-2 items-center">
              <span className={events.length > 0 ? 'text-emerald-600' : 'text-gray-400'}>
                {events.length > 0 ? '✓' : '✗'}
              </span>
              <span className={events.length > 0 ? 'text-gray-900' : 'text-gray-500'}>Event assigned</span>
            </li>
          </ul>
        </div>

        {/* STATUS STEPPER */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
          <div className="mb-4">
            <span className="text-sm text-gray-500 block mb-1">Current status</span>
            <Badge
              variant={vendor.confirmation_status as 'shortlisted' | 'quoted' | 'booked' | 'confirmed' | 'done'}
              className="text-sm px-4 py-1"
            >
              {vendor.confirmation_status.charAt(0).toUpperCase() + vendor.confirmation_status.slice(1)}
            </Badge>
          </div>

          {vendor.confirmation_status !== 'done' && canEdit && (
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                onClick={handleAdvanceStatus}
                disabled={advancingStatus || isRateMissingError}
              >
                {advancingStatus ? 'Saving…' : NEXT_STATUS_LABEL[vendor.confirmation_status] ?? ''}
              </Button>
              {isRateMissingError && (
                <span className="text-sm text-amber-600 font-medium">Enter rate before booking</span>
              )}
              {statusError && (
                <span className="text-sm text-red-600">{statusError}</span>
              )}
              {vendor.confirmation_status !== 'shortlisted' && (
                <Button variant="ghost" className="mt-1" onClick={() => setShowRevertSheet(true)}>
                  Revert status
                </Button>
              )}
            </div>
          )}
        </div>

        {/* RATE */}
        {canEdit && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium">Rate</h2>
              {!isEditingRate && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => { setIsEditingRate(true); setRateInput(vendor.negotiated_rate); }}
                  className="text-vivaah-600 font-medium"
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingRate ? (
              <div className="mt-4 space-y-4">
                <RupeeInput label="Rate" value={rateInput} onChange={setRateInput} autoFocus />
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1" onClick={handleSaveRate} disabled={savingRate}>
                    {savingRate ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => setIsEditingRate(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-[17px] font-medium">{formatDisplayRate(vendor.negotiated_rate)}</p>
            )}
          </div>
        )}

        {/* PAYMENT MILESTONES */}
        {canEdit && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-medium">Payment milestones</h2>
              <Button variant="secondary" size="small" onClick={() => setShowAddMilestone(true)}>+ Add</Button>
            </div>

            {milestones.length === 0 ? (
              <p className="text-[15px] text-gray-500">No milestones added yet.</p>
            ) : (
              <ul className="space-y-3">
                {milestones.map(m => {
                  const isPaid = m.status === 'paid';
                  return (
                    <li key={m.id} className="flex justify-between items-start border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[15px] font-medium text-gray-900">{m.description || 'Payment'}</p>
                        <p className="text-sm text-gray-500">
                          {isPaid
                            ? `Paid ${m.paid_date ? formatDateDDMMYYYY(m.paid_date) : ''}`
                            : `Due: ${formatDateDDMMYYYY(m.due_date)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-medium text-gray-900">{formatDisplayRate(m.amount)}</p>
                        {!isPaid && (
                          <button
                            className="text-xs text-vivaah-600 font-medium mt-0.5 min-h-[44px] min-w-[44px] flex items-center justify-end"
                            onClick={() => {
                              setSelectedMilestone(m);
                              setPaidDate(new Date().toISOString().split('T')[0]);
                              setShowMarkPaid(true);
                            }}
                          >
                            Mark paid
                          </button>
                        )}
                        {isPaid && (
                          <span className="text-xs text-emerald-600 font-medium">Paid ✓</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Add milestone sheet */}
      <BottomSheet
        isOpen={showAddMilestone}
        onClose={() => {
          setShowAddMilestone(false);
          setMilestoneLabel('');
          setMilestoneAmount(null);
          setMilestoneDueDate('');
        }}
        title="Add milestone"
      >
        <div className="space-y-4 mt-2">
          <Input
            label="Label (e.g. Advance, Final payment)"
            value={milestoneLabel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMilestoneLabel(e.target.value)}
            placeholder="Advance payment"
          />
          <RupeeInput label="Amount" value={milestoneAmount} onChange={setMilestoneAmount} />
          <div>
            <label className="text-sm font-normal text-gray-700 block mb-1">Due date</label>
            <input
              type="date"
              value={milestoneDueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMilestoneDueDate(e.target.value)}
              className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600"
            />
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full"
              disabled={!milestoneLabel.trim() || !milestoneAmount || !milestoneDueDate || addingMilestone}
              onClick={handleAddMilestone}
            >
              {addingMilestone ? 'Adding…' : 'Save milestone'}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Mark paid sheet */}
      <BottomSheet isOpen={showMarkPaid} onClose={() => setShowMarkPaid(false)} title="Mark as paid">
        <p className="text-sm text-gray-500 mb-4">
          {selectedMilestone?.description ?? 'Payment'}
        </p>
        <Input
          label="Payment date"
          type="date"
          value={paidDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaidDate(e.target.value)}
        />
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="primary" onClick={handleMarkPaid} disabled={!paidDate || markingPaid} className="w-full">
            {markingPaid ? 'Saving…' : 'Confirm payment'}
          </Button>
          <Button variant="ghost" onClick={() => setShowMarkPaid(false)} className="w-full">Cancel</Button>
        </div>
      </BottomSheet>

      {/* Confirm done sheet */}
      <BottomSheet isOpen={showDoneWarning} onClose={() => setShowDoneWarning(false)}>
        <div className="text-center pt-2">
          <h2 className="text-xl font-medium mb-2">Mark as Done?</h2>
          <p className="text-[15px] text-gray-600 mb-6">
            Marking as Done means all events for this vendor are complete. This cannot be reverted.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={handleConfirmDone} disabled={advancingStatus} className="w-full">
              {advancingStatus ? 'Saving…' : 'Yes, mark as Done'}
            </Button>
            <Button variant="ghost" onClick={() => setShowDoneWarning(false)} className="w-full">Cancel</Button>
          </div>
        </div>
      </BottomSheet>

      {/* Revert status sheet */}
      <BottomSheet isOpen={showRevertSheet} onClose={() => setShowRevertSheet(false)} title="Revert status">
        <p className="text-[15px] text-gray-600 mb-4">
          Revert {vendor.vendor_name} to {STATUS_CHAIN[statusIdx - 1] ?? ''}? Please give a reason.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-vivaah-600 bg-white text-[15px]"
          rows={3}
          placeholder="Reason for reverting…"
          value={revertReason}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRevertReason(e.target.value)}
        />
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="danger"
            disabled={!revertReason.trim() || reverting}
            onClick={handleRevert}
            className="w-full"
          >
            {reverting ? 'Saving…' : 'Confirm revert'}
          </Button>
          <Button variant="ghost" onClick={() => setShowRevertSheet(false)} className="w-full">Cancel</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
