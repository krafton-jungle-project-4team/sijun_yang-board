# Starter 생성 가이드

## 입력 제한

생성 에이전트는 원본 app/package 소스 코드를 읽지 않는다.

허용 입력:

- `docs/starter/*`
- `.codex/skills/**`

출력 starter에는 `docs/`를 만들지 않는다.

## 프로젝트 구조

```text
.
├── .codex/skills
├── AGENTS.md
├── apps
│   ├── api-server
│   └── web-client
├── packages
│   ├── shared
│   └── ui
├── compose.yml
├── eslint.config.mjs
├── package.json
└── tsconfig.base.json
```

첫 검증 scope는 `@nmm`를 쓴다. 다른 프로젝트에서는 `<scope>`만 일괄 치환한다.

## 생성 순서

1. 루트 npm workspace를 만든다.
2. `apps/web-client`를 Vite React TS로 생성한다.
3. `apps/api-server`를 Nest CLI로 생성한다.
4. `packages/shared`를 수동 생성한다.
5. `packages/ui`를 수동 생성하고 shadcn CLI 대상으로 설정한다.
6. `packages/ui`에서 `shadcn add --all`을 실행한다.
7. 현재 `.codex/skills`를 그대로 복사한다.
8. `agents-guide.md` 기준으로 root/app/package `AGENTS.md`를 작성한다.
9. root scripts, ESLint, TypeScript, Docker Compose, PgTyped를 구성한다.
10. auth + board 세로 슬라이스를 구현한다.
11. `npm run verify`를 통과시킨다.

## 의존성

루트 dev dependencies:

- `eslint`, `@eslint/js`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
- `eslint-config-prettier`, `eslint-plugin-check-file`, `eslint-plugin-import`, `eslint-plugin-react-hooks`
- `globals`, `prettier`, `concurrently`, `husky`, `lint-staged`

Web dependencies:

- `react`, `react-dom`, `@vitejs/plugin-react`, `vite`, `typescript`
- `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/react-query`
- `react-hook-form`, `@hookform/resolvers`, `zod`
- `axios`, `lucide-react`, `nuqs`
- `<scope>/shared`, `<scope>/ui`
- `tailwindcss`, `@tailwindcss/vite`

API dependencies:

- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/cli`, `@nestjs/schematics`
- `reflect-metadata`, `rxjs`, `zod`
- `pg`, `@pgtyped/runtime`, `@pgtyped/cli`
- `better-auth`, `dotenv`
- `nestjs-cls`, `@nestjs-cls/transactional`
- `nestjs-pino`, `pino-http`
- `ts-node`, `tsconfig-paths`, `ts-loader`, `typescript`
- `<scope>/shared`

Shared dependencies:

- `zod`, `tsup`, `typescript`

UI dependencies:

- shadcn/Radix/lucide/cva/clsx/tailwind dependencies installed by `shadcn add --all`
- `react` and `react-dom` as peer dependencies

## 루트 scripts

사용자는 루트 script만 실행한다.

- `dev`: DB와 API/Web 개발 서버 실행
- `dev:web`: shared build 후 Web 실행
- `dev:api`: Docker Compose로 API 실행
- `dev:db`: Docker Compose로 PostgreSQL 실행
- `dev:db:stop`: DB 정지
- `db:generate`: PgTyped 생성
- `db:verify`: DB 준비 후 schema drift 확인
- `build`: shared, web, api build
- `typecheck`: shared, ui, web, api typecheck
- `lint`: ESLint
- `format`: Prettier write
- `format:check`: Prettier check
- `verify`: lint, format check, typecheck, db generate, db verify, build

`verify`는 필요한 DB 컨테이너 준비까지 root script 안에서 처리한다.

## API 기준

- PostgreSQL + SQL-first + PgTyped 고정
- ORM 금지
- in-memory store, array store, Map store 금지
- canonical schema: `apps/api-server/database/schema.sql`
- seed/demo data: `apps/api-server/database/dummy-data.sql`
- feature SQL: `apps/api-server/src/features/<feature>/database/*.sql`
- generated PgTyped output: 같은 feature의 `database/__generated__`
- generated query import는 repository 내부에만 허용
- multi-step write는 service transaction boundary에서 실행

## Web 기준

- Vite React
- TanStack Router file-based routes
- TanStack Query server state
- React Hook Form
- shared Zod contract
- API 호출은 `src/shared/api/http-client.ts` 경유
- route boundary는 `src/routes`
- page body는 `src/pages`
- feature api/hooks/model/ui는 `src/features/<feature>`

## UI 기준

- `packages/ui`는 초기 scaffold 때만 구성한다.
- `shadcn add --all`로 선택 테마의 shadcn primitive를 미리 추가한다.
- 기능 추가 단계에서는 `packages/ui`를 수정하지 않는다.
- 앱 전용 UI 조합은 Web feature/page에 둔다.
- Web은 `@nmm/ui/components` 같은 `<scope>/ui/components` public export만 사용한다.

## Starter 기능

Starter에는 auth + board만 둔다.

포함해야 할 패턴:

- DB-backed session/current user
- global success/error envelope
- shared Zod contract
- controller/service/domain/repository/database 계층
- PgTyped reader/writer
- authenticated write endpoint
- Web list/detail/create/update/delete 흐름
- React Query pending/error UI
- RHF + shared Zod form validation
