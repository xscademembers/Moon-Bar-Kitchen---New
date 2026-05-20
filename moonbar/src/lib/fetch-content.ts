import { getDb, COLLECTIONS } from './mongodb';
import { galleryItems as fallbackGallery, type GalleryItem } from '../data/gallery';
import { blogPosts as fallbackBlog } from '../data/mock';

export type DbGalleryItem = GalleryItem & { imageUrl?: string };

export async function fetchGalleryItems(): Promise<DbGalleryItem[]> {
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

export async function fetchBlogPosts(publishedOnly = true) {
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

export async function fetchBlogPostBySlug(slug: string) {
  const posts = await fetchBlogPosts(true);
  return posts.find((p) => p.slug === slug) ?? null;
}
