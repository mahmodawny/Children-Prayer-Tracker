---
name: DB path resolution
description: Where the SQLite database file lives and how paths are resolved
---

## Rule
The SQLite database lives at `artifacts/api-server/prayer_tracker.db`.

- **Runtime** (`lib/db/src/index.ts`): `path.join(process.cwd(), "prayer_tracker.db")` — since the api-server workflow sets cwd to `artifacts/api-server/`, this resolves correctly.
- **drizzle-kit push** (`lib/db/drizzle.config.ts`): Uses absolute path `path.join(__dirname, "../../artifacts/api-server/prayer_tracker.db")` to target the same file.
- **Override**: Set `DATABASE_PATH` env var to point to a different location.

**Why:** drizzle-kit runs from `lib/db/` while the server runs from `artifacts/api-server/`. Using `process.cwd()` for the server and an absolute path in drizzle.config.ts keeps them in sync.

**How to apply:** If the server shows "no such table" errors, check that drizzle push was run targeting the correct DB file.
