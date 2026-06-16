# PROJECT_STATE.md

> Snapshot of the **DEMO_BROKER** project as of 2026-05-28.

## 1. Overview

A real-estate marketing website for **Site Seeing Realty** (brand: "SiteSeeing Realty"), a property consultant based in Mysore, Karnataka, India. The site markets plots, villas, and apartments and provides a private dashboard where the broker/owner can post and manage listings.

- **Public site**: marketing pages + an interactive "Explore Properties" section with a Leaflet map and listing grid.
- **Broker backend**: a password-protected dashboard (hidden route) for CRUD on listings, with image upload.
- **Data layer**: Supabase (Postgres + Auth + Storage). Code is fully wired; only live credentials are missing.

## 2. Tech Stack

| Concern | Choice | Version |
|---|---|---|
| Framework | React | ^18.3.1 |
| Build tool | Vite | ^6.0.0 |
| Routing | react-router-dom | ^7.14.2 |
| Maps | leaflet + react-leaflet | ^1.9.4 / ^4.2.1 |
| Animation | gsap (+ ScrollTrigger) | ^3.12.5 |
| Backend / DB / Auth / Storage | @supabase/supabase-js | ^2.105.4 |
| Styling | Single hand-written CSS file | `src/index.css` (~1645 lines) |

Scripts: `npm run dev` · `npm run build` · `npm run preview`

## 3. Directory Structure

```
DEMO_BROKER/
├── index.html               # Loads /src/main.jsx into #root, sets fonts/meta
├── vite.config.js           # Vite + @vitejs/plugin-react
├── package.json
├── .env.example             # Template for Supabase env vars
├── supabase/
│   └── schema.sql           # Full DB schema, RLS policies, storage bucket + policies
├── images/                  # main2.jpeg, slide2.png, profile-photo.jpeg, svgs
├── src/
│   ├── main.jsx             # Entry: BrowserRouter > PropertyProvider > App
│   ├── App.jsx              # All routes + Home page sections (Header, Banner,
│   │                        #   Slogan, PropertyExplorer, Contact, Footer, Loader)
│   ├── index.css            # All styling
│   ├── supabaseClient.js    # createClient() from VITE_ env vars
│   ├── context/
│   │   └── PropertyContext.jsx   # Global property state + Supabase CRUD
│   ├── pages/
│   │   ├── Dashboard.jsx     # Broker login + add/edit/delete + image upload
│   │   ├── PropertyDetails.jsx  # Single listing view + map + gallery
│   │   ├── About.jsx        # Static about page
│   │   └── Paperwork.jsx    # Static paperwork/legal page
│   └── assets/              # SSLogo.png, hero-img1..3.png
└── dist/                    # Prior build output
```

## 4. Routes

| Path | Component | Notes |
|---|---|---|
| `/` | `Home` | Banner slideshow, About, Slogan, Investments, **PropertyExplorer (map + grid)**, Contact form |
| `/about` | `About` | Static |
| `/paperwork` | `Paperwork` | Static |
| `/property/:id` | `PropertyDetails` | Looks up property by `id` from context |
| `/dashboard` | `Dashboard` | **Hidden/obfuscated broker route**, gated by Supabase auth |

## 5. Data Model — `plots` table

Defined in `supabase/schema.sql`:

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, `uuid_generate_v4()` |
| `created_at` | timestamptz | default `now()` |
| `title` | text | required |
| `type` | text | required — one of `Plot` / `Villa` / `Apartment` |
| `city` | text | e.g. `Mysore`, `Bangalore` — drives the map city filter |
| `size` | text | e.g. "10,000 sqft" |
| `price` | text | e.g. "₹50L" |
| `lat` | numeric | required (map marker) |
| `lng` | numeric | required (map marker) |
| `image` | text | main image URL |
| `gallery` | text[] | array of image URLs |
| `description` | text | |
| `documents` | text[] | paperwork labels |

