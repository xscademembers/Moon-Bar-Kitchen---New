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
    imageUrl: event.imageUrl || '',
    order: index,
  }));
}

export async function seedEvents(force = false, merge = false) {
  const db = await getDb();
  const collection = db.collection(COLLECTIONS.events);
  const existing = await collection.countDocuments();

  if (existing > 0 && merge) {
    const existingTitles = new Set(
      (await collection.find({}, { projection: { title: 1 } }).toArray()).map(
        (doc) => doc.title as string
      )
    );
    const missing = getDefaultEvents().filter((event) => !existingTitles.has(event.title));

    if (missing.length === 0) {
      return { inserted: 0, skipped: true, existing, merged: true };
    }

    const last = await collection.find({}).sort({ order: -1 }).limit(1).toArray();
    let nextOrder = ((last[0]?.order as number) ?? -1) + 1;
    const now = new Date();
    const docs = missing.map((item) => ({
      ...item,
      order: nextOrder++,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await collection.insertMany(docs);
    return { inserted: result.insertedCount, skipped: false, existing, merged: true };
  }

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
