import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Minimal signed-cookie session (HMAC-SHA256). Server-only.
 * Cookie value: base64url(JSON payload) + '.' + base64url(signature)
 */
export const SESSION_COOKIE = 'klambi_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  uid: string;
  un: string;
  exp: number; // epoch seconds
}

function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('SESSION_SECRET / SUPABASE_SERVICE_ROLE_KEY is not set');
  return s;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest();

export function createSessionToken(uid: string, username: string): string {
  const payload: SessionPayload = { uid, un: username, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS };
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(sign(body))}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const expected = sign(body);
    const given = Buffer.from(sig, 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.uid || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): SessionPayload | null {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(res: NextResponse, uid: string, username: string) {
  res.cookies.set(SESSION_COOKIE, createSessionToken(uid, username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
