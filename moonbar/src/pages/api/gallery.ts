import type { APIRoute } from 'astro';
import { getDb, COLLECTIONS } from '../../lib/mongodb';

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const items = await db
      .collection(COLLECTIONS.gallery)
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(items), {
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } });
  }
};
