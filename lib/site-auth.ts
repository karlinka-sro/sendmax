import { getRuntimeSetting } from '@/lib/runtime-env';

const encoder = new TextEncoder();

export const ACCESS_COOKIE = 'max_friend_access';

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export async function createAccessToken(secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode('send-to-max')));
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

export function passwordMatches(candidate: string) {
  const configured = getRuntimeSetting('MAX_SITE_PASSWORD');
  return Boolean(configured && constantTimeEqual(candidate, configured));
}

export async function hasAccess(cookieHeader: string | null) {
  const secret = getRuntimeSetting('MAX_SITE_SESSION_SECRET');
  if (!secret || !cookieHeader) return false;

  const token = cookieHeader
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([name]) => name === ACCESS_COOKIE)?.[1];

  if (!token) return false;
  return constantTimeEqual(decodeURIComponent(token), await createAccessToken(secret));
}
