# AGENTS.md 작성 가이드

현재 repo의 `AGENTS.md`를 그대로 복사하지 않는다. Starter용으로 일반화해 다시 작성한다.

빠지는 내용:

- 특정 기능명에 묶인 규칙
- starter 밖 기능
- 문서 작성 규칙

유지하는 내용:

- 루트 script 중심 실행
- `npm run verify`
- workspace import 경계
- kebab-case 파일/폴더명
- Web HTTP-only API
- shared Zod contract
- API PgTyped repository
- shadcn/Radix primitive 우선
- React Doctor와 복사된 frontend skills 적용

## Root AGENTS.md 초안

```md
# Repository Rules

## Structure

- `apps/web-client` is the Vite React app.
- `apps/api-server` is the Nest API server.
- `packages/shared` contains runtime-neutral Zod contracts and exported types.
- `packages/ui` contains shadcn/Radix primitives prepared during scaffold.
- Follow the nearest child `AGENTS.md` for implementation details.

## Commands

- Run user-facing tasks through root `package.json` scripts.
- After changes, run `npm run verify`.
- Individual checks are `npm run lint`, `npm run format:check`, `npm run typecheck`, and `npm run build`.
- Start development servers only through root scripts.
- Start the API only through Docker Compose wrapped by `npm run dev` or `npm run dev:api`.
- Do not run `nest start`, workspace dev scripts, or ad hoc env commands directly.

## Boundaries

- App-local imports outside the current folder use `@/*`.
- Same-folder imports use `./*`.
- Do not use `../*` in hand-written source.
- Workspace imports use package names.
- `apps/web-client` may import only `<scope>/shared` and `<scope>/ui` from this workspace.
- `apps/api-server` may import only `<scope>/shared` from this workspace.
- `packages/shared` must not import apps, React, Nest, Node runtime, UI, or DB code.
- `packages/ui` must not import apps, shared contracts, API code, Nest, Node runtime, or Vite app code.

## Naming

- TS/TSX files under `apps/*` and `packages/*` use kebab-case.
- `src` subfolders use kebab-case.
- Middle extensions such as `*.contract.ts` and `*.config.ts` are allowed.
- TanStack Router generated and route files follow framework rules.

## Frontend Quality

- React code changes use React Doctor plus the copied frontend skills.
- Use shadcn/Radix primitives from `<scope>/ui/components` before raw controls.
- Keep app-specific UI composition in Web feature/page code.
```

## Web AGENTS.md 초안

```md
# Web Client Rules

- Call the API through `src/shared/api/http-client.ts` only.
- Do not import Nest, Node runtime, DB code, or files from `apps/api-server`.
- Use `<scope>/shared` for Zod contracts and response parsing.
- Use `<scope>/ui/components` before raw controls such as button, input, card, table, and dialog.
- Keep app-specific UI composition in feature/page code.
- File-based routes live under `src/routes`.
- Route files own route boundaries and shared route layouts.
- Large page bodies live under `src/pages`.
- Feature API functions, hooks, model helpers, and UI live under `src/features/<feature>`.
- Use TanStack Query for server state and mutation pending/error UI.
- Use React Hook Form with shared Zod schemas for forms.
- Name event handlers `handle*`.
- Do not pass anonymous functions directly in JSX props.
- Interpret shadcn examples as imports from `<scope>/ui/components`.
- React/UI changes apply React Doctor, `toss-frontend-fundamentals`, and `vercel-react-best-practices`.
- Component API changes apply `vercel-composition-patterns`.
- Verify with `npm run verify` from the repository root.
```

## API AGENTS.md 초안

```md
# API Server Rules

- Start the API only through root scripts: `npm run dev` or `npm run dev:api`.
- Do not run `nest start` directly outside Docker/root script flow.
- Use `@/*` for app-local imports outside the current folder.
- Use `./*` only for same-folder files.
- Do not use `../*` in hand-written source.
- Import `<scope>/shared` contracts only; never import Web or UI code.
- Keep global prefix `api` and global success/error envelope.
- Controllers parse shared Zod schemas.
- Services use inferred/shared types and orchestrate use cases.
- Services own transaction boundaries.
- Domain data is plain interface/type snapshots.
- Domain behavior is grouped as pure functions on `XxxDomain`.
- Keep Nest errors, AppError, and exceptions in services or HTTP boundary code.
- All feature DB access uses PgTyped-backed repositories.
- PgTyped generated imports and generated `I*` types stay inside `repository/*`.
- Repositories map DB rows to domain snapshots, read views, or shared contract shapes before returning.
- Basic reads use `XxxReader` in `repository/*-reader.ts`.
- Writes use `XxxWriter` in `repository/*-writer.ts` and are CUD-only.
- Performance read shapes use `XxxViewQuery` in `repository/*-view-query.ts`.
- Query services are read-oriented.
- Documented side effects must call a writer.
- Inject repositories by role name such as `bookmarkReader` and `bookmarkWriter`.
- Multi-step writes run inside the service transaction boundary.
- In-memory stores, arrays as stores, and Map stores are forbidden.
- Update schema objects in `database/schema.sql`.
- Keep seed/demo data in `database/dummy-data.sql`.
- Update feature `database/*.sql` files and run `npm run db:generate` after query changes.
- Add a short purpose comment above each hand-written schema object and feature SQL query.
- Writes require `AuthenticatedUserGuard` unless explicitly public.
- User-owned content must be scoped to the current authenticated user.
- Verify with `npm run verify` from the repository root.
```

## Shared AGENTS.md 초안

```md
# Shared Package Rules

- This package contains runtime-neutral Zod contracts and exported types.
- Do not import React, Nest, pg, Node runtime, DB code, UI code, or app code.
- API controllers and Web clients parse these schemas at boundaries.
- Service code may use inferred/shared types but should not redefine API shapes.
- Keep response type names aligned with the wire shape.
- Avoid `Dto` suffixes unless resolving a real local collision.
- Reuse base schema pieces internally.
- Keep exported schema/type names and JSON fields stable unless the API contract changes.
- Add new feature contracts before API/Web implementation.
- Verify with `npm run verify` from the repository root.
```

## UI AGENTS.md 초안

```md
# UI Package Rules

- This package is prepared during starter scaffold with shadcn/Radix primitives.
- Do not modify this package during feature work.
- Use existing exports from `<scope>/ui/components` in Web code.
- Do not place app-specific UI composition here.
- Public primitives are exported from `src/components.ts`.
- `cn` stays in `src/lib/utils.ts`.
- Keep shadcn-compatible component APIs.
- If a feature needs custom composition, place it under the Web app.
- Verify with `npm run verify` from the repository root.
```
