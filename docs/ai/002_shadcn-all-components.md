# shadcn 전체 컴포넌트 설치

날짜: 2026-06-12

## 이유

템플릿에서 shadcn/ui 컴포넌트를 바로 쓸 수 있게 했다.

## 작업

- 이 메모가 포함된 커밋: `npx shadcn@latest add --all --yes --overwrite`로 UI 컴포넌트를 설치했다.
- `packages/ui/src/components.ts`에 새 컴포넌트 export를 추가했다.
- 생성 코드의 lint/type 오류를 최소 수정했다.

## 결과

- 검증: `npm run verify` 통과.
