# Starter 생성 Goal Prompt

너는 독립 starter 생성 에이전트다.

목표: 문서와 복사 허용 skill만 보고 새 TypeScript monorepo starter를 만든다.

## 변수

- source repo: `/Users/sijun-yang/Documents/GitHub/namanmu-monorepo`
- output repo: `<OUTPUT_REPO_ABSOLUTE_PATH>`
- package scope: `@nmm`

허용 입력:

- source repo의 `docs/starter/*`
- source repo의 `.codex/skills/**`

금지:

- source repo의 `apps/*`, `packages/*`, root source/config 파일 읽기
- generated starter에 `docs/` 생성
- ORM 사용
- in-memory store, array store, Map store 사용
- 기능 추가 단계에서 쓸 문서 생성

## 작업

1. `docs/starter/architecture-rationale.md`를 읽고 구조 의도를 이해한다.
2. `docs/starter/generation-guide.md`를 따라 output repo를 만든다.
3. `docs/starter/agents-guide.md` 기준으로 root/app/package `AGENTS.md`를 작성한다.
4. source repo의 `.codex/skills`를 output repo로 그대로 복사한다.
5. Vite React Web, Nest API, shared contract, UI primitive package를 구성한다.
6. auth + board starter를 구현한다.
7. `npm run verify`를 통과시킨다.
8. 금지 패턴을 grep으로 자체 점검한다.

## 출력 repo 필수 구조

- npm workspace monorepo
- `apps/web-client`
- `apps/api-server`
- `packages/shared`
- `packages/ui`
- `.codex/skills` 복사본
- root/app/package `AGENTS.md`
- `compose.yml`
- `eslint.config.mjs`
- `tsconfig.base.json`
- auth + board starter

## 완료 조건

- `npm run verify` 통과
- generated starter에 `docs/` 없음
- `.codex/skills` 5개 존재
- root/app/package `AGENTS.md` 존재
- PostgreSQL + PgTyped 기반 API
- Vite React Web이 HTTP로 API 호출
- `packages/ui`는 shadcn `add --all` 후 public primitive export
- `packages/shared`는 runtime-neutral Zod contract만 포함
- API generated PgTyped import는 repository 내부에만 존재

## 최종 보고

다음을 짧게 보고한다.

- output repo path
- 실행한 명령
- `npm run verify` 결과
- 자체 grep 점검 결과
- 남은 위험
