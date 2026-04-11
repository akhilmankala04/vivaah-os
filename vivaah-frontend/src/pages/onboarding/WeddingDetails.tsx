import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function WeddingDetails() {
  const navigate = useNavigate();
  const {
    partner1, setPartner1,
    partner2, setPartner2,
    weddingDate, setWeddingDate,
    muhuratFlag, setMuhuratFlag,
    city, setCity,
    isDestination, setIsDestination,
    setDetailsSkipped,
    updateOnboarding,
  } = useOnboarding();

  const [weeksAway, setWeeksAway] = useState<number | null>(null);

  useEffect(() => {
    if (weddingDate) {
      const selected = new Date(weddingDate);
      const now = new Date();
      const diffMs = selected.getTime() - now.getTime();
      const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
      setWeeksAway(weeks);

      // Propagate late_start_flag to context
      if (weeks < 20) {
        updateOnboarding({
          lateStartFlag: true,
          lateStartWeeks: 20 - weeks,
        });
      } else {
        updateOnboarding({
          lateStartFlag: false,
          lateStartWeeks: 0,
        });
      }
    } else {
      setWeeksAway(null);
      updateOnboarding({ lateStartFlag: false, lateStartWeeks: 0 });
    }
  }, [weddingDate]);

  const handleContinue = () => {
    setDetailsSkipped(false);
    navigate('/onboarding/events');
  };

  const handleSkip = () => {
    setDetailsSkipped(true);
    navigate('/onboarding/events');
  };

  const isFormValid = partner1.trim() !== '' && weddingDate !== '' && city.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-24 max-w-md mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500">Step 1 of 5</span>
        <Button variant="ghost" size="small" onClick={handleSkip}>
          Skip for now
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6">
        <div>
          <Input 
            label="Partner 1 name"
            value={partner1}
            onChange={e => setPartner1(e.target.value)}
            placeholder="Type name"
          />
        </div>

        <div>
          <Input 
            label="Partner 2 name"
            value={partner2}
            onChange={e => setPartner2(e.target.value)}
            placeholder="Type name (optional)"
          />
        </div>

        <div className="space-y-3">
          {/* Note: Native date input uses mobile picker, ensuring DD/MM/YYYY is handled internally */}
          <div className="flex items-center gap-3">
            <Input 
              label="Wedding date"
              type="date"
              value={weddingDate}
              onChange={e => setWeddingDate(e.target.value)}
            />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input 
              type="checkbox" 
              className="rounded text-vivaah-600 focus:ring-vivaah-600 w-4 h-4 accent-vivaah-600"
              checked={muhuratFlag}
              onChange={e => setMuhuratFlag(e.target.checked)}
            />
            <span className="text-[15px] text-gray-700">Date chosen by pandit / muhurat</span>
            {muhuratFlag && <Badge variant="done">Muhurat date</Badge>}
          </label>

          {weeksAway !== null && weeksAway > 0 && weeksAway < 20 && (
            <div className="bg-warning/10 border border-warning rounded-xl p-3 text-sm text-warning mt-2">
              Your wedding is {weeksAway} weeks away. We'll prioritise the most urgent tasks first.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Input 
            label={isDestination ? "Primary venue city" : "Wedding city"}
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="E.g. Jaipur"
          />
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input 
              type="checkbox" 
              className="rounded text-vivaah-600 focus:ring-vivaah-600 w-4 h-4 accent-vivaah-600"
              checked={isDestination}
              onChange={e => setIsDestination(e.target.checked)}
            />
            <span className="text-[15px] text-gray-700">This is a destination wedding</span>
          </label>
          
          {isDestination && (
            <p className="text-sm text-gray-500">We'll use 8 months as your planning horizon</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50  max-w-md mx-auto">
        <Button
          variant="primary"
          className="w-full"
          disabled={!isFormValid}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
