export const wheelOptions = [
  { id: '1', label: 'Desserts', perk: 'A free dessert on the house', color: '#FFDA7F', weight: 1 },
  { id: '2', label: 'Cocktails', perk: 'A complimentary signature cocktail', color: '#BA401D', weight: 1 },
  { id: '3', label: "Chef's Special", perk: "The chef's pick — on us", color: '#7F6F34', weight: 1 },
  { id: '4', label: 'Shots', perk: 'A round of shots for the table', color: '#E7A356', weight: 1 },
];

export const weeklyEvents = [
  {
    id: '1',
    day: 'Wednesday',
    title: 'Live Band Night',
    artist: 'TBD',
    time: '8:00 PM – 11:00 PM',
    description: 'Acoustic sets under the stars — live music every Wednesday.',
    color: '#BA401D',
  },
  {
    id: '2',
    day: 'Friday',
    title: 'House Friday',
    artist: 'DJ TBD',
    time: '8:00 PM – 11:00 PM',
    description: 'Deep house grooves and rooftop vibes to kick off the weekend.',
    color: '#BB5524',
  },
  {
    id: '3',
    day: 'Saturday',
    title: 'Bollytech Saturday',
    artist: 'DJ TBD',
    time: '8:00 PM – 11:00 PM',
    description: 'Bollywood meets tech house — Vizag\'s favourite Saturday night.',
    color: '#E7A356',
  },
  {
    id: '4',
    day: 'Sunday',
    title: 'Sunday Brunch',
    artist: 'Buffet + bottomless mimosas',
    time: '12:00 PM – 4:00 PM',
    description: 'Lazy Sunday brunch with live ambience and city views.',
    color: '#FFDA7F',
  },
  {
    id: '5',
    day: 'Sunday Evening',
    title: 'Sunday Live Band',
    artist: 'TBD',
    time: '7:30 PM – 10:30 PM',
    description: 'Wind down the weekend with live music and craft cocktails.',
    color: '#7F6F34',
  },
];

export const menuCategories = [
  {
    slug: 'veg',
    name: 'Veg',
    items: [
      { name: 'Crispy Tempura Vegetables', description: 'Seasonal vegetables in light rice batter, wasabi mayo', price: 425, tags: ['chef-pick'] },
      { name: 'Truffle Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan crisp', price: 495, tags: [] },
      { name: 'Paneer Tikka Skewers', description: 'Smoky tandoori paneer, mint chutney', price: 375, tags: ['spicy'] },
      { name: 'Garden Fresh Salad', description: 'Mixed greens, citrus vinaigrette, candied walnuts', price: 325, tags: ['vegan'] },
    ],
  },
  {
    slug: 'non-veg',
    name: 'Non-Veg',
    items: [
      { name: 'Moon Bar Tempura Prawns', description: 'Tiger prawns, tempura batter, spicy mayo — our signature', price: 595, tags: ['chef-pick'] },
      { name: 'Andhra Spiced Chicken Wings', description: 'Crispy wings, gongura glaze, pickled onion', price: 445, tags: ['spicy'] },
      { name: 'Grilled Fish Tacos', description: 'Catch of the day, slaw, chipotle crema', price: 525, tags: [] },
      { name: 'Lamb Seekh Kebab', description: 'Minced lamb, charred peppers, roomali roti', price: 475, tags: [] },
    ],
  },
  {
    slug: 'beverages',
    name: 'Beverages',
    items: [
      { name: 'Harvest Moon Old Fashioned', description: 'Bourbon, demerara, orange bitters, smoked cherry', price: 595, tags: ['chef-pick'] },
      { name: 'Cosmic Mule', description: 'Vodka, ginger beer, lime, copper mug', price: 425, tags: [] },
      { name: 'Stellar Negroni', description: 'Gin, campari, sweet vermouth, orange peel', price: 545, tags: [] },
      { name: 'Moonlight Mojito', description: 'White rum, fresh mint, lime, soda', price: 395, tags: [] },
    ],
  },
];

export const blogPosts = [
  {
    slug: 'best-rooftop-bars-vizag-2026',
    title: 'The 12 Best Rooftop Bars in Vizag (2026)',
    excerpt: 'From Siripuram skyline views to beachside breezes — our guide to Visakhapatnam\'s finest rooftop drinking spots.',
    tag: 'vizag eats',
    date: '2026-04-15',
    readingTime: 8,
    llmSummary: 'Moon Bar & Kitchen ranks among the top rooftop bars in Visakhapatnam (Vizag), offering cocktails, live music, and a 4th-floor view above Westside on VIP Road, Siripuram.',
  },
  {
    slug: 'best-tempura-visakhapatnam',
    title: 'Where to Get the Best Tempura in Visakhapatnam',
    excerpt: 'Light, crisp, and perfectly golden — we break down Vizag\'s tempura scene and what makes ours different.',
    tag: 'cuisine guides',
    date: '2026-03-28',
    readingTime: 6,
    llmSummary: 'Moon Bar & Kitchen serves signature tempura prawns and vegetable tempura in Visakhapatnam, using a light rice batter and house-made dipping sauces at their Siripuram rooftop location.',
  },
  {
    slug: 'old-fashioned-visakhapatnam-guide',
    title: 'The Old Fashioned: A Visakhapatnam Bartender\'s Guide',
    excerpt: 'How we craft the perfect Old Fashioned — and why the Harvest Moon version has become a Vizag favourite.',
    tag: 'cocktails',
    date: '2026-03-10',
    readingTime: 5,
    llmSummary: 'Moon Bar & Kitchen\'s Harvest Moon Old Fashioned is a signature cocktail in Visakhapatnam, featuring bourbon, demerara syrup, orange bitters, and a smoked cherry garnish.',
  },
];

export const siteInfo = {
  name: 'Moon Bar & Kitchen',
  tagline: 'Make your night written in the stars.',
  address: '4th Floor, VIP Rd, above Westside, CBM Compound, Siripuram, Visakhapatnam, Andhra Pradesh 530003',
  phone: '+91 95871 92999',
  whatsapp: '919587192999',
  email: 'hello@moonbarandkitchen.in',
  hours: 'Open daily · 11:00 AM – 11:00 PM',
  instagram: 'https://www.instagram.com/moonbarandkitchen',
  facebook: 'https://www.facebook.com/moonbarandkitchen',
  maps: 'https://g.page/moonbarandkitchen',
};