**Row Level Security (enabled):**
- Public `SELECT` allowed (anyone can read listings).
- `INSERT` / `UPDATE` / `DELETE` restricted to `authenticated` users (the broker).

### `inquiries` table (contact-form submissions)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `created_at` | timestamptz | default `now()` |
| `fullname` | text | required |
| `phone` | text | |
| `message` | text | |

RLS: `anon` may `INSERT` (submit the form); only `authenticated` (broker) may `SELECT` / `UPDATE` / `DELETE`. Shown in the dashboard's **Inquiries** tab.

**Storage:** public bucket `plot-images` with public read + authenticated write/update/delete. Dashboard uploads main images here via `supabase.storage.from('plot-images')`.

## 6. State & Data Flow

- `PropertyContext.jsx` is the single source of truth. On mount it fetches all rows from `plots` (newest first) and exposes `properties`, `addProperty`, `deleteProperty`, `editProperty`.
- `PropertyExplorer` (in `App.jsx`) reads `properties`, supports a type filter (`All / Villa / Apartment / Plot`), renders Leaflet markers and a card grid.
- `Dashboard.jsx` handles auth (`signInWithPassword` / `signOut`), an add/edit form, file upload, and delete. New/edited rows update both Supabase and local context state optimistically.
- `PropertyDetails.jsx` finds the property by route `id` from context and renders hero, description, location map, and gallery.

## 7. Supabase Integration Status

**Code: ✅ complete.** Client, context CRUD, auth, storage upload, schema, and RLS policies are all written.

**Config: ✅ connected** (as of 2026-05-28).
- Project ref: `jwlewgvkawbuguwerujy` — linked via Supabase CLI.
- `.env` created with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (gitignored).
- Migration `supabase/migrations/20260528000000_init_plots.sql` pushed to the remote DB: `plots` table, RLS policies, explicit Data-API GRANTs, and the public `plot-images` storage bucket are all live.
- Broker auth user `nenapiralirakesh@gmail.com` created via the Dashboard (Auth → Users, auto-confirmed).

> **Data API note:** Supabase projects created on/after 2026-05-30 no longer auto-expose `public` tables to the Data API. The migration includes explicit `GRANT`s (`anon`: SELECT; `authenticated`: SELECT/INSERT/UPDATE/DELETE) so listings remain readable/writable through supabase-js. RLS still governs row access.

### Environment variables (`.env` at project root)

```
VITE_SUPABASE_URL=https://jwlewgvkawbuguwerujy.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

### Migration workflow (CLI)

```bash
export SUPABASE_ACCESS_TOKEN=<personal access token>   # supabase.com/dashboard/account/tokens
supabase link --project-ref jwlewgvkawbuguwerujy
SUPABASE_DB_PASSWORD=<db password> supabase db push
```

> **Security:** rotate the DB password and the personal access token used during setup, since they were shared in chat. The anon key is public by design and is safe to keep.

## 8. Known Gaps / TODO

1. ✅ **Connect Supabase** — done (see section 7).
2. ✅ **`.gitignore`** — added; ignores `.env`, `node_modules/`, `dist/`, `.supabase/`, `.DS_Store`.
3. ✅ **Map default center** — re-centered on Mysore `[12.2958, 76.6394]` in `App.jsx`.
4. ✅ **Undefined image refs** — `IMAGES.main2mob` / `IMAGES.main3mob` replaced with existing desktop images in the mobile `<source>` fallbacks.
5. ✅ **Contact form** — now persists submissions to the `inquiries` table; the broker views them under the **Inquiries** tab in `/dashboard`. (Email/SMS notification still a future enhancement.)
6. **No listings yet** — the `plots` table is empty; add the first property via `/dashboard`.
7. Repo currently has **no commits**.

## 9. How to Run Locally

```bash
npm install
# create .env with the two VITE_ vars (see section 7)
npm run dev
```

Visit `/` for the site and `/dashboard` for the broker dashboard.
