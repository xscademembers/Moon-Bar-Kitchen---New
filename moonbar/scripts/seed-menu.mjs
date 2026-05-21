import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dns from 'node:dns';

if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch {
    // ignore
  }
}

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnv();

const menuCategories = [
  {
    slug: 'veg',
    items: [
      { name: 'Crispy Tempura Vegetables', description: 'Seasonal vegetables in light rice batter, wasabi mayo', price: 425, tags: ['chef-pick'] },
      { name: 'Truffle Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan crisp', price: 495, tags: [] },
      { name: 'Paneer Tikka Skewers', description: 'Smoky tandoori paneer, mint chutney', price: 375, tags: ['spicy'] },
      { name: 'Garden Fresh Salad', description: 'Mixed greens, citrus vinaigrette, candied walnuts', price: 325, tags: ['vegan'] },
    ],
  },
  {
    slug: 'non-veg',
    items: [
      { name: 'Moon Bar Tempura Prawns', description: 'Tiger prawns, tempura batter, spicy mayo — our signature', price: 595, tags: ['chef-pick'] },
      { name: 'Andhra Spiced Chicken Wings', description: 'Crispy wings, gongura glaze, pickled onion', price: 445, tags: ['spicy'] },
      { name: 'Grilled Fish Tacos', description: 'Catch of the day, slaw, chipotle crema', price: 525, tags: [] },
      { name: 'Lamb Seekh Kebab', description: 'Minced lamb, charred peppers, roomali roti', price: 475, tags: [] },
    ],
  },
  {
    slug: 'beverages',
    items: [
      { name: 'Harvest Moon Old Fashioned', description: 'Bourbon, demerara, orange bitters, smoked cherry', price: 595, tags: ['chef-pick'] },
      { name: 'Cosmic Mule', description: 'Vodka, ginger beer, lime, copper mug', price: 425, tags: [] },
      { name: 'Stellar Negroni', description: 'Gin, campari, sweet vermouth, orange peel', price: 545, tags: [] },
      { name: 'Moonlight Mojito', description: 'White rum, fresh mint, lime, soda', price: 395, tags: [] },
    ],
  },
];

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'moonbar';

if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const collection = client.db(dbName).collection('menu_items');

const existing = await collection.countDocuments();
if (existing > 0) {
  console.log(`Skipping seed: ${existing} menu items already exist.`);
  await client.close();
  process.exit(0);
}

const now = new Date();
const docs = [];

for (const category of menuCategories) {
  category.items.forEach((item, index) => {
    docs.push({
      name: item.name,
      description: item.description,
      price: item.price,
      category: category.slug,
      tags: item.tags,
      imageUrl: '',
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  });
}

const result = await collection.insertMany(docs);
console.log(`Seeded ${result.insertedCount} menu items.`);
await client.close();
