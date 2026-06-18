# Web Client

Vite React 클라이언트다. 게시판과 운영 관리 화면은 예시 도메인이며, 이 앱에서는 라우트, 페이지, 기능별 API/query/form/UI 조합을 어디에 두는지 참고하는 것이 핵심이다.

## 폴더 구조

```txt
src
├── app                 # 전역 provider, router, root layout, route boundary, app-level UI
├── routes              # TanStack Router 파일 기반 라우트
│   └── <domain>        # route layout, index/detail/new/edit 같은 URL 경계
├── pages               # 라우트에서 렌더링하는 페이지 본문
│   └── <domain>        # 화면 단위 조합
├── features            # 기능별 클라이언트 코드
│   └── <domain>
│       ├── api         # HTTP 요청 함수
│       ├── hooks       # React Query hook, mutation hook
│       ├── model       # 검색 조건, 권한, 라벨 등 순수 모델
│       └── ui          # 기능 전용 UI 조합
└── shared
    ├── api             # 공통 HTTP client
    └── env             # 클라이언트 환경변수 schema
```

인증은 공통 세션 상태와 route guard에 영향을 주기 때문에 `features/auth`, `routes/login.tsx`, `routes/signup.tsx`, `routes/me.tsx`, `routes/auth.error.tsx`, `app/route-auth.ts`로 별도 흐름을 둔다.

## 기술 선택

| 기술                                  | 이유                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| React, Vite                           | SPA 개발 서버와 빌드를 가볍게 유지하고 앱 구조를 명시적으로 조합한다.             |
| TanStack Router                       | 파일 기반 라우트와 타입 안전한 route context/search params를 사용한다.            |
| TanStack Query                        | 서버 상태, mutation, 캐시 무효화, 대기/오류 상태를 한 곳에서 다룬다.              |
| React Hook Form, Zod                  | 폼 상태는 RHF가 맡고 입력 검증은 `@nmm/shared` 계약과 맞춘다.                     |
| Axios                                 | `src/shared/api/http-client.ts`에 요청/응답 처리를 모아 API 호출 방식을 통일한다. |
| `@nmm/shared`                         | API 응답을 Zod schema로 파싱하고 Web/API 사이의 타입 중복을 줄인다.               |
| `@nmm/ui`, shadcn/Radix, Tailwind CSS | 접근성 primitive를 재사용하고 앱 전용 조합은 feature/page에 둔다.                 |
| nuqs                                  | 목록 검색 조건처럼 URL에 남아야 하는 클라이언트 상태를 다룬다.                    |

## 개발 규칙

- API 호출은 `src/shared/api/http-client.ts`를 통해서만 수행한다.
- API 응답과 폼 입력 검증에는 `@nmm/shared`의 Zod 계약을 우선 사용한다.
- 라우트 파일은 URL 경계와 route layout을 소유하고, 큰 화면 본문은 `src/pages/<domain>`에 둔다.
- 기능별 요청 함수, query hook, mutation hook, 기능 전용 UI는 `src/features/<domain>`에 둔다.
- 서버 상태와 mutation 대기/오류 UI에는 React Query를 사용한다.
    - React Query는 코드는 api 폴더에 포함된다.
    - 기능별 mutation과 query만 export한다. options는 외부에 노출하지 않는다.
- 폼에는 React Hook Form과 공유 Zod schema를 함께 사용한다.
- 원시 HTML 조합을 직접 늘리기 전에 `@nmm/ui/components` primitive를 먼저 확인한다.

## 실행

전체 실행은 루트에서 한다.

```sh
npm run dev
```

Web만 직접 실행해야 할 때는 API가 이미 떠 있는 상태에서 workspace script를 사용한다.

```sh
npm run dev -w @nmm/web-client
```

## 확인

기본 검증은 루트에서 한다.

```sh
npm run verify
```

Web만 빠르게 확인할 때는 다음 명령을 사용할 수 있다.

```sh
npm run typecheck -w @nmm/web-client
npm run build -w @nmm/web-client
```
