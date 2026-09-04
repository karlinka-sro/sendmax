import { headers } from 'next/headers';

import { hasAccess } from '@/lib/site-auth';

import MaxApp from './max-app';
import PasswordGate from './password-gate';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const requestHeaders = await headers();
  const authorized = await hasAccess(requestHeaders.get('cookie'));

  return authorized ? <MaxApp /> : <PasswordGate />;
}
