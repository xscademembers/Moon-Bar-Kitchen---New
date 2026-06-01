import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { sortEventsByWeekOrder } from '../../../lib/fetch-content';
import { getDb, COLLECTIONS } from '../../../lib/mongodb';

const DEFAULT_COLOR = '#BB5524';

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const items = await db.collection(COLLECTIONS.events).find({}).toArray();
    const byId = new Map(items.map((doc) => [doc._id.toString(), doc]));
    const sorted = sortEventsByWeekOrder(
      items.map((doc) => ({
        id: doc._id.toString(),
        day: doc.day as string,
        title: doc.title as string,
        artist: (doc.artist as string) || '',
        time: doc.time as string,
        description: (doc.description as string) || '',
        color: (doc.color as string) || DEFAULT_COLOR,
        imageUrl: (doc.imageUrl as string) || '',
      }))
    );

    return new Response(
      JSON.stringify(
        sorted.map((event) => {
          const doc = byId.get(event.id)!;
          return { ...doc, _id: event.id };
        })
      ),
      {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Events fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch events' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { day, title, artist, time, description, color, imageUrl } = body;

    if (!day?.trim() || !title?.trim() || !time?.trim()) {
      return new Response(JSON.stringify({ error: 'day, title, and time required' }), { status: 400 });
    }

    const db = await getDb();
    const count = await db.collection(COLLECTIONS.events).countDocuments();

    const doc = {
      day: String(day).trim(),
      title: String(title).trim(),
      artist: String(artist || '').trim(),
      time: String(time).trim(),
      description: String(description || '').trim(),
      color: String(color || DEFAULT_COLOR).trim(),
      imageUrl: String(imageUrl || '').trim(),
      order: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.events).insertOne(doc);
    return new Response(JSON.stringify({ ok: true, id: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error('Events create error:', err);
    return new Response(JSON.stringify({ error: 'Failed to add event' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, day, title, artist, time, description, color, imageUrl, order } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (day !== undefined) update.day = String(day).trim();
    if (title !== undefined) update.title = String(title).trim();
    if (artist !== undefined) update.artist = String(artist).trim();
    if (time !== undefined) update.time = String(time).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (color !== undefined) update.color = String(color).trim();
    if (imageUrl !== undefined) update.imageUrl = String(imageUrl).trim();
    if (order !== undefined) update.order = Number(order) || 0;

    const db = await getDb();
    await db.collection(COLLECTIONS.events).updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Events update error:', err);
    return new Response(JSON.stringify({ error: 'Failed to update event' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.events).deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Events delete error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete event' }), { status: 500 });
  }
};
