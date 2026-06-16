# PgTyped SQL-First API Migration

Date: 2026-06-15

## Reason

Move API persistence from ORM repositories to explicit SQL query files with generated PgTyped types.

## Work

- Added PgTyped runtime/CLI dependencies, `pgtyped.config.json`, and `npm run db:generate`.
- Replaced the API database module with a `pg.Pool` provider and a small `tx()` helper.
- Converted auth and board services to generated PgTyped queries under feature `database/` folders, with multi-step writes running inside `tx()`.
- Removed ORM entity files and package dependencies.
- Updated project rules and generation notes for PgTyped plus PostgreSQL-backed access.

## Verification

- `npm run db:generate` passed against the local Postgres schema.
- Final format, typecheck, build, and `npm run verify` results are recorded in the task outcome.
