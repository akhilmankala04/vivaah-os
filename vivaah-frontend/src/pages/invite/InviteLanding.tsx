import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function InviteLanding() {
  const { token } = useParams();
  const [showSignup, setShowSignup] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="p-4 w-full max-w-md mt-10">
        <h1 className="text-[28px] font-medium leading-tight mb-4">Your wedding plan</h1>
        {token === 'revoked' ? (
          <div className="bg-danger/10 border border-danger/20 rounded-2xl p-6 text-center ">
            <h2 className="text-xl font-medium text-danger mb-2">Access Revoked</h2>
            {/* DR-07-5: minimum 16px throughout InviteLanding */}
            <p className="text-[16px] text-danger">This invitation is no longer active.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center ">
            <p className="text-[17px] text-gray-700">Previewing content for invite token: <span className="font-medium">{token}</span></p>
            <div className="mt-8 flex justify-center">
              <div className="w-16 h-16 border-4 border-gray-100 border-t-vivaah-600 rounded-full animate-spin"></div>
            </div>
            {/* DR-07-5: text-sm (13px) → text-[16px] */}
            <p className="text-[16px] text-gray-500 mt-4">Loading appropriate access views...</p>
          </div>
        )}
      </div>

      {showSignup && token !== 'revoked' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100  max-w-md mx-auto z-10 animate-in slide-in-from-bottom-full duration-300">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-[17px] font-medium">Create your account</h3>
            {/* FIX 13: touch target for close button — min-h-[44px] min-w-[44px] */}
            <button
              onClick={() => setShowSignup(false)}
              className="text-gray-400 font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          {/* DR-07-5: text-[16px] minimum throughout */}
          <p className="text-[16px] text-gray-600 mb-4">Sign up to edit details or save this to your device.</p>
          <Button variant="primary" className="w-full">Sign up with Phone</Button>
        </div>
      )}
    </div>
  );
}
