import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '../../../lib/mongodb';

const VALID_CATEGORIES = ['veg', 'non-veg', 'beverages'];

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const items = await db
      .collection(COLLECTIONS.menu_items)
      .find({})
      .sort({ category: 1, order: 1, createdAt: 1 })
      .toArray();

    return new Response(JSON.stringify(items.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }))), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Menu fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch menu items' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, description, price, category, tags, imageUrl } = body;

    if (!name?.trim() || !category || !VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ error: 'name and valid category required' }), { status: 400 });
    }

    const db = await getDb();
    const count = await db.collection(COLLECTIONS.menu_items).countDocuments({ category });

    const doc = {
      name: String(name).trim(),
      description: String(description || '').trim(),
      price: Number(price) || 0,
      category: String(category),
      tags: parseTags(tags),
      imageUrl: String(imageUrl || '').trim(),
      order: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.menu_items).insertOne(doc);
    return new Response(JSON.stringify({ ok: true, id: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error('Menu create error:', err);
    return new Response(JSON.stringify({ error: 'Failed to add menu item' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, description, price, category, tags, imageUrl } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = String(name).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (price !== undefined) update.price = Number(price) || 0;
    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return new Response(JSON.stringify({ error: 'invalid category' }), { status: 400 });
      }
      update.category = String(category);
    }
    if (tags !== undefined) update.tags = parseTags(tags);
    if (imageUrl !== undefined) update.imageUrl = String(imageUrl).trim();

    const db = await getDb();
    await db.collection(COLLECTIONS.menu_items).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Menu update error:', err);
    return new Response(JSON.stringify({ error: 'Failed to update menu item' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.menu_items).deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Menu delete error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete menu item' }), { status: 500 });
  }
};
