# Starter 문서 목표

이 문서 묶음의 1차 목표는 팀 설명이 아니라 재현성 검증이다.

문서를 읽은 AI가 원본 코드를 보지 않고 다음을 수행해야 한다.

- Vite/Nest 기반 starter 생성
- 현재 `.codex/skills` 복사
- root/app/package별 `AGENTS.md` 생성
- `npm run verify` 통과
- 구현 세부 없는 기능 요구사항을 받고 기존 규칙대로 기능 추가

팀 공유용 아키텍처 문서는 이 검증이 통과한 뒤 별도로 작성한다.

## 핵심 결정

- 생성 문서는 원본 repo의 `docs/starter`에만 둔다.
- generated starter에는 `docs/`를 만들지 않는다.
- generated starter의 지침은 `AGENTS.md`, 하위 `AGENTS.md`, `.codex/skills`, ESLint, TypeScript, npm scripts, 예시 기능 코드로 전달한다.
- package scope는 placeholder로 설명하되 첫 검증은 `@nmm/*`로 고정한다.
- starter 기능은 auth + board만 포함한다.
- 기능 검증은 `bookmarks`부터 시작하고, 2차 하네스에서 taxonomy, state transition, dashboard를 검증한다.
- 1차 생성, 2차 기능 추가, 3차 지침 간략화는 모두 단계별 토너먼트로 검증한다.

## 읽는 순서

- `architecture-rationale.md`: 현재 규칙/라이브러리와 구조 선택 이유
- `agents-guide.md`: generated starter에 둘 `AGENTS.md` 초안과 변경점
- `generation-guide.md`: starter 생성 절차
- `skill-copy-guide.md`: `.codex/skills` 복사 기준
- `verification-harness.md`: 1차/2차/3차 검증 방식
- `strategy-tournament.md`: 단계별 전략 후보
- `prompts/`: 장기 goal 실행용 프롬프트 초안
