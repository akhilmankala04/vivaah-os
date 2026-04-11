import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { BottomNav } from '../../components/ui/BottomNav';
import { EventChip } from '../../components/ui/EventChip';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { getMockRole } from '../../lib/mockAuth';

interface EventRef {
  id: string;
  event_name: string;
  event_date: string;
}

interface VendorInstanceEvent {
  events: EventRef | null;
}

interface TrackedVendor {
  id: string;
  vendor_name: string;
  category: string;
  confirmation_status: string;
  updated_at: string;
  vendor_instance_events: VendorInstanceEvent[];
  // Computed client-side
  soonestEvent: EventRef | null;
  daysUntilEvent: number;
  daysSinceUpdate: number;
}

export default function ConfirmationTracker() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = getMockRole();

  const [tracked, setTracked] = useState<TrackedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetchTracked();
  }, [weddingId]);

  async function fetchTracked() {
    if (!weddingId) return;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const cutoffISO = thirtyDaysFromNow.toISOString().split('T')[0];

    const { data: vendors } = await supabase
      .from('vendor_instances_view')
      .select(`
        id, vendor_name, category, confirmation_status, updated_at,
        vendor_instance_events (
          events (id, event_name, event_date)
        )
      `)
      .eq('wedding_id', weddingId)
      .in('confirmation_status', ['shortlisted', 'quoted', 'booked'])
      .is('deleted_at', null);

    if (!vendors) { setLoading(false); return; }

    const now = Date.now();

    const trackedItems = (vendors as unknown as TrackedVendor[])
      .filter(v =>
        v.vendor_instance_events?.some(vie =>
          vie.events && vie.events.event_date <= cutoffISO
        )
      )
      .map(v => {
        const soonestEvent = v.vendor_instance_events
          ?.map(vie => vie.events)
          .filter((e): e is EventRef => e !== null && e.event_date <= cutoffISO)
          .sort((a, b) => a.event_date.localeCompare(b.event_date))[0] ?? null;

        const daysUntilEvent = soonestEvent
          ? Math.ceil((new Date(soonestEvent.event_date).getTime() - now) / (1000 * 60 * 60 * 24))
          : 999;

        const daysSinceUpdate = Math.floor(
          (now - new Date(v.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        return { ...v, soonestEvent, daysUntilEvent, daysSinceUpdate };
      })
      .sort((a, b) => a.daysUntilEvent - b.daysUntilEvent);

    setTracked(trackedItems);
    setLoading(false);
  }

  async function handleMarkConfirmed(vendorId: string) {
    setConfirming(vendorId);
    // Write to base table (not view) for updates
    const { error } = await supabase
      .from('vendor_instances')
      .update({ confirmation_status: 'confirmed' })
      .eq('id', vendorId);

    setConfirming(null);
    if (!error) {
      // Animate out then remove from list
      setAnimatingOut(prev => new Set(prev).add(vendorId));
      setTimeout(() => {
        setTracked(prev => prev.filter(v => v.id !== vendorId));
        setAnimatingOut(prev => {
          const s = new Set(prev);
          s.delete(vendorId);
          return s;
        });
      }, 300);
    }
  }

  function daysColour(days: number): string {
    if (days < 7) return 'text-red-600 font-medium';
    if (days <= 14) return 'text-amber-700 font-medium';
    return 'text-gray-500';
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
      <div className="px-4 pt-6 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center text-sm text-gray-500">
          ←
        </button>
        <div>
          <h1 className="text-[28px] font-medium leading-tight">Vendors needing confirmation</h1>
          <p className="text-sm text-gray-500">Next 30 days</p>
        </div>
      </div>

      {/* Empty state — all confirmed */}
      {tracked.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-green-700 text-xl" aria-hidden="true">✓</span>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">All clear</h2>
          <p className="text-[15px] text-gray-500">
            All vendors with upcoming events are confirmed. We'll let you know if anything changes.
          </p>
        </div>
      )}

      {/* Tracker rows */}
      <div className="px-4 mt-4 space-y-3">
        {tracked.map(vendor => (
          <div
            key={vendor.id}
            className={`bg-white border border-gray-100 rounded-2xl p-4 transition-all duration-300 ${
              animatingOut.has(vendor.id) ? 'opacity-0 h-0 overflow-hidden py-0' : 'opacity-100'
            }`}
          >
            {/* Row top: vendor name + status badge */}
            <div className="flex items-start justify-between mb-1">
              <p className="text-[15px] font-medium text-gray-900">{vendor.vendor_name}</p>
              <Badge variant={
                vendor.confirmation_status === 'booked' ? 'booked' :
                vendor.confirmation_status === 'quoted' ? 'quoted' :
                'shortlisted'
              }>
                {vendor.confirmation_status.charAt(0).toUpperCase() + vendor.confirmation_status.slice(1)}
              </Badge>
            </div>

            {/* Category + event + date */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2 text-sm text-gray-500">
              <span>{vendor.category}</span>
              {vendor.soonestEvent && (
                <>
                  <span>·</span>
                  <EventChip eventType={vendor.soonestEvent.event_name as never} />
                  <span>·</span>
                  <span>{formatDateDDMMYYYY(vendor.soonestEvent.event_date)}</span>
                </>
              )}
            </div>

            {/* Days until event + stalled badge */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {vendor.soonestEvent && (
                  <span className={`text-sm ${daysColour(vendor.daysUntilEvent)}`}>
                    {vendor.daysUntilEvent} day{vendor.daysUntilEvent !== 1 ? 's' : ''} away
                  </span>
                )}
                {vendor.daysSinceUpdate >= 14 && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300">
                    No update in {vendor.daysSinceUpdate} days
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-2 flex-shrink-0">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => handleMarkConfirmed(vendor.id)}
                  disabled={confirming === vendor.id}
                >
                  {confirming === vendor.id ? '…' : 'Confirm'}
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => navigate(`/wedding/${weddingId}/vendors/${vendor.id}`)}
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={role}
        currentPath={location.pathname}
      />
    </div>
  );
}
