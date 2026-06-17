# NMM Template

새 프로젝트를 빠르게 시작하기 위한 풀스택 보일러플레이트다.

Web, API, shared contract, UI primitive를 분리해 기능 추가 위치를 명확히 하고, root script와 검증 명령으로 로컬 실행 차이를 줄인다. 기본 예시는 세션 인증과 게시판 흐름을 포함한다.

## 구성

- `apps/web-client`: Vite React 클라이언트
- `apps/api-server`: NestJS API 서버
- `packages/shared`: API 계약용 Zod schema와 타입
- `packages/ui`: shadcn/Radix 기반 UI primitive

## 기술 선택

| 기술                              | 이유                                            |
| --------------------------------- | ----------------------------------------------- |
| npm workspaces                    | 앱과 패키지를 한 repo에서 단순하게 연결한다.    |
| React, Vite                       | 클라이언트 개발 서버와 빌드를 가볍게 유지한다.  |
| TanStack Router, TanStack Query   | 라우팅, URL 상태, 서버 상태 책임을 분리한다.    |
| React Hook Form, Zod              | 폼 상태와 입력 검증을 shared schema로 맞춘다.   |
| NestJS                            | controller, service, module 경계를 명확히 둔다. |
| PostgreSQL, PgTyped               | SQL을 원본으로 두고 쿼리 타입을 생성한다.       |
| better-auth                       | DB 기반 세션 인증을 보일러플레이트에 포함한다.  |
| shadcn/Radix, Tailwind CSS        | 접근성 primitive와 유틸리티 스타일을 조합한다.  |
| ESLint, Prettier, strict TSConfig | import 경계, 이름 규칙, 타입 기준을 자동화한다. |

## 실행

```sh
cp apps/api-server/.env.example apps/api-server/.env
npm install
npm run dev
```

`npm run dev`는 PostgreSQL, API, Web을 함께 실행한다.

## 확인

```sh
npm run verify
```

`npm run verify`는 PostgreSQL을 실행한 뒤 PgTyped 생성, schema drift 검증, lint, format check, typecheck, build를 실행한다.

DB 스키마만 확인하려면 `npm run db:verify`를 사용한다. 로컬 DB 데이터를 버리고 `schema.sql`/`dummy-data.sql` 기준으로 다시 만들 때만 `npm run db:forcesync`를 사용한다.

## 테스트 계정

- 관리자: `admin` / `admin`
- 일반 사용자: `user` / `user`
