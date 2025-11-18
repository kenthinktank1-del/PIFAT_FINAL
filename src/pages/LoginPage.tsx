import { useState } from 'react';
import { signInWithEmail } from '../lib/services/auth';
import { useAuth } from '../lib/context/AuthContext';
import { Lock, Mail, AlertCircle, Loader } from 'lucide-react';

interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  error: string;
}

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    loading: false,
    error: '',
  });

  if (isAuthenticated) {
    onLoginSuccess();
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.email || !state.password) {
      setState(prev => ({ ...prev, error: 'Email and password are required' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    const { user, error } = await signInWithEmail(state.email, state.password);

    if (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
    } else if (user) {
      setState(prev => ({
        ...prev,
        loading: false,
        email: '',
        password: '',
        error: '',
      }));
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PIFAT</h1>
            <p className="text-gray-600 mt-2">Forensics Toolkit</p>
            <p className="text-sm text-gray-500 mt-1">Admin Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={state.email}
                  onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="admin@forensics.local"
                  disabled={state.loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={state.password}
                  onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  disabled={state.loading}
                />
              </div>
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{state.error}</p>
                  {state.error.includes('administrators') && (
                    <p className="text-xs text-red-600 mt-1">Please contact your administrator for access</p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={state.loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {state.loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This system is restricted to authorized administrators only. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Demo credentials:<br />
            <span className="font-mono text-xs text-gray-500">admin@forensics.local</span>
          </p>
        </div>
      </div>
    </div>
  );
}
