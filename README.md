# Riya Oils

A single Next.js 16 app that serves both the storefront and the REST API (`/api/v1/*`),
backed by Supabase Postgres. One project, one `.env`, one deploy.

```
app/                 pages + app/api/v1/[...path]/route.ts (the API entry point)
server/              API: router, auth, db pool, services (ported from the old NestJS backend)
components/ lib/ …   storefront UI
database/migrations  SQL migrations (001 core schema, 002 home insights)
scripts/migrate.mjs  applies pending migrations once each
legacy/              the old Riya-frontend and Riya-backend projects, untouched (safe to delete)
```

## Run locally

```bash
cp .env.example .env     # fill in DATABASE_URL + SUPABASE_* values
npm install
npm run db:migrate       # applies any pending migrations
npm run dev              # http://localhost:3000, API at /api/v1
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## API

The routes, request bodies and `{ success, data, message }` response shape match the old NestJS API.
Public: `GET /health`, `/categories`, `/products`, `/products/:idOrSlug`, `/settings`, `/content/contact`,
`/insights/home`, and `POST /orders` (guest or signed-in). Customer routes (`/orders`, `/orders/:id`,
`/orders/:id/cancel`) and every `/admin/*` route need `Authorization: Bearer <Supabase access token>`.
Admin routes also need `profiles.role = 'ADMIN'` for that user.

A profile row is created automatically when someone signs up through Supabase Auth. To make someone an admin:

```sql
update public.profiles set role = 'ADMIN' where user_id = '<auth user id>';
```

## Home page data

- `oil_profiles`: typical fatty-acid split and smoke point per category (powers the profile and smoke-point charts).
- `quality_parameters`: the reference limits (Codex STAN 210 for cold-pressed oils).
- `quality_evaluations`: lab results per batch (powers the batch evaluation cards).
  The seeded rows have `is_sample = true` and show a "Sample data" badge. Replace them with real
  lab reports and delete the sample rows (or set `is_published = false`).

## Deploy (Netlify)

`netlify.toml` is included. Point the Netlify site at this folder (base directory = repo root),
and add the same variables from `.env` under **Site settings → Environment variables**.
No separate backend deploy is needed.
