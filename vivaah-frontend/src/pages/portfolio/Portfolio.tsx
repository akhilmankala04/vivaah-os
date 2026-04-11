import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EventChip } from '../../components/ui/EventChip';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';

interface Event {
  id: string;
  event_name: string;
  event_date: string;
}

interface Wedding {
  id: string;
  couple_name_1: string;
  couple_name_2: string | null;
  wedding_date: string;
  health_score: 'good' | 'at_risk' | 'critical';
  health_score_updated_at: string | null;
  status: string;
  events: Event[];
}

interface HealthBreakdown {
  state: string;
  overdue_payments_count: number;
  unconfirmed_vendors_within_30_days: number;
  overdue_tasks_count: number;
  budget_committed_pct: number;
}

// Health dot: colour + text label for colour-blind accessibility (DR-09-2)
function HealthDot({ state }: { state: 'good' | 'at_risk' | 'critical' }) {
  const config = {
    good:     { dot: 'bg-green-500',  label: 'On track', text: 'text-green-700' },
    at_risk:  { dot: 'bg-amber-500',  label: 'At risk',  text: 'text-amber-700' },
    critical: { dot: 'bg-red-500',    label: 'Critical', text: 'text-red-700'   },
  };
  const { dot, label, text } = config[state ?? 'good'];
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${dot}`} aria-hidden="true" />
      <span className={`text-[11px] font-medium uppercase tracking-wide ${text}`}>{label}</span>
    </div>
  );
}

// Breakdown row in health sheet
function BreakdownRow({
  label, count, value, link, onNavigate
}: {
  label: string;
  count: number | null;
  value?: string;
  link: string;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  if (count === 0 && !value) return null;
  return (
    <button
      onClick={() => { onNavigate(); navigate(link); }}
      className="flex items-center justify-between w-full py-2 text-left min-h-[44px]"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm font-medium ${count && count > 0 ? 'text-red-600' : 'text-gray-500'}`}>
        {value ?? count}
      </span>
    </button>
  );
}

// Individual wedding card
function WeddingCard({
  wedding,
  onHealthTap,
  onCardTap
}: {
  wedding: Wedding;
  onHealthTap: () => void;
  onCardTap: () => void;
}) {
  const daysUntil = Math.ceil(
    (new Date(wedding.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const nextEvents = wedding.events
    ?.filter(e => new Date(e.event_date) > new Date())
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 3) ?? [];

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer"
      onClick={onCardTap}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-[17px] font-medium text-gray-900">
            {wedding.couple_name_1}
            {wedding.couple_name_2 ? ` & ${wedding.couple_name_2}` : ''}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatDateDDMMYYYY(wedding.wedding_date)}
            {daysUntil > 0 ? ` · ${daysUntil} days` : ' · Today'}
          </p>
        </div>
        {/* Health dot — tappable, stops card propagation */}
        <button
          onClick={e => { e.stopPropagation(); onHealthTap(); }}
          className="ml-2 min-h-[44px] min-w-[44px] flex items-center justify-end"
          aria-label={`Health: ${wedding.health_score}`}
        >
          <HealthDot state={wedding.health_score} />
        </button>
      </div>

      {nextEvents.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {nextEvents.map(e => (
            <EventChip key={e.id} eventType={e.event_name as never} />
          ))}
        </div>
      )}
    </div>
  );
}

// Empty state per PRD Screen 28
function PortfolioEmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="w-24 h-24 bg-vivaah-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl" aria-hidden="true">💐</span>
      </div>
      <h2 className="text-xl font-medium text-gray-900 mb-3">Your wedding portfolio</h2>
      <p className="text-[15px] text-gray-500 mb-8 max-w-xs">
        Create your first wedding to get started. Every wedding you manage will appear here with a live health score.
      </p>
      <Button variant="primary" onClick={() => navigate('/onboarding')} className="w-full max-w-xs">
        Create wedding
      </Button>
    </div>
  );
}

