'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, LockKeyhole, Radio, Send, Wifi } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_LENGTH = 72;

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function MaxApp() {
  const [message, setMessage] = useState('');
  const [sendState, setSendState] = useState<SendState>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const unsupported = useMemo(
    () => /[^\x20-\x7E\n\r\t]/.test(message),
    [message],
  );

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = message.replace(/\s+/g, ' ').trim();
    if (!clean) return;
    if (/[^\x20-\x7E]/.test(clean)) {
      setError('Use plain letters, numbers, and punctuation so Max can read it.');
      setSendState('error');
      return;
    }

    setSendState('sending');
    setError('');
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean }),
      });
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) throw new Error(`message endpoint returned ${response.status}`);
      setMessage('');
      setSendState('sent');
    } catch {
      setError('Message was not sent. Check your internet connection and try again.');
      setSendState('error');
    }
  }

  function updateMessage(value: string) {
    setMessage(value.slice(0, MAX_LENGTH));
    setSendState('idle');
    setError('');
  }

  return (
    <main className="min-h-dvh px-4 py-6 sm:grid sm:place-items-center sm:py-10">
      <section className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[32px] border border-white/10 bg-card shadow-2xl shadow-black/40">
        <header className="px-6 pb-5 pt-7 sm:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
              <Radio aria-hidden="true" className="size-4 text-cyan-400" />
              Max link
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <Wifi aria-hidden="true" className="size-3.5" />
              Ready
            </div>
          </div>

          <div className="robot-shell" aria-label="Max looking at you">
            <div className="robot-button" aria-hidden="true" />
            <div className="robot-screen" aria-hidden="true">
              <span className="robot-eye" />
              <span className="robot-eye" />
            </div>
          </div>

          <div className="mt-7">
            <p className="text-sm font-medium text-cyan-300">A note for your desk friend</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-white">
              Send something to Max
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              It will stay on his screen until he presses the top button.
            </p>
          </div>
        </header>

        <form onSubmit={sendMessage} className="border-t border-white/8 bg-black/10 px-6 py-6 sm:px-8">
          <div className="mb-2 flex items-end justify-between gap-4">
            <label htmlFor="message" className="text-sm font-semibold text-white">
              Message
            </label>
            <span className={`font-mono text-xs ${message.length >= 65 ? 'text-amber-300' : 'text-muted-foreground'}`}>
              {message.length} / {MAX_LENGTH}
            </span>
          </div>

          <Textarea
            id="message"
            value={message}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder="Good luck with your exam!"
            onChange={(event) => updateMessage(event.target.value)}
            className="min-h-28 resize-none rounded-2xl border-white/12 bg-[#10151b] px-4 py-3 text-[16px] leading-6 text-white shadow-inner placeholder:text-slate-600 focus-visible:border-cyan-400/70 focus-visible:ring-cyan-400/15"
            aria-describedby="message-help send-status"
          />

          <p id="message-help" className={`mt-2 text-xs ${unsupported ? 'text-amber-300' : 'text-muted-foreground'}`}>
            {unsupported
              ? 'Max’s small screen works best with plain letters and punctuation.'
              : 'Up to 72 characters. Plain text works best.'}
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={!message.trim() || sendState === 'sending' || unsupported}
            className="mt-5 h-13 w-full rounded-2xl bg-cyan-400 text-[15px] font-bold text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300"
          >
            {sendState === 'sending' ? (
              'Sending…'
            ) : sendState === 'sent' ? (
              <><Check aria-hidden="true" /> Sent to Max</>
            ) : (
              <><Send aria-hidden="true" /> Send to Max</>
            )}
          </Button>

          <p
            id="send-status"
            role="status"
            aria-live="polite"
            className={`min-h-5 pt-3 text-center text-xs ${sendState === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}
          >
            {sendState === 'sent' && 'Delivered to ntfy. Max should see it in a few seconds.'}
            {sendState === 'error' && error}
          </p>
        </form>

        <form
          action="/api/logout"
          method="post"
          className="flex justify-center border-t border-white/8 px-6 py-4"
        >
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <LockKeyhole aria-hidden="true" className="size-3.5" />
            Lock this screen
          </button>
        </form>
      </section>

      <p className="mx-auto mt-5 max-w-[430px] text-center text-xs leading-5 text-slate-500 sm:absolute sm:bottom-5">
        Password protected. Only share it with people you trust.
      </p>
    </main>
  );
}
