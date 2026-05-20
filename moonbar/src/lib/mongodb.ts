import { MongoClient, type Db } from 'mongodb';
import { MONGODB_URI, MONGODB_DB } from 'astro:env/server';
import dns from 'node:dns';

// Some local networks refuse SRV DNS queries, which breaks the mongodb+srv://
// resolution. Point Node's resolver to public DNS so Atlas can be looked up.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // setServers may throw on certain platforms; ignore and fall back to system DNS
}

let client: MongoClient;
let db: Db;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (import.meta.env.DEV && global._mongoClient) {
    client = global._mongoClient;
    db = client.db(MONGODB_DB);
    return db;
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(MONGODB_DB);

  if (import.meta.env.DEV) {
    global._mongoClient = client;
  }

  return db;
}

export const COLLECTIONS = {
  reservations: 'reservations',
  gallery: 'gallery',
  blog_posts: 'blog_posts',
} as const;
