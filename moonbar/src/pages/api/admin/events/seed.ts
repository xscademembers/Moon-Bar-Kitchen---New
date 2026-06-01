import type { APIRoute } from 'astro';
import { seedEvents } from '../../../../lib/seed-events';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const merge = Boolean(body?.merge);
    const result = await seedEvents(force, merge);

    if (result.skipped && !result.merged) {
      return new Response(
        JSON.stringify({
          ok: true,
          skipped: true,
          message: 'Events already exist. Use force to replace them.',
          existing: result.existing,
        }),
        { headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, inserted: result.inserted }),
      { status: 201, headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error('Events seed error:', err);
    return new Response(JSON.stringify({ error: 'Failed to seed events' }), { status: 500 });
  }
};
