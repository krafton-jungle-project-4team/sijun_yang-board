import type { DatabaseError as PgDatabaseError } from "pg";

import { AppError, createDomainError } from "@/app-errors";
import type { QueryErrorPredicateMatcher } from "./query-error";

// Reference model:
// - Spring groups SQLSTATE classes in SQLStateSQLExceptionTranslator:
//   https://github.com/spring-projects/spring-framework/blob/main/spring-jdbc/src/main/java/org/springframework/jdbc/support/SQLStateSQLExceptionTranslator.java
// - Spring applies named vendor-code buckets in SQLErrorCodeSQLExceptionTranslator:
//   https://github.com/spring-projects/spring-framework/blob/main/spring-jdbc/src/main/java/org/springframework/jdbc/support/SQLErrorCodeSQLExceptionTranslator.java
// - Spring's default PostgreSQL SQLSTATE buckets live in sql-error-codes.xml:
//   https://github.com/spring-projects/spring-framework/blob/main/spring-jdbc/src/main/resources/org/springframework/jdbc/support/sql-error-codes.xml
// - PostgreSQL publishes stable SQLSTATE codes and object metadata fields:
//   https://www.postgresql.org/docs/current/errcodes-appendix.html

export type PgErrorField = "code" | "constraint" | "schema" | "table" | "column" | "routine";
export type PgErrorCriteria = Partial<Pick<PgDatabaseError, PgErrorField>>;
export type PgErrorMetadataCriteria = Omit<PgErrorCriteria, "code">;
export type DatabaseAccessErrorKind =
    | "badSqlGrammar"
    | "cannotAcquireLock"
    | "cannotSerializeTransaction"
    | "dataIntegrityViolation"
    | "dataAccessResourceFailure"
    | "deadlock"
    | "duplicateKey"
    | "permissionDenied"
    | "queryTimeout"
    | "transactionRollback"
    | "unknown";

export const DATABASE_ERRORS = {
    OPERATION_FAILED: {
        statusCode: 500,
        code: "DATABASE_ERROR",
        message: "데이터베이스 작업에 실패했습니다."
    }
} as const;

export function createDatabaseError(error: (typeof DATABASE_ERRORS)[keyof typeof DATABASE_ERRORS], cause?: Error) {
    return createDomainError(error, { cause });
}

export const pgSqlState = {
    cardinalityViolation: "21000",
    uniqueViolation: "23505",
    foreignKeyViolation: "23503",
    notNullViolation: "23502",
    checkViolation: "23514",
    exclusionViolation: "23P01",
    serializationFailure: "40001",
    deadlockDetected: "40P01",
    lockNotAvailable: "55P03",
    queryCanceled: "57014",
    insufficientPrivilege: "42501",
    syntaxError: "42601",
    undefinedTable: "42P01"
} as const;

export const pgSqlStateClass = {
    connectionException: "08",
    dataException: "22",
    integrityConstraintViolation: "23",
    transactionRollback: "40",
    syntaxOrAccessRuleViolation: "42",
    insufficientResources: "53",
    programLimitExceeded: "54",
    operatorIntervention: "57",
    systemError: "58"
} as const;

export const pgSpringPostgresSqlState = {
    badSqlGrammar: ["03000", "42000", "42601", "42602", "42622", "42804", "42P01"],
    duplicateKey: [pgSqlState.cardinalityViolation, pgSqlState.uniqueViolation],
    dataIntegrityViolation: [
        "23000",
        pgSqlState.notNullViolation,
        pgSqlState.foreignKeyViolation,
        pgSqlState.checkViolation
    ],
    dataAccessResourceFailure: ["53000", "53100", "53200", "53300"],
    cannotAcquireLock: [pgSqlState.lockNotAvailable],
    cannotSerializeTransaction: [pgSqlState.serializationFailure],
    deadlockLoser: [pgSqlState.deadlockDetected]
} as const;

