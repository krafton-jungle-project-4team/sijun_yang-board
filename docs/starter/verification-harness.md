# 검증 하네스

검증은 블라인드로 수행한다. 생성/기능/리뷰 에이전트는 필요한 입력만 읽는다.

## 공통 실행 원칙

- 각 단계는 10개 이상의 전략을 준비한다.
- 각 전략은 10회 이상 실행한다.
- 서브에이전트를 적극 사용한다.
- 실패는 원인별로 분류하고 다음 전략에 반영한다.
- 좋은 후보만 다음 단계로 올리는 토너먼트 방식으로 진행한다.

## 점수

총점 100점.

자동 검증 60점:

- `npm run verify` 통과
- DB/PgTyped/schema drift 검증 통과
- forbidden grep 통과
- generated starter에 `docs/` 없음
- `.codex/skills` 5개 존재
- root/app/package `AGENTS.md` 존재
- feature 단계에서 `packages/ui` 변경 없음

아키텍처 준수 30점:

- shared contract 우선
- API controller/service/domain/repository/database 계층 준수
- DB-backed repository 사용
- PgTyped generated import가 repository 밖으로 새지 않음
- Web route/page/feature 경계 준수
- `<scope>/ui/components` 우선 사용
- auth/owner/transaction/error 규칙 준수

지침 간결성 10점:

- 중복이 적음
- 하위 `AGENTS.md`가 자기 위치에서 바로 쓸 수 있음
- 불필요한 설명보다 행동 지침이 선명함

## 1차: Starter 생성 토너먼트

목표: 문서만 보고 재현 가능한 starter를 만든다.

절차:

1. starter 생성 전략 10개 이상을 준비한다.
2. 각 전략을 10회 이상 실행한다.
3. 생성 에이전트는 원본 app/package 소스 코드를 읽지 않는다.
4. 생성 에이전트는 `docs/starter/*`와 `.codex/skills/**`만 입력으로 사용한다.
5. reviewer 에이전트가 자동 검증과 수동 리뷰 점수를 매긴다.
6. 상위 3개 전략을 2차 검증 대상으로 올린다.

필수 통과:

- auth + board starter 생성
- generated starter에 `docs/` 없음
- `npm run verify` 통과
- API는 PostgreSQL + PgTyped
- Web은 HTTP-only API
- `packages/ui`는 shadcn preload 후 고정

## 2차: 기능 추가 토너먼트

목표: 구현 세부 없는 요구사항만으로 기능을 추가한다.

1차 기능:

- `bookmarks`: 로그인한 사용자가 URL과 제목을 저장하고, 내 목록을 보고, 삭제한다.

2차 기능군:

- taxonomy/many-to-many
- state transition
- read model/dashboard

절차:

1. 기능 추가 전략 10개 이상을 준비한다.
2. 1차 상위 starter에 각 전략을 10회 이상 적용한다.
3. 기능 에이전트는 generated starter만 읽는다.
4. 기능 에이전트는 starter 내부 `AGENTS.md`, `.codex/skills`, 기존 코드만 따른다.
5. reviewer 에이전트가 점수를 매긴다.
6. 상위 3개 전략을 3차 검증 대상으로 올린다.

필수 통과:

- `npm run verify` 통과
- feature는 DB-backed
- user-owned 데이터는 current user로 scope
- shared contract, API, Web이 모두 연결됨
- `packages/ui` 변경 없음

## 3차: 지침 간략화 토너먼트

목표: 지침을 줄여도 품질이 유지되는 조합을 찾는다.

비교 대상:

- 생성 가이드 길이
- 생성 프롬프트 길이
- root/child `AGENTS.md` 배치
- 중복 규칙 위치
- reviewer 체크리스트 강도
- 실패 사례 반영 위치

절차:

1. 간략화 전략 10개 이상을 준비한다.
2. 각 전략으로 1차 starter 생성과 2차 기능 추가를 다시 실행한다.
3. 각 전략은 10회 이상 반복한다.
4. 점수 상위 전략을 채택하거나 혼합한다.
5. 최종 후보만 교차 검증으로 다시 10회 이상 실행한다.

통과 기준:

- baseline 대비 자동 검증 실패율이 증가하지 않음
- 치명 아키텍처 위반이 증가하지 않음
- 지침 길이는 줄되 모호성은 늘지 않음

## 실패 분류

- scaffold 실패
- dependency/script 실패
- lint/format/typecheck 실패
- DB/PgTyped/schema drift 실패
- generated starter에 금지 파일 생성
- import boundary 위반
- in-memory store 사용
- API layer 누수
- shared runtime-neutral 위반
- Web feature boundary 위반
- UI package 수정
- auth/owner scope 누락
- over-engineering
- 요구사항 누락
