/* @name GetClaimsBySessionId */
SELECT
    s.id,
    s.user_id AS "userId",
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
    display_name AS "displayName",
    role,
    status,
    created_at AS "createdAt",
    updated_at AS "updatedAt"
FROM "user"
WHERE id = :userId::int4;

/* @name GetLoginCredentialsByLoginId */
SELECT
    id,
    password_hash AS "passwordHash",
    role,
    status
FROM "user"
WHERE login_id = :loginId;

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

/* @name CreateSessionForUser */
INSERT INTO "session" (id, user_id, expires_at)
SELECT
    :sessionId::uuid,
    u.id,
    now() + interval '30 days'
FROM "user" u
WHERE u.id = :userId::int4
RETURNING
    id,
    user_id AS "userId";

/* @name DeleteSessionsByUserId */
DELETE FROM "session"
WHERE user_id = :userId::int4;
