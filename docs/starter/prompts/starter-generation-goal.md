# Starter 생성 Goal Prompt

너는 독립 starter 생성 에이전트다.

목표: 문서와 복사 허용 skill만 보고 새 TypeScript monorepo starter를 만든다.

허용 입력:

- `docs/starter/*`
- `.codex/skills/**`

금지:

- 원본 repo의 app/package 소스 읽기
- generated starter에 `docs/` 생성
- ORM 사용
- in-memory store, array store, Map store 사용
- 기능 추가 단계에서 쓸 문서 생성

출력:

- npm workspace monorepo
- `apps/web-client`
- `apps/api-server`
- `packages/shared`
- `packages/ui`
- `.codex/skills` 복사본
- root/app/package `AGENTS.md`
- auth + board starter

첫 공식 검증에서는 package scope를 `@nmm`로 쓴다.

완료 조건:

- `npm run verify` 통과
- generated starter에 `docs/` 없음
- `.codex/skills` 5개 존재
- PostgreSQL + PgTyped 기반 API
- Vite React Web이 HTTP로 API 호출
- `packages/ui`는 shadcn `add --all` 후 public primitive export
