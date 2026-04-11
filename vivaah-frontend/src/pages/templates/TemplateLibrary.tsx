import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { EventChip } from '../../components/ui/EventChip';
import { formatDateDDMMYYYY } from '../../lib/dateUtils';

interface Template {
  id: string;
  template_name: string;
  event_sequence: { event_name: string; display_order: number; is_custom: boolean }[];
  access_config: Record<string, string>;
  task_category_defaults: string[] | null;
  usage_count: number;
  last_used_date: string | null;
  created_at: string;
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
  onUse,
}: {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onUse: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[15px] font-medium text-gray-900">{template.template_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Used {template.usage_count} time{template.usage_count !== 1 ? 's' : ''}
            {template.last_used_date ? ` · Last used ${formatDateDDMMYYYY(template.last_used_date)}` : ''}
          </p>
        </div>
        {/* Overflow menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400"
            aria-label="Template options"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-none overflow-hidden w-36">
              <button
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
              >
                Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 min-h-[44px]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event chips */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {template.event_sequence.map(e => (
          <EventChip key={e.event_name} eventType={e.event_name as never} />
        ))}
      </div>

      <Button variant="secondary" onClick={onUse} className="w-full">
        Use in new wedding
      </Button>
    </div>
  );
}

// Edit sheet
function EditTemplateSheet({
  template,
  isOpen,
  onClose,
  onSaved
}: {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) setName(template.template_name);
  }, [template]);

  async function handleSave() {
    if (!template || !name.trim()) return;
    setSaving(true);
    await supabase
      .from('wedding_templates')
      .update({ template_name: name.trim() })
      .eq('id', template.id);
    setSaving(false);
    onClose();
    onSaved();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit template">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-normal text-gray-700 block mb-1">Template name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-11 w-full border border-gray-300 rounded-xl px-3 text-[15px] outline-none focus:border-vivaah-600"
          />
        </div>
        {template && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Events</p>
            <div className="flex gap-1.5 flex-wrap">
              {template.event_sequence.map(e => (
                <EventChip key={e.event_name} eventType={e.event_name as never} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()} className="w-full">
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
      </div>
    </BottomSheet>
  );
}

// Delete confirmation sheet
function DeleteConfirmSheet({
  template,
  isOpen,
  onClose,
  onDeleted
}: {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!template) return;
    setDeleting(true);
    await supabase
      .from('wedding_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', template.id);
    setDeleting(false);
    onClose();
    onDeleted();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Delete template">
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to delete <span className="font-medium text-gray-900">{template?.template_name}</span>?
        This will not affect any weddings previously created from this template.
      </p>
      <div className="flex flex-col gap-3">
        <Button variant="ghost" onClick={handleDelete} disabled={deleting} className="w-full text-red-600">
          {deleting ? 'Deleting…' : 'Delete template'}
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
      </div>
    </BottomSheet>
  );
}

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  async function fetchTemplates() {
    const { data } = await supabase
      .from('wedding_templates')
      .select('*')
      .is('deleted_at', null)
      .order('usage_count', { ascending: false });
    setTemplates((data as Template[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchTemplates(); }, []);

  function handleEdit(t: Template) { setEditTarget(t); setShowEdit(true); }
  function handleDelete(t: Template) { setDeleteTarget(t); setShowDelete(true); }
  function handleUse(t: Template) { navigate(`/onboarding?templateId=${t.id}`); }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto space-y-3">
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center text-sm text-gray-500">
          ←
        </button>
        <h1 className="text-[28px] font-medium">Templates</h1>
      </div>

      {templates.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-gray-500 text-sm mb-4">
            No templates saved yet. When you finish setting up a wedding, save its configuration as a template to reuse for future clients.
          </p>
          <Button variant="primary" onClick={() => navigate('/onboarding')} className="w-full max-w-xs mx-auto">
            Create wedding
          </Button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => handleEdit(t)}
              onDelete={() => handleDelete(t)}
              onUse={() => handleUse(t)}
            />
          ))}
        </div>
      )}

      <EditTemplateSheet
        template={editTarget}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={() => fetchTemplates()}
      />
      <DeleteConfirmSheet
        template={deleteTarget}
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onDeleted={() => fetchTemplates()}
      />
    </div>
  );
}
