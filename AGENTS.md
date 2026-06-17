# 저장소 지침

## 역할

- 이 파일은 전역 원칙과 하위 지침 라우팅만 둔다.
- 더 구체적인 하위 `AGENTS.md`가 있으면 그 문서를 우선한다.

## 공통

- AGENTS에는 사람이 판단해야 하는 경계, 도구 선택, 검증 기준만 둔다.
- 파일/폴더명, import 제한, 포맷처럼 lint/타입체크/빌드가 검출하는 규칙은 문서에 반복하지 않고 `eslint.config.mjs`, `tsconfig*`, Prettier, 도구 설정을 신뢰한다. 이유는 읽고 검증해야 할 규칙을 줄이고 자동화 가능한 판단은 항상 같은 도구가 맡게 하기 위해서다.
- 새 반복 규칙은 가능한 한 AGENTS보다 lint/검증에 추가한다.
- 변경 검증은 루트 `npm run verify`를 기본으로 한다.
- 모듈 경계는 `eslint.config.mjs`와 하위 `AGENTS.md`를 따른다.
- 공통 strict/base TypeScript 옵션은 `tsconfig.base.json`에 둔다.
- 환경변수는 앱별 env 스키마 한 곳에서 Zod로 검증하고, 코드에서는 기본값/fallback 없이 누락 시 실패하게 한다.

## 라우팅

- Web/React 작업은 `apps/web-client/AGENTS.md`를 따른다.
- API, DB, PgTyped 작업은 `apps/api-server/AGENTS.md`를 따른다.
- 공유 계약과 타입은 `packages/shared/AGENTS.md`를 따른다.
- 공용 UI primitive는 `packages/ui/AGENTS.md`를 따른다.
- 교차 변경은 관련 하위 문서를 모두 따른다.
