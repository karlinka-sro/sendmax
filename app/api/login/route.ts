import { NextResponse } from 'next/server';

import {
  ACCESS_COOKIE,
  createAccessToken,
  passwordMatches,
} from '@/lib/site-auth';

export async function POST(request: Request) {
  let password = '';

  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const secret = process.env.MAX_SITE_SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Login is not configured.' }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, await createAccessToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
