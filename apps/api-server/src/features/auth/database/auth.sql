/* @name GetClaimsBySessionId */
SELECT
    s.id,
    s.user_id,
    u.role,
    u.status
FROM "session" s
INNER JOIN "user" u ON u.id = s.user_id
WHERE s.id = :sessionId::uuid
  AND s.expires_at > now();

/* @name GetUserById */
SELECT
    id,
    email,
    display_name,
    role,
    status,
    created_at,
    updated_at
FROM "user"
WHERE id = :userId::int4;

/* @name CompleteSignup */
UPDATE "user"
SET
    display_name = :displayName,
    status = 'ACTIVE',
    updated_at = now()
WHERE id = :userId::int4
RETURNING id;

/* @name UpdateMe */
UPDATE "user"
SET
    display_name = COALESCE(:displayName, display_name),
    updated_at = now()
WHERE id = :userId::int4
RETURNING id;

/* @name DeleteSessionsByUserId */
DELETE FROM "session"
WHERE user_id = :userId::int4;
