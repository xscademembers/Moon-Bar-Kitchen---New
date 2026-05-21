export interface GalleryItem {
  id: string;
  category: 'ambience' | 'food' | 'drinks' | 'events';
  emoji: string;
  span?: 'normal' | 'wide' | 'tall';
}

export const galleryCategories = [
  { slug: 'all', label: 'All' },
  { slug: 'ambience', label: 'Ambience' },
  { slug: 'food', label: 'Food' },
  { slug: 'drinks', label: 'Drinks' },
  { slug: 'events', label: 'Events' },
] as const;

export const galleryItems: GalleryItem[] = [
  { id: '1', category: 'ambience', emoji: '🌃', span: 'wide' },
  { id: '2', category: 'drinks', emoji: '🍸' },
  { id: '3', category: 'events', emoji: '🎵' },
  { id: '4', category: 'food', emoji: '🍤', span: 'tall' },
  { id: '5', category: 'food', emoji: '☀️' },
  { id: '6', category: 'ambience', emoji: '🌙' },
  { id: '7', category: 'events', emoji: '🎶', span: 'wide' },
  { id: '8', category: 'drinks', emoji: '🥃' },
  { id: '9', category: 'food', emoji: '🍽️' },
  { id: '10', category: 'ambience', emoji: '✨' },
  { id: '11', category: 'events', emoji: '🎧' },
  { id: '12', category: 'drinks', emoji: '🍹', span: 'tall' },
];

/** Subset shown on the homepage preview */
export const galleryPreviewItems = galleryItems.slice(0, 6);
