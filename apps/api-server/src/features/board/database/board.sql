/* @name ListPosts */
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id,
    u.display_name AS author_name,
    p.view_count,
    p.created_at,
    p.updated_at,
    (
        SELECT count(*)::int4
        FROM comments c
        WHERE c.post_id = p.id
    ) AS comment_count
FROM posts p
INNER JOIN "user" u ON u.id = p.author_id
WHERE (:search::text IS NULL OR p.title ILIKE '%' || :search::text || '%' OR p.content ILIKE '%' || :search::text || '%')
  AND (:tag::text IS NULL OR EXISTS (
      SELECT 1
      FROM post_tag_links ptl
      INNER JOIN post_tags pt ON pt.id = ptl.tag_id
      WHERE ptl.post_id = p.id
        AND pt.name = lower(:tag::text)
  ))
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
  AND (:tag::text IS NULL OR EXISTS (
      SELECT 1
      FROM post_tag_links ptl
      INNER JOIN post_tags pt ON pt.id = ptl.tag_id
      WHERE ptl.post_id = p.id
        AND pt.name = lower(:tag::text)
  ))
  AND (:authorId::int4 IS NULL OR p.author_id = :authorId::int4);

/* @name ListTagsByPostIds */
SELECT
    ptl.post_id,
    pt.id,
    pt.name
FROM post_tag_links ptl
INNER JOIN post_tags pt ON pt.id = ptl.tag_id
WHERE ptl.post_id = ANY(:postIds::int4[])
ORDER BY pt.name ASC;

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
    p.author_id,
    u.display_name AS author_name,
    p.view_count,
    p.created_at,
    p.updated_at,
    (
        SELECT count(*)::int4
        FROM comments c
        WHERE c.post_id = p.id
    ) AS comment_count
FROM posts p
INNER JOIN "user" u ON u.id = p.author_id
WHERE p.id = :postId::int4;

/* @name ListCommentsByPostId */
SELECT
    c.id,
    c.post_id,
    c.author_id,
    u.display_name AS author_name,
    c.content,
    c.created_at,
    c.updated_at
FROM comments c
INNER JOIN "user" u ON u.id = c.author_id
WHERE c.post_id = :postId::int4
ORDER BY c.created_at ASC;

/* @name ListTags */
SELECT
    id,
    name
FROM post_tags
ORDER BY name ASC;

/* @name CountPostTagLinks */
SELECT count(*)::int4 AS total
FROM post_tag_links
WHERE post_id = :postId::int4;

/* @name CreatePost */
WITH created_post AS (
    INSERT INTO posts (title, content, author_id)
    VALUES (:title, :content, :authorId::int4)
    RETURNING id
),
requested_tags AS (
    SELECT unnest(:tagNames::text[]) AS name
),
upserted_tags AS (
    INSERT INTO post_tags (name)
    SELECT name
    FROM requested_tags
    ON CONFLICT (name) DO NOTHING
    RETURNING id, name
),
existing_tags AS (
    SELECT id
    FROM post_tags
    WHERE name IN (SELECT name FROM requested_tags)
),
all_tags AS (
    SELECT id
    FROM existing_tags
    UNION
    SELECT id
    FROM upserted_tags
),
linked_tags AS (
    INSERT INTO post_tag_links (post_id, tag_id)
    SELECT created_post.id, all_tags.id
    FROM created_post
    CROSS JOIN all_tags
    ON CONFLICT (post_id, tag_id) DO NOTHING
    RETURNING post_id
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
),
requested_tags AS (
    SELECT unnest(:tagNames::text[]) AS name
),
deleted_links AS (
    DELETE FROM post_tag_links
    WHERE post_id = :postId::int4
      AND :replaceTags::bool
      AND EXISTS (SELECT 1 FROM updated_post)
    RETURNING post_id
),
upserted_tags AS (
    INSERT INTO post_tags (name)
    SELECT name
    FROM requested_tags
    WHERE :replaceTags::bool
      AND EXISTS (SELECT 1 FROM updated_post)
    ON CONFLICT (name) DO NOTHING
    RETURNING id, name
),
existing_tags AS (
    SELECT id
    FROM post_tags
    WHERE :replaceTags::bool
      AND EXISTS (SELECT 1 FROM updated_post)
      AND name IN (SELECT name FROM requested_tags)
),
all_tags AS (
    SELECT id
    FROM existing_tags
    UNION
    SELECT id
    FROM upserted_tags
),
linked_tags AS (
    INSERT INTO post_tag_links (post_id, tag_id)
    SELECT :postId::int4, all_tags.id
    FROM all_tags
    ON CONFLICT (post_id, tag_id) DO NOTHING
    RETURNING post_id
)
SELECT
    target_post.id,
    target_post.author_id,
    updated_post.id AS updated_id
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
    target_post.author_id,
    deleted_post.id AS deleted_id
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
    target_post.id AS post_id,
    created_comment.id AS comment_id
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
    target_comment.author_id,
    updated_comment.id AS updated_id
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
    target_comment.author_id,
    deleted_comment.id AS deleted_id
FROM target_comment
LEFT JOIN deleted_comment ON true;
