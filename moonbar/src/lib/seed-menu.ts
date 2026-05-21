import { menuCategories } from '../data/mock';
import { COLLECTIONS, getDb } from './mongodb';

export function getDefaultMenuItems() {
  const items: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
    tags: string[];
    imageUrl: string;
    order: number;
  }> = [];

  for (const category of menuCategories) {
    category.items.forEach((item, index) => {
      items.push({
        name: item.name,
        description: item.description,
        price: item.price,
        category: category.slug,
        tags: item.tags,
        imageUrl: '',
        order: index,
      });
    });
  }

  return items;
}

export async function seedMenuItems(force = false) {
  const db = await getDb();
  const collection = db.collection(COLLECTIONS.menu_items);
  const existing = await collection.countDocuments();

  if (existing > 0 && !force) {
    return { inserted: 0, skipped: true, existing };
  }

  if (force && existing > 0) {
    await collection.deleteMany({});
  }

  const now = new Date();
  const docs = getDefaultMenuItems().map((item) => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));

  const result = await collection.insertMany(docs);
  return { inserted: result.insertedCount, skipped: false, existing: 0 };
}
