# 설계 사유와 현재 기준선

이 문서는 starter 생성 절차보다 먼저 읽는다.

목표는 현재 repo에 어떤 규칙과 라이브러리가 있는지 이해하고, 그중 무엇을 starter 규칙으로 가져갈지 구분하는 것이다.

## 한 문장 요약

이 repo는 Web, API, Shared Contract, UI Primitive를 분리하고, AI가 새 기능을 추가할 때 경계를 넘거나 임시 구현으로 빠지지 않도록 lint, TypeScript, root scripts, `AGENTS.md`, 예시 기능으로 강제한다.

## 구조

| 위치              | 역할                         | 핵심 금지                         |
| ----------------- | ---------------------------- | --------------------------------- |
| `apps/web-client` | 브라우저 UI                  | API 서버/Nest/Node/DB 직접 import |
| `apps/api-server` | Nest API                     | Web/UI/React/Vite import          |
| `packages/shared` | Zod contract와 exported type | React/Nest/Node/DB/app import     |
| `packages/ui`     | shadcn/Radix primitive       | app domain/shared/API import      |

이 분리는 “기능 구현 위치”를 강제한다. 예를 들어 Web은 API를 HTTP로만 호출하고, API는 shared contract만 본다.

## 현재 라이브러리 지도

### Root

- `npm workspaces`: `apps/*`, `packages/*`를 한 repo에서 관리
- `eslint`: import 경계, React hooks, 파일명 규칙 강제
- `prettier`: 포맷 전담
- `typescript`: 공통 strict 기준
- `concurrently`: Web/API 개발 서버 동시 실행
- `husky`, `lint-staged`: commit 전 포맷/lint 보조

### Web

- `vite`, `@vitejs/plugin-react`: React app build/dev
- `react`, `react-dom`: UI runtime
- `@tanstack/react-router`: file-based routing
- `@tanstack/react-query`: server state와 mutation 상태
- `react-hook-form`, `@hookform/resolvers`: form state와 Zod 연결
- `zod`: shared contract parse
- `axios`: HTTP client
- `nuqs`: URL query state
- `tailwindcss`, `@tailwindcss/vite`: styling
- `lucide-react`: icon

### API

- `@nestjs/*`: HTTP API framework
- `pg`: PostgreSQL client
- `@pgtyped/runtime`, `@pgtyped/cli`: SQL-first typed query
- `better-auth`: auth/session 기반
- `nestjs-cls`, `@nestjs-cls/transactional`: request context와 transaction boundary
- `nestjs-pino`, `pino-http`: logging
- `zod`: request/response boundary validation
- `dotenv`: env loading

### Shared

- `zod`: wire contract schema
- `tsup`: shared package build

### UI

- `radix-ui`, `@base-ui/react`: accessible primitive 기반
- `lucide-react`: icon
- `class-variance-authority`, `clsx`, `tailwind-merge`: variant/class composition
- `react-hook-form`, `zod`: shadcn form primitive 지원
- `cmdk`, `vaul`, `sonner`, `recharts`, `react-day-picker` 등: shadcn component dependency

## 현재 규칙 지도

### 실행 규칙

- 사용자가 실행하는 작업은 root `package.json` script로 제공한다.
- API 개발 서버는 Docker Compose를 감싼 root script로 실행한다.
- API를 직접 `nest start`나 임의 env 조합으로 실행하지 않는다.

현재 repo의 `npm run verify`는 lint, format check, typecheck, build를 실행한다. Starter 목표에서는 여기에 DB/PgTyped/schema drift 검증까지 포함한다.

### TypeScript 규칙

공통 기준은 `tsconfig.base.json`에 둔다.

- `strict`
- `isolatedModules`
- `verbatimModuleSyntax`
- `noUncheckedIndexedAccess`
- `noImplicitOverride`

이 조합은 암묵적 any, 모듈 해석 차이, 배열/객체 접근 누락을 줄인다.

### 파일/폴더명 규칙

- TS/TSX 파일명은 kebab-case
- `src` 하위 폴더명은 kebab-case
- `*.contract.ts`, `*.config.ts` 같은 중간 확장자는 허용
- TanStack Router route/generated 파일은 프레임워크 규칙을 따른다

