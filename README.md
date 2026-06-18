# NMM Template

크래프톤 정글 12기 4팀의 신규 프로젝트 참고 자료로 정리한 풀스택 보일러플레이트다.

도메인 자체가 중요한 프로젝트는 아니다. 게시판과 운영 관리 화면은 인증, 목록/상세, 폼, 권한, 서버 상태, DB 쿼리, 공통 UI를 어떤 경계로 나눌지 보여주기 위한 예시 구현이다.

## 구성

```txt
.
├── apps
│   ├── web-client      # Vite React 클라이언트
│   └── api-server      # NestJS API 서버
└── packages
    ├── shared          # API 계약용 Zod schema와 export 타입
    └── ui              # shadcn/Radix 기반 공용 UI primitive
```

- `apps/web-client`: 라우트, 페이지, 기능별 API/query/form/UI 조합을 담는다.
- `apps/api-server`: HTTP controller, service use case, PgTyped repository, DB schema/query를 담는다.
- `packages/shared`: API 요청/응답 envelope와 기능별 계약을 Zod schema로 정의한다.
- `packages/ui`: 앱에 묶이지 않는 버튼, 폼, 다이얼로그 같은 primitive를 제공한다.

## 기술 선택

| 기술                          | 이유                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| npm workspaces                | 앱과 패키지를 한 저장소에서 연결해 shared contract와 UI primitive 변경을 바로 검증한다.  |
| TypeScript strict 설정        | API, Web, shared package 사이에서 타입 추론을 최대한 유지하고 암묵적인 값 누락을 줄인다. |
| React, Vite                   | SPA 클라이언트를 빠르게 개발하고, 라우팅과 서버 상태 도구를 직접 조합하기 쉽다.          |
| TanStack Router               | 파일 기반 라우트와 타입 안전한 route context/search params를 사용한다.                   |
| TanStack Query                | 서버 상태, mutation 대기/오류/무효화 책임을 컴포넌트 상태와 분리한다.                    |
| React Hook Form, Zod          | 폼 상태는 가볍게 관리하고 입력 검증은 shared schema와 같은 기준을 재사용한다.            |
| NestJS                        | module, controller, service 경계가 명확해 기능별 서버 코드를 일관되게 늘릴 수 있다.      |
| PostgreSQL, PgTyped           | SQL을 원본으로 유지하면서 쿼리 입출력 타입을 생성해 repository 구현을 안전하게 만든다.   |
| better-auth                   | DB 기반 세션 인증을 예시 흐름에 포함해 로그인 이후 권한 확인까지 참고할 수 있게 한다.    |
| shadcn/Radix, Tailwind CSS    | 접근성 primitive와 유틸리티 스타일을 조합해 빠르게 일관된 UI를 만든다.                   |
| ESLint, Prettier, root verify | import 경계, 파일 규칙, 포맷, 타입체크, 빌드를 한 명령으로 검증한다.                     |

## 실행

```sh
cp apps/api-server/.env.example apps/api-server/.env
cp apps/web-client/.env.example apps/web-client/.env
npm install
npm run dev
```

`npm run dev`는 PostgreSQL, API, Web을 함께 실행한다.

## 확인

```sh
npm run verify
```

`npm run verify`는 PostgreSQL 실행, PgTyped 생성, DB schema drift 검증, lint, format check, typecheck, build를 순서대로 실행한다.

DB 관련 자세한 흐름은 `apps/api-server/README.md`를 참고한다.

## 테스트 계정

- 관리자: `admin` / `admin`
- 일반 사용자: `user` / `user`
