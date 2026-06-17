# Route code splitting과 absolute import 정리

날짜: 2026-06-17

## 이유

`apps/web-client` build에서 큰 `index-*.js` chunk warning이 났다. `docs/ai/071_namanmu-bulletproof-react-rules-audit.md`는 route-level code splitting과 absolute import도 개선 대상으로 기록했다.

## 작업

- 관련 커밋: 이 메모가 포함된 커밋
- TanStack Router Vite plugin의 `autoCodeSplitting`을 다시 켰다.
- Vite 8 Rolldown `codeSplitting.groups`로 React, TanStack, UI, 기타 vendor chunk를 나눴다.
- `apps/web-client`와 `apps/api-server`에 `@/*` alias를 추가했다.
- app 내부 import를 `@/*`로 정리했다.
- ESLint가 app 내부 상위 상대 import를 막도록 했다.

## 결과

- route page component가 별도 lazy chunk로 build된다.
- `dist/assets/index-*.js`는 69.59 KB, gzip 17.18 KB다.
- 가장 큰 chunk는 `vendor-*.js` 407.82 KB, gzip 128.26 KB다.
- Vite chunk warning은 사라졌다.

## 검증

- `npm run verify`: 통과
- `npx react-doctor@latest --verbose`: 통과, `@nmm/web-client` 100점
- dev server의 `?tsr-split=component` 응답: `200 OK`

## 후속

- `@nmm/ui` React Doctor 경고는 별도 작업으로 처리한다.
