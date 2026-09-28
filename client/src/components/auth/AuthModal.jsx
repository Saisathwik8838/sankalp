import React, { useState } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { syncWithServer, API_BASE } from '../../lib/sync.js';

export function AuthModal({ isOpen, onClose }) {
  const { state, dispatch } = useSankalp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      dispatch({ type: 'SET_USER', payload: data.user });
      // Trigger immediate sync to upload local guest data to new account
      syncWithServer(dispatch, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
      <div className="card w-full max-w-[360px] p-6 relative bg-[var(--sf)] shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--mt)] hover:text-[var(--tx)] text-[18px]"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="serif text-[22px] font-semibold text-[var(--tx)] mb-1">
          {mode === 'login' ? 'Devotee Sign In' : 'Create Sync Account'}
        </div>
        <p className="text-[13px] text-[var(--mt)] mb-4">
          Optional. Keeps your sankalp progress synced safely across devices.
        </p>

        {/* Tab switch */}
        <div className="flex border border-[var(--ln)] rounded-full p-0.5 mb-4 bg-[var(--bg)]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 text-[13px] rounded-full font-medium transition-all ${
              mode === 'login' ? 'bg-[var(--sf)] text-[var(--tx)] shadow-sm' : 'text-[var(--mt)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 text-[13px] rounded-full font-medium transition-all ${
              mode === 'register' ? 'bg-[var(--sf)] text-[var(--tx)] shadow-sm' : 'text-[var(--mt)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 p-2.5 rounded-xl text-[13px] mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[13px] text-[var(--mt)] block mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[var(--ln)] rounded-xl px-3 py-2 text-[14px] bg-[var(--bg)] text-[var(--tx)]"
            />
          </div>

          <div>
            <label className="text-[13px] text-[var(--mt)] block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[var(--ln)] rounded-xl px-3 py-2 text-[14px] bg-[var(--bg)] text-[var(--tx)]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-2"
          >
            {isLoading ? 'Processing…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[var(--ln)] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-[var(--mt)] hover:text-[var(--tx)] underline"
          >
            Continue as Guest (Local on this device)
          </button>
        </div>
      </div>
    </div>
  );
}
