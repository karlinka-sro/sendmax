'use client';

import { useState } from 'react';
import { KeyRound, LockKeyhole } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PasswordGate() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle');

  async function unlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;
    setStatus('checking');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setStatus('error');
        setPassword('');
        return;
      }

      window.location.reload();
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="min-h-dvh px-4 py-6 sm:grid sm:place-items-center sm:py-10">
      <section className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[32px] border border-white/10 bg-card shadow-2xl shadow-black/40">
        <header className="px-6 pb-6 pt-8 text-center sm:px-8">
          <div className="mx-auto mb-6 grid size-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
            <LockKeyhole aria-hidden="true" className="size-6" />
          </div>

          <div className="robot-shell" aria-label="Max waiting for the password">
            <div className="robot-button" aria-hidden="true" />
            <div className="robot-screen" aria-hidden="true">
              <span className="robot-eye" />
              <span className="robot-eye" />
            </div>
          </div>

          <p className="mt-7 text-sm font-medium text-cyan-300">Friends only</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-white">
            Say hello to Max
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter the shared password to send a message to his desk friend.
          </p>
        </header>

        <form onSubmit={unlock} className="border-t border-white/8 bg-black/10 px-6 py-6 sm:px-8">
          <label htmlFor="password" className="text-sm font-semibold text-white">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            autoFocus
            onChange={(event) => {
              setPassword(event.target.value);
              setStatus('idle');
            }}
            className="mt-2 h-13 rounded-2xl border-white/12 bg-[#10151b] px-4 text-[16px] text-white shadow-inner placeholder:text-slate-600 focus-visible:border-cyan-400/70 focus-visible:ring-cyan-400/15"
            placeholder="Enter password"
            aria-invalid={status === 'error'}
            aria-describedby="password-status"
          />

          <Button
            type="submit"
            size="lg"
            disabled={!password || status === 'checking'}
            className="mt-4 h-13 w-full rounded-2xl bg-cyan-400 text-[15px] font-bold text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300"
          >
            <KeyRound aria-hidden="true" />
            {status === 'checking' ? 'Checking…' : 'Enter'}
          </Button>

          <p
            id="password-status"
            role="alert"
            className="min-h-5 pt-3 text-center text-xs text-rose-300"
          >
            {status === 'error' && 'That password is not correct. Please try again.'}
          </p>
        </form>
      </section>
    </main>
  );
}
