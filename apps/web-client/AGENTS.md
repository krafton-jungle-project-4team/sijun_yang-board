# 웹 클라이언트 지침

- 이 앱은 `src/shared/api/http-client.ts`로만 API를 호출한다.
- Zod 계약과 응답 파싱에는 `@nmm/shared`를 사용한다.
- 원시 컨트롤이나 의미/레이아웃 태그를 직접 만들기 전에 `@nmm/ui/components` 또는 shadcn primitive를 확인한다.
- 맞는 `@nmm/ui` primitive가 없으면 앱 전용 UI 조합은 기능/페이지 코드에 둔다.
- 앱 CSS 파일, 직접 CSS 선택자, 직접 테마 토큰 변경은 피한다.
- 파일 기반 라우트는 `src/routes` 아래에 둔다.
- 라우트 파일은 라우트 경계와 공유 라우트 레이아웃을 소유한다. 큰 페이지 본문은 `src/pages` 아래에 둘 수 있다.
- 기능별 API/query hook은 `src/features/<feature>` 아래에 둔다.
- 서버 상태와 mutation 대기/오류 UI에는 React Query를 사용한다.
- 폼에는 RHF와 공유 Zod schema를 함께 사용한다.
- 직접 작성한 앱 클래스에는 클래스 JSDoc을 둔다. 주석에는 클래스가 맡는 책임 설명, 사용하는 상황, 주의점이나 제약을 포함한다.
- 이 앱에서는 shadcn 공식 가져오기/경로 예시를 `@nmm/ui/components`로 해석한다.
- `shadcn` 스킬과 충돌하면 이 앱의 경계, 가져오기, UI, 검증 규칙을 우선한다.
- React/UI 변경은 React Doctor(`npx react-doctor@latest --verbose`), `toss-frontend-fundamentals`, `vercel-react-best-practices`로 확인한다.
- 컴포넌트 API 변경에는 `vercel-composition-patterns`를 적용한다.
