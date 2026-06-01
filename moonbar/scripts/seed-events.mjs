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

const events = [
  { day: 'Wednesday', title: 'Live Band Night', artist: 'TBD', time: '8:00 PM – 11:00 PM', description: 'Acoustic sets under the stars — live music every Wednesday.', color: '#BA401D' },
  { day: 'Friday', title: 'House Friday', artist: 'DJ TBD', time: '8:00 PM – 11:00 PM', description: 'Deep house grooves and elevated vibes to kick off the weekend.', color: '#BB5524' },
  { day: 'Saturday', title: 'Bollytech Saturday', artist: 'DJ TBD', time: '8:00 PM – 11:00 PM', description: "Bollywood meets tech house — Vizag's favourite Saturday night.", color: '#E7A356' },
  { day: 'Sunday', title: 'Sunday Brunch', artist: 'Buffet + bottomless mimosas', time: '12:00 PM – 4:00 PM', description: 'Lazy Sunday brunch with live ambience and city views.', color: '#FFDA7F' },
  { day: 'Sunday Evening', title: 'Sunday Live Band', artist: 'TBD', time: '7:30 PM – 10:30 PM', description: 'Wind down the weekend with live music and craft cocktails.', color: '#7F6F34' },
];

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'moonbar';

if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const collection = client.db(dbName).collection('events');

const existing = await collection.countDocuments();
if (existing > 0) {
  console.log(`Skipping seed: ${existing} events already exist.`);
  await client.close();
  process.exit(0);
}

const now = new Date();
const docs = events.map((event, index) => ({
  ...event,
  order: index,
  createdAt: now,
  updatedAt: now,
}));

const result = await collection.insertMany(docs);
console.log(`Seeded ${result.insertedCount} events.`);
await client.close();
