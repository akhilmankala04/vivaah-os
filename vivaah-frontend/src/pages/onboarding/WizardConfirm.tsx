import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EventChip } from '../../components/ui/EventChip';
import { supabase } from '../../lib/supabase';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';

export default function WizardConfirm() {
  const navigate = useNavigate();
  const context = useOnboarding();
  const {
    mode, partner1, partner2, weddingDate, muhuratFlag, city, isDestination,
    detailsSkipped, events, eventsSkipped, budget, budgetSkipped, participants,
    lateStartFlag, lateStartWeeks,
  } = context;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter out empty rows from participants and count valid ones
  const validParticipants = participants.filter(p => p.name.trim() !== '' && p.phone.trim() !== '');
  const validParticipantsCount = validParticipants.length;

  const handleCreate = async () => {
    setIsSubmitting(true);
    setHasError(false);
    setErrorMessage('');
    setStep1Done(false);
    setStep2Done(false);

    try {
      // ─── Step 1: Insert wedding record ────────────────────────────────────
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data: weddingData, error: weddingError } = await supabase
        .from('weddings')
        .insert({
          mode: mode ?? 2,
          couple_name_1: partner1,
          couple_name_2: partner2 || null,
          wedding_date: weddingDate || null,
          planning_start_date: new Date().toISOString().split('T')[0],
          destination_flag: isDestination,
          city: city,
          total_planned_budget: budget ?? 0,
          muhurat_flag: muhuratFlag,
          late_start_flag: lateStartFlag,
          late_start_weeks: lateStartFlag ? lateStartWeeks : 0,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (weddingError || !weddingData) {
        throw new Error(weddingError?.message ?? 'Failed to create wedding');
      }

      const weddingId: string = weddingData.id;

      // ─── Step 1b: Insert head planner participant FIRST ───────────────────
      // Must come before events/budget_ledger so has_role_or_access() works
      // for any subsequent RLS checks on this wedding.
      const headPlannerRole = mode === 1 ? 'planner' : 'head_planner';
      // Mode 1 planners get planner_full; Mode 2 head planners get full
      const headPlannerAccessLevel = mode === 1 ? 'planner_full' : 'full';
      const { data: headParticipant } = await supabase
        .from('participants')
        .insert({
          user_id: user.id,
          wedding_id: weddingId,
          name: partner1 || 'Planner',
          phone: '',
          role: headPlannerRole,
          access_level: headPlannerAccessLevel,
          invite_status: 'accepted',
          status: 'active',
        })
        .select()
        .single();

      // Insert budget_ledger record
      await supabase.from('budget_ledger').insert({
        wedding_id: weddingId,
        total_planned_budget: budget ?? 0,
      });

      // Insert events — only events that have a date set (event_date is NOT NULL in schema)
      const selectedEvents = events.filter(e => e.isSelected && e.date.trim() !== '');
      if (selectedEvents.length > 0) {
        await supabase.from('events').insert(
          selectedEvents.map(e => ({
            wedding_id: weddingId,
            event_name: e.type === 'custom' ? e.name : e.type,
            event_date: e.date,
            status: 'planned',
            is_custom: e.type === 'custom',
          }))
        );
      }

      // Insert timeline placeholder record (UNIQUE per wedding — upsert on conflict)
      await supabase.from('timelines').upsert({
        wedding_id: weddingId,
        late_start_flag: lateStartFlag,
        late_start_weeks: lateStartFlag ? lateStartWeeks : 0,
        items: null,
      }, { onConflict: 'wedding_id' });

      setStep1Done(true);

      // ─── Step 2: Insert remaining participants + messages_queue ───────────

      const headParticipantId = headParticipant?.id ?? null;

      const coupleNames = [partner1, partner2].filter(Boolean).join(' & ');
      const weddingDisplayDate = weddingDate ? formatDateDDMMYYYY(weddingDate) : 'TBD';

      if (validParticipants.length > 0) {
        // Insert participant records
        for (const p of validParticipants) {
          const roleMap: Record<string, string> = {
            couple_view: 'couple',
            family_view: 'family',
          };
          const participantRole = mode === 1
            ? (roleMap[p.accessLevel] ?? 'custom')
            : 'custom';

          await supabase.from('participants').insert({
            wedding_id: weddingId,
            name: p.name,
            phone: p.phone,
            role: participantRole,
            access_level: p.accessLevel,
            invite_status: 'pending',
            status: 'active',
            invited_by: headParticipantId,
          });

          // Queue WhatsApp invite message
          await supabase.from('messages_queue').insert({
            recipient_phone: p.phone,
            message_type: 'participant_invite',
            payload: {
              participantName: p.name,
              weddingName: `${coupleNames}'s Wedding`,
              coupleNames,
              weddingDate: weddingDisplayDate,
            },
            status: 'pending',
            retry_count: 0,
          });
        }
      }

      setStep2Done(true);

      // ─── Step 3: Generate AI timeline ─────────────────────────────────────
      let timelineFailed = false;
      try {
        const { data, error } = await supabase.functions.invoke('generate-ai-timeline', {
          body: { wedding_id: weddingId },
        });
        if (error || !data?.success) {
          console.error('Timeline generation failed:', data?.error ?? error?.message);
          timelineFailed = true;
        } else {
          setStep3Done(true);
        }
      } catch (err) {
        console.error('Timeline generation error:', err);
        timelineFailed = true;
      }

      // Brief pause so user sees step 3 status before navigating
      await new Promise(resolve => setTimeout(resolve, 800));

      if (mode === 1) {
        navigate('/portfolio', { state: timelineFailed ? { timelineFailed: true } : undefined });
      } else {
        navigate(`/wedding/${weddingId}`, { state: timelineFailed ? { timelineFailed: true } : undefined });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
      setHasError(true);
      setIsSubmitting(false);
    }
  };

  const formatRupees = (paise: number) => {
    const rupees = paise / 100;
    if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2)} crore`;
    if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2)} lakh`;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const getParticipantLabel = (level: string) => {
    switch (level) {
      case 'couple_view': return 'Couple';
      case 'family_view': return 'Family';
      case 'full': return 'Full access';
      case 'budget': return 'Budget';
      case 'task': return 'Tasks';
      case 'event_specific': return 'Events';
      case 'view_only': return 'View only';
      case 'guest': return 'Schedule only';
      default: return level;
    }
  };

  // Screen 7a: Transitional state (submitting)
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 max-w-md mx-auto relative">
        <div className="mt-12 mb-8">
          <h1 className="text-[28px] font-medium leading-tight text-center">
            {partner1} {partner2 && `& ${partner2}`}
          </h1>
          <p className="text-center text-gray-500 mt-2">
            {weddingDate ? formatDateDDMMYYYY(weddingDate) : 'Date TBD'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Wedding created */}
          <div className="flex items-center gap-3">
            {step1Done ? (
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs">✓</div>
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-vivaah-600 rounded-full animate-spin" />
            )}
            <span className={`text-[17px] font-medium ${step1Done ? 'text-gray-800' : 'text-gray-400'}`}>
              Wedding created ✓
            </span>
          </div>

          {/* Step 2: Invites sent */}
          <div className="flex items-center gap-3">
            {step2Done ? (
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs">✓</div>
            ) : step1Done ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-vivaah-600 rounded-full animate-spin" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200" />
            )}
            <span className={`text-[17px] font-medium ${step1Done ? 'text-gray-800' : 'text-gray-400'}`}>
              {validParticipantsCount > 0
                ? `Invites sent to ${validParticipantsCount} participants ✓`
                : 'No participants to invite'}
            </span>
          </div>

          {/* Step 3: Timeline generation */}
          <div className="flex items-center gap-3">
            {step3Done ? (
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs">✓</div>
            ) : step2Done ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-vivaah-600 rounded-full animate-spin" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200" />
            )}
            <span className={`text-[17px] font-medium ${step2Done ? 'text-gray-800' : 'text-gray-400'}`}>
              {step3Done ? 'Planning timeline ready ✓' : 'Generating your planning timeline…'}
            </span>
          </div>
        </div>

        <div className="mt-auto pb-8 text-center space-y-4">
          <p className="text-sm text-gray-500">This takes about 30 seconds</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 max-w-md mx-auto items-center justify-center">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center w-full">
          <p className="text-[17px] font-medium text-gray-900 mb-2">Something went wrong.</p>
          <p className="text-[15px] text-gray-500 mb-6">{errorMessage || 'Please try again.'}</p>
          <Button variant="primary" className="w-full" onClick={handleCreate}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Screen 7: Summary View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-28 max-w-md mx-auto relative">
      <h1 className="text-[28px] font-medium leading-tight mb-6">Review and confirm</h1>

      <div className="space-y-4 flex-1 overflow-y-auto hide-scrollbar">
        {/* DETAILS SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-medium">Wedding details</h2>
            <Button variant="ghost" size="small" onClick={() => navigate('/onboarding/details')} className="text-vivaah-600 font-medium">Edit</Button>
          </div>
          {detailsSkipped ? (
            <Badge className="bg-warning/20 text-warning border border-warning/50">Complete later</Badge>
          ) : (
            <div className="space-y-2 text-[15px]">
              <p><span className="text-gray-500">Couple:</span> {partner1} {partner2 && `& ${partner2}`}</p>
              <p className="flex items-center gap-2">
                <span className="text-gray-500">Date:</span> {weddingDate ? formatDateDDMMYYYY(weddingDate) : 'TBD'}
                {muhuratFlag && <Badge variant="done">Muhurat</Badge>}
              </p>
              <p><span className="text-gray-500">City:</span> {city} {isDestination && '(Destination)'}</p>
            </div>
          )}
        </div>

        {/* EVENTS SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-medium">Events</h2>
            <Button variant="ghost" size="small" onClick={() => navigate('/onboarding/events')} className="text-vivaah-600 font-medium">Edit</Button>
          </div>
          {eventsSkipped ? (
            <Badge className="bg-warning/20 text-warning border border-warning/50">Complete later</Badge>
          ) : (
            <div className="flex flex-wrap gap-2">
              {events.filter(e => e.isSelected).map(e => (
                <div key={e.id} className="flex items-center gap-2 mb-1 w-full">
                  <EventChip eventType={e.type} label={e.name} />
                  <span className="text-sm text-gray-500">
                    {e.date ? formatDateDDMMYYYY(e.date) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BUDGET SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-medium">Budget</h2>
            <Button variant="ghost" size="small" onClick={() => navigate('/onboarding/budget')} className="text-vivaah-600 font-medium">Edit</Button>
          </div>
          {budgetSkipped || budget === null ? (
            <Badge className="bg-warning/20 text-warning border border-warning/50">Complete later</Badge>
          ) : (
            <p className="text-[17px] font-medium">{formatRupees(budget)}</p>
          )}
        </div>

        {/* PARTICIPANTS SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-medium">Participants</h2>
            <Button variant="ghost" size="small" onClick={() => navigate('/onboarding/participants')} className="text-vivaah-600 font-medium">Edit</Button>
          </div>
          {validParticipantsCount === 0 ? (
            <p className="text-sm text-gray-500">None added</p>
          ) : (
            <div className="space-y-2">
              {participants.filter(p => p.name.trim() !== '').map(p => (
                <div key={p.id} className="flex justify-between items-center text-[15px]">
                  <span>{p.name}</span>
                  <span className="text-gray-500 text-sm">{getParticipantLabel(p.accessLevel)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50  max-w-md mx-auto">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleCreate}
        >
          Create wedding
        </Button>
      </div>
    </div>
  );
}
