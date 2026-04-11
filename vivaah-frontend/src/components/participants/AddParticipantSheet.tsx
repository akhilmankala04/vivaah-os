import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BottomSheet } from '../ui/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: 1 | 2;
  onSaved: () => void;
}

export function AddParticipantSheet({ isOpen, onClose, mode, onSaved }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accessLevel, setAccessLevel] = useState(mode === 1 ? '' : 'view_only');

  const handleToggleBudget = () => {
    if (accessLevel !== 'budget') {
      const confirmMsg = name ? `Give ${name} budget visibility?` : `Give them budget visibility?`;
      if (window.confirm(confirmMsg)) {
        setAccessLevel('budget');
      }
    } else {
      setAccessLevel('view_only');
    }
  };

  const handleSave = () => {
    // Mock submit
    onSaved();
    // Reset state
    setName('');
    setPhone('');
    setAccessLevel(mode === 1 ? '' : 'view_only');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add participant">
      <div className="space-y-4 mt-2">
        <Input
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="relative">
          <Input
            label="Phone number"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="pl-12"
          />
          <span className="absolute left-3 top-[34px] text-gray-500 font-medium">+91</span>
        </div>

        {mode === 1 ? (
          <div>
            <label className="text-sm font-normal text-gray-700 block mb-1">Access Level</label>
            <select
              value={accessLevel}
              onChange={e => setAccessLevel(e.target.value)}
              className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-[15px] outline-none focus:border-vivaah-600 focus:ring-0"
            >
              <option value="" disabled>Select access level...</option>
              <option value="couple_view">Couple view</option>
              <option value="family_view">Family view</option>
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-normal text-gray-700 block mb-1">Access Level</label>
              <select
                value={accessLevel}
                onChange={e => setAccessLevel(e.target.value)}
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

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[15px] font-medium">Budget contributor?</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={accessLevel === 'budget'}
                  onChange={handleToggleBudget}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vivaah-600"></div>
              </label>
            </div>
          </div>
        )}

        <div className="pt-4">
          <p className="text-xs text-center text-gray-500 mb-3 px-4">
            Invites will be sent via WhatsApp when the wedding is created
          </p>
          <Button
            variant="primary"
            className="w-full"
            disabled={!name || !phone || !accessLevel}
            onClick={handleSave}
          >
            Add and send invite
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
