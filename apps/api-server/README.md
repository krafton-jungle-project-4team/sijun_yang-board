# API Server

NestJS API 서버다. 게시판과 운영 관리는 예시 도메인이며, 이 서버에서는 controller, service, repository, domain, SQL query, schema drift 검증을 어떤 경계로 나누는지 참고하는 것이 핵심이다.

## 폴더 구조

```txt
.
├── database
│   ├── schema.sql          # DB schema 원본
│   └── dummy-data.sql      # 예시 seed data와 sequence runtime state
├── scripts
│   ├── force-sync-db.mjs   # schema.sql 기준 강제 동기화 (기존 데이터 삭제)
│   └── verify-schema-drift.mjs  # sqldef를 사용한 실제 DB와 schema.sql의 일치 여부를 검증
└── src
    ├── main.ts
    ├── app.module.ts
    ├── infra               # DB, env, HTTP envelope/filter, logger, 공통 domain 도구
    └── features
        └── <domain>
            ├── controller  # HTTP 요청/응답 경계, Zod parse
            ├── service     # use case 조율, transaction 경계
            ├── repository  # PgTyped query 실행과 DB row mapping
            ├── domain      # 순수 domain 함수와 snapshot type
            ├── database    # 기능별 SQL query와 PgTyped 생성물
            ├── <domain>.module.ts
            └── <domain>-errors.ts  # 도메인 에러
```

인증은 세션과 현재 사용자 컨텍스트를 전역적으로 사용하므로 `features/auth`에서 별도 흐름으로 다룬다. `provider`는 better-auth 연결을, `http`는 guard/decorator/request auth context를, `repository`는 사용자 계정 조회와 생성을 맡는다.

## 기술 선택

| 기술                        | 이유                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------- |
| NestJS                      | module, controller, service 경계를 강제하기 쉬워 기능 단위 확장 패턴을 맞추기 좋다.     |
| `@nmm/shared`, Zod          | controller에서 요청과 응답 계약을 파싱해 Web/API 사이의 JSON 형태를 한 기준으로 맞춘다. |
| PostgreSQL                  | 관계형 데이터, transaction, SQL 기반 조회 최적화 예시를 명확하게 보여준다.              |
| PgTyped                     | SQL 파일을 원본으로 두고 TypeScript query type을 생성해 repository의 입출력을 검증한다. |
| `@nestjs-cls/transactional` | 여러 repository 쓰기를 service transaction 안에서 묶는다.                               |
| better-auth                 | DB 기반 세션 인증, 현재 사용자 조회, guard 흐름을 보일러플레이트에 포함한다.            |
| nestjs-pino                 | 요청 로그와 애플리케이션 로그를 구조화된 형태로 남긴다.                                 |
| Docker Compose              | API와 PostgreSQL 실행 방식을 루트 스크립트로 통일한다.                                  |
| sqldef                      | `schema.sql`과 실제 DB 사이의 drift를 검증하고 필요할 때 강제 동기화한다.               |

## 개발 규칙

- API는 루트 `npm run dev` 또는 `npm run dev:api`로 실행한다.
- 전역 prefix는 `/api`이며 성공/오류 응답 envelope를 유지한다.
- controller는 공유 Zod schema로 요청을 파싱하고, service는 추론된 공유 타입을 사용한다.
- service는 use case 조율과 transaction 경계를 소유한다.
- DB 접근은 PgTyped 기반 repository를 통해 수행한다.
- 기본 읽기는 `XxxReader`, 쓰기는 `XxxWriter`, 성능 특화 읽기는 `XxxViewQuery` 이름을 사용한다.
- repository는 DB row를 그대로 노출하지 않고 domain, 읽기 view, 공유 계약 형태로 매핑한다.
- domain은 class가 아니라 snapshot type과 `XxxDomain` 순수 함수로 둔다.
    - **이런 규칙을 사용하는 이유는 DB 의존성을 줄이기 위한 것인데, snapshot interface를 통해 DB의 스키마 구조를 그대로 따르는 것이 아니라 하위 집합의 형태로서 데이터의 형식을 고정/명시하는 효과를 기대한다.**
- schema 객체는 `database/schema.sql`에, 기능별 query는 `src/features/<domain>/database/*.sql`에 둔다.
- query를 바꾼 뒤에는 PgTyped 생성과 schema drift 검증을 함께 확인한다.
- DB의 스키마 관리는 `sqldef`의 `psqldef`를 사용한다.

## 실행

전체 실행은 루트에서 한다.

```sh
npm run dev
```

API와 PostgreSQL만 실행해야 할 때는 루트 script를 사용한다.

```sh
npm run dev:api
```

## DB 흐름

`database/schema.sql`이 DB schema의 원본이다. `database/dummy-data.sql`은 예시 데이터와 sequence runtime state를 담는다.

기능별 SQL query는 `src/features/<domain>/database/*.sql`에 작성한다. query를 수정하면 PgTyped 생성물이 바뀌므로 다음 명령으로 재생성한다.

```sh
npm run db:generate -w @nmm/api-server
```

실제 DB가 `schema.sql`과 어긋났는지 확인하려면 루트에서 다음 명령을 실행한다.

```sh
npm run db:verify
```

`schema.sql` 기준으로 DB를 강제로 맞춰야 할 때만 다음 명령을 사용한다.

```sh
npm run db:forcesync
```

`db:forcesync`는 sqldef의 `--enable-drop`을 사용하고 세션 테이블을 비우므로 스키마 객체와 로그인 세션을 삭제할 수 있다.

## 확인

기본 검증은 루트에서 한다.

```sh
npm run verify
```

API만 빠르게 확인할 때는 다음 명령을 사용할 수 있다.

```sh
npm run typecheck -w @nmm/api-server
npm run build -w @nmm/api-server
```

## FAQ

1. `@nestjs-cls/transactional`를 사용하는 이유
    - PgTyped는 단순 SQL 생성기로, 트랜잭션 관리를 제공하지 않는다.
    - 따라서 헬퍼 함수를 사용해서 구현하는 패턴이 많이 쓰이는데, 트랜잭션 지점을 직접 관리하는 것은 모든 팀원이 적절하게 사용하기 어렵다.
    - `@nestjs-cls/transactional`을 채택하면 스프링과 비슷한 사용방식을 사용하면서, 세부 구현을 숨길 수 있다.
2. 왜 ORM 대신 SQL + PgTyped를 쓰나요?
    - 초기에는 TypeORM을 사용하였지만, ORM이 성능 분석이나 코드리뷰 관점에서 좋지 않다고 평가하게 되었다.
    - pgVector같은 특별한 기능이나 복잡한 조회 기능을 구현하는 경우, native query나 그보다 복잡한 조합의 쿼리를 생성하는 코드가 만들어졌음.
    - 이는 AI로 구현을 하고, 코드리뷰를 많이 하는 팀 환경 특성 상 좋지 않은 경험이였다.
    - 이러한 문제를 해결하기 위해 여러 대안을 고려해본 결과 Java 진영의 Mybatis와 비슷한 경험을 제공하는 PgTyped를 채택하게 되었다.
