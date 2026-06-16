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
WHERE id = :userId::int4
  AND is_anonymous = false;

/* Purpose: Check if a self-service signup identity is already taken. */
/* @name FindUserByLoginIdOrEmail */
SELECT id
FROM "user"
WHERE login_id = :loginId
   OR email = :email
LIMIT 1;

/* Purpose: Update the current user's editable profile fields. */
/* @name UpdateMe */
UPDATE "user"
SET
    display_name = COALESCE(:displayName, display_name),
    updated_at = now()
WHERE id = :userId::int4
RETURNING id;

/* Purpose: Remove one Better Auth session by token during rejected sign-in cleanup. */
/* @name DeleteSessionByToken */
DELETE FROM "session"
WHERE token = :token;
