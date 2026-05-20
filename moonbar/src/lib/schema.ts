export const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Moon Bar & Kitchen',
  image: 'https://moonbarandkitchen.in/og/cover.jpg',
  url: 'https://moonbarandkitchen.in',
  telephone: '+91-95871-92999',
  priceRange: '₹₹',
  servesCuisine: ['Indian', 'Continental', 'Asian', 'Cocktails'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '4th Floor, VIP Rd, above Westside, CBM Compound, Siripuram',
    addressLocality: 'Visakhapatnam',
    addressRegion: 'AP',
    postalCode: '530003',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.7311,
    longitude: 83.3169,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:00',
    },
  ],
  acceptsReservations: true,
  sameAs: [
    'https://www.instagram.com/moonbarandkitchen',
    'https://www.facebook.com/moonbarandkitchen',
    'https://g.page/moonbarandkitchen',
  ],
};
