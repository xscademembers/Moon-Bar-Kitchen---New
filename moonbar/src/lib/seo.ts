export interface PageMeta {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'Moon Bar & Kitchen';
const DEFAULT_DESCRIPTION =
  'Rooftop resto-bar in Siripuram, Visakhapatnam. Cocktails, live music, Sunday brunch & the best rooftop views in Vizag.';

export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE_NAME} | Best Resto Bar in Vizag`;
  return `${pageTitle} | ${SITE_NAME}`;
}

export function buildCanonical(path = '/'): string {
  const base = 'https://moonbarandkitchen.in';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function defaultMeta(overrides: Partial<PageMeta> = {}): PageMeta {
  return {
    title: buildTitle(),
    description: DEFAULT_DESCRIPTION,
    path: '/',
    ogImage: '/og/cover.jpg',
    ...overrides,
  };
}
