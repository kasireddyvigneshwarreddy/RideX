import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/book';
  const { login, loginAs } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'customer' | 'driver' | 'admin') => {
    setLoading(true);
    try {
      await loginAs(role);
      if (role === 'driver') navigate('/driver');
      else if (role === 'admin') navigate('/admin');
      else navigate(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-theme-text-muted hover:text-theme-text"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-theme-surface border border-theme-border shadow-elevated space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-theme-secondary text-theme-primary flex items-center justify-center font-black text-2xl mx-auto">
              X
            </div>
            <h1 className="text-2xl font-black font-display text-theme-text">Sign In to RideX</h1>
            <p className="text-xs text-theme-text-muted">
              Book rides, track captains, and access your mobility dashboard.
            </p>
          </div>

          {/* Quick Demo Logins Banner */}
          <div className="p-3.5 rounded-2xl bg-theme-primary-light border border-theme-primary/40 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-theme-secondary">
              <Sparkles className="w-4 h-4 text-theme-primary" />
              <span>One-Click Demo Logins</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="py-1.5 px-2 rounded-xl bg-theme-surface border border-theme-border font-bold text-[11px] hover:border-theme-primary transition-colors truncate"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('driver')}
                className="py-1.5 px-2 rounded-xl bg-theme-surface border border-theme-border font-bold text-[11px] hover:border-theme-primary transition-colors truncate"
              >
                🛵 Captain
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-1.5 px-2 rounded-xl bg-theme-surface border border-theme-border font-bold text-[11px] hover:border-theme-primary transition-colors truncate"
              >
                ⚡ Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-theme-text-muted block mb-1.5">
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@ridex.in or +919876543210"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-theme-border bg-theme-surface text-theme-text text-sm font-medium focus:outline-none focus:border-theme-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-theme-text-muted block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-theme-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-theme-border bg-theme-surface text-theme-text text-sm font-medium focus:outline-none focus:border-theme-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-theme-primary text-theme-secondary font-black text-sm hover:bg-theme-primary-hover shadow-subtle transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-theme-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-theme-primary hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
