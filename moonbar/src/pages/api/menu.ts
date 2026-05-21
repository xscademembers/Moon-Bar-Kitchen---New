import type { APIRoute } from 'astro';
import { fetchMenuCategories } from '../../lib/fetch-content';

export const GET: APIRoute = async () => {
  try {
    const categories = await fetchMenuCategories();
    return new Response(JSON.stringify(categories), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Public menu fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch menu' }), { status: 500 });
  }
};
