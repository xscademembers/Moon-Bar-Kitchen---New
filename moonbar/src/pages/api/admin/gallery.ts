import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '../../../lib/mongodb';

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
  } catch (err) {
    console.error('Gallery fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch gallery' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { label, category, imageUrl, emoji } = body;

    if (!label?.trim() || !category) {
      return new Response(JSON.stringify({ error: 'label and category required' }), { status: 400 });
    }

    const db = await getDb();
    const count = await db.collection(COLLECTIONS.gallery).countDocuments();

    const doc = {
      label: String(label).trim(),
      category: String(category),
      imageUrl: imageUrl?.trim() || '',
      emoji: emoji || '🌙',
      order: count,
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.gallery).insertOne(doc);
    return new Response(JSON.stringify({ ok: true, id: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error('Gallery create error:', err);
    return new Response(JSON.stringify({ error: 'Failed to add image' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.gallery).deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Gallery delete error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete' }), { status: 500 });
  }
};
