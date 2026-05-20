import type { APIRoute } from 'astro';
import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '../../../lib/mongodb';

export const GET: APIRoute = async () => {
  try {
    const db = await getDb();
    const reservations = await db
      .collection(COLLECTIONS.reservations)
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return new Response(JSON.stringify(reservations), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Reservations fetch error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch reservations' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'id and status required' }), { status: 400 });
    }

    const db = await getDb();
    await db.collection(COLLECTIONS.reservations).updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('Reservation update error:', err);
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 });
  }
};
