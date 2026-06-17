# UI 패키지 지침

## 범위

- `packages/ui`에 적용한다.
- 이 패키지는 앱과 무관한 shadcn/Radix primitive를 제공한다.
- shadcn primitive가 아닌 앱 전용 UI 조합은 이 패키지에 두지 않는다.
- TS/TSX 파일과 `src` 하위 폴더명은 kebab-case다.
- `*.config.ts` 같은 중간 확장자는 허용한다.

## 허용

- shadcn/Radix primitive 컴포넌트.
- shadcn/Radix/lucide/cva/clsx/tailwind-merge 유틸.
- `#lib/*` 같은 패키지 내부 가져오기.

## 금지

- 앱 도메인 코드.
- API 서버 코드.
- 공유 계약.
- Nest, Node runtime API, Vite 앱 코드.

## 규칙

- 공개 primitive는 `src/components.ts`에서 export한다.
- `cn`은 `src/lib/utils.ts`에 둔다.
- 가능한 경우 shadcn 호환 컴포넌트 API를 유지한다.
- shadcn/ui CLI 대상은 `packages/ui`다.
- `components.json`은 shadcn CLI 설정으로 유지한다.
- 색상 변경은 shadcn `tailwind.baseColor` 범주 안에서 고른다.
- `src/styles/globals.css`는 shadcn 기본 scaffold 중심으로 유지한다.

## 스킬

- shadcn primitive 검색, 추가, 업데이트, 조합에는 설치된 `shadcn` 스킬을 참고한다.
- `shadcn` 스킬과 충돌하면 이 파일의 패키지 경계, export, CLI 대상, 검증 규칙을 우선한다.
- Primitive API 판단에는 `vercel-composition-patterns`를 적용한다.
- UI 품질에는 `toss-frontend-fundamentals`, `web-design-guidelines`를 적용한다.

## 확인

- 변경 후 루트 `npm run verify`를 실행한다.
