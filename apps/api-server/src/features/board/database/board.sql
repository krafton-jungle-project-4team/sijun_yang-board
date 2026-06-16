/* @name ListPosts */
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id AS "authorId",
    u.display_name AS "authorName",
    p.view_count AS "viewCount",
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt",
    (
        SELECT count(*)::int4
        FROM comments c
        WHERE c.post_id = p.id
    ) AS "commentCount"
FROM posts p
INNER JOIN "user" u ON u.id = p.author_id
WHERE (:search::text IS NULL OR p.title ILIKE '%' || :search::text || '%' OR p.content ILIKE '%' || :search::text || '%')
  AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4)
ORDER BY
    CASE WHEN :sort = 'popular' THEN p.view_count END DESC NULLS LAST,
    p.created_at DESC
LIMIT :limit::int4
OFFSET :offset::int4;

/* @name CountPosts */
SELECT count(*)::int4 AS total
FROM posts p
WHERE (:search::text IS NULL OR p.title ILIKE '%' || :search::text || '%' OR p.content ILIKE '%' || :search::text || '%')
  AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4);

/* @name IncrementPostView */
UPDATE posts
SET view_count = view_count + 1
WHERE id = :postId::int4
RETURNING id;

/* @name GetPostById */
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id AS "authorId",
    u.display_name AS "authorName",
    p.view_count AS "viewCount",
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt",
    (
        SELECT count(*)::int4
        FROM comments c
        WHERE c.post_id = p.id
    ) AS "commentCount"
FROM posts p
INNER JOIN "user" u ON u.id = p.author_id
WHERE p.id = :postId::int4;

/* @name ListCommentsByPostId */
SELECT
    c.id,
    c.post_id AS "postId",
    c.author_id AS "authorId",
    u.display_name AS "authorName",
    c.content,
    c.created_at AS "createdAt",
    c.updated_at AS "updatedAt"
FROM comments c
INNER JOIN "user" u ON u.id = c.author_id
WHERE c.post_id = :postId::int4
ORDER BY c.created_at ASC;

/* @name CreatePost */
WITH created_post AS (
    INSERT INTO posts (title, content, author_id)
    VALUES (:title, :content, :authorId::int4)
    RETURNING id
)
SELECT id
FROM created_post;

/* @name UpdatePost */
WITH target_post AS (
    SELECT id, author_id
    FROM posts
    WHERE id = :postId::int4
),
updated_post AS (
    UPDATE posts p
    SET
        title = COALESCE(:title, p.title),
        content = COALESCE(:content, p.content),
        updated_at = now()
    FROM target_post
    WHERE p.id = target_post.id
      AND (target_post.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
    RETURNING p.id
)
SELECT
    target_post.id,
    target_post.author_id AS "authorId",
    updated_post.id AS "updatedId"
FROM target_post
LEFT JOIN updated_post ON true;

/* @name DeletePost */
WITH target_post AS (
    SELECT id, author_id
    FROM posts
    WHERE id = :postId::int4
),
deleted_post AS (
    DELETE FROM posts p
    USING target_post
    WHERE p.id = target_post.id
      AND (target_post.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
    RETURNING p.id
)
SELECT
    target_post.id,
    target_post.author_id AS "authorId",
    deleted_post.id AS "deletedId"
FROM target_post
LEFT JOIN deleted_post ON true;

/* @name CreateComment */
WITH target_post AS (
    SELECT id
    FROM posts
    WHERE id = :postId::int4
),
created_comment AS (
    INSERT INTO comments (post_id, author_id, content)
    SELECT target_post.id, :authorId::int4, :content
    FROM target_post
    RETURNING id
)
SELECT
    target_post.id AS "postId",
    created_comment.id AS "commentId"
FROM target_post
LEFT JOIN created_comment ON true;

/* @name UpdateComment */
WITH target_comment AS (
    SELECT id, author_id
    FROM comments
    WHERE id = :commentId::int4
),
updated_comment AS (
    UPDATE comments c
    SET
        content = :content,
        updated_at = now()
    FROM target_comment
    WHERE c.id = target_comment.id
      AND (target_comment.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
    RETURNING c.id
)
SELECT
    target_comment.id,
    target_comment.author_id AS "authorId",
    updated_comment.id AS "updatedId"
FROM target_comment
LEFT JOIN updated_comment ON true;

/* @name DeleteComment */
WITH target_comment AS (
    SELECT id, author_id
    FROM comments
    WHERE id = :commentId::int4
),
deleted_comment AS (
    DELETE FROM comments c
    USING target_comment
    WHERE c.id = target_comment.id
      AND (target_comment.author_id = :actorId::int4 OR :actorRole::text = 'ADMIN')
    RETURNING c.id
)
SELECT
    target_comment.id,
    target_comment.author_id AS "authorId",
    deleted_comment.id AS "deletedId"
FROM target_comment
LEFT JOIN deleted_comment ON true;
