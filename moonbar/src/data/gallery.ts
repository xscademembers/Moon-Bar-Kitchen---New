export interface GalleryItem {
  id: string;
  label: string;
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
  { id: '1', label: 'City Views from the 4th Floor', category: 'ambience', emoji: '🌃', span: 'wide' },
  { id: '2', label: 'Harvest Moon Old Fashioned', category: 'drinks', emoji: '🍸' },
  { id: '3', label: 'Live Band Night', category: 'events', emoji: '🎵' },
  { id: '4', label: 'Signature Tempura Prawns', category: 'food', emoji: '🍤', span: 'tall' },
  { id: '5', label: 'Sunday Brunch Spread', category: 'food', emoji: '☀️' },
  { id: '6', label: 'Night Ambience', category: 'ambience', emoji: '🌙' },
  { id: '7', label: 'Bollytech Saturday', category: 'events', emoji: '🎶', span: 'wide' },
  { id: '8', label: 'Craft Cocktail Bar', category: 'drinks', emoji: '🥃' },
  { id: '9', label: 'Plated Chef\'s Special', category: 'food', emoji: '🍽️' },
  { id: '10', label: 'Moonlit Dining', category: 'ambience', emoji: '✨' },
  { id: '11', label: 'House Friday DJ Set', category: 'events', emoji: '🎧' },
  { id: '12', label: 'Cosmic Mule', category: 'drinks', emoji: '🍹', span: 'tall' },
];

/** Subset shown on the homepage preview */
export const galleryPreviewItems = galleryItems.slice(0, 6);
