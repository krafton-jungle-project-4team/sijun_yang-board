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
        'SELECT\n    s.id,\n    s.user_id AS "userId",\n    u.role,\n    u.status\nFROM "session" s\nINNER JOIN "user" u ON u.id = s.user_id\nWHERE s.id = :sessionId::uuid\n  AND s.expires_at > now()'
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
        'SELECT\n    id,\n    email,\n    display_name AS "displayName",\n    role,\n    status,\n    created_at AS "createdAt",\n    updated_at AS "updatedAt"\nFROM "user"\nWHERE id = :userId::int4'
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

/** 'CompleteSignup' parameters type */
export interface ICompleteSignupParams {
    displayName?: string | null | void;
    userId?: number | null | void;
}

/** 'CompleteSignup' return type */
export interface ICompleteSignupResult {
    id: number;
}

/** 'CompleteSignup' query type */
export interface ICompleteSignupQuery {
    params: ICompleteSignupParams;
    result: ICompleteSignupResult;
}

const completeSignupIR: any = {
    usedParamSet: { displayName: true, userId: true },
    params: [
        { name: "displayName", required: false, transform: { type: "scalar" }, locs: [{ a: 37, b: 48 }] },
        { name: "userId", required: false, transform: { type: "scalar" }, locs: [{ a: 108, b: 114 }] }
    ],
    statement:
        "UPDATE \"user\"\nSET\n    display_name = :displayName,\n    status = 'ACTIVE',\n    updated_at = now()\nWHERE id = :userId::int4\nRETURNING id"
};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "user"
 * SET
 *     display_name = :displayName,
 *     status = 'ACTIVE',
 *     updated_at = now()
 * WHERE id = :userId::int4
 * RETURNING id
 * ```
 */
export const completeSignup = new PreparedQuery<ICompleteSignupParams, ICompleteSignupResult>(completeSignupIR);

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
        'UPDATE "user"\nSET\n    display_name = COALESCE(:displayName, display_name),\n    updated_at = now()\nWHERE id = :userId::int4\nRETURNING id'
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
