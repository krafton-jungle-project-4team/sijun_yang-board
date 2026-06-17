# 저장소 지침

## 문서 작성

- 문서는 같은 의미를 유지하는 한 가장 짧게 쓴다.
- 불필요한 미사여구와 반복 설명을 쓰지 않는다.

## 프로젝트 표준

- 변경 후 `npm run verify`로 lint, format check, typecheck, build를 함께 확인한다.
- 개별 확인은 `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run build`를 쓴다.
- 개발 서버는 루트 npm script로만 실행한다. API 서버는 Docker Compose를 감싼 `npm run dev` 또는 `npm run dev:api`만 사용한다.
- API 서버를 직접 `nest start`, workspace `start:dev`, 임의 환경 변수 조합으로 실행하지 않는다. 로컬 환경 의존이 실행마다 달라지는 것을 막기 위함이다.
- 사용자가 실행하는 작업은 루트 `package.json` script로 제공한다.
- workspace script는 루트 script가 호출하는 내부 도구 명령으로만 둔다.
- 모듈 경계는 `eslint.config.mjs`와 앱별 `AGENTS.md`를 따른다.
- `apps/*`, `packages/*`의 TS/TSX 파일과 `src` 하위 폴더명은 kebab-case다.
- `*.contract.ts`, `*.config.ts` 같은 중간 확장자는 허용한다.
- TanStack Router 라우트 파일은 프레임워크/생성기 규칙을 따른다.
- 앱 내부에서 다른 `src` 하위 폴더를 import할 때는 `@/*`를 쓴다.
- `./*`는 같은 폴더 로컬 import에만 쓰고, `../*`는 생성 파일/생성기 규칙 파일만 허용한다.
- workspace 간 import는 패키지 이름으로 한다.
- `apps/web-client`는 `@nmm/shared`, `@nmm/ui`만 workspace import로 사용하고 API는 HTTP로 호출한다.
- `apps/api-server`는 `@nmm/shared`만 workspace import로 사용하고 web 코드를 import하지 않는다.
- `packages/shared`는 앱, React, Nest, Node 런타임, DB를 import하지 않는다.
- 공통 strict/base TypeScript 옵션은 `tsconfig.base.json`에 둔다.

## 프론트엔드 품질

- React 코드 작성, 수정, 리팩토링 때 `React Doctor`, `toss-frontend-fundamentals`, `vercel-react-best-practices`를 함께 적용한다.
- `React Doctor`는 `npx react-doctor@latest --verbose`로 진단하고 점수 하락 항목을 먼저 정리한다.
- `toss-frontend-fundamentals`는 가독성, 예측 가능성, 응집도, 결합도 순서로 적용한다.
- `vercel-react-best-practices`는 waterfall, bundle, data fetching, re-render 비용을 줄이는 기준으로 적용한다.

## UI 작업 규칙

- 설치된 `shadcn` skill은 공식 컴포넌트 예시, CLI, registry, 조합 패턴 참고용으로 사용한다.
- `shadcn` skill 내용이 이 저장소의 `AGENTS.md`, 하위 `AGENTS.md`, eslint, TypeScript, npm script 규칙과 충돌하면 저장소 규칙을 우선한다.
- 작은 UI나 HTML tag를 직접 작성하기 전에 `@nmm/ui/components` 또는 shadcn/ui primitive로 대체 가능한지 먼저 확인한다.
- 대체 가능한 primitive가 있으면 raw HTML 대신 `@nmm/ui/components`를 사용한다.
- `packages/ui`에는 shadcn primitive만 둔다. 앱 전용 UI 조합은 필요한 primitive가 없어도 feature/page에 둔다.
- `section`, `main`, `form`, `h1`, `p`, `div` 같은 의미/레이아웃 태그는 shadcn 대체 가능성을 확인한 뒤에만 직접 사용한다.
- 앱별 CSS 파일, 직접 CSS selector, 직접 theme token 추가/수정은 피한다.
