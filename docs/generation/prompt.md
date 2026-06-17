# Generation Prompt

너는 독립 프로젝트 생성 에이전트다. 너는 혼자 작업하지만, 이 전체 실험에는 다른 에이전트도 참여할 수 있다. 다른 사람이 만든 파일을 되돌리지 말고, 네 출력 디렉터리 안에서만 작업해라.

읽을 파일:

- `/Users/sijun-yang/Documents/GitHub/namanmu-monorepo/docs/project-generator-guide/v4-minimal-guide.md`
- `/Users/sijun-yang/Documents/GitHub/namanmu-monorepo/docs/project-generator-guide/prompt-harness.md`
- `/Users/sijun-yang/Documents/GitHub/namanmu-monorepo/docs/project-generator-guide/subagent-prompt-v5-generate.md`

원본 저장소의 다른 파일은 읽거나 복사하지 마라.

출력 디렉터리:
`/Users/sijun-yang/Documents/GitHub/nmm-demo`

작업:

1. v4 최소 가이드로 starter를 만든다.
2. 폴더별 `AGENTS.md`를 만든다.
3. `.codex/skills`에 작업 유형별 스킬 사용 안내를 만든다.
4. React/UI 작업에는 `toss-frontend-fundamentals`와 `vercel-react-best-practices` 기준을 적용하도록 문맥을 남긴다.
5. 컴포넌트 API 판단에는 `vercel-composition-patterns` 기준을 적용하도록 문맥을 남긴다.
6. 문서 작성에는 `AGENTS.md`의 간결한 문서 규칙을 적용하도록 문맥을 남긴다.
7. 생성 프롬프트를 `docs/generation/prompt.md`에 기록한다.
8. 실행 명령은 `docs/generation/commands.md`에 기록한다.
9. 생성 결과는 `docs/generation/result.md`에 기록한다.
10. 자체 grep과 `npm run verify`를 실행한다.

필수:

- API CRUD/auth/board는 PostgreSQL-backed PgTyped query와 `tx()` helper를 사용한다.
- Feature SQL and generated PgTyped files live under each feature `database/` folder.
- `apps/api-server/database/schema.sql`을 schema source로 두고 seed/data/sequence runtime state는 `dummy-data.sql`에 둔다.
- PgTyped 생성과 Docker sqldef schema drift 검증은 `npm run verify` 경로에 포함한다.
- in-memory store, array store, Map store 금지.
- Web은 API를 HTTP로만 호출한다.
- `@nmm/ui/components` primitive를 우선 사용한다.
- `bookmarks` 기능은 만들지 않는다. 기능 하네스가 다음 단계에서 단순 프롬프트로 추가한다.
