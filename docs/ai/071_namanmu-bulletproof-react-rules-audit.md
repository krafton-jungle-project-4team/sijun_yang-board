# Namanmu bulletproof-react 규칙 감사

날짜: 2026-06-17

## 기준

`bulletproof-react` 문서의 핵심 규칙을 현재 `namanmu-monorepo`에 대조했다.

- feature 기반 구조와 단방향 의존성
- 엄격한 TypeScript, lint, format, absolute import
- 단일 API client, shared contract, schema parse
- 서버 중심 인증/인가, 안전한 cookie, 입력 검증
- React Query 기반 server state, form schema 검증
- route-level code splitting, bundle 관리, 불필요한 re-render 축소
- unit/integration/e2e 테스트
- Error Boundary, 일관된 API error envelope

## 결론

부분 준수다. 구조 경계, API contract, 서버 검증, React Query 사용은 좋다. 남은 부족한 부분은 테스트 부재, UI 패키지 품질 게이트 누락, password 정책 약함, 위험 API 예외 문서화, production error tracking이다.

## 잘 지키는 항목

- Root 품질 게이트가 있다. `package.json`은 `lint`, `format:check`, `typecheck`, `build`를 `verify`로 묶는다.
- 모듈 경계를 ESLint로 막는다. `eslint.config.mjs`는 web -> api/server, api -> web/ui, shared -> app/runtime, ui -> app/server/shared import를 금지한다.
- Web API 호출은 `apps/web-client/src/shared/api/http-client.ts` 하나로 모여 있다. Axios instance가 `withCredentials: true`를 쓰고, 성공/실패 envelope를 shared Zod schema로 parse한다.
- API controller는 request body/query/param을 shared Zod schema로 parse한다. 예: `auth.controller.ts`, `posts.controller.ts`, `projects.controller.ts`.
- 인증은 서버 세션 기반이다. `better-auth.service.ts`는 session cookie에 `httpOnly`, `sameSite: "lax"`, production `secure`를 둔다.
- 쓰기 API는 guard와 service/domain 권한 검사를 함께 쓴다. 게시글/댓글은 작성자 또는 ADMIN만 변경 가능하고, 운영 기능은 ADMIN 또는 담당자 status 변경만 허용한다.
- React Query가 server state 표준으로 쓰인다. `QueryClientProvider`, `QueryErrorResetBoundary`, feature query/mutation hook이 있다.
- Form은 React Hook Form + Zod resolver를 주로 사용한다.
- API 응답과 에러 envelope가 일관적이다. `ApiResponseInterceptor`와 `ApiExceptionFilter`가 `requestId`를 포함한다.
- `npm audit --omit=dev`: 취약점 0건.

## 해결한 항목

1. Route-level code splitting
   - TanStack Router `autoCodeSplitting`을 다시 켰다.
   - Vite build가 page route chunk를 별도 asset으로 만든다.
   - `dist/assets/index-*.js`는 69.59 KB, gzip 17.18 KB다.
   - 가장 큰 chunk는 `vendor-*.js` 407.82 KB, gzip 128.26 KB다.
   - Vite chunk warning은 사라졌다.

2. Absolute import 규칙
   - `apps/web-client`와 `apps/api-server`에 `@/*` alias를 추가했다.
   - app 내부 import를 `@/*`로 정리했다.
   - ESLint가 app 내부 상위 상대 import를 막는다.

## 개선 필요

1. 테스트 기준 미충족
   - `apps`/`packages` 아래 `*.test.*`, `*.spec.*` 파일이 없다.
   - `npm run test:api`는 성공하지만 `tests 0`이다.
   - 개선: shared schema/domain unit test, API service/controller integration test, Web critical flow test, Playwright e2e를 추가하고 root `verify` 또는 별도 CI gate에 포함한다.

2. UI 패키지 품질 게이트 누락
   - `eslint.config.mjs`가 `packages/ui/src/components/**`와 `use-mobile.ts`를 ignore한다.
   - `npx react-doctor@latest --verbose`: `@nmm/web-client` 100점, `@nmm/ui` 55점, 64 warnings.
   - 주요 경고: `chart.tsx` raw HTML injection, `recharts` eager load, unstable context value, index key, 접근성 경고.
   - 개선: shadcn 원본 유지가 필요한 파일과 직접 수정 대상 파일을 나누고, UI 패키지도 최소 security/performance/accessibility lint 또는 React Doctor gate를 둔다.

3. Password 정책 약함
   - `packages/shared/src/contracts/auth.contract.ts`와 `better-auth.service.ts` 모두 password `min(1)`/`minPasswordLength: 1`이다.
   - 개선: 최소 길이와 복잡도 정책을 shared schema와 auth provider 설정에 동일하게 적용한다. 예: 8자 이상, 공백 trim/금지 정책, rate limit/lockout 정책 문서화.

4. 위험 API 예외가 문서화되지 않음
   - `better-auth.service.ts`가 ESM 동적 import를 위해 `new Function("specifier", "return import(specifier)")`를 쓴다.
   - 현재 specifier는 상수라 직접 exploit 가능성은 낮지만 security scanner와 CSP 관점에서 예외다.
   - 개선: 이유를 코드 주석/ADR로 남기거나 Node ESM interop을 다른 방식으로 분리한다.

5. Production error tracking 없음
   - Error Boundary와 API error envelope는 있지만 Sentry류 production error tracking은 보이지 않는다.
   - 개선: client route error, API 5xx, unhandled rejection을 requestId와 연결해 수집한다.

## 우선순위

1. 테스트 0건 문제 해결
2. UI 패키지 React Doctor/security 경고 처리
3. password 정책 강화
4. `new Function` 예외 문서화 또는 제거
5. production error tracking 추가

## 검증

- `npm audit --omit=dev`: 통과, 취약점 0건
- `npx react-doctor@latest --verbose`: 통과, `@nmm/web-client` 100점, `@nmm/ui` 55점/64 warnings
- `npm run test:api`: 통과, 테스트 0건
- `npm run verify`: 통과, Vite chunk warning 없음
