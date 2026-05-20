# Moon Bar & Kitchen — Website Implementation Specification

**Client:** Moon Bar & Kitchen, Visakhapatnam
**Address:** 4th Floor, VIP Rd, above Westside, CBM Compound, Siripuram, Visakhapatnam, Andhra Pradesh 530003
**Existing site:** http://moonbarandkitchen.in/
**Document version:** 1.0
**Stack:** Astro (Hybrid SSR/SSG) + Tailwind + Supabase (Postgres + Auth + Storage)
**Audience:** Web developers and AI coding assistants (Claude)

---

## 1. Project Overview

### 1.1 What we're building
A fast, SEO-first restaurant website with a celestial "Moon & Space" theme, an interactive **Spin-the-Wheel** lead capture on the hero, a referral/share mechanic that gives friends a free perk, a weekly **Events** module, a CRUD-managed **Menu**, and a **Blog** that drives organic and AI search traffic for keywords like *"best resto bars in Vizag"* and *"best place to eat tempura in Visakhapatnam"*.

### 1.2 Primary goals
1. Rank on page 1 for **"best resto bars in vizag"**, **"best restaurants in Visakhapatnam"**, and long-tail dish/cuisine queries within 6 months.
2. Capture reservations directly through the site with an engaging gamified flow (spin-the-wheel) instead of a static form.
3. Drive virality through a referral link that hands the friend a real perk.
4. Give Moon Bar staff full self-serve control of wheel options, events, menu items, and blog content via an admin panel.
5. Become a citable source for LLM-driven search (ChatGPT, Perplexity, Google AI Overviews, Claude).

### 1.3 Non-goals
- E-commerce / online ordering (out of scope for v1; can be added later).
- Native mobile app (the site must be best-in-class mobile web).
- Customer accounts / loyalty (admin auth only for v1).

---

## 2. Tech Stack & Architecture

### 2.1 Stack decisions (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 5+ (Hybrid mode)** | Best-in-class SEO out of the box, ships zero JS by default, partial hydration ("islands") for interactive bits like the wheel. SSG for marketing/blog pages, SSR for admin and reservation API. |
| Styling | **Tailwind CSS v4** + custom CSS variables | Fast to iterate, easy to enforce moon/space theme tokens. |
| Interactive islands | **React** (used sparingly via `client:load` / `client:visible`) | The spin-the-wheel and admin forms only. Everything else stays static. |
| Animations | **GSAP** + **Framer Motion** (in React islands only) | Wheel spin physics + scroll-triggered parallax stars. |
| Database | **Supabase (Postgres)** | Hosted Postgres + Row Level Security + Storage for images + Auth for admin. One vendor, low ops overhead. Free tier is enough to start. |
| Auth | **Supabase Auth** (email+password, magic link for admin) | Restricted to admin users only. |
| File/image storage | **Supabase Storage** | Menu images, event cover images, blog images. Served behind Astro's image optimizer. |
| Email | **Resend** | Reservation confirmations, share link emails, review-request follow-ups. |
| Messaging | **WhatsApp Cloud API (Meta)** | All customer and owner messaging (no SMS). Reservation confirmations, status updates, reminders, referral notifications. Indian carrier delivery is excellent and free within 1,000 conversations/month. |
| Hosting (web) | **Vercel** or **Cloudflare Pages** | Vercel has best Astro support; Cloudflare Pages is cheaper at scale. Recommend Vercel for v1. |
| Domain / DNS | Existing `moonbarandkitchen.in` | Migrate DNS to Cloudflare for performance + analytics. |
| Analytics | **Plausible** (privacy-friendly) + **Google Search Console** + **Bing Webmaster Tools** | GSC and Bing are non-negotiable for SEO measurement. |

### 2.2 High-level architecture

```
                ┌─────────────────────────────────────────────────┐
                │                 Browser (visitor)               │
                │  Astro static pages + React islands (wheel UI)  │
                └───────────────────────┬─────────────────────────┘
                                        │ HTTPS
                ┌───────────────────────▼─────────────────────────┐
                │              Astro app on Vercel                │
                │  ┌──────────────┐   ┌──────────────────────┐    │
                │  │ Static pages │   │ /api/* SSR endpoints │    │
                │  │ (SSG, ISR)   │   │ - /api/spin          │    │
                │  │ - /          │   │ - /api/reserve       │    │
                │  │ - /menu      │   │ - /api/share/[code]  │    │
                │  │ - /events    │   │ - /api/admin/*       │    │
                │  │ - /blog/*    │   └──────────┬───────────┘    │
                │  └──────────────┘              │                │
                └────────────────────────────────┼────────────────┘
                                                 │ service-role key
                                  ┌──────────────▼──────────────┐
                                  │          Supabase           │
                                  │  Postgres │ Auth │ Storage  │
                                  └─────────────────────────────┘
                                                 │
                                  ┌──────────────▼──────────────┐
                                  │ Resend (email) │ WhatsApp   │
                                  │                │ Cloud API  │
                                  └─────────────────────────────┘
```

### 2.3 Repo layout

```
moonbar/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── public/
│   ├── llms.txt
│   ├── robots.txt
│   ├── favicon/
│   └── og/                         # generated OG images
├── src/
│   ├── pages/
│   │   ├── index.astro             # home (with hero wheel)
│   │   ├── menu.astro
│   │   ├── events.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── reserve/
│   │   │   ├── confirm.astro
│   │   │   └── [shareCode].astro   # friend lands here from share link
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── admin/
│   │   │   ├── login.astro
│   │   │   ├── index.astro         # dashboard
│   │   │   ├── wheel.astro
│   │   │   ├── events.astro
│   │   │   ├── menu.astro
│   │   │   ├── blog/
│   │   │   │   ├── index.astro
│   │   │   │   └── [id].astro
│   │   │   ├── reservations.astro
│   │   │   └── shares.astro
│   │   └── api/
│   │       ├── spin.ts             # POST { sessionId } -> wheel result
│   │       ├── reserve.ts          # POST reservation
│   │       ├── share/[code].ts     # GET resolve share code
│   │       └── admin/
│   │           ├── wheel.ts
│   │           ├── events.ts
│   │           ├── menu.ts
│   │           ├── blog.ts
│   │           └── reservations.ts
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── SpinWheel.tsx           # React island
│   │   ├── ReservationForm.tsx     # React island
│   │   ├── EventsGrid.astro
│   │   ├── MenuTabs.astro
│   │   ├── BlogCard.astro
│   │   ├── Starfield.tsx           # canvas background
│   │   ├── MoonPhase.astro
│   │   ├── SchemaOrg.astro         # JSON-LD per page
│   │   └── admin/...
│   ├── layouts/
│   │   ├── BaseLayout.astro        # head, meta, schema, footer
│   │   └── AdminLayout.astro
│   ├── lib/
│   │   ├── supabase.ts             # browser client
│   │   ├── supabaseAdmin.ts        # service-role server-only client
│   │   ├── wheel.ts                # spin algorithm
│   │   ├── share.ts                # share-code generation + redemption
│   │   ├── seo.ts                  # meta helpers
│   │   └── schema.ts               # JSON-LD builders
│   ├── content/                    # Astro Content Collections (blog drafts)
│   └── styles/
│       └── globals.css
└── supabase/
    ├── migrations/                 # SQL migrations
    └── seed.sql
```

---

## 3. Brand, Theme & Visual Direction

### 3.1 Concept
The brand is **Moon Bar & Kitchen** — lean fully into the celestial metaphor. The site should feel like stepping into a rooftop bar at night: a deep midnight sky, a luminous moon, drifting stars, and warm amber accents from the city lights and cocktail glow below.

