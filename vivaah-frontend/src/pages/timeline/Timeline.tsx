import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';
import { BottomNav } from '../../components/ui/BottomNav';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { getMockRole } from '../../lib/mockAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineItem {
  id: string;
  week_offset: number;
  title: string;
  description: string;
  category: 'vendor' | 'budget' | 'event' | 'admin';
  linked_task_id: string | null;
  linked_vendor_category: string | null;
  is_ai_generated: boolean;
}

interface Task {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'complete' | 'overdue';
  due_date: string | null;
}

interface TimelineItemWithTask extends TimelineItem {
  task: Task | null;
}

interface TimelineRecord {
  id: string;
  late_start_flag: boolean;
  late_start_weeks: number;
  generated_at: string | null;
  items: TimelineItem[] | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function weekLabel(weekOffset: number): string {
  if (weekOffset === 0) return 'Wedding week';
  if (weekOffset > 0) return `${weekOffset} week${weekOffset === 1 ? '' : 's'} after`;
  const abs = Math.abs(weekOffset);
  return `${abs} week${abs === 1 ? '' : 's'} to go`;
}

function categoryLabel(category: TimelineItem['category']): string {
  switch (category) {
    case 'vendor': return 'Vendor';
    case 'budget': return 'Budget';
    case 'event': return 'Event';
    case 'admin': return 'Admin';
  }
}

function categoryColour(category: TimelineItem['category']): string {
  switch (category) {
    case 'vendor': return 'bg-vivaah-100 text-vivaah-800';
    case 'budget': return 'bg-emerald-50 text-emerald-700';
    case 'event': return 'bg-blue-50 text-blue-700';
    case 'admin': return 'bg-gray-100 text-gray-600';
  }
}

function isItemOverdue(item: TimelineItemWithTask): boolean {
  if (item.task?.status === 'complete') return false;
  if (item.task?.status === 'overdue') return true;
  if (item.task?.due_date) {
    return new Date(item.task.due_date) < new Date();
  }
  return false;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Timeline() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const location = useLocation();
  const accessLevel = getMockRole();

  const [timeline, setTimeline] = useState<TimelineRecord | null>(null);
  const [items, setItems] = useState<TimelineItemWithTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Show timeline-failed banner if navigated here after a failed generation
  const timelineFailed = (location.state as { timelineFailed?: boolean } | null)?.timelineFailed ?? false;

  useEffect(() => {
    if (!weddingId) return;
    loadTimeline();
  }, [weddingId]);

  async function loadTimeline() {
    setLoading(true);
    const { data: tlData, error } = await supabase
      .from('timelines')
      .select('id, late_start_flag, late_start_weeks, generated_at, items')
      .eq('wedding_id', weddingId)
      .is('deleted_at', null)
      .single();

    if (error || !tlData) {
      setTimeline(null);
      setLoading(false);
      return;
    }

    setTimeline(tlData as TimelineRecord);

    if (!tlData.items || (tlData.items as TimelineItem[]).length === 0) {
      setLoading(false);
      return;
    }

    const rawItems = tlData.items as TimelineItem[];

    // Fetch tasks for all linked_task_ids
    const taskIds = rawItems.filter(i => i.linked_task_id).map(i => i.linked_task_id as string);
    let taskMap: Record<string, Task> = {};

    if (taskIds.length > 0) {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('id, title, status, due_date')
        .in('id', taskIds)
        .is('deleted_at', null);

      taskMap = Object.fromEntries((taskData ?? []).map(t => [t.id, t as Task]));
    }

    const merged: TimelineItemWithTask[] = rawItems.map(item => ({
      ...item,
      task: item.linked_task_id ? (taskMap[item.linked_task_id] ?? null) : null,
    }));

    setItems(merged);
    setLoading(false);
  }

  async function handleGenerate() {
    if (!weddingId) return;
    setIsGenerating(true);
    setGenerationError('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-timeline', {
        body: { wedding_id: weddingId },
      });
      // supabase.functions.invoke puts the parsed response body in error.context on non-2xx
      const bodyError = (error as { context?: { error?: string } } | null)?.context?.error;
      if (error || !data?.success) {
        setGenerationError(bodyError ?? data?.error ?? error?.message ?? 'Generation failed. Please try again.');
        console.error('Timeline generation detail:', bodyError ?? data?.error ?? error?.message);
      } else {
        await loadTimeline();
      }
    } catch (err) {
      setGenerationError('Generation failed. Please try again.');
      console.error('Timeline generation exception:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleMarkComplete(item: TimelineItemWithTask) {
    if (!item.linked_task_id) return;
    if (item.task?.status === 'complete') return;

    setCompletingId(item.id);
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'complete' })
      .eq('id', item.linked_task_id);

    if (!error) {
      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, task: i.task ? { ...i.task, status: 'complete' } : null }
            : i
        )
      );
    }
    setCompletingId(null);
  }

  // ─── Group items by week ───────────────────────────────────────────────────

  const overdueItems = items.filter(i => isItemOverdue(i));
  const nonOverdueItems = items.filter(i => !isItemOverdue(i));

  const weekGroups: Map<number, TimelineItemWithTask[]> = new Map();
  for (const item of nonOverdueItems) {
    const existing = weekGroups.get(item.week_offset) ?? [];
    weekGroups.set(item.week_offset, [...existing, item]);
  }
  // Sort weeks from furthest out (most negative) to soonest (0)
  const sortedWeeks = Array.from(weekGroups.entries()).sort((a, b) => a[0] - b[0]);

  const hasItems = items.length > 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium">Planning timeline</h1>
          {/* Phase 3 placeholder — regenerate */}
          <button
            disabled
            className="text-sm text-gray-400 cursor-not-allowed"
            title="Regenerate timeline — Phase 3"
          >
            Regenerate
          </button>
        </div>
        {timeline?.late_start_flag && timeline.late_start_weeks > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <p className="text-sm text-amber-800">
              Your wedding is {timeline.late_start_weeks} week{timeline.late_start_weeks === 1 ? '' : 's'} away. We've prioritised the most time-sensitive tasks first.
            </p>
          </div>
        )}
      </div>

      {/* Timeline failed banner */}
      {timelineFailed && !hasItems && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-[15px] text-amber-800 font-medium mb-1">Timeline generation failed</p>
          <p className="text-sm text-amber-700 mb-3">
            We couldn't generate your planning timeline right now. Your wedding has been set up successfully.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-9 px-4 rounded-lg text-sm font-medium bg-vivaah-600 text-white disabled:opacity-50"
          >
            {isGenerating ? 'Generating…' : 'Generate timeline'}
          </button>
          {generationError && (
            <p className="text-sm text-danger mt-2">{generationError}</p>
          )}
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Generating state */}
        {!loading && !hasItems && isGenerating && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-vivaah-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[15px] font-medium text-gray-800">Generating your timeline…</p>
            <p className="text-sm text-gray-500 mt-1">This takes about 30 seconds</p>
          </div>
        )}

        {/* Empty state — no timeline yet, not generating */}
        {!loading && !hasItems && !isGenerating && !timelineFailed && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
            <p className="text-[15px] font-medium text-gray-800 mb-1">No timeline yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Generate a personalised planning timeline for this wedding.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-11 px-5 rounded-xl text-sm font-medium bg-vivaah-600 text-white min-h-[44px] min-w-[44px] disabled:opacity-50"
            >
              {isGenerating ? 'Generating…' : 'Generate timeline'}
            </button>
            {generationError && (
              <p className="text-sm text-danger mt-2">{generationError}</p>
            )}
          </div>
        )}

        {/* Overdue section */}
        {!loading && overdueItems.length > 0 && (
          <div>
            <span className="text-xs font-medium text-danger uppercase tracking-widest">Overdue</span>
            <div className="mt-2 space-y-2">
              {overdueItems.map(item => (
                <TaskRow
                  key={item.id}
                  item={item}
                  isOverdue
                  isCompleting={completingId === item.id}
                  onComplete={() => handleMarkComplete(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Week groups */}
        {!loading && sortedWeeks.map(([weekOffset, weekItems]) => (
          <div key={weekOffset}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              {weekLabel(weekOffset)}
            </span>
            <div className="mt-2 space-y-2">
              {weekItems.map(item => (
                <TaskRow
                  key={item.id}
                  item={item}
                  isOverdue={false}
                  isCompleting={completingId === item.id}
                  onComplete={() => handleMarkComplete(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={accessLevel}
        currentPath={location.pathname}
      />
    </div>
  );
}

// ─── Task row sub-component ───────────────────────────────────────────────────

interface TaskRowProps {
  item: TimelineItemWithTask;
  isOverdue: boolean;
  isCompleting: boolean;
  onComplete: () => void;
}

function TaskRow({ item, isOverdue, isCompleting, onComplete }: TaskRowProps) {
  const isComplete = item.task?.status === 'complete';
  const dueDate = item.task?.due_date;

  return (
    <div className={`bg-white border rounded-2xl p-4 flex gap-3 items-start ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onComplete}
        disabled={isComplete || isCompleting || !item.linked_task_id}
        className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors min-w-[20px] min-h-[20px] ${
          isComplete
            ? 'bg-success border-success'
            : isOverdue
            ? 'border-red-400 hover:border-red-600'
            : 'border-gray-300 hover:border-vivaah-600'
        } disabled:cursor-not-allowed`}
        aria-label={isComplete ? 'Task complete' : 'Mark complete'}
      >
        {isComplete && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
            <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {isCompleting && (
          <div className="w-3 h-3 border border-gray-300 border-t-vivaah-600 rounded-full animate-spin" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[15px] font-medium leading-snug ${
            isComplete ? 'line-through text-gray-400' : isOverdue ? 'text-red-900' : 'text-gray-900'
          }`}>
            {item.title}
          </p>
          <span className={`text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColour(item.category)}`}>
            {categoryLabel(item.category)}
          </span>
        </div>

        {item.description && !isComplete && (
          <p className="text-sm text-gray-500 mt-0.5 leading-snug">{item.description}</p>
        )}

        {dueDate && (
          <p className={`text-sm mt-1 ${isOverdue ? 'text-red-700 font-medium' : 'text-gray-400'}`}>
            {isOverdue ? 'Was due ' : 'Due '}{formatDateDDMMYYYY(dueDate)}
          </p>
        )}
      </div>
    </div>
  );
}