export const pgErrors = {
    connectionException: (criteria?: PgErrorCriteria) => pgErrorClass(pgSqlStateClass.connectionException, criteria),
    dataException: (criteria?: PgErrorCriteria) => pgErrorClass(pgSqlStateClass.dataException, criteria),
    badSqlGrammar: (criteria?: PgErrorMetadataCriteria) => pgAnyError(pgSpringPostgresSqlState.badSqlGrammar, criteria),
    dataIntegrityViolation: (criteria?: PgErrorCriteria) =>
        pgErrorClass(pgSqlStateClass.integrityConstraintViolation, criteria),
    syntaxOrAccessRuleViolation: (criteria?: PgErrorCriteria) =>
        pgErrorClass(pgSqlStateClass.syntaxOrAccessRuleViolation, criteria),
    resourceFailure: (criteria?: PgErrorCriteria) =>
        pgAnyErrorClass(
            [
                pgSqlStateClass.connectionException,
                pgSqlStateClass.insufficientResources,
                pgSqlStateClass.programLimitExceeded,
                pgSqlStateClass.operatorIntervention,
                pgSqlStateClass.systemError
            ],
            criteria
        ),
    dataAccessResourceFailure: (criteria?: PgErrorMetadataCriteria) =>
        pgAnyError(pgSpringPostgresSqlState.dataAccessResourceFailure, criteria),
    transactionRollback: (criteria?: PgErrorCriteria) => pgErrorClass(pgSqlStateClass.transactionRollback, criteria),
    duplicateKey: (criteria?: PgErrorMetadataCriteria) => pgAnyError(pgSpringPostgresSqlState.duplicateKey, criteria),
    uniqueViolation: (criteria?: PgErrorMetadataCriteria) => pgError({ ...criteria, code: pgSqlState.uniqueViolation }),
    foreignKeyViolation: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.foreignKeyViolation }),
    notNullViolation: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.notNullViolation }),
    checkViolation: (criteria?: PgErrorMetadataCriteria) => pgError({ ...criteria, code: pgSqlState.checkViolation }),
    exclusionViolation: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.exclusionViolation }),
    serializationFailure: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.serializationFailure }),
    cannotSerializeTransaction: (criteria?: PgErrorMetadataCriteria) =>
        pgAnyError(pgSpringPostgresSqlState.cannotSerializeTransaction, criteria),
    deadlockDetected: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.deadlockDetected }),
    deadlockLoser: (criteria?: PgErrorMetadataCriteria) => pgAnyError(pgSpringPostgresSqlState.deadlockLoser, criteria),
    lockNotAvailable: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.lockNotAvailable }),
    cannotAcquireLock: (criteria?: PgErrorMetadataCriteria) =>
        pgAnyError(pgSpringPostgresSqlState.cannotAcquireLock, criteria),
    queryCanceled: (criteria?: PgErrorMetadataCriteria) => pgError({ ...criteria, code: pgSqlState.queryCanceled }),
    queryTimeout: (criteria?: PgErrorMetadataCriteria) => pgError({ ...criteria, code: pgSqlState.queryCanceled }),
    insufficientPrivilege: (criteria?: PgErrorMetadataCriteria) =>
        pgError({ ...criteria, code: pgSqlState.insufficientPrivilege })
} as const;

/**
 * PostgreSQL 실패를 애플리케이션의 database error 계층으로 정규화한다.
 *
 * 제어된 API 오류가 되어야 하는 매핑된 SQLSTATE 실패의 base class로 사용한다.
 * client에 노출하지 않고도 로그에서 constraint를 식별할 수 있도록 PostgreSQL metadata를 유지한다.
 */
export class DatabaseAccessError extends AppError {
    public readonly pg: PgErrorCriteria;

    constructor(
        public readonly kind: DatabaseAccessErrorKind,
        cause: Error
    ) {
        super(
            DATABASE_ERRORS.OPERATION_FAILED.code,
            DATABASE_ERRORS.OPERATION_FAILED.message,
            DATABASE_ERRORS.OPERATION_FAILED.statusCode,
            { cause }
        );
        this.name = new.target.name;
        this.pg = getPgErrorMetadata(cause);
    }
}

/**
 * PostgreSQL이 보고한 duplicate key 또는 uniqueness violation을 나타낸다.
 *
 * insert나 update가 unique index와 충돌해 database failure로 처리되어야 할 때 사용한다.
 * 더 구체적인 사용자-facing conflict 의미가 필요하면 feature service에서 domain error로 매핑한다.
 */
export class DatabaseDuplicateKeyError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("duplicateKey", cause);
    }
}

/**
 * foreign key, not-null, check 등 데이터 무결성 실패를 나타낸다.
 *
 * duplicate key 이외의 schema constraint 위반으로 PostgreSQL이 데이터를 거부할 때 사용한다.
 * feature가 constraint를 더 명확한 domain error로 매핑하지 않는 한 인프라 신호로 다룬다.
 */
