/** Types generated for queries found in "apps/api-server/src/features/auth/database/auth.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'GetClaimsBySessionId' parameters type */
export interface IGetClaimsBySessionIdParams {
    sessionId?: string | null | void;
}

/** 'GetClaimsBySessionId' return type */
export interface IGetClaimsBySessionIdResult {
    id: string;
    role: string;
    status: string;
    userId: number;
}

/** 'GetClaimsBySessionId' query type */
export interface IGetClaimsBySessionIdQuery {
    params: IGetClaimsBySessionIdParams;
    result: IGetClaimsBySessionIdResult;
}

const getClaimsBySessionIdIR: any = {
    usedParamSet: { sessionId: true },
    params: [{ name: "sessionId", required: false, transform: { type: "scalar" }, locs: [{ a: 139, b: 148 }] }],
    statement:
        'SELECT\n    s.id,\n    s.user_id AS "userId",\n    u.role,\n    u.status\nFROM "session" s\nINNER JOIN "user" u ON u.id = s.user_id\nWHERE s.id = :sessionId::uuid\n  AND s.expires_at > now()                                                   '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     s.id,
 *     s.user_id AS "userId",
 *     u.role,
 *     u.status
 * FROM "session" s
 * INNER JOIN "user" u ON u.id = s.user_id
 * WHERE s.id = :sessionId::uuid
 *   AND s.expires_at > now()
 * ```
 */
export const getClaimsBySessionId = new PreparedQuery<IGetClaimsBySessionIdParams, IGetClaimsBySessionIdResult>(
    getClaimsBySessionIdIR
);

/** 'GetUserById' parameters type */
export interface IGetUserByIdParams {
    userId?: number | null | void;
}

/** 'GetUserById' return type */
export interface IGetUserByIdResult {
    createdAt: Date;
    displayName: string;
    email: string;
    id: number;
    role: string;
    status: string;
    updatedAt: Date;
}

/** 'GetUserById' query type */
export interface IGetUserByIdQuery {
    params: IGetUserByIdParams;
    result: IGetUserByIdResult;
}

const getUserByIdIR: any = {
    usedParamSet: { userId: true },
    params: [{ name: "userId", required: false, transform: { type: "scalar" }, locs: [{ a: 167, b: 173 }] }],
    statement:
        'SELECT\n    id,\n    email,\n    display_name AS "displayName",\n    role,\n    status,\n    created_at AS "createdAt",\n    updated_at AS "updatedAt"\nFROM "user"\nWHERE id = :userId::int4                                                                    '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     email,
 *     display_name AS "displayName",
 *     role,
 *     status,
 *     created_at AS "createdAt",
 *     updated_at AS "updatedAt"
 * FROM "user"
 * WHERE id = :userId::int4
 * ```
 */
export const getUserById = new PreparedQuery<IGetUserByIdParams, IGetUserByIdResult>(getUserByIdIR);

/** 'GetLoginCredentialsByLoginId' parameters type */
export interface IGetLoginCredentialsByLoginIdParams {
    loginId?: string | null | void;
}

/** 'GetLoginCredentialsByLoginId' return type */
export interface IGetLoginCredentialsByLoginIdResult {
    id: number;
    passwordHash: string;
    role: string;
    status: string;
}

/** 'GetLoginCredentialsByLoginId' query type */
export interface IGetLoginCredentialsByLoginIdQuery {
    params: IGetLoginCredentialsByLoginIdParams;
    result: IGetLoginCredentialsByLoginIdResult;
}

const getLoginCredentialsByLoginIdIR: any = {
    usedParamSet: { loginId: true },
    params: [{ name: "loginId", required: false, transform: { type: "scalar" }, locs: [{ a: 102, b: 109 }] }],
    statement:
        'SELECT\n    id,\n    password_hash AS "passwordHash",\n    role,\n    status\nFROM "user"\nWHERE login_id = :loginId                                                                 '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     id,
 *     password_hash AS "passwordHash",
 *     role,
 *     status
 * FROM "user"
 * WHERE login_id = :loginId
 * ```
 */
export const getLoginCredentialsByLoginId = new PreparedQuery<
    IGetLoginCredentialsByLoginIdParams,
    IGetLoginCredentialsByLoginIdResult
>(getLoginCredentialsByLoginIdIR);

/** 'UpdateMe' parameters type */
export interface IUpdateMeParams {
    displayName?: string | null | void;
    userId?: number | null | void;
}

/** 'UpdateMe' return type */
export interface IUpdateMeResult {
    id: number;
}

/** 'UpdateMe' query type */
export interface IUpdateMeQuery {
    params: IUpdateMeParams;
    result: IUpdateMeResult;
}

const updateMeIR: any = {
    usedParamSet: { displayName: true, userId: true },
    params: [
        { name: "displayName", required: false, transform: { type: "scalar" }, locs: [{ a: 46, b: 57 }] },
        { name: "userId", required: false, transform: { type: "scalar" }, locs: [{ a: 109, b: 115 }] }
    ],
    statement:
        'UPDATE "user"\nSET\n    display_name = COALESCE(:displayName, display_name),\n    updated_at = now()\nWHERE id = :userId::int4\nRETURNING id                                                  '
};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "user"
 * SET
 *     display_name = COALESCE(:displayName, display_name),
 *     updated_at = now()
 * WHERE id = :userId::int4
 * RETURNING id
 * ```
 */
export const updateMe = new PreparedQuery<IUpdateMeParams, IUpdateMeResult>(updateMeIR);

/** 'CreateUser' parameters type */
export interface ICreateUserParams {
    displayName?: string | null | void;
    email?: string | null | void;
    loginId?: string | null | void;
    passwordHash?: string | null | void;
}

/** 'CreateUser' return type */
export interface ICreateUserResult {
    id: number;
}

/** 'CreateUser' query type */
export interface ICreateUserQuery {
    params: ICreateUserParams;
    result: ICreateUserResult;
}

const createUserIR: any = {
    usedParamSet: { loginId: true, email: true, passwordHash: true, displayName: true },
    params: [
        { name: "loginId", required: false, transform: { type: "scalar" }, locs: [{ a: 88, b: 95 }] },
        { name: "email", required: false, transform: { type: "scalar" }, locs: [{ a: 98, b: 103 }] },
        { name: "passwordHash", required: false, transform: { type: "scalar" }, locs: [{ a: 106, b: 118 }] },
        { name: "displayName", required: false, transform: { type: "scalar" }, locs: [{ a: 121, b: 132 }] }
    ],
    statement:
        "INSERT INTO \"user\" (login_id, email, password_hash, display_name, role, status)\nVALUES (:loginId, :email, :passwordHash, :displayName, 'USER', 'ACTIVE')\nRETURNING id                                                                "
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "user" (login_id, email, password_hash, display_name, role, status)
 * VALUES (:loginId, :email, :passwordHash, :displayName, 'USER', 'ACTIVE')
 * RETURNING id
 * ```
 */
export const createUser = new PreparedQuery<ICreateUserParams, ICreateUserResult>(createUserIR);

/** 'CreateSessionForUser' parameters type */
export interface ICreateSessionForUserParams {
    sessionId?: string | null | void;
    userId?: number | null | void;
}

/** 'CreateSessionForUser' return type */
export interface ICreateSessionForUserResult {
    id: string;
    userId: number;
}

/** 'CreateSessionForUser' query type */
export interface ICreateSessionForUserQuery {
    params: ICreateSessionForUserParams;
    result: ICreateSessionForUserResult;
}

const createSessionForUserIR: any = {
    usedParamSet: { sessionId: true, userId: true },
    params: [
        { name: "sessionId", required: false, transform: { type: "scalar" }, locs: [{ a: 59, b: 68 }] },
        { name: "userId", required: false, transform: { type: "scalar" }, locs: [{ a: 145, b: 151 }] }
    ],
    statement:
        'INSERT INTO "session" (id, user_id, expires_at)\nSELECT\n    :sessionId::uuid,\n    u.id,\n    now() + interval \'30 days\'\nFROM "user" u\nWHERE u.id = :userId::int4\nRETURNING\n    id,\n    user_id AS "userId"                                                                            '
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO "session" (id, user_id, expires_at)
 * SELECT
 *     :sessionId::uuid,
 *     u.id,
 *     now() + interval '30 days'
 * FROM "user" u
 * WHERE u.id = :userId::int4
 * RETURNING
 *     id,
 *     user_id AS "userId"
 * ```
 */
export const createSessionForUser = new PreparedQuery<ICreateSessionForUserParams, ICreateSessionForUserResult>(
    createSessionForUserIR
);

/** 'DeleteSessionsByUserId' parameters type */
export interface IDeleteSessionsByUserIdParams {
    userId?: number | null | void;
}

/** 'DeleteSessionsByUserId' return type */
export type IDeleteSessionsByUserIdResult = void;

/** 'DeleteSessionsByUserId' query type */
export interface IDeleteSessionsByUserIdQuery {
    params: IDeleteSessionsByUserIdParams;
    result: IDeleteSessionsByUserIdResult;
}

const deleteSessionsByUserIdIR: any = {
    usedParamSet: { userId: true },
    params: [{ name: "userId", required: false, transform: { type: "scalar" }, locs: [{ a: 38, b: 44 }] }],
    statement: 'DELETE FROM "session"\nWHERE user_id = :userId::int4'
};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "session"
 * WHERE user_id = :userId::int4
 * ```
 */
export const deleteSessionsByUserId = new PreparedQuery<IDeleteSessionsByUserIdParams, IDeleteSessionsByUserIdResult>(
    deleteSessionsByUserIdIR
);
