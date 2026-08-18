import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Full Name is required');
        await signup(email, password, fullName);
        onClose();
      } else if (mode === 'forgot') {
        setSuccessMsg(`If an account exists for ${email}, a password reset link has been dispatched.`);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create FinTrack AI Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'login' && 'Sign in to access your financial dashboard'}
            {mode === 'signup' && 'Track income, budget smarter, and get AI insights'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-glow flex items-center justify-center space-x-2"
          >
            <span>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Recovery Email'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
