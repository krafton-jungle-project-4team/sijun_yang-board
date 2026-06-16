/* Purpose: Load session claims for authenticated request guards. */
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

/* Purpose: Read the current user profile by id. */
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

/* Purpose: Load login credentials during email/password sign-in. */
/* @name GetLoginCredentialsByLoginId */
SELECT
    id,
    password_hash AS "passwordHash",
    role,
    status
FROM "user"
WHERE login_id = :loginId;

/* Purpose: Update the current user's editable profile fields. */
/* @name UpdateMe */
UPDATE "user"
SET
    display_name = COALESCE(:displayName, display_name),
    updated_at = now()
WHERE id = :userId::int4
RETURNING id;

/* Purpose: Create a self-service user account. */
/* @name CreateUser */
INSERT INTO "user" (login_id, email, password_hash, display_name, role, status)
VALUES (:loginId, :email, :passwordHash, :displayName, 'USER', 'ACTIVE')
RETURNING id;

/* Purpose: Create a persistent session for a signed-in user. */
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

/* Purpose: Remove every session owned by a user during sign-out cleanup. */
/* @name DeleteSessionsByUserId */
DELETE FROM "session"
WHERE user_id = :userId::int4;
