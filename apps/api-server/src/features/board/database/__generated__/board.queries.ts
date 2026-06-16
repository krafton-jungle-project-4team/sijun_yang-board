/** Types generated for queries found in "apps/api-server/src/features/board/database/board.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'ListPosts' parameters type */
export interface IListPostsParams {
    authorId?: number | null | void;
    limit?: number | null | void;
    offset?: number | null | void;
    search?: string | null | void;
    sort?: string | null | void;
}

/** 'ListPosts' return type */
export interface IListPostsResult {
    authorId: number;
    authorName: string;
    commentCount: number | null;
    content: string;
    createdAt: Date;
    id: number;
    title: string;
    updatedAt: Date;
    viewCount: number;
}

/** 'ListPosts' query type */
export interface IListPostsQuery {
    params: IListPostsParams;
    result: IListPostsResult;
}

const listPostsIR: any = {
    usedParamSet: { search: true, authorId: true, sort: true, limit: true, offset: true },
    params: [
        {
            name: "search",
            required: false,
            transform: { type: "scalar" },
            locs: [
                { a: 388, b: 394 },
                { a: 434, b: 440 },
                { a: 481, b: 487 }
            ]
        },
        {
            name: "authorId",
            required: false,
            transform: { type: "scalar" },
            locs: [
                { a: 510, b: 518 },
                { a: 551, b: 559 }
            ]
        },
        { name: "sort", required: false, transform: { type: "scalar" }, locs: [{ a: 591, b: 595 }] },
        { name: "limit", required: false, transform: { type: "scalar" }, locs: [{ a: 676, b: 681 }] },
        { name: "offset", required: false, transform: { type: "scalar" }, locs: [{ a: 696, b: 702 }] }
    ],
    statement:
        'SELECT\n    p.id,\n    p.title,\n    p.content,\n    p.author_id AS "authorId",\n    u.display_name AS "authorName",\n    p.view_count AS "viewCount",\n    p.created_at AS "createdAt",\n    p.updated_at AS "updatedAt",\n    (\n        SELECT count(*)::int4\n        FROM comments c\n        WHERE c.post_id = p.id\n    ) AS "commentCount"\nFROM posts p\nINNER JOIN "user" u ON u.id = p.author_id\nWHERE (:search::text IS NULL OR p.title ILIKE \'%\' || :search::text || \'%\' OR p.content ILIKE \'%\' || :search::text || \'%\')\n  AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4)\nORDER BY\n    CASE WHEN :sort = \'popular\' THEN p.view_count END DESC NULLS LAST,\n    p.created_at DESC\nLIMIT :limit::int4\nOFFSET :offset::int4                                                             '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     p.id,
 *     p.title,
 *     p.content,
 *     p.author_id AS "authorId",
 *     u.display_name AS "authorName",
 *     p.view_count AS "viewCount",
 *     p.created_at AS "createdAt",
 *     p.updated_at AS "updatedAt",
 *     (
 *         SELECT count(*)::int4
 *         FROM comments c
 *         WHERE c.post_id = p.id
 *     ) AS "commentCount"
 * FROM posts p
 * INNER JOIN "user" u ON u.id = p.author_id
 * WHERE (:search::text IS NULL OR p.title ILIKE '%' || :search::text || '%' OR p.content ILIKE '%' || :search::text || '%')
 *   AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4)
 * ORDER BY
 *     CASE WHEN :sort = 'popular' THEN p.view_count END DESC NULLS LAST,
 *     p.created_at DESC
 * LIMIT :limit::int4
 * OFFSET :offset::int4
 * ```
 */
export const listPosts = new PreparedQuery<IListPostsParams, IListPostsResult>(listPostsIR);

/** 'CountPosts' parameters type */
export interface ICountPostsParams {
    authorId?: number | null | void;
    search?: string | null | void;
}

/** 'CountPosts' return type */
export interface ICountPostsResult {
    total: number | null;
}

/** 'CountPosts' query type */
export interface ICountPostsQuery {
    params: ICountPostsParams;
    result: ICountPostsResult;
}

const countPostsIR: any = {
    usedParamSet: { search: true, authorId: true },
    params: [
        {
            name: "search",
            required: false,
            transform: { type: "scalar" },
            locs: [
                { a: 51, b: 57 },
                { a: 97, b: 103 },
                { a: 144, b: 150 }
            ]
        },
        {
            name: "authorId",
            required: false,
            transform: { type: "scalar" },
            locs: [
                { a: 173, b: 181 },
                { a: 214, b: 222 }
            ]
        }
    ],
    statement:
        "SELECT count(*)::int4 AS total\nFROM posts p\nWHERE (:search::text IS NULL OR p.title ILIKE '%' || :search::text || '%' OR p.content ILIKE '%' || :search::text || '%')\n  AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4)                                                                        "
};

/**
 * Query generated from SQL:
 * ```
 * SELECT count(*)::int4 AS total
 * FROM posts p
 * WHERE (:search::text IS NULL OR p.title ILIKE '%' || :search::text || '%' OR p.content ILIKE '%' || :search::text || '%')
 *   AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4)
 * ```
 */
export const countPosts = new PreparedQuery<ICountPostsParams, ICountPostsResult>(countPostsIR);

/** 'IncrementPostView' parameters type */
export interface IIncrementPostViewParams {
    postId?: number | null | void;
}

/** 'IncrementPostView' return type */
export interface IIncrementPostViewResult {
    id: number;
}

/** 'IncrementPostView' query type */
export interface IIncrementPostViewQuery {
    params: IIncrementPostViewParams;
    result: IIncrementPostViewResult;
}

const incrementPostViewIR: any = {
    usedParamSet: { postId: true },
    params: [{ name: "postId", required: false, transform: { type: "scalar" }, locs: [{ a: 56, b: 62 }] }],
    statement:
        "UPDATE posts\nSET view_count = view_count + 1\nWHERE id = :postId::int4\nRETURNING id                                                                         "
};

/**
 * Query generated from SQL:
 * ```
 * UPDATE posts
 * SET view_count = view_count + 1
 * WHERE id = :postId::int4
 * RETURNING id
 * ```
 */
export const incrementPostView = new PreparedQuery<IIncrementPostViewParams, IIncrementPostViewResult>(
    incrementPostViewIR
);

/** 'GetPostById' parameters type */
export interface IGetPostByIdParams {
    postId?: number | null | void;
}

/** 'GetPostById' return type */
export interface IGetPostByIdResult {
    authorId: number;
    authorName: string;
    commentCount: number | null;
    content: string;
    createdAt: Date;
    id: number;
    title: string;
    updatedAt: Date;
    viewCount: number;
}

/** 'GetPostById' query type */
export interface IGetPostByIdQuery {
    params: IGetPostByIdParams;
    result: IGetPostByIdResult;
}

const getPostByIdIR: any = {
    usedParamSet: { postId: true },
    params: [{ name: "postId", required: false, transform: { type: "scalar" }, locs: [{ a: 394, b: 400 }] }],
    statement:
        'SELECT\n    p.id,\n    p.title,\n    p.content,\n    p.author_id AS "authorId",\n    u.display_name AS "authorName",\n    p.view_count AS "viewCount",\n    p.created_at AS "createdAt",\n    p.updated_at AS "updatedAt",\n    (\n        SELECT count(*)::int4\n        FROM comments c\n        WHERE c.post_id = p.id\n    ) AS "commentCount"\nFROM posts p\nINNER JOIN "user" u ON u.id = p.author_id\nWHERE p.id = :postId::int4                                                               '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     p.id,
 *     p.title,
 *     p.content,
 *     p.author_id AS "authorId",
 *     u.display_name AS "authorName",
 *     p.view_count AS "viewCount",
 *     p.created_at AS "createdAt",
 *     p.updated_at AS "updatedAt",
 *     (
 *         SELECT count(*)::int4
 *         FROM comments c
 *         WHERE c.post_id = p.id
 *     ) AS "commentCount"
 * FROM posts p
 * INNER JOIN "user" u ON u.id = p.author_id
 * WHERE p.id = :postId::int4
 * ```
 */
