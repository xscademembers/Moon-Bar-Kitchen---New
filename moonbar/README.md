# Moon Bar & Kitchen — Website

Celestial-themed restaurant website for Moon Bar & Kitchen, Visakhapatnam.

**Stack:** Astro 6 + Tailwind CSS v4 + React (islands) + GSAP
**Deploy target:** Vercel (static, zero-config)

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # builds to ./dist
npm run preview  # serves the built site locally
```

## Deploying to Vercel

The project is fully static and Vercel auto-detects Astro — no adapter needed for Phase 1.

### Option A — Vercel Dashboard (recommended)

1. Push the `moonbar/` folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. **Important:** if `moonbar/` is a sub-folder inside a larger repo, set
   **Root Directory** → `moonbar` in the project settings.
4. Vercel will auto-fill these (already pinned in `vercel.json`):
   - Framework: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
   - Node version: **22.x** (set via `.nvmrc`)
5. Click **Deploy**. First build takes ~2 minutes.

### Option B — Vercel CLI

```bash
npm install -g vercel
cd moonbar
vercel              # follow prompts, link to project
vercel --prod       # deploy to production
```

### Custom domain (moonbarandkitchen.in)

After the first deploy:
1. Vercel → Project → Settings → Domains → **Add** `moonbarandkitchen.in`.
2. Follow Vercel's DNS instructions (either nameservers or `A`/`CNAME` records).
3. SSL is auto-provisioned.

## What's included for Vercel

- **`vercel.json`** — framework config + cache headers for `/_astro/*`, fonts, images, `robots.txt`, `llms.txt`, `sitemap-index.xml`, plus baseline security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
- **`.nvmrc`** — pins Node 22 to match the Astro 6 engine requirement.
- **`.vercelignore`** — keeps `node_modules`, `dist`, `.env*`, logs, and editor files out of deploys.
- **`.gitignore`** — standard Astro ignores already in place.

## Color palette

| Token | Hex | Usage |
|-------|-----|-------|
| Olive | `#414C2F` | Surfaces, wheel segments |
| Burnt Orange | `#BA401D` | Primary CTAs |
| Rust | `#BB5524` | Hover states |
| Olive Brown | `#7F6F34` | Tags, accents |
| Golden Yellow | `#FFDA7F` | Moon glow, highlights |
| Cream | `#F9E1CD` | Body text |
| Sandy Orange | `#E7A356` | Warm accents |

## Pages

- `/` — Hero, spin wheel, events, menu preview, blog, visit us
- `/menu` — Full menu with Veg / Non-Veg / Beverages tabs
- `/events` — Weekly events schedule
- `/blog` — SEO blog index + individual posts
- `/about` — Restaurant story
- `/contact` — Address, hours, embedded Google Map

## Phase 1 status

This is the **Phase 1 public site** from the implementation spec — static content with mock data, deployable to Vercel as-is.

Next phases (will require switching `astro.config.mjs` to hybrid output and adding `@astrojs/vercel`):
- Supabase database + API routes (`/api/spin`, `/api/reserve`, `/api/availability`)
- Admin panel
- WhatsApp Cloud API integration
- Real photography
