import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '../../../lib/mongodb';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const posts = await db
      .collection(COLLECTIONS.blog_posts)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(posts), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Blog fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, excerpt, tag, body: content, published, readingTime, llmSummary } = body;

    if (!title?.trim() || !excerpt?.trim()) {
      return new Response(JSON.stringify({ error: 'title and excerpt required' }), { status: 400 });
    }

    const db = await getDb();
    const slug = slugify(title);

    const doc = {
      slug,
      title: String(title).trim(),
      excerpt: String(excerpt).trim(),
      tag: tag || 'vizag eats',
      body: content || '',
      llmSummary: llmSummary || excerpt,
      published: Boolean(published),
      readingTime: readingTime ? Number(readingTime) : 5,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.blog_posts).insertOne(doc);
    return new Response(JSON.stringify({ ok: true, id: result.insertedId, slug }), { status: 201 });
  } catch (err) {
    console.error('Blog create error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create post' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const db = await getDb();
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.title) set.title = updates.title;
    if (updates.excerpt) set.excerpt = updates.excerpt;
    if (updates.tag) set.tag = updates.tag;
    if (updates.body !== undefined) set.body = updates.body;
    if (updates.published !== undefined) set.published = updates.published;
    if (updates.readingTime) set.readingTime = Number(updates.readingTime);

    await db.collection(COLLECTIONS.blog_posts).updateOne(
      { _id: new ObjectId(id) },
      { $set: set }
    );

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Blog update error:', err);
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.blog_posts).deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Blog delete error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete' }), { status: 500 });
  }
};
