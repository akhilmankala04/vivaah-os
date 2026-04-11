import { useState } from 'react';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/BottomSheet';

interface Props {
  isOpen: boolean;
  participantName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function RoleTransferSheet({ isOpen, participantName, onClose, onConfirm }: Props) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'declined'>('idle');

  const handleTransfer = () => {
    // Mock the flow
    setStatus('waiting');
    // Simulate target accepting or declining after 2 seconds
    setTimeout(() => {
      // In a real flow, this state would rely on a socket or DB update
      onConfirm();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="text-center pt-2">
        {status === 'idle' ? (
          <>
            <h2 className="text-xl font-medium mb-2">Transfer role?</h2>
            <p className="text-[15px] text-gray-600 mb-6">
              Transfer your head planner role to {participantName}? You will become a full-access participant.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleTransfer}>Transfer</Button>
            </div>
          </>
        ) : status === 'waiting' ? (
          <div className="py-6">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-vivaah-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-[17px] font-medium text-gray-800">Waiting for {participantName} to accept</h2>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-danger font-medium mb-4">{participantName} declined the transfer.</p>
            <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
