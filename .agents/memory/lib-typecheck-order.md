---
name: Lib typecheck order
description: Must build composite libs before typechecking leaf packages that reference them
---

## Rule
Always run `pnpm run typecheck:libs` (which runs `tsc --build`) before running `pnpm --filter @workspace/api-server run typecheck` or any other leaf package that has `references` to composite libs.

**Why:** Composite packages like `@workspace/db` emit declaration files into their `dist/` directory. Leaf packages resolve types from those declarations. If the declarations are stale or missing, TypeScript reports "has no exported member" errors even though the source exports are correct.

**How to apply:** In any session that involves the api-server or other packages referencing `@workspace/db` or `@workspace/api-zod`, run `typecheck:libs` once at the start.
