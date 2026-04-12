import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { OnboardingProvider } from './pages/onboarding/OnboardingContext';
import ModeSelection from './pages/onboarding/ModeSelection';
import WeddingDetails from './pages/onboarding/WeddingDetails';
import EventSetup from './pages/onboarding/EventSetup';
import BudgetSetup from './pages/onboarding/BudgetSetup';
import ParticipantSetup from './pages/onboarding/ParticipantSetup';
import WizardConfirm from './pages/onboarding/WizardConfirm';
import TemplateSelection from './pages/onboarding/TemplateSelection';
import ParticipantList from './pages/participants/ParticipantList';
import VendorList from './pages/vendors/VendorList';
import VendorDetail from './pages/vendors/VendorDetail';
import InviteLanding from './pages/invite/InviteLanding';
import PermissionDenied from './pages/error/PermissionDenied';
import WeddingDashboard from './pages/dashboard/WeddingDashboard';
import PaymentCalendar from './pages/payments/PaymentCalendar';
import BudgetLedger from './pages/budget/BudgetLedger';
import ConfirmationTracker from './pages/tracker/ConfirmationTracker';
import Portfolio from './pages/portfolio/Portfolio';
import TemplateLibrary from './pages/templates/TemplateLibrary';
import Timeline from './pages/timeline/Timeline';
import WeeklyBriefing from './pages/briefings/WeeklyBriefing'
import PlanningAssistant from './pages/assistant/PlanningAssistant';
import LoginPage from './pages/auth/LoginPage';
import { getMockRole } from './lib/mockAuth';
import { useOffline } from './lib/useOffline';
import { useAuthRedirect } from './hooks/useAuthRedirect';
import { SkeletonCard } from './components/ui/SkeletonCard';

// Auth guard — redirects to /login if no active Supabase session
function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'out'>('loading');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthState('ok');
      } else {
        setAuthState('out');
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-md px-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }
  if (authState === 'out') return null;
  return <>{children}</>;
}

// Route wrapper: reads weddingId from URL and passes required props to ParticipantList
function ParticipantListRoute() {
  const { weddingId } = useParams<{ weddingId: string }>();
  const role = getMockRole();
  return (
    <ParticipantList
      weddingId={weddingId ?? ''}
      mode={2}
      currentUserAccessLevel={role}
    />
  );
}

function ProtectedRoute({ children, blockVendors }: { children: React.ReactNode, allowedRoles?: string[], blockVendors?: boolean }) {
  const role = getMockRole();
  if (role === 'revoked') {
    return <Navigate to="/permission-denied" replace />;
  }
  if (blockVendors && (role === 'family_view' || role === 'guest')) {
    return <Navigate to="/permission-denied" replace />;
  }
  return <>{children}</>;
}

function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gray-800 text-white text-xs font-medium py-1.5 px-4 text-center ">
      You're offline — viewing saved data.
    </div>
  );
}

// Smart root redirect — Mode 1 planners → /portfolio, others → dashboard or /onboarding
// Shows a SkeletonCard loading state while resolving (not a blank div)
function RootRedirect() {
  useAuthRedirect();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('SW registration failed:', err);
      });
    }
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <OnboardingProvider>
        <OfflineBanner />
        <div className="pt-6">
          <Routes>
            <Route path="/onboarding" element={<RequireAuth><ModeSelection /></RequireAuth>} />
            <Route path="/onboarding/template" element={<RequireAuth><TemplateSelection /></RequireAuth>} />
            <Route path="/onboarding/details" element={<RequireAuth><WeddingDetails /></RequireAuth>} />
            <Route path="/onboarding/events" element={<RequireAuth><EventSetup /></RequireAuth>} />
            <Route path="/onboarding/budget" element={<RequireAuth><BudgetSetup /></RequireAuth>} />
            <Route path="/onboarding/participants" element={<RequireAuth><ParticipantSetup /></RequireAuth>} />
            <Route path="/onboarding/confirm" element={<RequireAuth><WizardConfirm /></RequireAuth>} />

            {/* Portfolio (Mode 1 planners) */}
            <Route path="/portfolio" element={<RequireAuth><Portfolio /></RequireAuth>} />
            <Route path="/settings/templates" element={<RequireAuth><TemplateLibrary /></RequireAuth>} />

            {/* Protected routes */}
            <Route path="/wedding/:weddingId/participants" element={
              <ProtectedRoute>
                <ParticipantListRoute />
              </ProtectedRoute>
            } />
            <Route path="/wedding/:weddingId/vendors" element={<ProtectedRoute blockVendors><VendorList /></ProtectedRoute>} />
            <Route path="/wedding/:weddingId/vendors/:vendorId" element={<ProtectedRoute blockVendors><VendorDetail /></ProtectedRoute>} />
            {/* Phase 2 operating layer routes */}
            <Route path="/wedding/:weddingId/payments" element={<ProtectedRoute><PaymentCalendar /></ProtectedRoute>} />
            <Route path="/wedding/:weddingId/budget" element={<ProtectedRoute><BudgetLedger /></ProtectedRoute>} />
            <Route path="/wedding/:weddingId/tracker" element={<ProtectedRoute><ConfirmationTracker /></ProtectedRoute>} />
            {/* Phase 3 — AI timeline + weekly briefing */}
            <Route path="/wedding/:weddingId/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
            <Route path="/wedding/:weddingId/briefings" element={<ProtectedRoute><WeeklyBriefing /></ProtectedRoute>} />
            <Route path="/wedding/:weddingId/assistant" element={<ProtectedRoute><PlanningAssistant /></ProtectedRoute>} />
            {/* Wedding dashboard — replaces the Navigate stub */}
            <Route path="/wedding/:weddingId" element={<ProtectedRoute><WeddingDashboard /></ProtectedRoute>} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/invite/:token" element={<InviteLanding />} />
            <Route path="/permission-denied" element={<PermissionDenied />} />

            {/* Root: smart redirect with SkeletonCard loading state */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </OnboardingProvider>
    </BrowserRouter>
  );
}

export default App;
