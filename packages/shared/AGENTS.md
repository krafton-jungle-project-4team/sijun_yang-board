# Shared Package Rules

- This package contains runtime-neutral Zod contracts and exported types.
- Do not import React, Nest, TypeORM, pg, Node runtime, DB code, or app code.
- API controllers and Web clients parse these schemas at boundaries.
- Service code may use inferred/shared types but should not redefine API shapes.
- Keep envelope schemas in `src/contracts/api.contract.ts`.
- Keep auth contracts in `src/contracts/auth.contract.ts`.
- Keep board/post/comment/tag contracts in `src/contracts/post.contract.ts`.
- Add new feature contracts here before API/Web implementation.
- Build with `npm run build --workspace @nmm/shared`.
- Verify with `npm run verify` from the repository root.
