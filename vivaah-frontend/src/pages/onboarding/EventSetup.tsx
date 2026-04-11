import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EventChip } from '../../components/ui/EventChip';

export default function EventSetup() {
  const navigate = useNavigate();
  const { mode, events, setEvents, setEventsSkipped } = useOnboarding();
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const toggleEvent = (id: string) => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, isSelected: !ev.isSelected } : ev
    ));
    setErrorVisible(false);
  };

  const updateEventValue = (id: string, field: 'date' | 'time', value: string) => {
    setEvents(prev => prev.map(ev => 
      ev.id === id ? { ...ev, [field]: value } : ev
    ));
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const newId = `custom-${Date.now()}`;
    setEvents(prev => [...prev, {
      id: newId,
      type: 'custom',
      name: customName.trim(),
      date: '',
      time: '',
      isSelected: true,
      description: ''
    }]);
    setCustomName('');
    setShowCustomInput(false);
    setErrorVisible(false);
  };

  const handleContinue = () => {
    const hasSelected = events.some(ev => ev.isSelected);
    if (!hasSelected) {
      setErrorVisible(true);
      return;
    }
    setEventsSkipped(false);
    navigate('/onboarding/budget');
  };

  const handleSkip = () => {
    setEventsSkipped(true);
    navigate('/onboarding/budget');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-28 max-w-md mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Step 2 of 5</span>
        <Button variant="ghost" size="small" onClick={handleSkip}>
          Skip for now
        </Button>
      </div>

      <h1 className="text-[28px] font-medium leading-tight mb-6">
        Which events are part of this wedding?
      </h1>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
        {events.map((ev) => (
          <div 
            key={ev.id} 
            className={`bg-white border rounded-2xl p-4 transition-colors ${
              ev.isSelected ? 'border-vivaah-400 ring-1 ring-vivaah-400' : 'border-gray-200'
            }`}
          >
            <div 
              className="flex items-start gap-3 cursor-pointer" 
              onClick={() => toggleEvent(ev.id)}
            >
              <div className="pt-1">
                <input 
                  type="checkbox" 
                  checked={ev.isSelected}
                  readOnly
                  className="rounded text-vivaah-600 focus:ring-vivaah-600 w-4 h-4 accent-vivaah-600 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="mb-1">
                  <EventChip eventType={ev.type} label={ev.name} />
                </div>
                {mode === 2 && ev.description && (
                  <p className="text-[15px] text-gray-600">{ev.description}</p>
                )}
              </div>
            </div>

            {/* Expanded Inputs when selected */}
            {ev.isSelected && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <Input 
                  label="Date"
                  type="date"
                  value={ev.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEventValue(ev.id, 'date', e.target.value)}
                />
                <Input 
                  label="Start time"
                  type="time"
                  value={ev.time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEventValue(ev.id, 'time', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        {showCustomInput ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-2 items-end">
            <div className="flex-1">
              <Input 
                label="Custom event name"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="E.g. Pool Party"
                autoFocus
              />
            </div>
            <Button variant="secondary" onClick={handleAddCustom}>Add</Button>
            <Button variant="ghost" onClick={() => setShowCustomInput(false)}>Cancel</Button>
          </div>
        ) : (
          <Button 
            variant="ghost"
            onClick={() => setShowCustomInput(true)}
            className="w-full border border-dashed border-gray-300 text-gray-600 font-medium"
          >
            + Add custom event
          </Button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50  max-w-md mx-auto">
        {errorVisible && (
          <p className="text-sm text-danger text-center mb-2">Please select at least one event to continue.</p>
        )}
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
