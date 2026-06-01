import { weeklyEvents } from '../data/mock';
import { COLLECTIONS, getDb } from './mongodb';

export function getDefaultEvents() {
  return weeklyEvents.map((event, index) => ({
    day: event.day,
    title: event.title,
    artist: event.artist,
    time: event.time,
    description: event.description,
    color: event.color,
    order: index,
  }));
}

export async function seedEvents(force = false) {
  const db = await getDb();
  const collection = db.collection(COLLECTIONS.events);
  const existing = await collection.countDocuments();

  if (existing > 0 && !force) {
    return { inserted: 0, skipped: true, existing };
  }

  if (force && existing > 0) {
    await collection.deleteMany({});
  }

  const now = new Date();
  const docs = getDefaultEvents().map((item) => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs);
  return { inserted: result.insertedCount, skipped: false, existing: 0 };
}
