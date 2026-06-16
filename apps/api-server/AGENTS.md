# API Server Rules

- Start the API only through root scripts: `npm run dev` or `npm run dev:api`.
- Do not run `nest start` directly outside Docker/root script flow.
- Import `@nmm/shared` contracts only; never import Web or UI code.
- Keep global prefix `api` and global success/error envelope.
- Controllers parse shared Zod schemas; services use inferred/shared types.
- Auth/session/current user must be DB-backed.
- Board/auth DB access must use PgTyped queries backed by PostgreSQL.
- Multi-step writes must run through the `tx()` helper from `src/infra/database`.
- In-memory stores, arrays as stores, Map stores, and `board-store.ts` are forbidden.
- Update schema objects in `database/schema.sql`; keep seed data and sequence runtime state in `database/dummy-data.sql`.
- Update feature `database/*.sql` files and run `npm run db:generate` after query changes.
- Run `npm run db:verify` with the database already started by `npm run dev:db` when checking schema drift; it uses Docker sqldef, not a local binary.
- Writes require `SessionUserGuard` and `ActiveAccountGuard` unless explicitly public.
- Only author or ADMIN may update/delete board content.
- Verify with `npm run verify` from the repository root.