export const getPostById = new PreparedQuery<IGetPostByIdParams, IGetPostByIdResult>(getPostByIdIR);

/** 'ListCommentsByPostId' parameters type */
export interface IListCommentsByPostIdParams {
    postId?: number | null | void;
}

/** 'ListCommentsByPostId' return type */
export interface IListCommentsByPostIdResult {
    authorId: number;
    authorName: string;
    content: string;
    createdAt: Date;
    id: number;
    postId: number;
    updatedAt: Date;
}

/** 'ListCommentsByPostId' query type */
export interface IListCommentsByPostIdQuery {
    params: IListCommentsByPostIdParams;
    result: IListCommentsByPostIdResult;
}

const listCommentsByPostIdIR: any = {
    usedParamSet: { postId: true },
    params: [{ name: "postId", required: false, transform: { type: "scalar" }, locs: [{ a: 267, b: 273 }] }],
    statement:
        'SELECT\n    c.id,\n    c.post_id AS "postId",\n    c.author_id AS "authorId",\n    u.display_name AS "authorName",\n    c.content,\n    c.created_at AS "createdAt",\n    c.updated_at AS "updatedAt"\nFROM comments c\nINNER JOIN "user" u ON u.id = c.author_id\nWHERE c.post_id = :postId::int4\nORDER BY c.created_at ASC                                                         '
};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     c.id,
 *     c.post_id AS "postId",
 *     c.author_id AS "authorId",
 *     u.display_name AS "authorName",
 *     c.content,
 *     c.created_at AS "createdAt",
 *     c.updated_at AS "updatedAt"
 * FROM comments c
 * INNER JOIN "user" u ON u.id = c.author_id
 * WHERE c.post_id = :postId::int4
 * ORDER BY c.created_at ASC
 * ```
 */
export const listCommentsByPostId = new PreparedQuery<IListCommentsByPostIdParams, IListCommentsByPostIdResult>(
    listCommentsByPostIdIR
);

/** 'CreatePost' parameters type */
export interface ICreatePostParams {
    authorId?: number | null | void;
    content?: string | null | void;
    title?: string | null | void;
}

/** 'CreatePost' return type */
export interface ICreatePostResult {
    id: number;
}

/** 'CreatePost' query type */
export interface ICreatePostQuery {
    params: ICreatePostParams;
    result: ICreatePostResult;
}

const createPostIR: any = {
    usedParamSet: { title: true, content: true, authorId: true },
    params: [
        { name: "title", required: false, transform: { type: "scalar" }, locs: [{ a: 85, b: 90 }] },
        { name: "content", required: false, transform: { type: "scalar" }, locs: [{ a: 93, b: 100 }] },
        { name: "authorId", required: false, transform: { type: "scalar" }, locs: [{ a: 103, b: 111 }] }
    ],
    statement:
        "WITH created_post AS (\n    INSERT INTO posts (title, content, author_id)\n    VALUES (:title, :content, :authorId::int4)\n    RETURNING id\n)\nSELECT id\nFROM created_post                                                                      "
};

/**
 * Query generated from SQL:
 * ```
 * WITH created_post AS (
 *     INSERT INTO posts (title, content, author_id)
 *     VALUES (:title, :content, :authorId::int4)
 *     RETURNING id
 * )
 * SELECT id
 * FROM created_post
 * ```
 */
export const createPost = new PreparedQuery<ICreatePostParams, ICreatePostResult>(createPostIR);

/** 'UpdatePost' parameters type */
export interface IUpdatePostParams {
    actorId?: number | null | void;
    actorRole?: string | null | void;
    content?: string | null | void;
    postId?: number | null | void;
    title?: string | null | void;
}

/** 'UpdatePost' return type */
export interface IUpdatePostResult {
    authorId: number;
    id: number;
    updatedId: number;
}

/** 'UpdatePost' query type */
export interface IUpdatePostQuery {
    params: IUpdatePostParams;
    result: IUpdatePostResult;
}

const updatePostIR: any = {
    usedParamSet: { postId: true, title: true, content: true, actorId: true, actorRole: true },
    params: [
        { name: "postId", required: false, transform: { type: "scalar" }, locs: [{ a: 77, b: 83 }] },
        { name: "title", required: false, transform: { type: "scalar" }, locs: [{ a: 164, b: 169 }] },
        { name: "content", required: false, transform: { type: "scalar" }, locs: [{ a: 209, b: 216 }] },
        { name: "actorId", required: false, transform: { type: "scalar" }, locs: [{ a: 346, b: 353 }] },
        { name: "actorRole", required: false, transform: { type: "scalar" }, locs: [{ a: 364, b: 373 }] }
    ],
    statement:
        'WITH target_post AS (\n    SELECT id, author_id\n    FROM posts\n    WHERE id = :postId::int4\n),\nupdated_post AS (\n    UPDATE posts p\n    SET\n        title = COALESCE(:title, p.title),\n        content = COALESCE(:content, p.content),\n        updated_at = now()\n    FROM target_post\n    WHERE p.id = target_post.id\n      AND (target_post.author_id = :actorId::int4 OR :actorRole::text = \'ADMIN\')\n    RETURNING p.id\n)\nSELECT\n    target_post.id,\n    target_post.author_id AS "authorId",\n    updated_post.id AS "updatedId"\nFROM target_post\nLEFT JOIN updated_post ON true                                                                      '
};

/**
 * Query generated from SQL:
 * ```
 * WITH target_post AS (
 *     SELECT id, author_id
 *     FROM posts
 *     WHERE id = :postId::int4
 * ),
 * updated_post AS (
 *     UPDATE posts p
 *     SET
 *         title = COALESCE(:title, p.title),
 *         content = COALESCE(:content, p.content),
 *         updated_at = now()
 *     FROM target_post
 *     WHERE p.id = target_post.id
 *       AND (target_post.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
 *     RETURNING p.id
 * )
 * SELECT
 *     target_post.id,
 *     target_post.author_id AS "authorId",
 *     updated_post.id AS "updatedId"
 * FROM target_post
 * LEFT JOIN updated_post ON true
 * ```
 */
export const updatePost = new PreparedQuery<IUpdatePostParams, IUpdatePostResult>(updatePostIR);

/** 'DeletePost' parameters type */
export interface IDeletePostParams {
    actorId?: number | null | void;
    actorRole?: string | null | void;
    postId?: number | null | void;
}

/** 'DeletePost' return type */
export interface IDeletePostResult {
    authorId: number;
    deletedId: number;
    id: number;
}

/** 'DeletePost' query type */
export interface IDeletePostQuery {
    params: IDeletePostParams;
    result: IDeletePostResult;
}

const deletePostIR: any = {
    usedParamSet: { postId: true, actorId: true, actorRole: true },
    params: [
        { name: "postId", required: false, transform: { type: "scalar" }, locs: [{ a: 77, b: 83 }] },
        { name: "actorId", required: false, transform: { type: "scalar" }, locs: [{ a: 225, b: 232 }] },
        { name: "actorRole", required: false, transform: { type: "scalar" }, locs: [{ a: 243, b: 252 }] }
    ],
    statement:
        'WITH target_post AS (\n    SELECT id, author_id\n    FROM posts\n    WHERE id = :postId::int4\n),\ndeleted_post AS (\n    DELETE FROM posts p\n    USING target_post\n    WHERE p.id = target_post.id\n      AND (target_post.author_id = :actorId::int4 OR :actorRole::text = \'ADMIN\')\n    RETURNING p.id\n)\nSELECT\n    target_post.id,\n    target_post.author_id AS "authorId",\n    deleted_post.id AS "deletedId"\nFROM target_post\nLEFT JOIN deleted_post ON true                                                                 '
};

/**
 * Query generated from SQL:
 * ```
 * WITH target_post AS (
 *     SELECT id, author_id
 *     FROM posts
 *     WHERE id = :postId::int4
 * ),
 * deleted_post AS (
 *     DELETE FROM posts p
 *     USING target_post
 *     WHERE p.id = target_post.id
 *       AND (target_post.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
 *     RETURNING p.id
 * )
 * SELECT
 *     target_post.id,
 *     target_post.author_id AS "authorId",
 *     deleted_post.id AS "deletedId"
 * FROM target_post
 * LEFT JOIN deleted_post ON true
 * ```
 */
export const deletePost = new PreparedQuery<IDeletePostParams, IDeletePostResult>(deletePostIR);

/** 'CreateComment' parameters type */
export interface ICreateCommentParams {
    authorId?: number | null | void;
    content?: string | null | void;
    postId?: number | null | void;
}

/** 'CreateComment' return type */
export interface ICreateCommentResult {
    commentId: number;
    postId: number;
}

/** 'CreateComment' query type */
export interface ICreateCommentQuery {
    params: ICreateCommentParams;
    result: ICreateCommentResult;
}

const createCommentIR: any = {
    usedParamSet: { postId: true, authorId: true, content: true },
    params: [
        { name: "postId", required: false, transform: { type: "scalar" }, locs: [{ a: 66, b: 72 }] },
        { name: "authorId", required: false, transform: { type: "scalar" }, locs: [{ a: 186, b: 194 }] },
        { name: "content", required: false, transform: { type: "scalar" }, locs: [{ a: 203, b: 210 }] }
    ],
    statement:
        'WITH target_post AS (\n    SELECT id\n    FROM posts\n    WHERE id = :postId::int4\n),\ncreated_comment AS (\n    INSERT INTO comments (post_id, author_id, content)\n    SELECT target_post.id, :authorId::int4, :content\n    FROM target_post\n    RETURNING id\n)\nSELECT\n    target_post.id AS "postId",\n    created_comment.id AS "commentId"\nFROM target_post\nLEFT JOIN created_comment ON true                                                                         '
};

/**
 * Query generated from SQL:
 * ```
 * WITH target_post AS (
 *     SELECT id
 *     FROM posts
 *     WHERE id = :postId::int4
 * ),
 * created_comment AS (
 *     INSERT INTO comments (post_id, author_id, content)
 *     SELECT target_post.id, :authorId::int4, :content
 *     FROM target_post
 *     RETURNING id
 * )
 * SELECT
 *     target_post.id AS "postId",
 *     created_comment.id AS "commentId"
 * FROM target_post
 * LEFT JOIN created_comment ON true
 * ```
 */
export const createComment = new PreparedQuery<ICreateCommentParams, ICreateCommentResult>(createCommentIR);

/** 'UpdateComment' parameters type */
export interface IUpdateCommentParams {
    actorId?: number | null | void;
    actorRole?: string | null | void;
    commentId?: number | null | void;
    content?: string | null | void;
}

/** 'UpdateComment' return type */
export interface IUpdateCommentResult {
    authorId: number;
    id: number;
    updatedId: number;
}

/** 'UpdateComment' query type */
export interface IUpdateCommentQuery {
    params: IUpdateCommentParams;
    result: IUpdateCommentResult;
}

const updateCommentIR: any = {
    usedParamSet: { commentId: true, content: true, actorId: true, actorRole: true },
    params: [
        { name: "commentId", required: false, transform: { type: "scalar" }, locs: [{ a: 83, b: 92 }] },
        { name: "content", required: false, transform: { type: "scalar" }, locs: [{ a: 172, b: 179 }] },
        { name: "actorId", required: false, transform: { type: "scalar" }, locs: [{ a: 306, b: 313 }] },
        { name: "actorRole", required: false, transform: { type: "scalar" }, locs: [{ a: 324, b: 333 }] }
    ],
    statement:
        'WITH target_comment AS (\n    SELECT id, author_id\n    FROM comments\n    WHERE id = :commentId::int4\n),\nupdated_comment AS (\n    UPDATE comments c\n    SET\n        content = :content,\n        updated_at = now()\n    FROM target_comment\n    WHERE c.id = target_comment.id\n      AND (target_comment.author_id = :actorId::int4 OR :actorRole::text = \'ADMIN\')\n    RETURNING c.id\n)\nSELECT\n    target_comment.id,\n    target_comment.author_id AS "authorId",\n    updated_comment.id AS "updatedId"\nFROM target_comment\nLEFT JOIN updated_comment ON true                                                                         '
};

/**
 * Query generated from SQL:
 * ```
 * WITH target_comment AS (
 *     SELECT id, author_id
 *     FROM comments
 *     WHERE id = :commentId::int4
 * ),
 * updated_comment AS (
 *     UPDATE comments c
 *     SET
 *         content = :content,
 *         updated_at = now()
 *     FROM target_comment
 *     WHERE c.id = target_comment.id
 *       AND (target_comment.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
 *     RETURNING c.id
 * )
 * SELECT
 *     target_comment.id,
 *     target_comment.author_id AS "authorId",
 *     updated_comment.id AS "updatedId"
 * FROM target_comment
 * LEFT JOIN updated_comment ON true
 * ```
 */
export const updateComment = new PreparedQuery<IUpdateCommentParams, IUpdateCommentResult>(updateCommentIR);

/** 'DeleteComment' parameters type */
export interface IDeleteCommentParams {
    actorId?: number | null | void;
    actorRole?: string | null | void;
    commentId?: number | null | void;
}

/** 'DeleteComment' return type */
export interface IDeleteCommentResult {
    authorId: number;
    deletedId: number;
    id: number;
}

/** 'DeleteComment' query type */
export interface IDeleteCommentQuery {
    params: IDeleteCommentParams;
    result: IDeleteCommentResult;
}

const deleteCommentIR: any = {
    usedParamSet: { commentId: true, actorId: true, actorRole: true },
    params: [
        { name: "commentId", required: false, transform: { type: "scalar" }, locs: [{ a: 83, b: 92 }] },
        { name: "actorId", required: false, transform: { type: "scalar" }, locs: [{ a: 249, b: 256 }] },
        { name: "actorRole", required: false, transform: { type: "scalar" }, locs: [{ a: 267, b: 276 }] }
    ],
    statement:
        'WITH target_comment AS (\n    SELECT id, author_id\n    FROM comments\n    WHERE id = :commentId::int4\n),\ndeleted_comment AS (\n    DELETE FROM comments c\n    USING target_comment\n    WHERE c.id = target_comment.id\n      AND (target_comment.author_id = :actorId::int4 OR :actorRole::text = \'ADMIN\')\n    RETURNING c.id\n)\nSELECT\n    target_comment.id,\n    target_comment.author_id AS "authorId",\n    deleted_comment.id AS "deletedId"\nFROM target_comment\nLEFT JOIN deleted_comment ON true'
};

/**
 * Query generated from SQL:
 * ```
 * WITH target_comment AS (
 *     SELECT id, author_id
 *     FROM comments
 *     WHERE id = :commentId::int4
 * ),
 * deleted_comment AS (
 *     DELETE FROM comments c
 *     USING target_comment
 *     WHERE c.id = target_comment.id
 *       AND (target_comment.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
 *     RETURNING c.id
 * )
 * SELECT
 *     target_comment.id,
 *     target_comment.author_id AS "authorId",
 *     deleted_comment.id AS "deletedId"
 * FROM target_comment
 * LEFT JOIN deleted_comment ON true
 * ```
 */
export const deleteComment = new PreparedQuery<IDeleteCommentParams, IDeleteCommentResult>(deleteCommentIR);