export class DatabaseDataIntegrityViolationError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("dataIntegrityViolation", cause);
    }
}

/**
 * 잘못된 SQL 문법이나 누락된 database object를 나타낸다.
 *
 * PgTyped 또는 손으로 작성한 SQL이 syntax나 object 오류로 PostgreSQL에 도달했을 때 사용한다.
 * client에 특화 안내를 반환하기보다 코드나 migration 결함으로 조사한다.
 */
export class DatabaseBadSqlGrammarError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("badSqlGrammar", cause);
    }
}

/**
 * PostgreSQL resource 또는 connection 실패를 나타낸다.
 *
 * database availability, resource limit, connection state 때문에 query를 실행할 수 없을 때 사용한다.
 * transaction 상태가 이미 무효일 수 있으므로 repository layer에서 무작정 retry하지 않는다.
 */
export class DatabaseResourceFailureError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("dataAccessResourceFailure", cause);
    }
}

/**
 * PostgreSQL의 넓은 transaction rollback 계열 실패를 나타낸다.
 *
 * rollback class SQLSTATE가 더 좁은 concurrency error로 매핑되지 않을 때 사용한다.
 * transaction retry 정책을 repository 위에서 결정할 수 있도록 원본 cause를 보존한다.
 */
export class DatabaseTransactionRollbackError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("transactionRollback", cause);
    }
}

/**
 * lock 획득 실패를 나타낸다.
 *
 * PostgreSQL이 요청한 lock을 사용할 수 없다고 보고할 때 사용한다.
 * operation을 retry할지 사용자에게 노출할지는 service-level use case가 결정한다.
 */
export class DatabaseCannotAcquireLockError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("cannotAcquireLock", cause);
    }
}

/**
 * 더 엄격한 isolation level에서 발생한 serialization 실패를 나타낸다.
 *
 * PostgreSQL이 concurrent transaction을 serialize할 수 없을 때 사용한다.
 * caller가 idempotency와 사용자 의도를 고려할 수 있도록 retry 결정은 이 class 밖에 둔다.
 */
export class DatabaseCannotSerializeTransactionError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("cannotSerializeTransaction", cause);
    }
}

/**
 * 감지된 database deadlock을 나타낸다.
 *
 * concurrent lock이 deadlock을 만들어 PostgreSQL이 transaction을 중단할 때 사용한다.
 * 현재 transaction은 실패한 것으로 보고 같은 executor로 계속 진행하지 않는다.
 */
export class DatabaseDeadlockError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("deadlock", cause);
    }
}

/**
 * 취소되었거나 timeout된 query를 나타낸다.
 *
 * 설정된 실행 시간을 넘어 PostgreSQL이 작업을 취소할 때 사용한다.
 * 느린 경로를 caller에서 숨기지 말고 timeout 조정은 database 또는 query policy에서 다룬다.
 */
export class DatabaseQueryTimeoutError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("queryTimeout", cause);
    }
}

/**
 * database 권한 부족을 나타낸다.
 *
 * 설정된 role에 접근 권한이 없어 PostgreSQL이 query를 거부할 때 사용한다.
 * end-user authorization이 아니라 deployment 또는 schema ownership drift로 다룬다.
 */
export class DatabasePermissionDeniedError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("permissionDenied", cause);
    }
}

/**
 * 매핑되지 않은 PostgreSQL database 실패를 나타낸다.
 *
 * 어떤 SQLSTATE predicate도 오류를 포착하지 못했을 때 fallback으로 사용한다.
 * feature code에서 이 class로 분기하기 전에 더 좁은 mapping을 추가한다.
 */
export class DatabaseUnknownError extends DatabaseAccessError {
    constructor(cause: PgDatabaseError) {
        super("unknown", cause);
    }
}

export const databaseErrors = {
    access: DatabaseAccessError,
    badSqlGrammar: DatabaseBadSqlGrammarError,
    cannotAcquireLock: DatabaseCannotAcquireLockError,
    cannotSerializeTransaction: DatabaseCannotSerializeTransactionError,
    dataIntegrityViolation: DatabaseDataIntegrityViolationError,
    dataAccessResourceFailure: DatabaseResourceFailureError,
    deadlock: DatabaseDeadlockError,
    duplicateKey: DatabaseDuplicateKeyError,
    permissionDenied: DatabasePermissionDeniedError,
    queryTimeout: DatabaseQueryTimeoutError,
    transactionRollback: DatabaseTransactionRollbackError,
    unknown: DatabaseUnknownError
} as const;

