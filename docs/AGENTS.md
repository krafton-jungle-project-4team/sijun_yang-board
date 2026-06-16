# Documentation Rules

- Write as briefly as possible without losing meaning.
- Avoid repeated explanations and decorative phrasing.
- Apply `writing-guidelines` for docs writing, compression, and review.
- Generation logs live under `docs/generation`.
- AI work notes live under `docs/ai`.
- Each AI note includes reason, work, result, verification, and follow-up when relevant.
- Refer to the current commit as `이 메모가 포함된 커밋` if the note ships with it.
- Do not document implementation details that are not present in this project.
- Keep feature prompts short enough for the harness to verify project context.
- Verify with `npm run verify` from the repository root.
