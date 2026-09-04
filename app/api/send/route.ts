import { NextResponse } from 'next/server';

import { hasAccess } from '@/lib/site-auth';
import { getRuntimeSetting } from '@/lib/runtime-env';

const MAX_LENGTH = 72;

export async function POST(request: Request) {
  if (!(await hasAccess(request.headers.get('cookie')))) {
    return NextResponse.json({ error: 'Password required.' }, { status: 401 });
  }

  let message = '';
  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === 'string'
      ? body.message.replace(/\s+/g, ' ').trim()
      : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!message || message.length > MAX_LENGTH || /[^\x20-\x7E]/.test(message)) {
    return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
  }

  const ntfyUrl = getRuntimeSetting('NTFY_URL');
  if (!ntfyUrl) {
    return NextResponse.json({ error: 'Messaging is not configured.' }, { status: 503 });
  }

  const ntfyResponse = await fetch(ntfyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'X-Title': 'Message for Max',
    },
    body: message,
  });

  if (!ntfyResponse.ok) {
    return NextResponse.json({ error: 'Message delivery failed.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
