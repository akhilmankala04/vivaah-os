import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EventChip } from '../../components/ui/EventChip';

interface TemplateEvent {
  event_name: string;
  display_order: number;
  is_custom: boolean;
}

interface SaveAsTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  weddingEvents: TemplateEvent[];
  mode: 1 | 2;
}

/**
 * Sheet opened from wedding settings.
 * Saves the wedding's event structure + access config as a reusable template.
 * NEVER captures: couple names, wedding date, vendor data, rates, milestones, client notes.
 */
export default function SaveAsTemplateSheet({
  isOpen,
  onClose,
  weddingEvents,
  mode,
}: SaveAsTemplateSheetProps) {
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const accessConfig = mode === 1
    ? { default_couple_access: 'couple_view', default_family_access: 'family_view' }
    : { default_participant_access: 'view_only' };

  async function handleSave() {
    if (!templateName.trim() || !userId) return;
    setSaving(true);

    await supabase.from('wedding_templates').insert({
      owner_user_id: userId,
      template_name: templateName.trim(),
      event_sequence: weddingEvents,
      access_config: accessConfig,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setTemplateName('');
      onClose();
    }, 1200);
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Save as template">
      <div className="space-y-5">
        {/* Template name input */}
        <div>
          <label className="text-sm font-normal text-gray-700 block mb-1">Template name</label>
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="e.g. South Indian 4-day wedding"
            className="h-11 w-full border border-gray-300 rounded-xl px-3 text-[15px] outline-none focus:border-vivaah-600"
          />
        </div>

        {/* What WILL be saved */}
        <div>
          <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-2">Will be saved</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
            <p className="text-sm text-gray-700">Event sequence</p>
            <div className="flex gap-1.5 flex-wrap">
              {weddingEvents.map(e => (
                <EventChip key={e.event_name} eventType={e.event_name as never} />
              ))}
            </div>
            <p className="text-sm text-gray-700 mt-1">
              Access defaults: {mode === 1 ? 'couple view / family view' : 'view only for all participants'}
            </p>
          </div>
        </div>

        {/* What WON'T be saved */}
        <div>
          <p className="text-[11px] font-medium tracking-wide uppercase text-gray-500 mb-2">Will NOT be saved</p>
          <p className="text-sm text-gray-500">
            Couple names, wedding date, vendors, rates, payment milestones, and client notes are never saved to templates.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {saved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-3 text-center">
            <p className="text-sm font-medium text-emerald-700">Template saved</p>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !templateName.trim()}
            className="w-full"
          >
            {saving ? 'Saving…' : 'Save template'}
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
      </div>
    </BottomSheet>
  );
}
