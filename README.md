# Renata Belmonte · Makeup Artist

Professional booking website for an independent makeup artist based in Ciudad Juárez, México. Built as a full-stack portfolio piece demonstrating real-world patterns: slot-based scheduling, Supabase Auth, Row Level Security, transactional emails, and a complete admin panel.

> All UI text is in Spanish (Mexican market). Prices in MXN.

## Live Demo

**Site:** [www.renatabelmonte.mx](https://www.renatabelmonte.mx)  
**Admin:** `/admin` (Supabase Auth — single user, public registration disabled)

---

## Features

### Public site
- **Landing page** — hero, about, services catalog (SSR for SEO), portfolio gallery, FAQ accordion, footer
- **Booking flow** — 4-step: service selection → date picker → time slot → customer form
- **Real-time availability** — slots calculated server-side from weekly schedule minus existing bookings
- **No double-booking** — enforced at the database level with a PostgreSQL exclusion constraint (`btree_gist`), not just client validation
- **Race condition handling** — if two users book the same slot simultaneously, the second one gets a clear error and fresh slot options (SQLSTATE `23P01`)
- **Confirmation page** — booking summary + pre-filled WhatsApp message CTA

### Admin panel (`/admin`)
- **Auth** — Supabase email/password login; middleware protects all `/admin/*` routes
- **Bookings** — filterable table (by status & date range), inline confirm/cancel/complete actions, pending-count badge
- **Blocked dates** — create/delete date ranges to block availability (vacations, events)
- **Service catalog** — create/edit all services, activate/deactivate toggle (no destructive deletes)

### Transactional emails (Resend)
1. **Customer confirmation** — sent on booking creation (pending → customer)
2. **Booking alert** — new reservation details sent to the makeup artist
3. **24h reminder** — Vercel Cron job runs daily, sends reminders for next-day confirmed appointments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS v3 + shadcn/ui |
| Database / Auth / Storage | Supabase (PostgreSQL) |
| Email | Resend |
| Hosting | Vercel |
| Date picker | react-day-picker v10 |

---

## Architecture Highlights

### Server/client separation
```
src/
├── actions/
│   ├── booking.ts      # Public server actions (slot calc, booking insert)
│   └── admin.ts        # Admin server actions (auth, CRUD — authenticated only)
├── lib/
│   ├── supabase/
│   │   ├── server.ts   # createClient() (anon+session) + createServiceClient() (service_role)
│   │   └── client.ts   # Browser client — anon key only, never service_role
│   └── email.ts        # Resend send functions (server-only)
├── middleware.ts        # Supabase SSR session refresh + /admin/* redirect guard
└── app/
    ├── (public)/       # Landing, /reservar, /reservar/confirmacion
    ├── admin/          # Protected panel (layout checks session)
    └── api/cron/       # Vercel Cron endpoint
```

### Security
- `SUPABASE_SERVICE_ROLE_KEY` is **never** sent to the browser. Only used in Server Components and Route Handlers.
- Supabase **Row Level Security** is active on all tables from day one:
  - Anon: read active services, insert bookings (status = `pending` only)
  - Authenticated (Renata): read/manage all bookings, full CRUD on services and blocked dates
- Admin routes protected by two layers: middleware (`getUser()` — validates JWT with Supabase server) + layout fallback redirect.
- No online payments. Payment is cash/transfer on the day of service.

### No double-booking at the DB level
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist ( tsrange(starts_at, ends_at) WITH && )
  WHERE (status IN ('pending', 'confirmed'));
```

The server action catches SQLSTATE `23P01` (exclusion violation) and returns a typed `SLOT_TAKEN` error so the client can re-fetch available slots without a full page reload.

### Slot calculation
Slots are generated entirely server-side every time a user picks a date:
1. Fetch weekly schedule from `availability` table
2. Check `blocked_dates` for the selected date
3. Fetch service `duration_minutes`
4. Fetch existing `pending`/`confirmed` bookings that day
5. Generate 60-minute slots within working hours, filter overlaps

The slot end time is calculated from the service duration — the customer never picks an end time.

---

## Database Schema

```sql
services       -- id, slug, name, description, duration_minutes, price_mxn,
               --   category, image_path, is_active, sort_order

bookings       -- id, service_id, customer_name, customer_email, customer_phone,
               --   starts_at, ends_at (auto-set by trigger), status, event_type,
               --   allergies, reference_notes, at_home

availability   -- id, weekday (0=Sun…6=Sat), opens_at, closes_at

blocked_dates  -- id, start_date, end_date, reason
```

Full schema in [`01_schema.sql`](./01_schema.sql) · Seed data in [`02_seed.sql`](./02_seed.sql).

---

## Local Setup

### 1. Clone & install
```bash
git clone https://github.com/davidhielo91/makeup-artist.git
cd makeup-artist
npm install
```

### 2. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run `01_schema.sql` then `02_seed.sql`.
3. Copy your project URL, anon key, and service role key.

### 3. Configure environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase, Resend, and CRON_SECRET values
```

### 4. Run the dev server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Create the admin user
In Supabase Dashboard → Authentication → Users → **Add user**. Set the email and password Renata will use. Public sign-up is intentionally disabled.

---

## Email Setup (Resend)

1. Create an account at [resend.com](https://resend.com) and get an API key.
2. Verify the domain `renatabelmonte.mx` (or your own domain) in Resend.
3. Set `RESEND_API_KEY` and `FROM_EMAIL` in your environment variables.

Until configured, emails are silently skipped (the booking still succeeds). The guard checks that `RESEND_API_KEY` starts with `re_` before attempting any send.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Use the official **Vercel ↔ Supabase integration** to sync environment variables automatically.
4. Add `RESEND_API_KEY`, `FROM_EMAIL`, and `CRON_SECRET` manually in the Vercel dashboard.
5. The `vercel.json` cron (`0 14 * * *` UTC = 8:00 AM Juárez) will activate automatically on Vercel Pro/Hobby plans.

---

## Design System

**Style:** editorial beauty magazine — generous whitespace, high-contrast Didone serif headlines, a single terracotta accent (`#C2603F`) over a warm cream background (`#F4F0E9`).

| Token | Hex | Use |
|---|---|---|
| `cream` | `#F4F0E9` | Main background |
| `accent` | `#C2603F` | CTAs, prices, highlights |
| `ink` | `#1A1A1A` | Body text |
| `footer` | `#0E0E0E` | Footer background |
| `muted` | `#6B6B6B` | Secondary text |
| `line` | `#E0DAD0` | Borders, dividers |

Fonts: **Playfair Display** (serif headings) · **Inter** (body sans) · **Great Vibes** (script signature, used once in hero).

---

## Project Structure

```
.
├── 01_schema.sql           # Full DB schema with RLS policies + exclusion constraint
├── 02_seed.sql             # Seed data (services, availability)
├── vercel.json             # Cron job config
├── src/
│   ├── actions/
│   │   ├── booking.ts      # getAvailableSlots, createBooking
│   │   └── admin.ts        # signIn, signOut, booking/service/bloqueo CRUD
│   ├── app/
│   │   ├── page.tsx        # Landing page (SSR)
│   │   ├── reservar/       # Booking flow + confirmation
│   │   ├── admin/          # Protected admin panel
│   │   │   ├── page.tsx        # Bookings table
│   │   │   ├── bloqueos/       # Blocked dates CRUD
│   │   │   └── servicios/      # Service catalog management
│   │   └── api/cron/
│   │       └── recordatorios/  # Daily reminder cron endpoint
│   ├── components/
│   │   ├── layout/         # Navbar, Footer
│   │   ├── sections/       # Hero, SobreMi, Servicios, Portafolio, FAQ
│   │   └── ui/             # shadcn/ui components
│   ├── lib/
│   │   ├── email.ts        # Resend email templates (server-only)
│   │   ├── format.ts       # formatPrice, formatDuration, formatBookingDate
│   │   └── supabase/       # server.ts + client.ts
│   ├── middleware.ts        # Supabase SSR session refresh + /admin/* guard
│   └── types/
│       └── database.ts     # TypeScript interfaces for DB types
└── CLAUDE.md               # Project spec & business data
```

---

## Business Info

| | |
|---|---|
| **Name** | Renata Belmonte Cárdenas |
| **Location** | Av. de las Torres 1450, Col. Campestre, Cd. Juárez, Chih. |
| **WhatsApp** | +52 656 218 4490 |
| **Email** | hola@renatabelmonte.mx |
| **Instagram** | [@renata.mua](https://instagram.com/renata.mua) |

---

## License

MIT
