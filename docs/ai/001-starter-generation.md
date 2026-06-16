# Starter Generation

Date: 2026-06-12

## Reason

Create a v4-guide starter that preserves project rules for the next feature harness.

## Work

- Built workspace config, shared contracts, UI primitives, Nest API, Vite Web, SQL schema/seed, AGENTS.md, skill guides, and generation logs.
- Related commit: 이 메모가 포함된 커밋.

## Result

- API auth/board were generated with DB-backed persistence and later migrated to PgTyped SQL-first access.
- Web calls API over HTTP and parses shared envelopes.
- `bookmarks` was not implemented.

## Verification

- Grep checks passed: forbidden in-memory patterns had no matches.
- `npm run verify` passed.
