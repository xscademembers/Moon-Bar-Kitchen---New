import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from './env';

export function verifyAdminLogin(username: string, password: string): boolean {
  if (!env.adminPassword) return false;
  return safeEqual(username, env.adminUsername) && safeEqual(password, env.adminPassword);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  if (!env.sessionSecret) throw new Error('SESSION_SECRET is not configured');
  const payload = `admin:${Date.now()}`;
  const sig = createHmac('sha256', env.sessionSecret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !env.sessionSecret) return false;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload.startsWith('admin:')) return false;

  const timestamp = Number(payload.split(':')[1]);
  if (Number.isNaN(timestamp)) return false;
  if (Date.now() - timestamp > SESSION_MAX_AGE * 1000) return false;

  const expected = createHmac('sha256', env.sessionSecret).update(payload).digest('hex');
  if (sig.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
