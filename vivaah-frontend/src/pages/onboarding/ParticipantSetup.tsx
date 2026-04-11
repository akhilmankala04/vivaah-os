import { useNavigate } from 'react-router-dom';
import { useOnboarding, AccessLevel, Participant } from './OnboardingContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function ParticipantSetup() {
  const navigate = useNavigate();
  const { mode, participants, setParticipants } = useOnboarding();

  const updateParticipant = (id: string, field: keyof Participant, value: string | number | boolean | AccessLevel) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addFamilyMember = () => {
    setParticipants(prev => [
      ...prev,
      { id: `fam-${Date.now()}`, name: '', phone: '', accessLevel: 'family_view', roleGroup: 'family' }
    ]);
  };

  const addGeneralParticipant = () => {
    setParticipants(prev => [
      ...prev,
      { id: `gen-${Date.now()}`, name: '', phone: '', accessLevel: 'view_only', roleGroup: 'general' }
    ]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleBudget = (id: string, currentLevel: AccessLevel, name: string) => {
    if (currentLevel !== 'budget') {
      const confirmMsg = name ? `Give ${name} budget visibility?` : `Give them budget visibility?`;
      if (window.confirm(confirmMsg)) {
        updateParticipant(id, 'accessLevel', 'budget');
      }
    } else {
      updateParticipant(id, 'accessLevel', 'view_only');
    }
  };

  const handleContinue = () => {
    navigate('/onboarding/confirm'); // Step 7
  };

  // Segregate participants for rendering
  const couples = participants.filter(p => p.roleGroup === 'couple');
  const families = participants.filter(p => p.roleGroup === 'family');
  const generals = participants.filter(p => p.roleGroup === 'general');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-32 max-w-md mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Step 4 of 5</span>
        <Button variant="ghost" size="small" onClick={handleContinue}>
          Skip for now
        </Button>
      </div>

      {mode === 1 ? (
        <div className="space-y-8 flex-1 overflow-y-auto hide-scrollbar">
          {/* Mode 1: Planner */}
          <section>
            <h2 className="text-xl font-medium mb-4">Invite the couple</h2>
            <div className="space-y-4">
              {couples.map((c, i) => (
                <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[15px] font-medium">Partner {i + 1}</span>
                    <Badge variant="done">Couple view</Badge>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      label="Name" 
                      value={c.name} 
                      onChange={e => updateParticipant(c.id, 'name', e.target.value)} 
                    />
                    <Input 
                      label="Phone number" 
                      type="tel" 
                      placeholder="+91"
                      value={c.phone} 
                      onChange={e => updateParticipant(c.id, 'phone', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4">Invite family members (optional)</h2>
            <div className="space-y-4 mb-4">
              {families.map(f => (
                <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Badge variant="shortlisted">Family view</Badge>
                    <Button variant="ghost" size="small" onClick={() => removeParticipant(f.id)} className="text-danger">Remove</Button>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      label="Name" 
                      value={f.name} 
                      onChange={e => updateParticipant(f.id, 'name', e.target.value)} 
                    />
                    <Input 
                      label="Phone number" 
                      type="tel" 
                      placeholder="+91"
                      value={f.phone} 
                      onChange={e => updateParticipant(f.id, 'phone', e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full border border-dashed border-gray-300" onClick={addFamilyMember}>
              + Add family member
            </Button>
          </section>
        </div>
      ) : (
        <div className="space-y-8 flex-1 overflow-y-auto hide-scrollbar">
          {/* Mode 2: Self-Planned */}
          <section>
            <h2 className="text-xl font-medium mb-4">Invite participants</h2>
            <div className="space-y-4 mb-4">
              {generals.map(g => (
                <div key={g.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <label className="text-sm font-normal text-gray-700 block mb-1">Access Level</label>
                      <select 
                        value={g.accessLevel}
                        onChange={e => updateParticipant(g.id, 'accessLevel', e.target.value)}
                        className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600 focus:ring-0"
                      >
                        <option value="full">Can see everything</option>
                        <option value="budget">Budget and finances only</option>
                        <option value="task">Assigned tasks only</option>
                        <option value="event_specific">One event only</option>
                        <option value="view_only">Can view everything</option>
                        <option value="guest">Schedule and logistics only</option>
                      </select>
                    </div>
                    <Button variant="ghost" size="small" onClick={() => removeParticipant(g.id)} className="text-danger ml-4 mt-[30px]">Remove</Button>
                  </div>

                  <div className="space-y-3">
                    <Input 
                      label="Name" 
                      value={g.name} 
                      onChange={e => updateParticipant(g.id, 'name', e.target.value)} 
                    />
                    <Input 
                      label="Phone number" 
                      type="tel" 
                      placeholder="+91"
                      value={g.phone} 
                      onChange={e => updateParticipant(g.id, 'phone', e.target.value)} 
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[15px] font-medium">Budget contributor?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={g.accessLevel === 'budget'}
                        onChange={() => handleToggleBudget(g.id, g.accessLevel, g.name)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vivaah-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full border border-dashed border-gray-300" onClick={addGeneralParticipant}>
              + Add participant
            </Button>
          </section>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50  max-w-md mx-auto">
        <p className="text-xs text-center text-gray-500 mb-3 px-4">
          Invites will be sent via WhatsApp when the wedding is created
        </p>
        <Button
          variant="primary"
          className="w-full"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
