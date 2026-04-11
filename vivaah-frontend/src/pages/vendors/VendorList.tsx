import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AddVendorSheet, VendorInstance } from '../../components/vendors/AddVendorSheet';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { BottomNav } from '../../components/ui/BottomNav';
import { getMockRole } from '../../lib/mockAuth';
import { useOffline } from '../../lib/useOffline';

interface VendorRow {
  id: string;
  vendor_name: string;
  category: string;
  confirmation_status: string;
  negotiated_rate: number | null;
  // From nested payment_milestones select (upcoming/due only, ordered by due_date)
  payment_milestones: {
    id: string;
    amount: number;
    due_date: string;
    status: string;
  }[];
}

interface VendorCard {
  id: string;
  name: string;
  category: string;
  status: string;         // display string, capitalised
  statusKey: string;      // raw DB value for badge variant
  rate: number;
  nextPayment: number;
  nextDate: string;
  remaining: number;
  isOverdue: boolean;
  isMissingParams: boolean;
}

function formatLakhs(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `${(rupees / 10000000).toFixed(2)} crore`;
  if (rupees >= 100000) return `${(rupees / 100000).toFixed(2)} lakh`;
  return rupees.toLocaleString('en-IN');
}

function rowToCard(v: VendorRow): VendorCard {
  const upcomingMilestones = v.payment_milestones
    .filter(m => m.status !== 'paid')
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const paidTotal = v.payment_milestones
    .filter(m => m.status === 'paid')
    .reduce((s, m) => s + m.amount, 0);

  const next = upcomingMilestones[0] ?? null;
  const nextPayment = next?.amount ?? 0;
  const nextDate = next
    ? new Date(next.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : '';
  const rate = v.negotiated_rate ?? 0;
  const remaining = rate > 0 ? rate - paidTotal : 0;
  const isOverdue = upcomingMilestones.some(m => m.status === 'overdue');

  return {
    id: v.id,
    name: v.vendor_name,
    category: v.category,
    status: v.confirmation_status.charAt(0).toUpperCase() + v.confirmation_status.slice(1),
    statusKey: v.confirmation_status,
    rate,
    nextPayment,
    nextDate,
    remaining,
    isOverdue,
    isMissingParams: !v.negotiated_rate || v.confirmation_status === 'shortlisted',
  };
}

// Couple-view card: name, category only — no rates
function VendorCardCoupleView({ vendor }: { vendor: VendorCard }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-medium">{vendor.name}</h3>
        <Badge variant="confirmed">Confirmed</Badge>
      </div>
      <div className="border-t border-gray-100 my-3" />
      <p className="text-sm text-gray-500">{vendor.category}</p>
    </div>
  );
}

export default function VendorList() {
  const navigate = useNavigate();
  const { weddingId } = useParams<{ weddingId: string }>();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const isOffline = useOffline();
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState<VendorCard[]>([]);

  const location = useLocation();
  const currentRole = getMockRole();
  const isCoupleOrFamilyView = currentRole === 'couple_view' || currentRole === 'family_view';

  const fetchVendors = useCallback(async () => {
    if (!weddingId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('vendor_instances_view')
      .select(`
        id, vendor_name, category, confirmation_status, negotiated_rate,
        payment_milestones!vendor_instance_id (
          id, amount, due_date, status
        )
      `)
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setVendors((data as unknown as VendorRow[]).map(rowToCard));
    }
    setIsLoading(false);
  }, [weddingId]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filter by access level
  const visibleVendors = isCoupleOrFamilyView
    ? vendors.filter(v => v.statusKey === 'confirmed' || v.statusKey === 'done')
    : vendors;

  const handleVendorSaved = (_instance: VendorInstance) => {
    setShowAddSheet(false);
    // Re-fetch to get accurate data from DB (milestones, etc.)
    fetchVendors();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-20 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-medium leading-tight">Vendors</h1>
        {!isCoupleOrFamilyView && (
          <div className="relative group">
            <Button variant="secondary" size="small" onClick={() => setShowAddSheet(true)} disabled={isOffline}>
              Add vendor
            </Button>
            {isOffline && (
              <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Reconnect to make changes
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleVendors.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center mt-10">
          <div className="w-12 h-12 bg-vivaah-50 rounded-full flex items-center justify-center mx-auto mb-4 text-vivaah-600 font-medium text-xl">V</div>
          <h2 className="text-xl font-medium mb-2">No vendors added yet</h2>
          <p className="text-[15px] text-gray-500 mb-6 leading-relaxed">
            {isCoupleOrFamilyView
              ? 'Your planner will share confirmed vendors here.'
              : 'Add your first vendor to start tracking payments and confirmations.'}
          </p>
          {!isCoupleOrFamilyView && (
            <div className="relative group inline-block">
              <Button variant="primary" onClick={() => setShowAddSheet(true)} disabled={isOffline}>Add vendor</Button>
              {isOffline && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Reconnect to make changes
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleVendors.map(v => {
            if (isCoupleOrFamilyView) {
              return <VendorCardCoupleView key={v.id} vendor={v} />;
            }

            const remainingRatio = v.rate > 0 ? (v.remaining / v.rate) : 0;
            const hasHighRemaining = remainingRatio > 0.5;

            return (
              <div
                key={v.id}
                className={`bg-white border rounded-2xl p-4 cursor-pointer hover:bg-gray-50 focus-visible:outline-none ${
                  v.isMissingParams
                    ? 'border-gray-100 border-l-4 border-l-amber-400'
                    : 'border-gray-100'
                }`}
                onClick={() => navigate(`/wedding/${weddingId}/vendors/${v.id}`)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-[17px] font-medium text-gray-900">{v.name}</h3>
                  <Badge variant={v.statusKey as 'shortlisted' | 'quoted' | 'booked' | 'confirmed' | 'done'}>
                    {v.status}
                  </Badge>
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="grid grid-cols-1 gap-2 text-[15px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-medium text-gray-900">
                      {v.rate > 0 ? `₹${formatLakhs(v.rate)}` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next payment</span>
                    <span className="font-medium text-gray-900">
                      {v.nextPayment > 0 ? `₹${formatLakhs(v.nextPayment)} on ${v.nextDate}` : 'No milestones'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remaining</span>
                    <span className={`font-medium ${v.isOverdue ? 'text-red-600' : hasHighRemaining ? 'text-amber-600' : 'text-gray-900'}`}>
                      {v.remaining > 0 ? `₹${formatLakhs(v.remaining)}` : v.rate > 0 ? '₹0' : '--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isCoupleOrFamilyView && (
        <AddVendorSheet
          isOpen={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          onSaved={handleVendorSaved}
          weddingId={weddingId}
        />
      )}

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={currentRole}
        currentPath={location.pathname}
      />
    </div>
  );
}
