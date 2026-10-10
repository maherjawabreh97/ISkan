# Iskan — Real Estate Website

Bilingual (Arabic / English) real-estate site built with Next.js (App Router).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The language is chosen from the
URL: `/ar` (Arabic, default, RTL) or `/en` (English, LTR).

## Admin Dashboard

A built-in dashboard lets you add and manage listings (sale and rent) — including
number of rooms, citizenship eligibility, rent price, requirements and room images —
plus manage multiple users with roles.

- Sign in at `/{locale}/admin/login` (e.g. `/ar/admin/login`).
- Default account: **admin / admin123**. Change it immediately from
  **Users → edit admin**, or set `ADMIN_USERNAME` / `ADMIN_PASSWORD` before the
  first run.
- Roles:
  - **Admin** — everything, including user management.
  - **Editor** — add, edit and delete properties.
  - **Viewer** — read-only access to the dashboard.

### Environment variables

Copy `.env.example` to `.env` and adjust:

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME` | Username for the seed admin (first run only). Default `admin`. |
| `ADMIN_PASSWORD` | Password for the seed admin (first run only). Default `admin123`. |
| `ADMIN_SECRET` | Secret used to sign the admin session cookie. Set a long random value in production. |
| `SUPABASE_URL` | Supabase project URL. Set together with the key below to switch storage to Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key (bypasses RLS). Never expose it to the browser. |
| `SUPABASE_BUCKET` | Storage bucket for images. Default `property-images`. |

## Data & images

Storage has two modes. **Supabase** is used automatically when `SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` are set; otherwise the app falls back to local
files. Switching does not change any UI or routes.

### Mode A — Supabase (recommended for hosted deployments)

1. Create a Supabase project.
2. Open **SQL Editor**, paste `supabase/schema.sql` and run it. This creates the
   `properties` and `users` tables and the public `property-images` bucket.
3. Put the project URL and the **service_role** key in `.env`.
4. If you already have listings in `data/`, migrate them once with
   `npm run migrate:supabase` (run it **before** step 5). Community/public
   listing images in `public/uploads/` keep working by relative URL.
5. Restart the app. On first read the seed admin is created in the `users` table.

> Switching to Supabase starts from an empty database, so run the migration in
> step 4 first — otherwise the site will show no listings until you re-add them.

Works on Vercel/serverless as well as a VPS. Uploaded images live in the bucket
and are served from `https://<project>.supabase.co` (already allowed in
`next.config.ts`).

### Mode B — local files (default when Supabase is not configured)

Requires a server with a persistent filesystem (VPS / Node host — **not** a
read-only serverless host).

| Path | Contents |
| --- | --- |
| `data/properties.json` | All listings (created from the seed on first run). |
| `data/users.json` | Admin users and hashed passwords. |
| `public/uploads/` | Images uploaded from the dashboard. |

The `data/` and `public/uploads/` folders are created automatically and are
git-ignored. **Back them up** — they hold your live content.

> The rest of the app only talks to `lib/properties-store.ts`,
> `lib/users-store.ts` and `lib/uploads.ts`, so the storage backend can be
> swapped without touching pages or components.

## Security

What the admin panel already does:

- Signed, `httpOnly`, `sameSite=lax` session cookie (`secure` in production);
  the role is re-checked against the store on every request.
- Passwords hashed with `scrypt` + per-user salt and compared in constant time.
- Dashboard pages are gated by layout **and** every Server Action re-checks the
  user and role (`requireActionUser`).
- Login is rate-limited (in-memory, per IP + username).
- Uploaded images are validated by their real magic bytes, not the browser MIME.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and HSTS in production).

Before going live:

1. **Set `ADMIN_SECRET`** to a long random value (see `.env.example`).
2. **Change the default `admin` password** on first login (or set
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` before the first run).
3. Serve the site over **HTTPS** (required for the `secure` cookie).
4. The rate limiter is in-memory: fine for one Node process. If you run several
   instances, put a shared limiter/WAF in front.

> Not a substitute for an audit — this is a list of the built-in measures, not a
> guarantee.

## Project structure

- `app/[lang]/(site)/` — public pages (home, listings, property detail, legal).
- `app/[lang]/admin/` — the dashboard (login + protected pages).
- `app/api/admin/upload/` — authenticated image-upload endpoint.
- `lib/supabase.ts` — Supabase client + configuration detection.
- `lib/properties-store.ts`, `lib/users-store.ts`, `lib/uploads.ts` — storage
  (Supabase when configured, otherwise local files).
- `supabase/schema.sql` — database tables and image bucket, run once.
- `lib/auth.ts` — sessions and role checks.
- `lib/dictionaries/` — Arabic/English copy, plus `admin.ts` for the dashboard.

## Build

```bash
npm run build
npm run start
```
