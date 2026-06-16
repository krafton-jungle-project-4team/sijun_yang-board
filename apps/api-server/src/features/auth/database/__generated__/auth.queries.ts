/** Types generated for queries found in "apps/api-server/src/features/auth/database/auth.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

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
        'SELECT\n    id,\n    email,\n    display_name AS "displayName",\n    role,\n    status,\n    created_at AS "createdAt",\n    updated_at AS "updatedAt"\nFROM "user"\nWHERE id = :userId::int4\n  AND is_anonymous = false                                                                        '
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
 *   AND is_anonymous = false
 * ```
 */
export const getUserById = new PreparedQuery<IGetUserByIdParams, IGetUserByIdResult>(getUserByIdIR);

/** 'FindUserByLoginIdOrEmail' parameters type */
export interface IFindUserByLoginIdOrEmailParams {
    email?: string | null | void;
    loginId?: string | null | void;
}

/** 'FindUserByLoginIdOrEmail' return type */
export interface IFindUserByLoginIdOrEmailResult {
    id: number;
}

/** 'FindUserByLoginIdOrEmail' query type */
export interface IFindUserByLoginIdOrEmailQuery {
    params: IFindUserByLoginIdOrEmailParams;
    result: IFindUserByLoginIdOrEmailResult;
}

const findUserByLoginIdOrEmailIR: any = {
    usedParamSet: { loginId: true, email: true },
    params: [
        { name: "loginId", required: false, transform: { type: "scalar" }, locs: [{ a: 39, b: 46 }] },
        { name: "email", required: false, transform: { type: "scalar" }, locs: [{ a: 62, b: 67 }] }
    ],
    statement:
        'SELECT id\nFROM "user"\nWHERE login_id = :loginId\n   OR email = :email\nLIMIT 1                                                                 '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT id
 * FROM "user"
 * WHERE login_id = :loginId
 *    OR email = :email
 * LIMIT 1
 * ```
 */
export const findUserByLoginIdOrEmail = new PreparedQuery<
    IFindUserByLoginIdOrEmailParams,
    IFindUserByLoginIdOrEmailResult
>(findUserByLoginIdOrEmailIR);

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
        'UPDATE "user"\nSET\n    display_name = COALESCE(:displayName, display_name),\n    updated_at = now()\nWHERE id = :userId::int4\nRETURNING id                                                                                       '
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

/** 'DeleteSessionByToken' parameters type */
export interface IDeleteSessionByTokenParams {
    token?: string | null | void;
}

/** 'DeleteSessionByToken' return type */
export type IDeleteSessionByTokenResult = void;

/** 'DeleteSessionByToken' query type */
export interface IDeleteSessionByTokenQuery {
    params: IDeleteSessionByTokenParams;
    result: IDeleteSessionByTokenResult;
}

const deleteSessionByTokenIR: any = {
    usedParamSet: { token: true },
    params: [{ name: "token", required: false, transform: { type: "scalar" }, locs: [{ a: 36, b: 41 }] }],
    statement: 'DELETE FROM "session"\nWHERE token = :token'
};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM "session"
 * WHERE token = :token
 * ```
 */
export const deleteSessionByToken = new PreparedQuery<IDeleteSessionByTokenParams, IDeleteSessionByTokenResult>(
    deleteSessionByTokenIR
);
