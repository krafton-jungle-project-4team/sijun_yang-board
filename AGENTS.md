# 저장소 지침

## 역할

- 이 파일은 전역 원칙과 하위 지침 라우팅만 둔다.
- 더 구체적인 하위 `AGENTS.md`가 있으면 그 문서를 우선한다.

## 공통

- 문서는 같은 의미를 유지하는 한 가장 짧게 쓴다.
- 변경 검증은 루트 `npm run verify`를 기본으로 한다.
- 모듈 경계는 `eslint.config.mjs`와 하위 `AGENTS.md`를 따른다.
- 공통 strict/base TypeScript 옵션은 `tsconfig.base.json`에 둔다.

## 라우팅

- Web/React 작업은 `apps/web-client/AGENTS.md`를 따른다.
- API, DB, PgTyped 작업은 `apps/api-server/AGENTS.md`를 따른다.
- 공유 계약과 타입은 `packages/shared/AGENTS.md`를 따른다.
- 공용 UI primitive는 `packages/ui/AGENTS.md`를 따른다.
- 문서 작업은 `docs/AGENTS.md`를 따른다.
- 교차 변경은 관련 하위 문서를 모두 따른다.
