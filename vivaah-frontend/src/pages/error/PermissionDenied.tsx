import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function PermissionDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 items-center justify-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center text-2xl font-medium mb-6">!</div>
      <h1 className="text-2xl font-medium mb-3">Access Restricted</h1>
      <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
        You don't have permission to view this page. You can still access budget, tasks, or event details based on your role.
        <br /><br />
        If you need access, please contact the lead planner.
      </p>
      
      <Button variant="primary" className="w-full" onClick={() => navigate('/')}>
        Return to My Plan
      </Button>
    </div>
  );
}