### 3.2 Color tokens

```css
:root {
  /* Sky */
  --mb-midnight: #07091a;
  --mb-deep-space: #0f1430;
  --mb-nebula: #1c1644;
  --mb-aurora: #3a2a73;

  /* Moonlight */
  --mb-moon-bone: #f4f1e8;     /* primary text on dark */
  --mb-moon-soft: #d9d3c0;
  --mb-moon-crater: #8f877a;

  /* Bar lights (warm accent) */
  --mb-amber: #f5b454;         /* primary CTA */
  --mb-amber-glow: #ffd58a;
  --mb-copper: #c97a3a;

  /* Cocktail accents (use sparingly) */
  --mb-cosmic-pink: #ff6ba6;
  --mb-aurora-teal: #4fd1c5;

  /* Functional */
  --mb-success: #6ee7b7;
  --mb-warn: #fbbf24;
  --mb-error: #f87171;
}
```

### 3.3 Type
- **Display:** *Cormorant Garamond* (serif, italics on tagline) — elegance, fine-dining cue.
- **Body:** *Inter* — clean, readable, modern.
- **Accent / micro:** *Space Grotesk* — for numerics, prices, event timings (ties into "space" wordplay).

Load via Astro's `@fontsource` packages (self-hosted, no Google FOIT).

### 3.4 Motion & feel
- A subtle animated **starfield** behind the hero (Canvas, low-power; pauses on `prefers-reduced-motion`).
- **Moon parallax**: the moon graphic in the hero shifts slightly as the user scrolls.
- **Section transitions**: gentle fade + 12px upward translate on scroll-in (Intersection Observer; CSS only, no library needed).
- The wheel spin uses **GSAP easing** (`power4.out`, 5–7 second decay) for that satisfying "is it going to land on mine?" tension.

### 3.5 Imagery
- Photography: dim, moody, plated food and cocktails shot on dark backgrounds. Replace any existing flat / overexposed images.
- Iconography: thin-stroke line icons (use **Lucide** via React island where needed; static SVG inlines elsewhere).

---

## 4. Information Architecture

### 4.1 Sitemap
```
/                         Home (hero + wheel + events + menu preview + about + contact)
/menu                     Full menu (Veg / Non-Veg / Beverages)
/events                   Full weekly events + any upcoming specials
/about                    About Moon Bar, the team, the rooftop
/contact                  Contact, location, hours, embedded Google Map
/reserve/confirm          Post-reservation confirmation + shareable link
/reserve/[shareCode]      Friend's landing page (claim a perk)
/blog                     Blog index
/blog/[slug]              Individual post
/admin                    Admin (login-gated)
```

### 4.2 Header nav
`Home · Menu · Events · Blog · About · Contact` — plus a prominent **"Reserve a Table"** button that scroll-locks to the hero wheel on the home page (or routes to `/#wheel` from any other page).

### 4.3 Footer
- Quick links (same as nav)
- Address with Google Maps link
- Phone / WhatsApp (clickable)
- Operating hours
- Social: Instagram, Facebook, Google Reviews
- Newsletter signup (optional — Resend audience)
- Copyright + privacy policy + terms

---

## 5. Page-by-Page Requirements

### 5.1 Home (`/`)
**Sections in order:**
1. **Hero with Spin-the-Wheel** — full viewport on desktop. Headline: *"Make your night written in the stars."* Subhead: *"Spin the moon. Claim your perk. Reserve your table."* CTA: scroll to wheel.
2. **The Wheel** — see §6.
3. **This Week at Moon Bar** — events grid (see §7).
4. **Menu Preview** — 3 cards (Veg / Non-Veg / Beverages) linking to `/menu`.
5. **About strip** — short copy + rooftop photo + "Read more" → `/about`.
6. **From the Blog** — 3 most recent posts.
7. **Visit Us** — map + address + hours + phone.
8. **Footer.**

**SEO target:** *best resto bars in vizag*, *rooftop bar Visakhapatnam*, *Siripuram restaurants*.

### 5.2 Menu (`/menu`)
- Tabbed UI: **Veg | Non-Veg | Beverages** (URL-synced: `?cat=veg`).
- Each item card: image, name, short description, price (₹), tags (e.g., "spicy", "chef's pick", "contains nuts").
- Filterable by sub-tags if present.
- **SEO:** individual menu items are *not* separate pages in v1, but each is wrapped in `<article itemscope itemtype="https://schema.org/MenuItem">` so Google can read the full menu structure for "tempura in Visakhapatnam"–style queries. v1.5 can elevate top dishes to own pages.

