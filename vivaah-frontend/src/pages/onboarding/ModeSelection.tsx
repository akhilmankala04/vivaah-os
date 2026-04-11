import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useOnboarding } from './OnboardingContext';

export default function ModeSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode, setMode } = useOnboarding();
  const [checking, setChecking] = useState(false);

  // If a templateId is passed via query param, treat Mode 1 as pre-selected
  const preselectedTemplateId = searchParams.get('templateId');

  const handleContinue = async () => {
    if (!mode) return;

    // Mode 2: always go directly to details
    if (mode === 2) {
      navigate('/onboarding/details');
      return;
    }

    // Mode 1: check if user has any saved templates
    setChecking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/onboarding/details'); setChecking(false); return; }

    const { data: templates } = await supabase
      .from('wedding_templates')
      .select('id')
      .eq('owner_user_id', user.id)
      .is('deleted_at', null)
      .limit(1);

    setChecking(false);
    // If templates exist, go to template selection screen first
    const dest = (templates && templates.length > 0)
      ? '/onboarding/template'
      : '/onboarding/details';

    // If a specific templateId was passed in the URL, preserve it
    navigate(preselectedTemplateId ? `${dest}?templateId=${preselectedTemplateId}` : dest);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 pb-24 max-w-md mx-auto relative">
      <div className="flex-1">
        <h1 className="text-[28px] font-medium leading-tight mb-8">
          How is this wedding being managed?
        </h1>

        <div className="flex flex-col gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMode(1)}
            className={`w-full text-left p-4 rounded-2xl transition-colors cursor-pointer ${
              mode === 1
                ? 'border-2 border-vivaah-600 bg-vivaah-50'
                : 'border border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <h2 className="text-xl font-medium mb-1">I'm a professional planner managing this for a client</h2>
            <p className="text-[15px] text-gray-600">
              You'll get a full planner toolkit including portfolio view and client templates
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setMode(2)}
            className={`w-full text-left p-4 rounded-2xl transition-colors cursor-pointer ${
              mode === 2
                ? 'border-2 border-vivaah-600 bg-vivaah-50'
                : 'border border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <h2 className="text-xl font-medium mb-1">We're planning this ourselves</h2>
            <p className="text-[15px] text-gray-600">
              One person from your family or couple leads the plan. Everyone else gets the right level of access.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50  max-w-md mx-auto">
        <Button
          variant="primary"
          className="w-full"
          disabled={!mode || checking}
          onClick={handleContinue}
        >
          {checking ? 'Checking…' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
