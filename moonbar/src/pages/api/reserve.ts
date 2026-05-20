import type { APIRoute } from 'astro';
import { getDb, COLLECTIONS } from '../../lib/mongodb';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, phone, date, time, people, prizeLabel, prizePerk } = body;

    if (!name?.trim() || !phone?.trim() || !date || !time) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const db = await getDb();
    const doc = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      date: String(date),
      time: String(time),
      people: people ? Number(people) : null,
      prizeLabel: prizeLabel || null,
      prizePerk: prizePerk || null,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    const result = await db.collection(COLLECTIONS.reservations).insertOne(doc);

    return new Response(JSON.stringify({ ok: true, id: result.insertedId }), { status: 201 });
  } catch (err) {
    console.error('Reserve error:', err);
    return new Response(JSON.stringify({ error: 'Failed to save reservation' }), { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
};