### 5.3 Events (`/events`)
- Hero strip: *"Every night has a soundtrack."*
- **Weekly recurring grid** (Wed Band / Fri House / Sat Bollytech / Sun Brunch + Sun Evening Band) — admin-editable cover, artist, time, blurb.
- **Upcoming one-off specials** (e.g., New Year's, Diwali) — admin-creatable with specific dates.

### 5.4 Blog (`/blog` and `/blog/[slug]`)
- Index: card grid, filterable by tag (e.g., *cocktails*, *cuisine guides*, *vizag eats*).
- Post page: hero image, title, author, published date, reading time, body (rendered markdown), related posts, share buttons.
- Each post supports a **"For LLMs" summary block** at the top — a 2–3 sentence factual TL;DR that LLMs can lift into answers (see §11.5).

### 5.5 About (`/about`)
Story of the space, the chef(s), the rooftop, the city. Add Schema.org `Restaurant` markup.

### 5.6 Contact (`/contact`)
- Address, phone, WhatsApp deep-link, email, hours table.
- Embedded Google Map (lazy-loaded `<iframe>` or static map image with click-to-open — the latter is better for Core Web Vitals).
- Direct link to Google Maps listing.

### 5.7 Reservation confirmation (`/reserve/confirm`)
After a successful reservation:
- Big "🌙 Confirmed!" with reservation summary.
- Prize won on the wheel.
- **Share block** (only if `num_people > 0`): pre-filled message + copy-to-clipboard button + WhatsApp / Instagram DM / X share buttons.
- "Add to Google Calendar" link.

### 5.8 Friend landing (`/reserve/[shareCode]`)
- Personalized greeting: *"{ReferrerName} thinks you should join them at Moon Bar — spin the moon and get your perk on the house."*
- Same wheel UI, but the wheel result is **auto-flagged as a referral redemption** in the backend.
- Standard reservation form follows. On submit, the friend gets the perk + a record links back to the referrer.

---

## 6. Spin-the-Wheel — Detailed Spec

### 6.1 User flow
1. User lands on home, scrolls / clicks to wheel section.
2. They see a glowing circular wheel with N segments (default 4: Desserts / Cocktails / Chef's Special / Shots).
3. They click **"Spin the Moon"**. The wheel spins 5–7 seconds with GSAP easing and lands on a segment.
4. Result modal: *"Tonight, the moon grants you a free **{prize}**."*
5. Modal CTA: **"Lock it in — reserve your table."** Opens reservation form (name, phone, # of people [optional], date, time).
6. On submit, the row is written to `customers` (with the prize and a generated `share_code`).
7. If `num_people > 0`, the confirmation screen shows a copyable share link `https://moonbarandkitchen.in/reserve/{shareCode}`.
8. Anyone who lands via that link also spins and reserves; their row links back via `referred_by`.

### 6.2 Spin algorithm
Server-side, in `/api/spin`. **Never trust the client** for the result — only the animation. Otherwise spam scripts can game it.

```ts
// src/lib/wheel.ts
export async function pickWheelOutcome(supabase) {
  const { data: options } = await supabase
    .from('wheel_options')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (!options?.length) throw new Error('No active wheel options');

  // Each option has an integer `weight` (default 1). Higher weight = more likely.
  // Admin can use weights to bias the wheel (e.g., promote slow-moving items).
  const totalWeight = options.reduce((s, o) => s + o.weight, 0);
  const roll = Math.random() * totalWeight;
  let acc = 0;
  for (const o of options) {
    acc += o.weight;
    if (roll < acc) return o;
  }
  return options[options.length - 1];
}
```

The client receives `{ optionId, label, perk, segmentIndex }` from the API and animates the wheel to land on `segmentIndex` (deterministic angle = `360 * 6 + (segmentIndex * segmentAngle) + jitterWithinSegment`).

### 6.3 Wheel UI implementation notes
- Built in **React** as a single island (`src/components/SpinWheel.tsx`), hydrated with `client:visible`.
- The wheel itself is **SVG** (one `<g>` per segment), not Canvas — so it remains crisp, accessible, and themable with CSS variables.
- Each segment is colored using a HSL gradient derived from the option's `color` field (admin-pickable).
- Center has a moon icon; pointer is a triangle at 12 o'clock.
- A subtle bloom/glow filter (`feGaussianBlur` + `feMerge`) gives the wheel its lunar feel.
- Accessibility: the spin button has an `aria-live="polite"` region that announces the result. Screen reader users get the prize as text, no animation required.
- `prefers-reduced-motion`: skip the spin animation, just reveal the result with a fade.
- Throttle: one spin per session (localStorage flag) until the user reserves, to prevent spam re-spinning.

### 6.4 Reservation form fields

| Field | Type | Required | Validation |
|---|---|---|---|
| Name | text | ✅ | 2–60 chars, trimmed |
| Phone | tel | ✅ | Indian mobile regex `^[6-9]\d{9}$`; can prepend +91 server-side |
| Number of people | int | ❌ (optional) | 1–20 |
| Reservation date | date | ✅ | Must be today + within 60 days |
| Reservation time | time | ✅ | 11:00 – 22:30 in 30-min increments (last seating 30 min before close) |
| Special requests | textarea | ❌ | ≤ 300 chars |

### 6.5 Capacity / availability

The site **enforces a slot cap** of **10 reservations per 30-minute slot** by default. The cap is admin-configurable from `Settings → Reservations` (writes to `site_settings.reservation_slot_cap`).

How it works:
- `/api/reserve` runs an atomic count check inside a Postgres transaction:
  ```sql
  -- pseudocode inside a SERIALIZABLE transaction
  select count(*) from customers
   where reservation_date = $date
     and reservation_time = $time
     and status in ('pending','confirmed','seated');
  -- if >= reservation_slot_cap, reject with 409 Conflict
  ```
- If the slot is full, the API returns `{ error: 'slot_full', alternatives: [...] }` with the next 3 nearest available slots on the same date.
- On the reservation form the time-picker pre-fetches `/api/availability?date=YYYY-MM-DD` and renders full slots as disabled.
- Admin can override and force-book a full slot from the admin panel (a confirm-modal prevents accidents).

A banner still appears post-submit: *"Booking received — we'll WhatsApp you to confirm within 30 minutes."*

---

## 7. Events Module

### 7.1 Default weekly events (seed data)

| Day | Title | Default artist/description | Default time |
|---|---|---|---|
| Wednesday | **Live Band Night** | TBD by admin | 8:00 PM – 11:00 PM |
| Friday | **House Friday** | DJ TBD | 8:00 PM – 11:00 PM |
| Saturday | **Bollytech Saturday** | DJ TBD | 8:00 PM – 11:00 PM |
| Sunday (day) | **Sunday Brunch** | Buffet + bottomless mimosas | 12:00 PM – 4:00 PM |
| Sunday (evening) | **Sunday Live Band** | TBD | 7:30 PM – 10:30 PM |

> Outlet hours are 11:00 AM – 11:00 PM daily. All event times are admin-editable; the times above are seed values only.

### 7.2 Admin-editable fields per event
- Cover image (Supabase Storage)
- Title
- Artist / band name (optional)
- Day of week (enum)
- Start / end time
- Short description (≤ 200 chars)
- Long description (markdown, optional)
- Is active (boolean — to temporarily hide e.g. during summer break)
- Display order

### 7.3 One-off events
A separate concept (`events_specials` table) for dated events like New Year's. Surfaces above the weekly grid until the date passes.

---

## 8. Menu Module

### 8.1 Categories (fixed in v1)
- Veg
- Non-Veg
- Beverages

Stored as `menu_categories` rows (slug, name, display_order). Admin can reorder but in v1 cannot add new top-level categories. (Add this as a v1.5 feature flag.)

### 8.2 Menu item fields
- Name (required)
- Description (optional, ≤ 300 chars)
- Price ₹ (required, integer paise OR decimal; store as numeric(10,2))
- Category (FK)
- Image (Supabase Storage, optional but strongly encouraged)
- Tags (e.g., spicy, chef-pick, contains-nuts, vegan, gluten-free) — comma-separated or jsonb array
- Is available (boolean — temp 86'd)
- Display order
- SEO: `meta_description` override (optional)

### 8.3 Display
Tabbed; each tab is its own anchor `#veg`, `#non-veg`, `#beverages`. Items render in a 1-col mobile / 2-col tablet / 3-col desktop grid.

---

## 9. Blog Module — The SEO + AI-SEO Engine

### 9.1 Content strategy
The blog is the primary tool for SEO + LLM citation. Target topic clusters:

| Cluster | Sample post titles | Target keywords |
|---|---|---|
| **City eats** | "The 12 Best Rooftop Bars in Vizag (2026)" | best rooftop bar vizag, restaurants in visakhapatnam |
| **Dish guides** | "Where to Get the Best Tempura in Visakhapatnam" | tempura vizag, japanese food visakhapatnam |
| **Cocktail education** | "The Old Fashioned: A Visakhapatnam Bartender's Guide" | best old fashioned vizag |
| **Pairing & culture** | "What to Drink With Andhra Biryani" | andhra biryani pairing |
| **Behind the scenes** | "Meet the Chef at Moon Bar Visakhapatnam" | moon bar chef visakhapatnam |
| **Event recaps** | "Saturday Bollytech at Moon Bar — Recap & Photos" | bollytech night vizag |

Aim for **2 posts/month** at launch, scaling to **1/week** after month 3.

### 9.2 Post structure (template)
1. **For LLMs** block — 2–3 sentence factual TL;DR (gets a `<section data-llm-summary>` and is also included in the Article schema `description`).
2. **Quick answer** — one-paragraph direct answer to the post's question (Google "featured snippet" hook).
3. **TOC** (auto-generated from H2s).
4. Body, with H2 / H3 headings phrased as natural questions where possible.
5. **Local context** — every post mentions Visakhapatnam / Vizag and links to the relevant Moon Bar page (menu, events, contact).
6. **FAQ block** at the bottom, marked up as `FAQPage` schema.
7. Internal links to 3–5 related posts.

### 9.3 Author + E-E-A-T
- All posts have a named author (admin user) with a bio + photo.
- Posts can cite the chef/bartender by name with a quote — strong E-E-A-T signal.

### 9.4 Markdown features
- Astro Content Collections handle markdown.
- Custom components inside MDX: `<Callout>`, `<DishCard slug="tempura"/>` (auto-pulls from menu), `<EventCard day="friday"/>`.

---

## 10. Database Schema (Supabase / Postgres)

All tables use `id uuid primary key default gen_random_uuid()` and `created_at timestamptz default now()` unless noted.

```sql
-- 10.1 admins (managed by Supabase Auth; this is a profile table)
create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'editor', -- 'owner' | 'editor'
  created_at timestamptz default now()
);

-- 10.2 wheel_options
-- `weight` is fully admin-configurable from the dashboard.
-- If every active option has the same weight (e.g. all 1), the wheel behaves as a
-- uniform random pick. Admin can bias the wheel toward cheaper perks by raising
-- their weight (e.g. shots=4, dessert=2, cocktail=1, chef's special=1).
create table wheel_options (
  id uuid primary key default gen_random_uuid(),
  label text not null,                          -- "Desserts"
  perk_description text not null,               -- "A free dessert on the house"
  color text not null default '#f5b454',
  weight int not null default 1 check (weight >= 0),
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10.3 spins (one row per server-validated spin; lets us audit if abused)
create table spins (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,                     -- anonymous browser session
  option_id uuid references wheel_options(id),
  via_share_code text,                          -- if from a referral link
  user_agent text,
  ip_hash text,                                 -- sha256 of IP+secret (privacy)
  created_at timestamptz default now()
);

-- 10.4 customers (reservations)
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  num_people int,                               -- nullable on purpose
  reservation_date date not null,
  reservation_time time not null,
  prize_option_id uuid references wheel_options(id),
  prize_label_snapshot text,                    -- snapshot in case admin renames option later
  perk_snapshot text,
  spin_id uuid references spins(id),
  share_code text unique,                       -- generated only if num_people > 0
  referred_by_share_code text,                  -- nullable; if filled, this customer came in via a referral
  special_requests text,
  status text not null default 'pending',       -- pending | confirmed | seated | no_show | cancelled
  staff_notes text,
  created_at timestamptz default now()
);
create index on customers (reservation_date);
create index on customers (share_code);
create index on customers (referred_by_share_code);

-- 10.5 shares (analytics on referral links — optional but useful)
create table share_events (
  id uuid primary key default gen_random_uuid(),
  share_code text not null,
  event_type text not null,                     -- 'click' | 'reservation'
  meta jsonb,
  created_at timestamptz default now()
);

-- 10.6 events (weekly recurring)
create table events_weekly (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sun..6=Sat
  slot text not null default 'evening',          -- 'day' | 'evening'  (Sunday has both)
  title text not null,
  artist_name text,
  description text,
  long_description_md text,
  cover_image_path text,                         -- Supabase Storage path
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10.7 events_specials (one-off dated events)
create table events_specials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_path text,
  event_date date not null,
  start_time time,
  end_time time,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 10.8 menu_categories
create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                     -- 'veg' | 'non-veg' | 'beverages'
  name text not null,
  display_order int default 0
);

-- 10.9 menu_items
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_path text,
  tags text[] default '{}',
  is_available boolean default true,
  is_chefs_pick boolean default false,
  display_order int default 0,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10.10 site_settings (k/v store for runtime-tunable values)
create table site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now(),
  updated_by uuid references admin_profiles(id)
);

-- Seed defaults
insert into site_settings (key, value, description) values
  ('reservation_slot_cap',      '10',                                           'Max reservations per 30-minute slot. Editable from the admin Settings page.'),
  ('reservation_slot_minutes',  '30',                                           'Width of a reservation slot in minutes.'),
  ('reservation_open_time',     '"11:00"',                                      'First bookable slot.'),
  ('reservation_close_time',    '"22:30"',                                      'Last bookable slot (kitchen closes 30 min before listed closing time).'),
  ('reservation_advance_days',  '60',                                           'How many days ahead a customer can book.'),
  ('confirmation_window_mins',  '30',                                           'Promised confirmation window shown to customers.'),
  ('whatsapp_owner_number',     '"+919587192999"',                              'Owner number to receive new-reservation pings.');

-- 10.11 blog_posts
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  llm_summary text,                              -- the "For LLMs" block
  body_md text not null,
  cover_image_path text,
  author_id uuid references admin_profiles(id),
  tags text[] default '{}',
  meta_title text,
  meta_description text,
  keywords text[] default '{}',
  faq jsonb,                                     -- [{q, a}, ...] for FAQPage schema
  published_at timestamptz,
  is_published boolean default false,
  reading_time_minutes int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on blog_posts (slug);
create index on blog_posts (is_published, published_at desc);
```

### 10.12 Row-Level Security (RLS)
All tables: RLS **enabled**. Two policy sets:
- **Public read** for `wheel_options (is_active)`, `events_weekly (is_active)`, `events_specials (is_active)`, `menu_categories`, `menu_items (is_available)`, `blog_posts (is_published)`. No public writes.
- **Authenticated admin** (Supabase JWT with `role in ('owner','editor')`): full CRUD on all admin tables. Use a Postgres function `is_admin()` that checks `admin_profiles`.

`customers`, `spins`, `share_events`: **no public access at all**. All writes go through Astro SSR endpoints using the **service role key** (server-side env var, never exposed to the browser).

---

## 11. SEO & AI-SEO Strategy

### 11.1 Core requirements
- **Lighthouse SEO score: 100.** Non-negotiable.
- **Performance score ≥ 90 on mobile**, with **LCP < 2.0s** on 4G.
- Every page has a unique `<title>` (≤ 60 chars) and `meta description` (≤ 155 chars).
- Canonical URLs on every page.
- Mobile-first responsive (Tailwind breakpoints).
- All images served via Astro `<Image>` (AVIF/WebP fallback) with descriptive `alt`.
- Internal linking: hero → menu, blog → menu items, events → reservation.

### 11.2 `sitemap.xml`
Use `@astrojs/sitemap`. Auto-generates from all routes; include blog posts (filter to `is_published`). Re-generated on build + via a cron-triggered rebuild when blog posts are published from the admin panel (Vercel deploy hook).

```js
// astro.config.mjs (excerpt)
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://moonbarandkitchen.in',
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin'),
    changefreq: 'weekly',
    priority: 0.7,
    serialize(item) {
      if (item.url.endsWith('/')) return { ...item, priority: 1.0 };
      if (item.url.includes('/blog/')) return { ...item, priority: 0.8, changefreq: 'monthly' };
      return item;
    }
  })]
});
```

Submit to Google Search Console and Bing Webmaster Tools on launch.

### 11.3 `robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# Be explicit-friendly to AI crawlers
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: CCBot
Allow: /

Sitemap: https://moonbarandkitchen.in/sitemap-index.xml
```

### 11.4 `llms.txt`
A markdown-formatted summary at `/llms.txt` for LLM crawlers (see the proposed standard at llmstxt.org).

```
# Moon Bar & Kitchen

> Rooftop bar and restaurant in Siripuram, Visakhapatnam (Vizag), Andhra Pradesh.
> Known for cocktails, multi-cuisine menu, live music Wed–Sun, Sunday brunch, and rooftop ambience.

## About
Moon Bar & Kitchen is a rooftop resto-bar located on the 4th floor above Westside,
VIP Road, CBM Compound, Siripuram, Visakhapatnam 530003. Open daily, 11 AM to 11 PM.

## Key info
- Address: 4th Floor, VIP Rd, above Westside, CBM Compound, Siripuram, Visakhapatnam, AP 530003
- Phone / WhatsApp: +91 95871 92999
- Hours: Open daily 11:00 AM – 11:00 PM (Monday through Sunday)
- Cuisine: Multi-cuisine — Indian, Continental, Asian, with full bar
- Best known for: rooftop view, cocktails, live music, Sunday brunch
- Reservations: https://moonbarandkitchen.in/#wheel (spin the wheel for a free perk)

## Weekly events
- Wednesday: Live band (8:30 PM – 11:30 PM)
- Friday: House Friday DJ (9:00 PM – 1:00 AM)
- Saturday: Bollytech (Bollywood + Tech house) DJ (9:00 PM – 1:00 AM)
- Sunday brunch: 12:00 PM – 4:00 PM
- Sunday evening: Live band (7:30 PM – 10:30 PM)

## Menu sections
- /menu#veg — vegetarian dishes
- /menu#non-veg — non-vegetarian dishes
- /menu#beverages — cocktails, mocktails, beer, wine, spirits

## Docs
- [Menu](https://moonbarandkitchen.in/menu): Full food and beverage menu.
- [Events](https://moonbarandkitchen.in/events): Weekly schedule + upcoming specials.
- [Blog](https://moonbarandkitchen.in/blog): Food and bar guides for Visakhapatnam.
- [About](https://moonbarandkitchen.in/about): Story, team, location.
- [Contact](https://moonbarandkitchen.in/contact): Hours, map, phone, WhatsApp.

## Optional
- [Reservations work via a "Spin the Moon" wheel](https://moonbarandkitchen.in/#wheel) that grants a free perk (dessert, cocktail, chef's special, or shots).
```

### 11.5 JSON-LD schema (per page)

**Site-wide (in `BaseLayout.astro`)** — `Restaurant` schema:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Moon Bar & Kitchen",
  "image": "https://moonbarandkitchen.in/og/cover.jpg",
  "url": "https://moonbarandkitchen.in",
  "telephone": "+91-95871-92999",
  "priceRange": "₹₹",
  "servesCuisine": ["Indian", "Continental", "Asian", "Cocktails"],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4th Floor, VIP Rd, above Westside, CBM Compound, Siripuram",
    "addressLocality": "Visakhapatnam",
    "addressRegion": "AP",
    "postalCode": "530003",
    "addressCountry": "IN"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 17.7311, "longitude": 83.3169 },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "11:00", "closes": "23:00" }
  ],
  "acceptsReservations": "True",
  "sameAs": [
    "https://www.instagram.com/moonbarandkitchen",
    "https://www.facebook.com/moonbarandkitchen",
    "https://g.page/moonbarandkitchen"
  ]
}
</script>
```

**Menu page** — `Menu` + nested `MenuSection` + `MenuItem` schema generated from the DB.

**Blog post page** — `Article` + `BreadcrumbList` + `FAQPage` (if FAQ block present).

**Events page** — `Event` schema for each entry.

### 11.6 Content optimizations for AI search
- **Direct-answer paragraphs** at the top of every blog post (LLMs lift these).
- **Named entity richness**: explicitly mention "Visakhapatnam (Vizag)", "Andhra Pradesh", "Siripuram", "CBM Compound" in body copy where natural — LLMs index entity associations.
- **Structured "facts" sections** (e.g., a table of "10 best tempura spots") — easy for LLMs to extract.
- **Author bios** with credentials — increases citation trustworthiness.
- **Update dates** visibly displayed — LLMs favor recent content.

### 11.7 Local SEO
- Claim and complete the Google Business Profile (link provided).
- Embed Google Maps on `/contact`.
- Add **NAP consistency** (Name, Address, Phone) — identical wording everywhere (site, GBP, Justdial, Zomato, Swiggy listings).
- Encourage Google reviews via the post-reservation email.
- Build local citations on Zomato, Justdial, EazyDiner, MagicPin.

---

## 12. Admin Panel

### 12.1 Auth
- **Single owner account** (one Supabase Auth user, role `owner`). The `admin_profiles` table supports more roles in the future, but v1 ships with just the owner.
- Magic-link or email+password via Supabase Auth.
- All `/admin/*` routes are SSR + protected by a middleware that checks `is_admin()`.
- 2FA strongly recommended for the owner account.
- Bootstrap: the owner account is created via a one-time invite link generated with `ADMIN_INVITE_SECRET`.

### 12.2 Modules

| Module | Capability |
|---|---|
| **Dashboard** | Today's reservations, last 7 days, conversion funnel (spins → reservations), top wheel outcomes |
| **Wheel** | CRUD on `wheel_options`: label, perk text, color, weight, order, active toggle. Live preview of the wheel. |
| **Events (Weekly)** | CRUD on `events_weekly`. Drag-reorder. Image upload to Supabase Storage. |
| **Events (Specials)** | CRUD on `events_specials` |
| **Menu** | CRUD on `menu_items` + reorder categories. Bulk toggle availability (e.g., "86 items"). |
| **Blog** | CRUD on `blog_posts`. Markdown editor (use [TipTap](https://tiptap.dev) or a simple monaco editor). Image upload. Preview. Schedule publish. |
| **Reservations** | List, filter by date, status. Status updates (confirm / seated / no-show / cancel). Export CSV. |
| **Shares** | Leaderboard of share codes by clicks and conversions. |
| **Settings** | All `site_settings` keys editable from a single page: reservation slot cap (default **10**), slot width, open/close times, advance booking window, WhatsApp owner number, etc. Every change is timestamped and stamped with `updated_by`. |

### 12.3 UX notes
- Build the admin in plain Astro pages + minimal React islands for forms (using **React Hook Form** + **Zod** validation).
- Use **TanStack Table** for data grids.
- All forms have optimistic UI + toast notifications (use **sonner**).
- Image upload component: drag-drop + crop (use **react-easy-crop**).

---

## 13. API Endpoints (Astro SSR)

All API endpoints live under `src/pages/api/`. All accept/return JSON.

### 13.1 Public endpoints

| Method | Path | Purpose | Body |
|---|---|---|---|
| `POST` | `/api/spin` | Server-validated spin | `{ sessionId, viaShareCode? }` |
| `GET` | `/api/availability?date=YYYY-MM-DD` | Returns array of 30-min slots with remaining capacity | — |
| `POST` | `/api/reserve` | Create reservation. Rejects with 409 + alternate slots if cap reached. | `{ sessionId, spinId, name, phone, numPeople?, date, time, specialRequests? }` |
| `GET` | `/api/share/:code` | Resolve a share code (used by friend's landing page) | — |
| `POST` | `/api/webhooks/whatsapp` | Meta WhatsApp Cloud API webhook — receives delivery/read receipts and inbound replies | Meta payload |

### 13.2 Admin endpoints (auth required)
- `GET / POST / PATCH / DELETE` for each resource:
  - `/api/admin/wheel`
  - `/api/admin/wheel/:id`
  - `/api/admin/events/weekly[, /:id]`
  - `/api/admin/events/specials[, /:id]`
  - `/api/admin/menu/categories[, /:id]`
  - `/api/admin/menu/items[, /:id]`
  - `/api/admin/blog[, /:id]`
  - `/api/admin/reservations[, /:id]`
  - `/api/admin/uploads` (signed URL for Supabase Storage)

### 13.3 Rate limiting
- `/api/spin` and `/api/reserve`: max 5 spins / 3 reservations per IP per hour (use [Upstash Ratelimit](https://github.com/upstash/ratelimit) on Vercel Edge).
- Admin endpoints: standard Supabase Auth + IP-based throttle.

### 13.4 Sample: `/api/spin` (illustrative)

```ts
// src/pages/api/spin.ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { pickWheelOutcome } from '@/lib/wheel';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const { sessionId, viaShareCode } = await request.json();
  if (!sessionId) return new Response('Missing sessionId', { status: 400 });

  // Rate limit (pseudo)
  // if (await isThrottled(clientAddress)) return new Response('Too many spins', { status: 429 });

  const option = await pickWheelOutcome(supabaseAdmin);

  const { data: spin } = await supabaseAdmin.from('spins').insert({
    session_id: sessionId,
    option_id: option.id,
    via_share_code: viaShareCode || null,
    user_agent: request.headers.get('user-agent'),
    ip_hash: await hashIp(clientAddress),
  }).select().single();

  // segmentIndex used by client for landing-angle calc
  const { data: allActive } = await supabaseAdmin
    .from('wheel_options')
    .select('id')
    .eq('is_active', true)
    .order('display_order');
  const segmentIndex = allActive.findIndex(o => o.id === option.id);

  return new Response(JSON.stringify({
    spinId: spin.id,
    optionId: option.id,
    label: option.label,
    perk: option.perk_description,
    color: option.color,
    segmentIndex,
    totalSegments: allActive.length,
  }), { headers: { 'content-type': 'application/json' } });
};
```

---

## 14. Share / Referral Mechanic

### 14.1 Generating the share code
On reservation submit, if `num_people > 0`:
- Generate a 7-char base58 code (e.g., `nanoid` with custom alphabet — exclude `0OIl`).
- Save to `customers.share_code`.
- Return URL to client: `https://moonbarandkitchen.in/reserve/{code}`.

### 14.2 Pre-filled share message
> "Hey! I just booked a table at Moon Bar Visakhapatnam 🌙 — they let me spin a wheel and I won {prize_label}. You get one too if you book through my link: {url}"

Provide buttons: **WhatsApp**, **Copy link**, **Instagram DM** (uses `instagram://sharesheet` deep link, falls back to copy), **X/Twitter**.

### 14.3 Friend's flow
- `/reserve/[code]` loads. We call `/api/share/{code}` to:
  - Verify the code is real and active.
  - Get the referrer's first name for personalization.
  - Log a `share_events` row of type `click`.
- Friend spins, gets a result, fills the form. On submit:
  - `customers.referred_by_share_code = code`.
  - `share_events` row of type `reservation` is logged.

### 14.4 Abuse considerations
- A single share code is unlimited use in v1 (deliberate — virality > fraud risk for a small business). If abuse appears, add a per-code redemption cap in admin settings.
- Same-phone-number reservations are flagged in the admin (one customer using their own link).

---

## 15. Performance & Core Web Vitals

| Metric | Target | How |
|---|---|---|
| LCP | < 2.0s mobile | Hero image preloaded; moon SVG inline; fonts self-hosted with `font-display: swap` |
| INP | < 200ms | No JS on most pages; only the wheel + admin hydrate |
| CLS | < 0.05 | All images have explicit width/height; reserve space for the wheel SVG |
| TTFB | < 500ms | Vercel Edge; static pages via ISR |
| JS shipped on home | < 50 KB gzip | Use `client:visible` for the wheel; everything else server-rendered |
| Image format | AVIF with WebP fallback | Astro Image |
| Caching | Aggressive | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on Astro pages; `immutable` on hashed assets |

Run **Lighthouse CI** on every PR; fail the build if perf < 85 or SEO < 100.

---

## 16. Accessibility (WCAG 2.2 AA)

- Color contrast: midnight backgrounds with bone-white text easily clear AAA.
- Wheel: must be operable by keyboard. Spin button gets focus; result is announced via `aria-live`.
- All interactive elements have visible focus rings (custom amber glow, not the browser default).
- Forms: `<label>` associated to every input; error messages tied via `aria-describedby`.
- Skip-to-content link.
- `prefers-reduced-motion` honored throughout (starfield + wheel + scroll animations).

---

## 17. Security & Privacy

- Service-role Supabase key only used server-side (Astro API routes), **never** shipped to the browser.
- Anon key in the browser is fine but RLS must be airtight.
- `customers` and `spins` are PII-bearing — never expose via public read; admin-only.
- Hash IPs (sha256 + secret) before storage in `spins` for analytics — do not store raw IPs.
- HTTPS only; HSTS preload.
- CSP header (strict): `default-src 'self'; script-src 'self' 'unsafe-inline' plausible.io; img-src 'self' data: *.supabase.co; ...`
- Honeypot field on the reservation form to block dumb bots. Optional Turnstile/hCaptcha if abuse appears.
- GDPR/India DPDP-friendly: a privacy policy page; a checkbox on the reservation form: *"I agree to be contacted about my reservation."*
- Cookies: none beyond a session ID and the wheel-spin localStorage flag. Show a minimal cookie/privacy note in the footer rather than a full banner.

---

## 18. Messaging & Notification Flows (WhatsApp Cloud API + Email)

All customer-facing messaging uses the **WhatsApp Cloud API (Meta)**. There is **no SMS**. Email (Resend) is used only as a secondary channel for review-request follow-ups and as a fallback when WhatsApp delivery fails.

### 18.1 Setup prerequisites

1. **Meta Business Manager** account verified for the client.
2. **WhatsApp Business Account (WABA)** linked to a phone number (use **+91 95871 92999** — the published business number).
3. App created at developers.facebook.com → WhatsApp product enabled.
4. **System User** with a permanent access token (saved in `WHATSAPP_ACCESS_TOKEN`).
5. **Phone Number ID** + **WABA ID** saved as env vars.
6. **Webhook** at `/api/webhooks/whatsapp` registered with Meta; verify token in `WHATSAPP_VERIFY_TOKEN`.
7. **Approved message templates** (templates are required for outbound messages outside the 24-hour customer-initiated window — all of ours are outbound).

### 18.2 Message templates to submit for Meta approval

Submit these in Meta Business Manager → WhatsApp Manager → Message Templates. Category: **UTILITY** for transactional, **MARKETING** for review/referral.

| Template name | Category | Variables | Body |
|---|---|---|---|
| `reservation_received` | UTILITY | `{{1}}` name, `{{2}}` date, `{{3}}` time, `{{4}}` people, `{{5}}` perk | "🌙 Hi {{1}}! We've received your booking at Moon Bar for {{2}} at {{3}} ({{4}} guests). Your spin perk: *{{5}}*. We'll confirm within 30 minutes." |
| `reservation_confirmed` | UTILITY | `{{1}}` name, `{{2}}` date, `{{3}}` time, `{{4}}` perk | "🌙 Confirmed, {{1}}! See you on {{2}} at {{3}}. Don't forget your perk: *{{4}}*. Reply here to change anything." |
| `reservation_cancelled` | UTILITY | `{{1}}` name, `{{2}}` date | "Hi {{1}}, your Moon Bar reservation for {{2}} has been cancelled. Reply to rebook or call +91 95871 92999." |
| `reservation_reminder_24h` | UTILITY | `{{1}}` name, `{{2}}` time | "Tonight at Moon Bar 🌙 See you at {{2}}, {{1}}. Tap for directions: https://moonbarandkitchen.in/contact" |
| `owner_new_reservation` | UTILITY | `{{1}}` name, `{{2}}` phone, `{{3}}` date, `{{4}}` time, `{{5}}` people, `{{6}}` perk | "New booking 🌙 {{1}} ({{2}}) — {{3}} at {{4}} for {{5}} guests. Perk: {{6}}. Open admin to confirm." |
| `referrer_friend_booked` | MARKETING | `{{1}}` referrer name, `{{2}}` friend first name, `{{3}}` date | "Hey {{1}}! 🌙 {{2}} just booked at Moon Bar using your link for {{3}}. The drinks are on the moon. See you both then." |
| `review_request` | MARKETING | `{{1}}` name | "Hope you had a great night at Moon Bar, {{1}} 🌙 If you did, a quick Google review would mean the world: {{review_link}}" |

Each template should also include a header image (moon logo) and a footer ("Moon Bar & Kitchen, Visakhapatnam") for brand consistency.

### 18.3 Flow matrix

| Trigger | Recipient | Template | Channel(s) |
|---|---|---|---|
| Reservation submitted | Customer | `reservation_received` | WhatsApp |
| Reservation submitted | Owner | `owner_new_reservation` | WhatsApp to `whatsapp_owner_number` |
| Status → `confirmed` (admin click) | Customer | `reservation_confirmed` | WhatsApp |
| Status → `cancelled` (admin click) | Customer | `reservation_cancelled` | WhatsApp |
| 24h before reservation | Customer | `reservation_reminder_24h` | WhatsApp (cron) |
| Friend reservation via share code | Original referrer | `referrer_friend_booked` | WhatsApp |
| 48h after reservation | Customer | `review_request` | WhatsApp + email fallback |

### 18.4 Implementation

```ts
// src/lib/whatsapp.ts
const WA_API = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export async function sendTemplate(opts: {
  to: string;                // E.164, e.g. "+919876543210"
  template: string;          // e.g. "reservation_received"
  language?: string;         // default "en"
  components: any[];         // Meta's template component spec
}) {
  const res = await fetch(WA_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: opts.to.replace(/[^\d]/g, ''),
      type: 'template',
      template: {
        name: opts.template,
        language: { code: opts.language ?? 'en' },
        components: opts.components,
      },
    }),
  });
  const body = await res.json();
  await logMessage({ ...opts, providerResponse: body, ok: res.ok });
  if (!res.ok) throw new Error(`WhatsApp send failed: ${JSON.stringify(body)}`);
  return body;
}
```

### 18.5 Webhook (`/api/webhooks/whatsapp`)

- **GET** handles Meta's verification handshake (echo `hub.challenge` if `hub.verify_token` matches).
- **POST** receives delivery / read receipts and any inbound replies from customers. Persist to `message_log`. Inbound replies notify the owner WhatsApp (so customer questions reach a human).

### 18.6 Logging table

```sql
create table message_log (
  id uuid primary key default gen_random_uuid(),
  channel text not null,                  -- 'whatsapp' | 'email'
  direction text not null,                -- 'outbound' | 'inbound'
  to_address text,
  from_address text,
  template_name text,
  customer_id uuid references customers(id),
  provider_message_id text,
  status text,                            -- 'sent' | 'delivered' | 'read' | 'failed'
  payload jsonb,
  error text,
  created_at timestamptz default now()
);
```

### 18.7 Failure handling

- If a WhatsApp send returns a non-2xx (number not on WhatsApp, opted out, etc.), the admin reservation row shows a red "WhatsApp failed" badge so the owner can call manually.
- If `review_request` fails on WhatsApp, automatically fall through to email if the customer provided one.
- Rate limits: WhatsApp Cloud API allows 1,000 free conversations/month and tiered messaging limits beyond that. Monitor in Meta Business Manager.

---

## 19. Implementation Roadmap

### Phase 0 — Pre-flight (Week 0)
- [ ] Domain audit; set up DNS at Cloudflare.
- [ ] Create Supabase project; run base migrations.
- [ ] Create Vercel project; wire Supabase env vars.
- [ ] Create GitHub repo with the layout in §2.3.
- [ ] Stand up Resend + verified sending domain (`hello@moonbarandkitchen.in`).
- [ ] **WhatsApp Cloud API onboarding**: verify Meta Business, create WABA, attach +91 95871 92999, generate permanent system-user token, submit all message templates in §18.2 for approval (Meta approval takes 1–3 business days — start early).
- [ ] Set up GSC + Bing Webmaster Tools (verify with DNS TXT).
- [ ] Draft Privacy Policy + Terms of Service (use a Visakhapatnam-appropriate India DPDP-compliant template; have the client review).

### Phase 1 — Core public site (Weeks 1–2)
- [ ] Astro scaffold + Tailwind + brand tokens.
- [ ] Base layout, header, footer, schema.org, sitemap, robots, llms.txt.
- [ ] Home page (hero + static placeholder for wheel).
- [ ] About, Contact, Menu (static), Events (static) pages.
- [ ] Image pipeline + photography placeholders.
- [ ] Deploy to Vercel staging.

### Phase 2 — Spin-the-wheel + reservations (Weeks 2–3)
- [ ] DB: `wheel_options`, `spins`, `customers`, `share_events`, `site_settings`, `message_log`.
- [ ] `/api/spin`, `/api/availability`, `/api/reserve` endpoints (with slot-cap enforcement).
- [ ] `SpinWheel.tsx` React island (SVG, GSAP).
- [ ] `ReservationForm.tsx` with validation + live slot availability lookup.
- [ ] `/reserve/confirm` and `/reserve/[shareCode]` pages.
- [ ] WhatsApp Cloud API integration (`reservation_received`, `owner_new_reservation`, `referrer_friend_booked`).
- [ ] `/api/webhooks/whatsapp` handler.
- [ ] Resend email fallbacks.

### Phase 3 — Admin panel (Weeks 3–4)
- [ ] Supabase Auth — single owner account bootstrapped via invite secret.
- [ ] `/admin/login` + middleware.
- [ ] Wheel CRUD module (label, perk, color, **weight**, order, active).
- [ ] Events CRUD module (weekly + specials).
- [ ] Menu CRUD module (categories + items, with image upload).
- [ ] Reservations module (list, status changes that fire `reservation_confirmed` / `reservation_cancelled` templates, CSV export).
- [ ] Settings module (reservation slot cap default **10**, slot width, open/close, etc.).

### Phase 4 — Blog + SEO polish (Weeks 4–5)
- [ ] `blog_posts` table + admin module.
- [ ] Markdown editor in admin.
- [ ] Blog index + detail pages.
- [ ] JSON-LD: Article, FAQPage, BreadcrumbList, MenuItem, Event.
- [ ] Lighthouse CI in PRs.
- [ ] Submit sitemap to GSC + Bing.
- [ ] Seed 4–6 launch blog posts targeting Vizag keywords.

### Phase 5 — Launch (Week 6)
- [ ] Final design polish + photography swap-in (client photos supplied).
- [ ] Accessibility audit (axe, manual keyboard test).
- [ ] Load test the spin/reserve endpoints.
- [ ] Verify all WhatsApp templates are approved and end-to-end live.
- [ ] Publish Privacy Policy and Terms pages.
- [ ] Cutover DNS to new site.
- [ ] Submit to GSC + Bing as a "site move" if the existing site was on the same domain.
- [ ] Post-launch monitoring (Plausible + Sentry).

### Phase 6 — Post-launch (ongoing)
- [ ] 2 blog posts/month, scaling.
- [ ] Monitor share-code performance; iterate the referral mechanic.
- [ ] v1.5: slot-based capacity check, customer accounts, online ordering integration.

---

## 20. Environment Variables

```bash
# Public (safe in browser, used by Astro at build/runtime)
PUBLIC_SITE_URL=https://moonbarandkitchen.in
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=...
PUBLIC_PLAUSIBLE_DOMAIN=moonbarandkitchen.in

# Server-only (NEVER exposed)
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...

# WhatsApp Cloud API (Meta)
WHATSAPP_ACCESS_TOKEN=...          # permanent system user token
WHATSAPP_PHONE_NUMBER_ID=...       # from Meta WhatsApp Manager
WHATSAPP_BUSINESS_ACCOUNT_ID=...   # WABA ID
WHATSAPP_VERIFY_TOKEN=...          # random; used for webhook handshake
WHATSAPP_APP_SECRET=...            # used to verify webhook signatures

IP_HASH_SECRET=                    # random 32-byte string
ADMIN_INVITE_SECRET=               # used to bootstrap the owner account

# Build-time
GOOGLE_SITE_VERIFICATION=...
BING_SITE_VERIFICATION=...
```

---

## 21. Acceptance Criteria

A feature is done when:

1. **Spin-the-Wheel**
   - [ ] Lands on a server-decided segment with smooth animation.
   - [ ] Cannot be cheated client-side (server is source of truth).
   - [ ] Result is announced to screen readers.
   - [ ] Works on iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari/Edge.
   - [ ] Honors `prefers-reduced-motion`.

2. **Reservations**
   - [ ] Validate name, phone, date, time on client and server.
   - [ ] Enforce `reservation_slot_cap` (default **10**, configurable in admin). Full slots cannot be booked from the front-end; admin can override.
   - [ ] `/api/availability` returns correct remaining capacity per slot.
   - [ ] Persist to `customers` with prize snapshot.
   - [ ] If `num_people > 0`, return a share URL.
   - [ ] Owner receives a WhatsApp message (`owner_new_reservation` template) within 60 seconds of submit.
   - [ ] Customer receives `reservation_received` WhatsApp within 60 seconds of submit.

3. **Sharing**
   - [ ] Share URL resolves to a personalized friend landing page.
   - [ ] Friend's reservation links back to the referrer.
   - [ ] Admin can see share leaderboard.

4. **Admin CRUD**
   - [ ] Single owner account can log in and is the only admin user.
   - [ ] Each of wheel/events/menu/blog is fully CRUDable from the panel.
   - [ ] Wheel weights are editable per option; setting all weights equal produces a uniform random spin.
   - [ ] Reservation slot cap is editable from Settings; the public form reflects the new cap immediately.
   - [ ] Images upload to Supabase Storage and render via Astro `<Image>`.
   - [ ] Reservations can be moved between statuses with one click; status change fires the correct WhatsApp template.

5. **SEO**
   - [ ] Lighthouse SEO = 100 on every public page.
   - [ ] `sitemap.xml`, `robots.txt`, `llms.txt` all present and correct.
   - [ ] Valid JSON-LD on home, menu, events, every blog post (verified via Google Rich Results Test).
   - [ ] Indexed in GSC within 2 weeks of launch.

6. **Performance**
   - [ ] Mobile Lighthouse Performance ≥ 90.
   - [ ] LCP < 2.0s on Slow 4G throttling.
   - [ ] No console errors on any page.

7. **Accessibility**
   - [ ] Zero `critical` or `serious` axe-core issues on home, menu, events, blog, reservation flow.
   - [ ] Fully keyboard-navigable.

---

## 22. Sample Seed Data

```sql
-- Categories
insert into menu_categories (slug, name, display_order) values
  ('veg', 'Veg', 1),
  ('non-veg', 'Non-Veg', 2),
  ('beverages', 'Beverages', 3);

-- Wheel options
insert into wheel_options (label, perk_description, color, weight, display_order) values
  ('Desserts',       'A free dessert on the house',            '#ff6ba6', 1, 1),
  ('Cocktails',      'A complimentary signature cocktail',     '#f5b454', 1, 2),
  ('Chef''s Special','A tasting plate of the chef''s special', '#4fd1c5', 1, 3),
  ('Shots',          'A round of moonlit shots',               '#c97a3a', 1, 4);

-- Weekly events (outlet closes 11 PM daily; admin can change any of these)
insert into events_weekly (day_of_week, slot, title, artist_name, start_time, end_time, description) values
  (3, 'evening', 'Live Band Night',     null, '20:00', '23:00', 'Live acoustic & rock — different band every week.'),
  (5, 'evening', 'House Friday',        null, '20:00', '23:00', 'House music to kick the weekend off right.'),
  (6, 'evening', 'Bollytech Saturday',  null, '20:00', '23:00', 'Bollywood meets tech house. Vizag''s loudest Saturday.'),
  (0, 'day',     'Sunday Brunch',       null, '12:00', '16:00', 'Buffet + bottomless mimosas + lazy rooftop vibes.'),
  (0, 'evening', 'Sunday Live Band',    null, '19:30', '22:30', 'Wind down with live music every Sunday night.');

-- Owner account
-- 1. Create the owner via Supabase Auth (one-time invite using ADMIN_INVITE_SECRET).
-- 2. Then insert the profile:
-- insert into admin_profiles (id, email, display_name, role) values ('<auth-user-id>', 'owner@moonbarandkitchen.in', 'Owner', 'owner');
```

---

## 23. Appendix A — `astro.config.mjs` (starter)

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://moonbarandkitchen.in',
  output: 'hybrid',
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [tailwind({ applyBaseStyles: false }), react(), sitemap({
    filter: (page) => !page.includes('/admin') && !page.includes('/api/'),
  })],
  image: {
    domains: ['xxxx.supabase.co'],
  },
  experimental: { contentCollectionCache: true },
});
```

## 24. Appendix B — `BaseLayout.astro` head essentials

```astro
---
const {
  title = 'Moon Bar & Kitchen — Rooftop Bar & Restaurant in Visakhapatnam',
  description = 'Moon Bar & Kitchen is a rooftop resto-bar in Siripuram, Visakhapatnam. Cocktails, live music, Sunday brunch. Spin the moon and book your table.',
  canonical = Astro.url.href,
  ogImage = '/og/cover.jpg',
} = Astro.props;
---
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <!-- OG / Twitter -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={new URL(ogImage, Astro.site).href} />
  <meta name="twitter:card" content="summary_large_image" />

  <!-- Theme -->
  <meta name="theme-color" content="#07091a" />

  <!-- Fonts (self-hosted via @fontsource) -->
  <link rel="preload" as="font" type="font/woff2" href="/fonts/inter-var.woff2" crossorigin />

  <!-- Schema.org -->
  <slot name="schema" />
</head>
```

## 25. Appendix C — Launch SEO checklist

- [ ] All public pages have unique title + description.
- [ ] Open Graph image renders on WhatsApp, Twitter, LinkedIn previews.
- [ ] `sitemap.xml` accessible at `/sitemap-index.xml`.
- [ ] `robots.txt` accessible.
- [ ] `llms.txt` accessible.
- [ ] Google Search Console: domain verified, sitemap submitted, no coverage errors.
- [ ] Bing Webmaster Tools: same.
- [ ] Rich Results Test passes for Restaurant, Menu, Article, FAQPage.
- [ ] Mobile-Friendly Test passes.
- [ ] HTTPS: HSTS enabled, no mixed content.
- [ ] Page Speed Insights: mobile ≥ 90 perf, 100 SEO, 100 best practices.
- [ ] Google Business Profile complete: hours, menu link, reservation link, 10+ photos.
- [ ] First 4–6 blog posts published with internal links to /menu and /reserve.

---

**End of specification.**
