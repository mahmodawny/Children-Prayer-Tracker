---
name: SQLite drizzle query style
description: How to write drizzle-orm queries in api-server routes to avoid TypeScript PgSelectBase errors
---

## Rule
In `artifacts/api-server/src/routes/*.ts`, never call `.get()` or `.all()` on drizzle select builders. Use these patterns instead:

- Array: `const rows = await db.select().from(table).where(...);`
- Single: `const [row] = await db.select().from(table).where(...).limit(1);`
- Insert returning single: `const [inserted] = await db.insert(table).values(...).returning();`
- Update returning single: `const [updated] = await db.update(table).set(...).where(...).returning();`

**Why:** When TypeScript resolves types through composite workspace packages, drizzle-orm sometimes surfaces PostgreSQL types (`PgSelectBase`) even though the runtime uses SQLite. The `.get()` and `.all()` methods only exist on SQLite sync builders, causing TS2339 errors. The `await db.select()...` pattern (without `.get()`/`.all()`) works for both PostgreSQL and SQLite type signatures.

**How to apply:** Any time you write or edit route handlers in `artifacts/api-server/src/routes/`.
