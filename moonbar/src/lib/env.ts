/** Server-only env access. Reads process.env (Vercel) and import.meta.env (Astro dev .env). */
function read(key: string, fallback = ''): string {
  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;

  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  if (fromMeta) return fromMeta;

  return fallback;
}

export const env = {
  mongodbUri: read('MONGODB_URI'),
  mongodbDb: read('MONGODB_DB', 'moonbar'),
  adminUsername: read('ADMIN_USERNAME', 'admin'),
  adminPassword: read('ADMIN_PASSWORD'),
  sessionSecret: read('SESSION_SECRET'),
};
