import type { APIRoute } from 'astro';
import { verifyAdminLogin, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password required' }), { status: 400 });
    }

    if (!verifyAdminLogin(username, password)) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    cookies.set(SESSION_COOKIE, createSessionToken(), {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Login failed' }), { status: 500 });
  }
};
