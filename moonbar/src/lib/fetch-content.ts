import { getDb, COLLECTIONS } from './mongodb';
import { galleryItems as fallbackGallery, type GalleryItem } from '../data/gallery';
import { blogPosts as fallbackBlog } from '../data/mock';

export type DbGalleryItem = GalleryItem & { imageUrl?: string };

// Wrap any promise so a hanging DB call never exceeds the function timeout.
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    p.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

async function fetchGalleryItemsInner(): Promise<DbGalleryItem[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.gallery)
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    if (docs.length === 0) return fallbackGallery;

    return docs.map((doc) => ({
      id: doc._id.toString(),
      label: doc.label as string,
      category: doc.category as GalleryItem['category'],
      emoji: (doc.emoji as string) || '🌙',
      imageUrl: (doc.imageUrl as string) || '',
    }));
  } catch {
    return fallbackGallery;
  }
}

export function fetchGalleryItems(): Promise<DbGalleryItem[]> {
  return withTimeout(fetchGalleryItemsInner(), 5000, fallbackGallery);
}

async function fetchBlogPostsInner(publishedOnly = true) {
  try {
    const db = await getDb();
    const filter = publishedOnly ? { published: true } : {};
    const docs = await db
      .collection(COLLECTIONS.blog_posts)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    if (docs.length === 0) return fallbackBlog;

    return docs.map((doc) => ({
      slug: doc.slug as string,
      title: doc.title as string,
      excerpt: doc.excerpt as string,
      tag: doc.tag as string,
      date: (doc.date as string) || new Date(doc.createdAt as Date).toISOString().split('T')[0],
      readingTime: (doc.readingTime as number) || 5,
      llmSummary: (doc.llmSummary as string) || (doc.excerpt as string),
      body: (doc.body as string) || '',
    }));
  } catch {
    return fallbackBlog;
  }
}

export function fetchBlogPosts(publishedOnly = true) {
  return withTimeout(fetchBlogPostsInner(publishedOnly), 5000, fallbackBlog);
}

export async function fetchBlogPostBySlug(slug: string) {
  const posts = await fetchBlogPosts(true);
  return posts.find((p) => p.slug === slug) ?? null;
}
