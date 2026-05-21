import type { APIRoute } from 'astro';
import { seedMenuItems } from '../../../../lib/seed-menu';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const result = await seedMenuItems(force);

    if (result.skipped) {
      return new Response(
        JSON.stringify({
          ok: true,
          skipped: true,
          message: 'Menu already has items. Use force to replace them.',
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
    console.error('Menu seed error:', err);
    return new Response(JSON.stringify({ error: 'Failed to seed menu items' }), { status: 500 });
  }
};
