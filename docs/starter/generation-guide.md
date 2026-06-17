# Starter 생성 가이드

## 입력 제한

생성 에이전트는 원본 app/package 소스 코드를 읽지 않는다.

허용 입력:

- `docs/starter/*`
- `.codex/skills/**`

출력 starter에는 `docs/`를 만들지 않는다.

## 실행 변수

첫 검증은 다음 값을 쓴다.

- source repo: `/Users/sijun-yang/Documents/GitHub/namanmu-monorepo`
- output repo: 실행할 때 지정한다.
- package scope: `@nmm`

다른 프로젝트로 재사용할 때는 package scope만 일괄 치환한다. 첫 검증에서는 scope를 바꾸지 않는다.

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

출력 repo에는 다음을 만들지 않는다.

- `docs/`
- 원본 repo의 app/package 소스 복사본
- 기능 추가용 설명 문서

## 최소 산출물 체크리스트

생성 직후 다음 파일과 폴더가 있어야 한다.

- `AGENTS.md`
- `apps/web-client/AGENTS.md`
- `apps/api-server/AGENTS.md`
- `packages/shared/AGENTS.md`
- `packages/ui/AGENTS.md`
- `.codex/skills/shadcn/SKILL.md`
- `.codex/skills/toss-frontend-fundamentals/SKILL.md`
- `.codex/skills/vercel-composition-patterns/SKILL.md`
- `.codex/skills/vercel-react-best-practices/SKILL.md`
- `.codex/skills/web-design-guidelines/SKILL.md`
- `compose.yml`
- `eslint.config.mjs`
- `tsconfig.base.json`
- root `package.json`
- app/package별 `package.json`, `tsconfig`
- `apps/api-server/database/schema.sql`
- `apps/api-server/database/dummy-data.sql`
- `apps/api-server/pgtyped.config.json`
- `packages/ui/components.json`

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

각 단계는 끝난 뒤 산출물을 확인한다. 누락된 workspace나 script를 뒤 단계에서 임시로 우회하지 않는다.

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

`db:verify`는 로컬에 설치된 DB 도구를 암묵적으로 요구하지 않는다. Docker 또는 npm script로 재현 가능해야 한다.

## Verify 필수 조건

`npm run verify`는 fresh checkout에서도 한 번에 실행 가능해야 한다.

필수 포함:

- lint
- format check
- typecheck
- PgTyped generation
- schema drift check
- shared build
- web build
- api build

금지:

- 사용자가 API를 직접 켜야 통과하는 verify
- 수동 env export가 필요한 verify
- workspace 내부 script를 사용자가 직접 실행해야 하는 verify

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
- global prefix는 `api`
- success/error response envelope는 global interceptor/filter에서 처리
- controller/service는 envelope를 직접 만들지 않음
- write endpoint는 명시적으로 public이 아니면 authenticated guard 사용

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
- route generated file은 프레임워크 생성물로 취급
- hand-written JSX prop에 익명 함수 직접 전달 금지
- event handler는 `handle*` 이름 사용

## UI 기준

- `packages/ui`는 초기 scaffold 때만 구성한다.
- `shadcn add --all`로 선택 테마의 shadcn primitive를 미리 추가한다.
- 기능 추가 단계에서는 `packages/ui`를 수정하지 않는다.
- 앱 전용 UI 조합은 Web feature/page에 둔다.
- Web은 `@nmm/ui/components` 같은 `<scope>/ui/components` public export만 사용한다.

## Starter 기능

Starter에는 auth + board만 둔다.

포함해야 할 패턴:

- DB-backed signup/login/logout/current user
- global success/error envelope
- shared Zod contract
- controller/service/domain/repository/database 계층
- PgTyped reader/writer
- authenticated write endpoint
- Web login/signup/current user 흐름
- board post list/detail/create/update/delete 흐름
- board comment create/delete 흐름
- React Query pending/error UI
- RHF + shared Zod form validation

Starter 밖 기능은 만들지 않는다.

- bookmarks
- taxonomy/labels
- review state transition
- dashboard/read model

위 기능은 검증 하네스가 다음 단계에서 요구사항만 주고 추가한다.

## 생성 실패로 봐야 하는 신호

- `docs/`를 생성함
- 원본 app/package 소스를 읽거나 복사함
- API가 in-memory store를 사용함
- ORM을 설치하거나 사용함
- Web이 API server 파일을 직접 import함
- shared가 React, Nest, Node, DB를 import함
- PgTyped generated type이 service/controller로 새어 나감
- 기능 추가 전부터 `packages/ui`에 app-specific UI가 들어감
- `npm run verify`가 DB 검증 없이 통과함
