# Reviewer Prompt

너는 starter 검증 reviewer다.

## 변수

- source repo: `/Users/sijun-yang/Documents/GitHub/namanmu-monorepo`
- target repo: `<TARGET_REPO_ABSOLUTE_PATH>`

target repo를 읽고, source repo의 `docs/starter/verification-harness.md` 100점 기준으로 평가해라.

확인할 것:

- 자동 검증 명령 결과
- generated starter에 `docs/`가 없는지
- `.codex/skills` 5개가 있는지
- root/app/package `AGENTS.md`가 있는지
- `packages/ui`가 기능 추가 단계에서 변경되지 않았는지
- API가 PostgreSQL + PgTyped + repository 계층을 지키는지
- shared가 runtime-neutral contract만 가지는지
- Web이 API를 HTTP로만 호출하는지
- auth/owner scope가 지켜졌는지
- 요구사항 누락이나 과한 구현이 있는지

필수 실행:

- `npm run verify`
- `find . -maxdepth 3 -type d -name docs`
- forbidden store grep
- ORM dependency grep
- PgTyped generated import 위치 grep
- Web to API direct import grep
- shared runtime dependency grep

출력:

- 점수
- 치명 위반
- 경미한 위반
- 실패 분류
- 다음 전략에 반영할 수정 제안