AI가 새 파일을 만들 때 이름 스타일이 섞이지 않도록 ESLint가 강제한다.

### Import 규칙

- 같은 폴더 import는 `./*`
- 앱 내부의 다른 `src` 폴더 import는 `@/*`
- hand-written source에서 `../*` 금지
- workspace 간 import는 package name 사용

이 규칙은 파일 이동과 feature 확장 때 상대 경로가 길어지는 문제를 막는다.

### Web 규칙

- API 호출은 `src/shared/api/http-client.ts`를 통해서만 한다.
- Web은 API 서버 코드를 import하지 않는다.
- server state는 TanStack Query로 둔다.
- form은 React Hook Form과 shared Zod schema로 처리한다.
- route boundary는 `src/routes`, 큰 page body는 `src/pages`, feature 구현은 `src/features/<feature>`에 둔다.
- JSX prop에 익명 함수를 직접 넣지 않는다.

### API 규칙

- controller는 shared Zod schema로 boundary를 parse한다.
- service는 use case orchestration과 transaction boundary를 소유한다.
- domain은 plain snapshot type과 pure function 중심이다.
- DB 접근은 PgTyped-backed repository로만 한다.
- generated query import와 generated `I*` type은 repository 내부에만 둔다.
- reader/writer/view-query 역할을 나눈다.
- in-memory store, array store, Map store는 금지한다.

### Shared 규칙

- Zod contract와 exported type만 둔다.
- React, Nest, Node runtime, DB, app code를 import하지 않는다.
- API와 Web은 shared schema를 boundary에서 parse한다.

### UI 규칙

- `packages/ui`는 shadcn/Radix primitive package다.
- app-specific UI 조합은 Web feature/page에 둔다.
- Web은 `@nmm/ui/components` 같은 public primitive export를 사용한다.
- Starter 목표에서는 초기 `shadcn add --all` 이후 기능 추가 단계에서 `packages/ui` 수정을 금지한다.

## 왜 이렇게 나누는가

AI 기능 추가에서 자주 생기는 실패는 다음이다.

- API 없이 Web local state만 만든다.
- DB 없이 array/Map store를 만든다.
- Web이 API server 파일을 직접 import한다.
- shared contract 없이 API/Web shape를 따로 만든다.
- generated DB type이 service/controller까지 새어 나온다.
- app 전용 UI가 공용 UI package에 들어간다.
- 문서나 새 규칙을 기능 구현 대신 만든다.

현재 구조는 이 실패를 코드 경계와 검증으로 막는다.

## Starter로 가져갈 것

- npm workspace 구조
- Vite React Web
- Nest API
- `packages/shared` Zod contract
- `packages/ui` shadcn/Radix primitive
- root script 중심 실행
- strict TypeScript
- ESLint import/naming/React rules
- PostgreSQL + SQL-first + PgTyped
- Better Auth 기반 DB-backed session/current user
- global success/error envelope
- root/app/package `AGENTS.md`
- 현재 `.codex/skills` 복사

## Starter에서 줄일 것

- 현재 repo의 여러 product feature
- 현재 repo의 generation 기록
- generated starter 내부 `docs/`
- 기능명에 묶인 권한 문구

Starter는 auth + board만 포함한다. 기능 추가 검증은 bookmarks부터 시작한다.

## Starter에서 보강할 것

- `npm run verify`에 DB/PgTyped/schema drift 검증 포함
- 기능 추가 단계에서 `packages/ui` 수정 금지
- generated starter에 `docs/` 생성 금지
- `AGENTS.md`는 기능명이 아니라 feature 추가 규칙 중심으로 작성
- 1차 생성, 2차 기능 추가, 3차 지침 간략화를 모두 전략 토너먼트로 검증

## 먼저 이해할 순서

1. 이 문서로 구조, 라이브러리, 규칙을 이해한다.
2. `agents-guide.md`로 AI에게 전달할 규칙의 위치를 본다.
3. `generation-guide.md`로 생성 절차를 본다.
4. `verification-harness.md`로 성공 기준을 본다.
