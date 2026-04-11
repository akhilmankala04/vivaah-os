import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpDone, setSignUpDone] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        // Supabase may require email confirmation depending on project settings.
        // Try signing in immediately — if confirmation is disabled this works.
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Email confirmation required — show message
          setSignUpDone(true);
        } else {
          navigate('/');
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  if (signUpDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-4 max-w-md mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-medium mb-2">Check your email</h2>
          <p className="text-[15px] text-gray-500 mb-6">
            We sent a confirmation link to <span className="font-medium text-gray-800">{email}</span>.
            Click it, then sign in here.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => { setSignUpDone(false); setIsSignUp(false); }}
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-4 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-medium leading-tight">
          {isSignUp ? 'Create account' : 'Sign in'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Vivaah OS</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder={isSignUp ? 'At least 6 characters' : 'Password'}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-3">{error}</p>
      )}

      <Button
        variant="primary"
        className="w-full mt-6"
        disabled={loading || !email.trim() || !password.trim()}
        onClick={handleSubmit}
      >
        {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </Button>

      <button
        onClick={() => { setIsSignUp(s => !s); setError(''); }}
        className="mt-4 text-sm text-vivaah-600 text-center min-h-[44px] w-full"
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : "Don't have an account? Create one"}
      </button>
    </div>
  );
}
