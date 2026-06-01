import type { APIRoute } from 'astro';
import { fetchWeeklyEvents } from '../../lib/fetch-content';

export const GET: APIRoute = async () => {
  try {
    const events = await fetchWeeklyEvents();
    return new Response(JSON.stringify(events), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Public events fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch events' }), { status: 500 });
  }
};
