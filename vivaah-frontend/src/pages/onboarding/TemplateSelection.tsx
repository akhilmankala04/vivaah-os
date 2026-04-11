import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EventChip } from '../../components/ui/EventChip';
import { useOnboarding } from './OnboardingContext';

interface Template {
  id: string;
  template_name: string;
  event_sequence: { event_name: string; display_order: number; is_custom: boolean }[];
  access_config: Record<string, string>;
  usage_count: number;
  last_used_date: string | null;
}

export default function TemplateSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setEvents, updateOnboarding } = useOnboarding();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(searchParams.get('templateId') ?? '');

  useEffect(() => {
    supabase
      .from('wedding_templates')
      .select('id, template_name, event_sequence, access_config, usage_count, last_used_date')
      .is('deleted_at', null)
      .order('usage_count', { ascending: false })
      .then(({ data }) => {
        setTemplates((data as Template[]) ?? []);
        setLoading(false);
      });
  }, []);

  function applyTemplate(template: Template) {
    // Pre-fill events from template event_sequence
    const EVENT_DEFAULTS: Record<string, string> = {
      haldi: 'Turmeric ceremony, usually the morning before the wedding',
      mehendi: 'Henna ceremony, usually the evening before the wedding',
      sangeet: 'Music and dance celebration, usually 1–2 days before',
      engagement: 'Ring exchange ceremony',
      wedding: 'The main ceremony',
      reception: 'Post-wedding celebration for extended guests',
    };

    const prefilledEvents = template.event_sequence
      .sort((a, b) => a.display_order - b.display_order)
      .map(e => ({
        id: e.event_name,
        type: e.event_name as 'haldi' | 'mehendi' | 'sangeet' | 'engagement' | 'wedding' | 'reception' | 'custom',
        name: e.event_name.charAt(0).toUpperCase() + e.event_name.slice(1),
        date: '',
        time: '',
        isSelected: true,
        description: EVENT_DEFAULTS[e.event_name] ?? '',
      }));

    setEvents(prefilledEvents);
    // Store template metadata in context for WizardConfirm to reference
    updateOnboarding({ selectedTemplateId: template.id } as never);
    navigate('/onboarding/details');
  }

  function startFresh() {
    navigate('/onboarding/details');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="px-4 pt-10 pb-6">
        <h1 className="text-[28px] font-medium leading-tight mb-1">Start from a template?</h1>
        <p className="text-[15px] text-gray-500">
          Reuse a saved event sequence and access configuration, or start fresh.
        </p>
      </div>

      {/* Start fresh card */}
      <div className="px-4 mb-4">
        <button
          onClick={startFresh}
          className={`w-full text-left bg-white border rounded-2xl p-4 transition-colors min-h-[44px] ${
            selectedId === '' ? 'border-vivaah-600' : 'border-gray-100'
          }`}
        >
          <p className="text-[15px] font-medium text-gray-900">Start fresh</p>
          <p className="text-sm text-gray-500 mt-0.5">Build this wedding step-by-step from scratch.</p>
        </button>
      </div>

      {/* Divider */}
      {templates.length > 0 && (
        <div className="px-4 flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">or use a template</p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* Template list */}
      <div className="px-4 space-y-3 pb-24">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`w-full text-left bg-white border rounded-2xl p-4 transition-colors ${
              selectedId === t.id ? 'border-vivaah-600' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[15px] font-medium text-gray-900">{t.template_name}</p>
              <p className="text-xs text-gray-500">{t.usage_count} uses</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {t.event_sequence.map(e => (
                <EventChip key={e.event_name} eventType={e.event_name as never} />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* CTA foot */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-md mx-auto flex flex-col gap-3">
        {selectedId && selectedId !== '' ? (
          <Button
            variant="primary"
            onClick={() => {
              const t = templates.find(x => x.id === selectedId);
              if (t) applyTemplate(t);
            }}
            className="w-full"
          >
            Use this template
          </Button>
        ) : (
          <Button variant="primary" onClick={startFresh} className="w-full">
            Continue without template
          </Button>
        )}
      </div>
    </div>
  );
}
