import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { Button } from '../../components/ui/Button';
import { RupeeInput } from '../../components/ui/RupeeInput';

export default function BudgetSetup() {
  const navigate = useNavigate();
  const { budget, setBudget, setBudgetSkipped } = useOnboarding();
  const [errorVisible, setErrorVisible] = useState(false);

  const handleContinue = () => {
    if (budget === null || budget <= 0) {
      setErrorVisible(true);
      return;
    }
    setBudgetSkipped(false);
    navigate('/onboarding/participants'); // Step 6
  };

  const handleSkip = () => {
    setBudget(null);
    setBudgetSkipped(true);
    navigate('/onboarding/participants');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-28 max-w-md mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Step 3 of 5</span>
        <Button variant="ghost" size="small" onClick={handleSkip}>
          Skip for now
        </Button>
      </div>

      <h1 className="text-[28px] font-medium leading-tight mb-8">
        What's your total wedding budget?
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <RupeeInput
          label="Total planned budget"
          value={budget}
          onChange={(val) => {
            setBudget(val);
            if (val && val > 0) setErrorVisible(false);
          }}
          autoFocus
          className="text-lg font-medium"
        />
        {errorVisible && (
          <p className="text-sm text-danger mt-2">Please enter a valid budget amount.</p>
        )}
        <p className="text-[15px] text-gray-600 mt-4 leading-relaxed">
          You can update this anytime. Committed and paid amounts are calculated automatically.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50  max-w-md mx-auto">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleContinue}
          disabled={budget === null || budget <= 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
