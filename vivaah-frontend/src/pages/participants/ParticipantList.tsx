import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { BottomNav } from '../../components/ui/BottomNav';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { AddParticipantSheet } from '../../components/participants/AddParticipantSheet';
import { RoleTransferSheet } from '../../components/participants/RoleTransferSheet';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { supabase } from '../../lib/supabase';

interface Participant {
  id: string;
  name: string;
  phone: string;
  role: string;
  access_level: string;
  invite_status: 'pending' | 'sent' | 'failed' | 'accepted';
}

interface Props {
  weddingId: string;
  mode: 1 | 2;
  currentUserAccessLevel: string; // reserved for future column-level UI gating
}

export default function ParticipantList({ weddingId, mode, currentUserAccessLevel }: Props) {
  const location = useLocation();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [showRevokeSheet, setShowRevokeSheet] = useState(false);
  const [showTransferSheet, setShowTransferSheet] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Fetch current user's role for this wedding
  useEffect(() => {
    async function fetchCurrentRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('participants')
          .select('role, access_level')
          .eq('user_id', user.id)
          .eq('wedding_id', weddingId)
          .eq('status', 'active')
          .single();
        if (data) setCurrentUserRole(data.role);
      }
    }
    fetchCurrentRole();
  }, [weddingId]);

  // Fetch participants
  useEffect(() => {
    async function fetchParticipants() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('participants')
        .select('id, name, phone, role, access_level, invite_status')
        .eq('wedding_id', weddingId)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setParticipants(data as Participant[]);
      }
      setIsLoading(false);
    }
    fetchParticipants();
  }, [weddingId]);

  // Gate edit controls by role
  const canEditAccess =
    (mode === 1 && currentUserRole === 'planner') ||
    (mode === 2 && currentUserRole === 'head_planner');

  const getAccessLevelLabel = (level: string) => {
    const map: Record<string, string> = {
      'full': 'Full access',
      'budget': 'Budget only',
      'task': 'Tasks only',
      'event_specific': 'One event only',
      'view_only': 'View only',
      'guest': 'Schedule and venue (guest)',
      'couple_view': 'Couple view',
      'family_view': 'Family view',
    };
    return map[level] || level;
  };

  // 6b — Access level change → Supabase
  const handleAccessLevelChange = async (participantId: string, newLevel: string) => {
    const { error } = await supabase
      .from('participants')
      .update({ access_level: newLevel })
      .eq('id', participantId);

    if (!error) {
      setParticipants(prev =>
        prev.map(p => p.id === participantId ? { ...p, access_level: newLevel } : p)
      );
    } else {
      console.error('Failed to update access level:', error);
    }
  };

  // 6c — Revoke access → soft delete + queue message
  const handleRevoke = async (participantId: string, phone: string) => {
    const { error } = await supabase
      .from('participants')
      .update({ status: 'revoked' })
      .eq('id', participantId);

    if (!error) {
      // Queue WhatsApp notification
      await supabase.from('messages_queue').insert({
        recipient_phone: phone,
        message_type: 'access_revoked',
        payload: { weddingId },
        status: 'pending',
        retry_count: 0,
      });

      // Remove from UI (data preserved in DB with status = revoked)
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      setShowRevokeSheet(false);
      setSelectedParticipantId(null);
    }
  };

  const activeParticipant = participants.find(p => p.id === selectedParticipantId);
  const failedInvites = participants.filter(p => p.invite_status === 'failed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto p-4">
        <h1 className="text-[28px] font-medium leading-tight mb-6">Participants</h1>
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Invite Failure Banner */}
      {failedInvites.length > 0 && (
        <div className="bg-danger/10 p-3 mx-4 mt-6 rounded-xl border border-danger/20 flex flex-col gap-1">
          {failedInvites.map(f => (
            <p key={`fail-${f.id}`} className="text-[13px] text-danger font-medium flex justify-between">
              <span>Invite to {f.name} failed to deliver.</span>
              <Button variant="ghost" size="small" className="underline p-0 h-auto min-h-[44px]" onClick={() => {
                // mock resend — Phase 2: real resend via Edge Function
                setParticipants(prev => prev.map(p => p.id === f.id ? { ...p, invite_status: 'sent' } : p));
              }}>Resend</Button>
            </p>
          ))}
        </div>
      )}

      <div className="p-4 pb-20">
        <h1 className="text-[28px] font-medium leading-tight mb-6">Participants</h1>

        {participants.length === 0 ? (
          <div className="bg-white border text-center p-6 rounded-2xl border-gray-200 mb-6">
            <h2 className="text-xl font-medium mb-2">No participants</h2>
            <p className="text-[15px] text-gray-500 mb-6">Add participants to give them access.</p>
            <Button variant="primary" onClick={() => setShowAddSheet(true)}>Add participant</Button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
          {participants.map(p => {
            const isExpanded = selectedParticipantId === p.id;

            return (
              <div
                key={p.id}
                className={`bg-white border border-gray-200 rounded-2xl transition-all ${isExpanded ? 'p-4' : 'p-4 cursor-pointer'}`}
                onClick={() => { if (!isExpanded) setSelectedParticipantId(p.id); }}
              >
                {!isExpanded ? (
                  // Collapsed View
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-[17px] font-medium text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-500">{getAccessLevelLabel(p.access_level)}</p>
                    </div>
                    {p.invite_status === 'failed' ? (
                      <span className="text-[11px] font-medium uppercase tracking-wide bg-danger/10 text-danger px-2.5 py-0.5 rounded-full">Invite failed</span>
                    ) : p.invite_status === 'accepted' ? (
                      <span className="text-[11px] font-medium uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Accepted</span>
                    ) : (
                      <span className="text-[11px] font-medium uppercase tracking-wide bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">Invite sent</span>
                    )}
                  </div>
                ) : (
                  // Expanded View
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-medium text-gray-900">{p.name}</h3>
                      {/* FIX 13: touch target for close button */}
                      <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setSelectedParticipantId(null); }}
                        className="text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-[15px] font-medium text-gray-700">{p.phone}</p>

                    {p.invite_status === 'failed' && (
                      <Button variant="secondary" size="small" onClick={() => {
                        setParticipants(prev => prev.map(op => op.id === p.id ? { ...op, invite_status: 'sent' } : op));
                      }}>Resend invite</Button>
                    )}

                    {canEditAccess && (
                      <div className="pt-3 border-t border-gray-100">
                        <label className="text-sm font-normal text-gray-700 block mb-1">Access Level</label>
                        <select
                          value={p.access_level}
                          onChange={e => {
                            e.stopPropagation();
                            handleAccessLevelChange(p.id, e.target.value);
                          }}
                          className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600 focus:ring-0 mb-3"
                        >
                          {mode === 1 ? (
                            <>
                              <option value="couple_view">Couple view</option>
                              <option value="family_view">Family view</option>
                            </>
                          ) : (
                            <>
                              <option value="full">Can see everything (Full access)</option>
                              <option value="budget">Budget and finances only</option>
                              <option value="task">Assigned tasks only</option>
                              <option value="event_specific">One event only</option>
                              <option value="view_only">Can view everything</option>
                              <option value="guest">Schedule and logistics only</option>
                            </>
                          )}
                        </select>

                        <div className="flex gap-2">
                          {mode === 2 && p.access_level === 'full' && (
                            <Button variant="secondary" className="flex-1" onClick={() => setShowTransferSheet(true)}>
                              Transfer head planner
                            </Button>
                          )}
                          <Button variant="danger" className="flex-1" onClick={() => setShowRevokeSheet(true)}>
                            Revoke access
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        <Button variant="secondary" className="w-full" onClick={() => setShowAddSheet(true)}>
          Add participant
        </Button>
      </div>

      {/* Sheets */}
      <AddParticipantSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        mode={mode}
        onSaved={() => setShowAddSheet(false)}
      />

      {activeParticipant && (
        <>
          <BottomSheet isOpen={showRevokeSheet} onClose={() => setShowRevokeSheet(false)}>
            <div className="text-center pt-2">
              <h2 className="text-xl font-medium mb-2">Remove participant?</h2>
              <p className="text-[15px] text-gray-600 mb-6">
                Remove {activeParticipant.name}? They'll be notified by WhatsApp.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowRevokeSheet(false)}>Cancel</Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleRevoke(activeParticipant.id, activeParticipant.phone)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </BottomSheet>

          <RoleTransferSheet
            isOpen={showTransferSheet}
            participantName={activeParticipant.name}
            onClose={() => setShowTransferSheet(false)}
            onConfirm={() => {
              // Phase 2: trigger socket and update UI to show success
              setShowTransferSheet(false);
            }}
          />
        </>
      )}

      <BottomNav
        weddingId={weddingId}
        currentAccessLevel={currentUserAccessLevel}
        currentPath={location.pathname}
      />
    </div>
  );
}
