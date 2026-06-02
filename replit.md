# رفيق الصلاة — Prayer Tracker for Children

A full-stack Arabic RTL web application that helps children track their daily prayers, earn points and achievements, and compete on a leaderboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/prayer-tracker run dev` — run the React frontend (port 23980, proxied at `/`)
- `pnpm run typecheck:libs` — build composite lib type declarations (run before api-server typecheck)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes to api-server SQLite file

## Default Accounts (development)

- **Admin**: `admin` / `admin123`
- **Test children**: `ahmed`, `sara`, `omar` — all with password `child123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Pino logging
- DB: SQLite (`artifacts/api-server/prayer_tracker.db`) + Drizzle ORM + better-sqlite3
- Auth: JWT (`SESSION_SECRET` env var) + bcryptjs
- Prayer times: Aladhan API (`https://api.aladhan.com/v1/timingsByCity`)
- Frontend: React + Vite + Wouter + TanStack Query + Tailwind CSS + framer-motion
- UI: Shadcn-style components, Cairo Arabic font, Islamic green/gold theme, dark/light mode
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)

## Where things live

- `lib/db/src/schema/` — SQLite tables: `users`, `prayer_records`, `achievements`
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/prayer-tracker/src/pages/` — React pages (login, home, dashboard, history, leaderboard, achievements, admin/*)
- `artifacts/api-server/prayer_tracker.db` — SQLite database file

## Architecture decisions

- SQLite instead of PostgreSQL for zero-config local development (no DATABASE_URL needed)
- Drizzle queries use `.limit(1)` + destructuring instead of `.get()` for cross-DB type compatibility
- JWT stored in `localStorage` as `prayer_token`; auto-attached in `custom-fetch.ts`
- Prayer times fetched live from Aladhan API; fallback to Mecca defaults on network failure
- Admin role must be set directly in DB (`UPDATE users SET role='admin' WHERE username='admin'`)

## Product

- **Child view**: Daily prayer tracker with time-aware recording, progress ring, Framer Motion celebration animations
- **Stats**: Daily/weekly/monthly compliance, streak counter, points
- **Leaderboard**: Ranks children by points and compliance (daily/weekly/monthly)
- **Achievements**: Auto-awarded badges (first prayer, fajr hero, full week, century, etc.)
- **Admin view**: Overview dashboard, children CRUD, per-child stats

## User preferences

_Populate as you build._

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the api-server needs compiled lib declarations
- The SQLite DB file lives in `artifacts/api-server/prayer_tracker.db` (resolved via `process.cwd()` at runtime)
- `drizzle-kit push` uses `drizzle.config.ts` in `lib/db/` which targets the api-server DB path
- The admin account registered via `/api/auth/register` gets role=child; must manually set role=admin in DB

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
