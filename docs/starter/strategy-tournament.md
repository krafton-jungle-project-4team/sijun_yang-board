# 전략 토너먼트 후보

이 목록은 시작 후보일 뿐이다. 실행 중 실패 원인에 따라 새 전략을 추가한다.

## 1차 Starter 생성 전략

1. 긴 생성 가이드 + 짧은 goal prompt
2. 짧은 생성 가이드 + 체크리스트형 goal prompt
3. 파일 트리 먼저 생성 후 세부 구현
4. root scripts 먼저 고정 후 workspace 구현
5. DB/schema/PgTyped 먼저 구현 후 API/Web 연결
6. `AGENTS.md` 먼저 작성 후 코드 구현
7. ESLint/tsconfig 먼저 작성 후 코드 구현
8. `npm run verify` 항목을 단계별로 통과시키며 구현
9. dependency matrix를 먼저 작성하고 설치 후 구현
10. generated starter 금지 조건을 먼저 검사하며 구현
11. reviewer가 중간 산출물을 점검한 뒤 다음 workspace 구현
12. 실패 사례 체크리스트를 prompt 끝에 붙이고 구현

## 2차 기능 추가 전략

1. shared contract 먼저 작성
2. schema/sql/PgTyped 먼저 작성
3. API vertical slice 후 Web 연결
4. feature route/page skeleton 후 API 연결
5. mutation 권한/owner scope 먼저 설계
6. reader/writer repository 먼저 설계
7. domain rule 먼저 작성 후 service 구현
8. UI form/list/delete 흐름을 마지막에 연결
9. 기존 board feature와 구조 비교 후 구현
10. 각 계층 구현 후 즉시 typecheck
11. reviewer 체크리스트 통과 후 `npm run verify`
12. 실패 원인별 retry prompt로 재시도

## 3차 지침 간략화 전략

1. root는 구조만, 하위 `AGENTS.md`는 상세
2. root는 전역 금지만, 하위 `AGENTS.md`는 작업 순서 중심
3. 하위 `AGENTS.md`는 체크리스트형 문장만 사용
4. 하위 `AGENTS.md`는 계층 책임 중심으로 작성
5. 중복 규칙을 root에서만 유지
6. 치명 규칙만 하위에도 중복
7. 생성 가이드는 상세, generated `AGENTS.md`는 짧게
8. 생성 가이드는 짧게, generated `AGENTS.md`는 작업 순서 중심
9. reviewer prompt를 강하게 하고 `AGENTS.md`는 압축
10. 실패 사례는 verification harness에만 반영
11. 실패 사례 중 치명 항목만 `AGENTS.md`에 반영
12. 문장을 명령형으로 통일해 길이를 줄임

## 채택 방식

- 각 단계에서 상위 3개 전략을 남긴다.
- 다음 단계는 상위 전략만 대상으로 한다.
- 최종 후보는 교차 검증 10회 이상을 추가 실행한다.
- 최종 문서는 최고 점수 전략 1개 또는 상위 전략 혼합안으로 갱신한다.