export function pgError(criteria: string | PgErrorCriteria): QueryErrorPredicateMatcher<PgDatabaseError> {
    const normalizedCriteria = typeof criteria === "string" ? { code: criteria } : criteria;

    return {
        matches: (error): error is PgDatabaseError =>
            isPgDatabaseError(error) && matchesPgErrorCriteria(error, normalizedCriteria)
    };
}

export function pgAnyError(
    sqlStates: readonly string[],
    criteria: PgErrorMetadataCriteria = {}
): QueryErrorPredicateMatcher<PgDatabaseError> {
    return {
        matches: (error): error is PgDatabaseError =>
            isPgDatabaseError(error) &&
            typeof error.code === "string" &&
            sqlStates.includes(error.code) &&
            matchesPgErrorCriteria(error, criteria)
    };
}

export function pgErrorClass(
    sqlStateClass: string,
    criteria?: PgErrorCriteria
): QueryErrorPredicateMatcher<PgDatabaseError> {
    return pgAnyErrorClass([sqlStateClass], criteria);
}

export function pgAnyErrorClass(
    sqlStateClasses: readonly string[],
    criteria: PgErrorCriteria = {}
): QueryErrorPredicateMatcher<PgDatabaseError> {
    return {
        matches: (error): error is PgDatabaseError =>
            isPgDatabaseError(error) &&
            typeof error.code === "string" &&
            sqlStateClasses.includes(error.code.slice(0, 2)) &&
            matchesPgErrorCriteria(error, criteria)
    };
}

export function databaseFallbackError(error?: Error) {
    return createDatabaseError(DATABASE_ERRORS.OPERATION_FAILED, error);
}

export function translateDatabaseError(error: unknown) {
    if (error instanceof DatabaseAccessError || !isPgDatabaseError(error)) {
        return error;
    }

    if (pgErrors.duplicateKey().matches(error)) {
        return new DatabaseDuplicateKeyError(error);
    }

    if (pgErrors.cannotAcquireLock().matches(error)) {
        return new DatabaseCannotAcquireLockError(error);
    }

    if (pgErrors.cannotSerializeTransaction().matches(error)) {
        return new DatabaseCannotSerializeTransactionError(error);
    }

    if (pgErrors.deadlockLoser().matches(error)) {
        return new DatabaseDeadlockError(error);
    }

    if (pgErrors.queryTimeout().matches(error)) {
        return new DatabaseQueryTimeoutError(error);
    }

    if (pgErrors.dataIntegrityViolation().matches(error)) {
        return new DatabaseDataIntegrityViolationError(error);
    }

    if (pgErrors.badSqlGrammar().matches(error)) {
        return new DatabaseBadSqlGrammarError(error);
    }

    if (pgErrors.insufficientPrivilege().matches(error)) {
        return new DatabasePermissionDeniedError(error);
    }

    if (pgErrors.dataAccessResourceFailure().matches(error) || pgErrors.resourceFailure().matches(error)) {
        return new DatabaseResourceFailureError(error);
    }

    if (pgErrors.transactionRollback().matches(error)) {
        return new DatabaseTransactionRollbackError(error);
    }

    return new DatabaseUnknownError(error);
}

export function isPgDatabaseError(error: unknown): error is PgDatabaseError {
    return (
        error instanceof Error &&
        !(error instanceof AppError) &&
        typeof (error as Partial<PgDatabaseError>).code === "string"
    );
}

function matchesPgErrorCriteria(error: PgDatabaseError, criteria: PgErrorCriteria) {
    return pgErrorFields.every((field) => criteria[field] === undefined || error[field] === criteria[field]);
}

function getPgErrorMetadata(error: Error): PgErrorCriteria {
    if (!isPgDatabaseError(error)) {
        return {};
    }

    const metadata: PgErrorCriteria = {};

    for (const field of pgErrorFields) {
        if (error[field] !== undefined) {
            metadata[field] = error[field];
        }
    }

    return metadata;
}

const pgErrorFields = [
    "code",
    "constraint",
    "schema",
    "table",
    "column",
    "routine"
] as const satisfies readonly PgErrorField[];
