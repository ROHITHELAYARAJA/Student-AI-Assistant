import React, { useState } from 'react';
import { router } from '../../services/router.js';

interface AuthViewProps {
  initialMode?: 'signup' | 'login';
  onAuthSuccess: (user: { name: string; email: string }) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'signup',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [firstName, setFirstName] = useState('Sarthak');
  const [lastName, setLastName] = useState('Dhawan');
  const [email, setEmail] = useState('sarthak@example.com');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) {
      setError('Please fill out all fields.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    const fullName = mode === 'signup' ? `${firstName.trim()} ${lastName.trim()}` : email.split('@')[0];
    onAuthSuccess({ name: fullName, email: email.trim() });
    router.navigate('/dashboard');
  };

  const handleGoogleAuth = () => {
    onAuthSuccess({ name: 'Sarthak Dhawan', email: 'sarthak@example.com' });
    router.navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#111115] flex flex-col items-center justify-center p-4 select-none relative font-sans">
      <div className="absolute top-6 left-8 flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
        </svg>
        <span className="font-bold text-white text-base tracking-tight">turbo ai</span>
      </div>

      <div className="w-full max-w-[420px] bg-[#181820] border border-[#272736] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </h1>
          <p className="text-xs text-zinc-400">
            Create notes in minutes. No credit card required.
          </p>
        </div>

        <button
          onClick={handleGoogleAuth}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-[#20202C] hover:bg-[#282838] border border-[#303044] text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[#272738]" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">OR</span>
          <div className="flex-1 h-[1px] bg-[#272738]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#14141C] border border-[#2B2B3E] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-300 block mb-1">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#14141C] border border-[#2B2B3E] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-zinc-300 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2.5 rounded-xl bg-[#14141C] border border-[#2B2B3E] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-[#14141C] border border-[#2B2B3E] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {error && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all active:scale-[0.99] mt-2"
          >
            {mode === 'signup' ? 'Create an account' : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  router.navigate('/login');
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 ml-1"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  router.navigate('/signup');
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 ml-1"
              >
                Sign up
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-[11px] text-zinc-500 max-w-sm">
        By creating or entering an account, you agree to the{' '}
        <span className="text-zinc-400 underline cursor-pointer">Terms of Service</span> and{' '}
        <span className="text-zinc-400 underline cursor-pointer">Privacy Policy</span>.
      </div>
    </div>
  );
};
