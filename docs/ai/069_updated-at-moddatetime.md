# updated_at moddatetime trigger

Date: 2026-06-17

## Reason

Keep `updated_at` current at the database layer for every mutable table.

## Work

- Added the official PostgreSQL `moddatetime` extension to `schema.sql`.
- Added `updated_at` to `"session"`.
- Added `BEFORE UPDATE` triggers for `"user"`, `"session"`, `posts`, `comments`, `projects`, `tasks`, and `approval_requests`.
- Changed each trigger to call `moddatetime(updated_at)`.
- Removed `pgcrypto` because PostgreSQL 16 includes `gen_random_uuid()`.

## Verification

- `npm run verify` passed.
- A clean `postgres:16-alpine` container applied `schema.sql` successfully.
- `gen_random_uuid()` worked without `pgcrypto` in the clean container.

## Follow-up

- Run `npm run db:verify` with `npm run dev:db` before committing schema drift-sensitive changes.
- Run `npm run db:generate` only when feature SQL query inputs or outputs change.
