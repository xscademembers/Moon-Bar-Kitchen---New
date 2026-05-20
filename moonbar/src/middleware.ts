import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken, SESSION_COOKIE } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const session = context.cookies.get(SESSION_COOKIE)?.value;
  const isAuthed = verifySessionToken(session);

  if (pathname.startsWith('/api/admin')) {
    if (!isAuthed) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthed) {
      return context.redirect('/admin/login');
    }
  }

  if (pathname === '/admin/login' && isAuthed) {
    return context.redirect('/admin');
  }

  return next();
});