// Health score breakdown sheet
function HealthBreakdownSheet({
  wedding,
  isOpen,
  onClose
}: {
  wedding: Wedding | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState<HealthBreakdown | null>(null);

  useEffect(() => {
    if (isOpen && wedding) {
      supabase
        .rpc('wedding_health_score', { p_wedding_id: wedding.id })
        .then(({ data }) => setBreakdown(data?.[0] ?? null));
    }
  }, [isOpen, wedding]);

  if (!wedding) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`${wedding.couple_name_1}${wedding.couple_name_2 ? ` & ${wedding.couple_name_2}` : ''}`}>
      <div className="mb-4">
        <HealthDot state={wedding.health_score} />
      </div>

      {!breakdown ? (
        <SkeletonCard />
      ) : (
        <div className="divide-y divide-gray-100">
          <BreakdownRow
            label="Overdue payments"
            count={breakdown.overdue_payments_count}
            link={`/wedding/${wedding.id}/payments`}
            onNavigate={onClose}
          />
          <BreakdownRow
            label="Unconfirmed vendors (30 days)"
            count={breakdown.unconfirmed_vendors_within_30_days}
            link={`/wedding/${wedding.id}/tracker`}
            onNavigate={onClose}
          />
          <BreakdownRow
            label="Overdue tasks"
            count={breakdown.overdue_tasks_count}
            link={`/wedding/${wedding.id}/timeline`}
            onNavigate={onClose}
          />
          <BreakdownRow
            label="Budget committed"
            count={null}
            value={`${breakdown.budget_committed_pct}%`}
            link={`/wedding/${wedding.id}/budget`}
            onNavigate={onClose}
          />
        </div>
      )}

      <Button
        variant="primary"
        onClick={() => { onClose(); navigate(`/wedding/${wedding.id}`); }}
        className="w-full mt-6"
      >
        Open wedding
      </Button>
    </BottomSheet>
  );
}

// Main portfolio page
const HEALTH_ORDER: Record<string, number> = { critical: 0, at_risk: 1, good: 2 };

export default function Portfolio() {
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'urgency' | 'date'>('urgency');
  const [breakdownWedding, setBreakdownWedding] = useState<Wedding | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeddings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('weddings')
        .select(`
          id, couple_name_1, couple_name_2, wedding_date,
          health_score, health_score_updated_at, status,
          events (id, event_name, event_date)
        `)
        .eq('created_by', user.id)
        .eq('mode', 1)
        .eq('status', 'active')
        .is('deleted_at', null);

      setWeddings((data as Wedding[]) ?? []);
      setLoading(false);
    }
    fetchWeddings();
  }, []);

  // Real-time health score subscription (NFR-01-3, FR-S17-06)
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('portfolio-health')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'weddings', filter: `created_by=eq.${userId}` },
        (payload) => {
          setWeddings(prev =>
            prev.map(w => w.id === payload.new.id
              ? { ...w, health_score: payload.new.health_score as Wedding['health_score'] }
              : w
            )
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const sorted = [...weddings].sort((a, b) => {
    if (sortBy === 'urgency') {
      const healthDiff = (HEALTH_ORDER[a.health_score] ?? 2) - (HEALTH_ORDER[b.health_score] ?? 2);
      if (healthDiff !== 0) return healthDiff;
    }
    return new Date(a.wedding_date).getTime() - new Date(b.wedding_date).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-[28px] font-medium">Your weddings</h1>
        {/* Sort toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setSortBy('urgency')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              sortBy === 'urgency' ? 'bg-white text-gray-900' : 'text-gray-500'
            }`}
          >
            By urgency
          </button>
          <button
            onClick={() => setSortBy('date')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              sortBy === 'date' ? 'bg-white text-gray-900' : 'text-gray-500'
            }`}
          >
            By date
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-4 space-y-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {!loading && sorted.length === 0 && <PortfolioEmptyState />}

      {/* Wedding cards — 2 column on desktop, 1 column on mobile (DR-01-4) */}
      {!loading && sorted.length > 0 && (
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-3 pb-24">
          {sorted.map(wedding => (
            <WeddingCard
              key={wedding.id}
              wedding={wedding}
              onHealthTap={() => { setBreakdownWedding(wedding); setShowBreakdown(true); }}
              onCardTap={() => navigate(`/wedding/${wedding.id}`)}
            />
          ))}
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={() => navigate('/onboarding')}
        className="fixed bottom-6 right-4 bg-vivaah-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl border border-vivaah-800"
        aria-label="Add wedding"
      >
        +
      </button>

      {/* Health breakdown sheet */}
      <HealthBreakdownSheet
        wedding={breakdownWedding}
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
      />
    </div>
  );
}
