# 공유 패키지 지침

- 이 패키지는 런타임에 중립적인 Zod 계약과 export 타입을 담는다.
- TS 파일과 `src` 하위 폴더명은 kebab-case를 사용한다.
- `*.contract.ts`, `*.config.ts` 같은 중간 확장자는 허용한다.
- React, Nest, TypeORM, pg, Node 런타임, DB 코드, 앱 코드를 가져오지 않는다.
- API 컨트롤러와 웹 클라이언트는 경계에서 이 스키마들을 파싱한다.
- 서비스 코드는 추론/공유 타입을 사용할 수 있지만 API 형태를 다시 정의하면 안 된다.
- Export된 응답 타입 이름은 `Comment`, `PostSummary`, `TaskSummary`처럼 전송 형태와 맞춘다. 실제 로컬 이름 충돌을 해결할 때가 아니면 `Dto` 접미사를 피한다.
- 내부에서는 기본 스키마 조각을 재사용하되, API 계약을 명시적으로 바꾸는 경우가 아니면 기존 export schema/type 이름과 JSON field를 유지한다.
- Envelope 스키마는 `src/contracts/api.contract.ts`에 둔다.
- Auth 계약은 `src/contracts/auth.contract.ts`에 둔다.
- Board/post/comment/tag 계약은 `src/contracts/post.contract.ts`에 둔다.
- 새 기능 계약은 API/Web 구현 전에 여기에 먼저 추가한다.
- `npm run build --workspace @nmm/shared`로 빌드한다.
- 저장소 루트에서 `npm run verify`로 검증한다.
