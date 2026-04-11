import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { BottomNav } from '../../components/ui/BottomNav';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { getMockRole } from '../../lib/mockAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BriefingItem {
  type: string;
  label: string;
  detail: string;
  days_outstanding?: number;
  flagged_last_week?: boolean;
  days_stalled?: number;
  due_date?: string | null;
}

interface BudgetSection {
  planned_paise: number;
  committed_paise: number;
  paid_paise: number;
  summary: string;
}

interface Briefing {
  id: string;
  generated_at: string;
  overdue_section: BriefingItem[] | null;
  at_risk_section: BriefingItem[] | null;
  upcoming_section: BriefingItem[] | null;
  budget_section: BudgetSection | null;
  is_all_clear: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(2)} crore`;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(2)} lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

function formatGeneratedAt(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Section components ───────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  items: BriefingItem[];
  variant: 'overdue' | 'at_risk' | 'upcoming';
}

function BriefingSection({ title, items, variant }: SectionProps) {
  if (items.length === 0) return null;

  const labelColour =
    variant === 'overdue' ? 'text-red-600' :
    variant === 'at_risk' ? 'text-amber-600' :
    'text-gray-500';

  const cardBorder =
    variant === 'overdue' ? 'border-red-200 bg-red-50' :
    variant === 'at_risk' ? 'border-amber-200 bg-amber-50' :
    'border-gray-100 bg-white';

  return (
    <div>
      <span className={`text-xs font-medium uppercase tracking-widest ${labelColour}`}>{title}</span>
      <div className="mt-2 space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className={`border rounded-2xl p-4 ${cardBorder}`}>
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[15px] font-medium leading-snug ${
                variant === 'overdue' ? 'text-red-900' :
                variant === 'at_risk' ? 'text-amber-900' :
                'text-gray-900'
              }`}>
                {item.label}
              </p>
              {item.flagged_last_week && (
                <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full flex-shrink-0 bg-red-100 text-red-700">
                  Last week
                </span>
              )}
            </div>

            {item.detail && (
              <p className={`text-sm mt-0.5 leading-snug ${
                variant === 'overdue' ? 'text-red-700' :
                variant === 'at_risk' ? 'text-amber-700' :
                'text-gray-500'
              }`}>
                {item.detail}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {typeof item.days_outstanding === 'number' && (
                <span className="text-sm text-red-700 font-medium">
                  {item.days_outstanding} day{item.days_outstanding === 1 ? '' : 's'} overdue
                </span>
              )}
              {typeof item.days_stalled === 'number' && item.days_stalled > 0 && (
                <span className="text-sm text-amber-700 font-medium">
                  {item.days_stalled} day{item.days_stalled === 1 ? '' : 's'} stalled
                </span>
              )}
              {item.due_date && (
                <span className="text-sm text-gray-400">
                  Due {formatDateDDMMYYYY(item.due_date.split('T')[0])}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Budget card ──────────────────────────────────────────────────────────────

function BudgetCard({ budget }: { budget: BudgetSection }) {
  const committedPct = budget.planned_paise > 0
    ? Math.round((budget.committed_paise / budget.planned_paise) * 100)
    : 0;
  const paidPct = budget.planned_paise > 0
    ? Math.round((budget.paid_paise / budget.planned_paise) * 100)
    : 0;

  const barColour = committedPct >= 100 ? 'bg-red-500' : committedPct >= 85 ? 'bg-amber-400' : 'bg-vivaah-600';

  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-widest text-gray-500">Budget health</span>
      <div className="mt-2 bg-white border border-gray-100 rounded-2xl p-4">
        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all ${barColour}`}
            style={{ width: `${Math.min(committedPct, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-400">Planned</p>
            <p className="text-[15px] font-medium text-gray-900">{formatRupees(budget.planned_paise)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-400">Committed</p>
            <p className={`text-[15px] font-medium ${committedPct >= 100 ? 'text-red-600' : committedPct >= 85 ? 'text-amber-600' : 'text-gray-900'}`}>
              {formatRupees(budget.committed_paise)}
            </p>
            <p className="text-xs text-gray-400">{committedPct}%</p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-wide uppercase text-gray-400">Paid</p>
            <p className="text-[15px] font-medium text-emerald-600">{formatRupees(budget.paid_paise)}</p>
            <p className="text-xs text-gray-400">{paidPct}%</p>
          </div>
        </div>

        {budget.summary && (
          <p className="text-sm text-gray-600 leading-snug">{budget.summary}</p>
        )}
      </div>
    </div>
  );
}

// ─── All-clear card ───────────────────────────────────────────────────────────

function AllClearCard({ upcoming }: { upcoming: BriefingItem[] }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
      <p className="text-[15px] font-medium text-emerald-800 mb-1">All clear</p>
      <p className="text-sm text-emerald-700 mb-3">
        No overdue or at-risk items this week. Your wedding is on track.
      </p>
      {upcoming.length > 0 && (
        <>
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-2">Coming up</p>
          <div className="space-y-2">
            {upcoming.map((item, idx) => (
              <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-3">
                <p className="text-[15px] font-medium text-gray-900">{item.label}</p>
                {item.detail && <p className="text-sm text-gray-500 mt-0.5">{item.detail}</p>}
                {item.due_date && (
                  <p className="text-sm text-gray-400 mt-1">Due {formatDateDDMMYYYY(item.due_date.split('T')[0])}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Briefing detail view ─────────────────────────────────────────────────────

function BriefingDetail({ briefing, onBack }: { briefing: Briefing; onBack: () => void }) {
  const overdue = briefing.overdue_section ?? [];
  const atRisk = briefing.at_risk_section ?? [];
  const upcoming = briefing.upcoming_section ?? [];
  const budget = briefing.budget_section;

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 min-h-[44px] min-w-[44px] -ml-1 px-1"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All briefings
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
        <p className="text-[15px] font-medium text-gray-900">
          Briefing — {formatGeneratedAt(briefing.generated_at)}
        </p>
      </div>

      {briefing.is_all_clear ? (
        <AllClearCard upcoming={upcoming} />
      ) : (
        <>
          <BriefingSection title="Overdue" items={overdue} variant="overdue" />
          <BriefingSection title="At risk" items={atRisk} variant="at_risk" />
          <BriefingSection title="Upcoming decisions" items={upcoming} variant="upcoming" />
        </>
      )}

      {budget && <BudgetCard budget={budget} />}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WeeklyBriefing() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const location = useLocation();
  const accessLevel = getMockRole();

  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  useEffect(() => {
    if (!weddingId) return;
    loadBriefings();
  }, [weddingId]);

  async function loadBriefings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('briefings')
      .select('id, generated_at, overdue_section, at_risk_section, upcoming_section, budget_section, is_all_clear')
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .order('generated_at', { ascending: false });

    if (!error && data) {
      setBriefings(data as Briefing[]);
      // Auto-select the most recent briefing
      if (data.length > 0 && !selectedBriefing) {
        setSelectedBriefing(data[0] as Briefing);
      }
    }
    setLoading(false);
  }

  async function handleGenerate() {
    if (!weddingId) return;
    setIsGenerating(true);
    setGenerationError('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-briefing', {
        body: { wedding_id: weddingId },
      });
      const bodyError = (error as { context?: { error?: string } } | null)?.context?.error;
      if (error || !data?.success) {
        setGenerationError(bodyError ?? data?.error ?? error?.message ?? 'Generation failed. Please try again.');
      } else {
        await loadBriefings();
      }
    } catch (err) {
      setGenerationError('Generation failed. Please try again.');
      console.error('Briefing generation exception:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">Briefings</h1>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-9 px-3.5 rounded-lg text-sm font-medium bg-vivaah-600 text-white disabled:opacity-50 min-h-[44px] min-w-[44px]"
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Generating spinner */}
        {!loading && isGenerating && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-vivaah-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[15px] font-medium text-gray-800">Generating your briefing…</p>
            <p className="text-sm text-gray-500 mt-1">This takes about 20 seconds</p>
          </div>
        )}

        {/* Generation error */}
        {generationError && !isGenerating && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-sm text-red-700">{generationError}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !isGenerating && briefings.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <p className="text-[15px] font-medium text-gray-800 mb-1">No briefings yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Generate a briefing to get a weekly overview of what needs attention for this wedding.
            </p>
            {/* Generate button is in header */}
          </div>
        )}

        {/* Briefing detail — shown when a briefing is selected */}
        {!loading && !isGenerating && selectedBriefing && (
          <BriefingDetail
            briefing={selectedBriefing}
            onBack={briefings.length > 1 ? () => setSelectedBriefing(null) : () => {}}
          />
        )}

        {/* Briefing history list — shown when no briefing selected and multiple exist */}
        {!loading && !isGenerating && !selectedBriefing && briefings.length > 0 && (
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-gray-500">History</span>
            <div className="mt-2 space-y-2">
              {briefings.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBriefing(b)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between min-h-[44px] text-left"
                >
                  <div>
                    <p className="text-[15px] font-medium text-gray-900">
                      {formatGeneratedAt(b.generated_at)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {b.is_all_clear
                        ? 'All clear'
                        : `${(b.overdue_section ?? []).length} overdue · ${(b.at_risk_section ?? []).length} at risk`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.is_all_clear && (
                      <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Clear
                      </span>
                    )}
                    {!b.is_all_clear && (b.overdue_section ?? []).length > 0 && (
                      <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Action needed
                      </span>
                    )}
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Latest briefing with "view all" — when a briefing is selected and more exist */}
        {!loading && !isGenerating && selectedBriefing && briefings.length > 1 && (
          <div className="pt-2">
            <button
              onClick={() => setSelectedBriefing(null)}
              className="text-sm text-vivaah-600 font-medium min-h-[44px] min-w-[44px]"
            >
              View all {briefings.length} briefings
            </button>
          </div>
        )}
      </div>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={accessLevel}
        currentPath={location.pathname}
      />
    </div>
  );
}
