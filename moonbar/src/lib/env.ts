/** Server-only env access. Uses process.env so Vercel builds don't fail when secrets aren't set at build time. */
function read(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  mongodbUri: read('MONGODB_URI'),
  mongodbDb: read('MONGODB_DB', 'moonbar'),
  adminUsername: read('ADMIN_USERNAME', 'admin'),
  adminPassword: read('ADMIN_PASSWORD'),
  sessionSecret: read('SESSION_SECRET'),
};
