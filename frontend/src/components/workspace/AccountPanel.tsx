import React, { useState } from 'react';
import { request } from '../../services/studyApi';
import { router } from '../../services/router';

export function AccountPanel({ session, onChange }: { session: any; onChange: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await request(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password, name: name || 'Student' }),
      });
      setPassword('');
      onChange();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (session?.user?.email) {
    return (
      <div className="account-panel">
        <strong>{session.user.name}</strong>
        <p>Signed in as {session.user.email}. Your notebooks are saved on the study server.</p>
        <button
          className="subtle-button"
          onClick={async () => {
            try {
              await request('/auth/logout', { method: 'POST' });
              onChange();
            } catch (e: any) {
              setError(e.message);
            }
          }}
        >
          Sign out
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <form className="account-panel" onSubmit={submit}>
      <div style={{ marginBottom: '16px', width: '100%' }}>
        <button
          type="button"
          onClick={() => router.navigate('/login')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px 16px',
            fontSize: '14.5px',
            fontWeight: 600,
            borderRadius: '14px',
            background: '#121214',
            color: '#ffffff',
            border: '1px solid #27272a',
            boxShadow: '0 0 25px -5px rgba(140, 102, 218, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google &amp; Social</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', color: '#888', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ padding: '0 10px', color: '#6b7280' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>
      </div>

      <h3>{mode === 'register' ? 'Save your learning across sessions' : 'Welcome back'}</h3>
      <p>
        {session?.guest
          ? 'You are using a private guest workspace. Register to keep access to it.'
          : 'Sign in to access your notebooks.'}
      </p>
      {mode === 'register' && (
        <>
          <label className="field-label" htmlFor="account-name">
            Name
          </label>
          <input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            maxLength={50}
          />
        </>
      )}
      <label className="field-label" htmlFor="account-email">
        Email
      </label>
      <input
        id="account-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoComplete="email"
        required
      />
      <label className="field-label" htmlFor="account-password">
        Password · at least 10 characters
      </label>
      <input
        id="account-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        minLength={10}
        maxLength={128}
        required
      />
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <button className="dark-button modal-submit" disabled={busy}>
        {busy ? 'One moment…' : mode === 'register' ? 'Create account' : 'Sign in'}
      </button>
      <button
        type="button"
        className="text-button"
        onClick={() => {
          setMode(mode === 'register' ? 'login' : 'register');
          setError('');
        }}
      >
        {mode === 'register' ? 'Already registered? Sign in' : 'New here? Create an account'}
      </button>
    </form>
  );
}
