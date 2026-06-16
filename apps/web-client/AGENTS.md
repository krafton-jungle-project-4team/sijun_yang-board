# Web Client Rules

- This app calls the API through `src/shared/api/http-client.ts` only.
- Do not import Nest, TypeORM, Node runtime, or files from `apps/api-server`.
- Use `@nmm/shared` for Zod contracts and response parsing.
- Use `@nmm/ui/components` before raw controls such as button/input/card/table/dialog.
- Routes live under `src/app/router.tsx` and page code under `src/pages`.
- Feature API/query hooks stay under `src/features/<feature>`.
- Use React Query for server state and mutation pending/error UI.
- Use RHF with shared Zod schemas for forms.
- Name event handlers `handle*`; do not put anonymous functions in JSX props.
- Interpret shadcn official import/path examples as `@nmm/ui/components` for this app.
- If the `shadcn` skill conflicts with this file, prefer this app's boundary, import, UI, and verification rules.
- React/UI code must apply `toss-frontend-fundamentals` and `vercel-react-best-practices`.
- Component API changes must apply `vercel-composition-patterns`.
- Verify with `npm run verify` from the repository root.
