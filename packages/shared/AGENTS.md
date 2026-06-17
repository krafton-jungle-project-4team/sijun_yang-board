# Shared Package Rules

- This package contains runtime-neutral Zod contracts and exported types.
- TS files and `src` folders use kebab-case.
- `*.contract.ts` and `*.config.ts` style middle extensions are allowed.
- Do not import React, Nest, TypeORM, pg, Node runtime, DB code, or app code.
- API controllers and Web clients parse these schemas at boundaries.
- Service code may use inferred/shared types but should not redefine API shapes.
- Keep exported response type names aligned with the wire shape, such as `Comment`, `PostSummary`, and `TaskSummary`; avoid `Dto` suffixes unless resolving a real local collision.
- Reuse base schema pieces internally, but keep existing exported schema/type names and JSON fields unless the API contract is explicitly changed.
- Keep envelope schemas in `src/contracts/api.contract.ts`.
- Keep auth contracts in `src/contracts/auth.contract.ts`.
- Keep board/post/comment/tag contracts in `src/contracts/post.contract.ts`.
- Add new feature contracts here before API/Web implementation.
- Build with `npm run build --workspace @nmm/shared`.
- Verify with `npm run verify` from the repository root.
