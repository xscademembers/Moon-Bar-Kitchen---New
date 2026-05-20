import type { APIRoute } from 'astro';
import { getDb, COLLECTIONS } from '../../lib/mongodb';

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const posts = await db
      .collection(COLLECTIONS.blog_posts)
      .find({ published: true })
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(posts), {
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } });
  }
};
