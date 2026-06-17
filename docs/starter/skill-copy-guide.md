# Skill 복사 기준

Generated starter에는 새 skill을 만들지 않는다. 현재 repo의 `.codex/skills`를 그대로 복사한다.

## 복사 대상

- `.codex/skills/shadcn`
- `.codex/skills/toss-frontend-fundamentals`
- `.codex/skills/vercel-composition-patterns`
- `.codex/skills/vercel-react-best-practices`
- `.codex/skills/web-design-guidelines`

## 규칙

- skill 원문과 하위 파일을 수정하지 않는다.
- generated starter의 `AGENTS.md`가 repo 규칙을 정하고, skill은 보조 지침으로 사용한다.
- skill 내용이 `AGENTS.md`, ESLint, TypeScript, npm script 규칙과 충돌하면 generated starter 규칙을 우선한다.
- 기능 추가 AI는 React/UI 작업에서 frontend quality 관련 skill을 사용한다.
- shadcn 예시는 Web에서 `<scope>/ui/components` import로 해석한다.

## 검증

- 5개 skill directory가 모두 있어야 한다.
- 각 directory에 `SKILL.md`가 있어야 한다.
- 기능 추가 과정에서 skill directory를 수정하지 않아야 한다.
