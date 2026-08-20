'use client';

import React, { useState } from 'react';
import { User } from '@/types/form';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Globe,
  Compass,
  LayoutGrid,
  CheckSquare,
  Disc,
  ArrowDownCircle,
  Sliders,
} from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8) score += 2;
    else if (pwd.length >= 8) score += 1;
    return Math.min(score, 4);
  };

  const strengthScore = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authMode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Please agree to the Terms of Service and Privacy Policy');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        authMode === 'login'
          ? { username, password }
          : { username, password, name };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('df_auth_user', JSON.stringify(data.data));
        onSuccess(data.data);
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex overflow-hidden font-sans text-slate-800 select-none">
      <div className="hidden lg:flex lg:w-1/2 bg-[#f8fafc] border-r border-slate-200/80 p-12 xl:p-16 flex-col justify-between overflow-y-auto">
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            {authMode === 'register' ? (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <LayoutGrid className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
            )}
            <span className="text-xl font-bold text-slate-900 tracking-tight">LogicFlow</span>
          </div>

          <div className="space-y-3 max-w-lg">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {authMode === 'register'
                ? 'Architect complex logic with elegant simplicity.'
                : 'Dynamic Form Builder'}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {authMode === 'register'
                ? 'The enterprise-grade form builder designed for power users. Drag, drop, and define advanced rulesets without writing a single line of code.'
                : 'Build flexible forms without rebuilding your application. Configure fields, dependencies, and validation rules through a visual form builder.'}
            </p>
          </div>

          {authMode === 'register' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-lg">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-indigo-400" />
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                  <div className="text-slate-300 font-bold text-xs">:::</div>
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                </div>

                <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600 font-black text-xs">=x</span>
                      <div className="h-3.5 bg-indigo-600 rounded-full w-24" />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                      IF &gt; THEN
                    </span>
                  </div>
                  <div className="h-8 rounded-lg border border-slate-200 bg-white" />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-slate-300 bg-white flex items-center justify-center text-slate-400 text-xs">
                    ✓
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex gap-4 max-w-lg">
              <div className="w-10 border-r border-slate-100 pr-3 space-y-4 text-slate-400 flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <CheckSquare className="w-4 h-4" />
                <Disc className="w-4 h-4" />
                <ArrowDownCircle className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="h-2.5 bg-slate-300 rounded w-1/3" />
                  <div className="h-6 bg-white rounded-lg border border-slate-200" />
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="h-2.5 bg-slate-300 rounded w-1/3" />
                  <div className="h-6 bg-white rounded-lg border border-slate-200" />
                </div>

                <div className="p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/20 space-y-1.5">
                  <div className="h-2.5 bg-indigo-600 rounded-full w-1/4" />
                  <div className="h-6 bg-white rounded-lg border border-indigo-200" />
                </div>
              </div>

              <div className="w-24 border-l border-slate-100 pl-3 space-y-3 text-slate-400">
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-6 bg-slate-100 rounded-lg" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-2.5 bg-slate-200 rounded w-8" />
                  <div className="w-6 h-3.5 bg-indigo-600 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-8">
          {authMode === 'register' ? (
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  A
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  B
                </div>
                <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  C
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Trusted by 10,000+ architects.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-16 overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {authMode === 'register' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              {authMode === 'register'
                ? 'Start building dynamic forms in minutes.'
                : 'Sign in to continue to your workspace.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {authMode === 'register' ? 'Email / Username' : 'Email'}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={authMode === 'register' ? 'Create a password' : 'Enter your password'}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authMode === 'register' && password && (
                <div className="pt-1 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${idx <= strengthScore
                          ? strengthScore <= 1
                            ? 'bg-rose-500'
                            : strengthScore <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          : 'bg-slate-200'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">
                      {strengthScore <= 1
                        ? 'Weak'
                        : strengthScore <= 2
                          ? 'Medium'
                          : strengthScore <= 3
                            ? 'Good'
                            : 'Strong'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>
            )}

            {authMode === 'register' ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-600 cursor-pointer">
                  I agree to the <span className="text-indigo-600 font-semibold hover:underline">Terms of Service</span> and{' '}
                  <span className="text-indigo-600 font-semibold hover:underline">Privacy Policy</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">Remember me</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#3730a3] hover:bg-[#312e81] text-white font-bold text-xs shadow-md shadow-indigo-900/20 transition active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading
                ? 'Processing...'
                : authMode === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2">
            {authMode === 'register' ? (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
