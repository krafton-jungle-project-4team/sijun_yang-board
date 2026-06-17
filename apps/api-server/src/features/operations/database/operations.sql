/* Purpose: List active users for assignment and ownership controls. */
/* @name ListActiveUsers */
SELECT
    id,
    email,
    display_name AS "displayName",
    role
FROM "user"
WHERE status = 'ACTIVE'
  AND is_anonymous = false
ORDER BY display_name ASC;

/* Purpose: List projects with filters, sorting, and aggregate counts. */
/* @name ListProjects */
SELECT
    p.id,
    p.name,
    p.description,
    p.status,
    p.owner_id AS "ownerId",
    owner.display_name AS "ownerName",
    p.created_by_id AS "createdById",
    creator.display_name AS "createdByName",
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt",
    (
        SELECT count(*)::int4
        FROM tasks t
        WHERE t.project_id = p.id
    ) AS "taskCount",
    (
        SELECT count(*)::int4
        FROM tasks t
        WHERE t.project_id = p.id
          AND t.status <> 'DONE'
    ) AS "openTaskCount",
    (
        SELECT count(*)::int4
        FROM approval_requests ar
        WHERE ar.project_id = p.id
          AND ar.status = 'PENDING'
    ) AS "pendingRequestCount"
FROM projects p
INNER JOIN "user" owner ON owner.id = p.owner_id
INNER JOIN "user" creator ON creator.id = p.created_by_id
WHERE (:search::text IS NULL OR p.name ILIKE '%' || :search::text || '%' OR p.description ILIKE '%' || :search::text || '%')
  AND (:status::text IS NULL OR p.status = :status::text)
ORDER BY
    CASE WHEN :sort = 'name' THEN p.name END ASC NULLS LAST,
    CASE WHEN :sort = 'oldest' THEN p.created_at END ASC NULLS LAST,
    p.created_at DESC
LIMIT :limit::int4
OFFSET :offset::int4;

/* Purpose: Count projects for paginated list metadata. */
/* @name CountProjects */
SELECT count(*)::int4 AS total
FROM projects p
WHERE (:search::text IS NULL OR p.name ILIKE '%' || :search::text || '%' OR p.description ILIKE '%' || :search::text || '%')
  AND (:status::text IS NULL OR p.status = :status::text);

/* Purpose: Read a project detail with owner, creator, and aggregate counts. */
/* @name GetProjectById */
SELECT
    p.id,
    p.name,
    p.description,
    p.status,
    p.owner_id AS "ownerId",
    owner.display_name AS "ownerName",
    p.created_by_id AS "createdById",
    creator.display_name AS "createdByName",
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt",
    (
        SELECT count(*)::int4
        FROM tasks t
        WHERE t.project_id = p.id
    ) AS "taskCount",
    (
        SELECT count(*)::int4
        FROM tasks t
        WHERE t.project_id = p.id
          AND t.status <> 'DONE'
    ) AS "openTaskCount",
    (
        SELECT count(*)::int4
        FROM approval_requests ar
        WHERE ar.project_id = p.id
          AND ar.status = 'PENDING'
    ) AS "pendingRequestCount"
FROM projects p
INNER JOIN "user" owner ON owner.id = p.owner_id
INNER JOIN "user" creator ON creator.id = p.created_by_id
WHERE p.id = :projectId::int4;

/* Purpose: Create a project and return its new id. */
/* @name CreateProject */
INSERT INTO projects (name, description, status, owner_id, created_by_id)
VALUES (:name, :description, :status, COALESCE(:ownerId::int4, :createdById::int4), :createdById::int4)
RETURNING id;

/* Purpose: Update editable project fields. */
/* @name UpdateProject */
UPDATE projects
SET
    name = COALESCE(:name, name),
    description = COALESCE(:description, description),
    status = COALESCE(:status, status),
    owner_id = COALESCE(:ownerId, owner_id),
    updated_at = now()
WHERE id = :projectId::int4
RETURNING id;

/* Purpose: List tasks for a project in work-priority order. */
/* @name ListTasksByProjectId */
SELECT
    t.id,
    t.project_id AS "projectId",
    p.name AS "projectName",
    t.title,
    t.description,
    t.status,
    t.priority,
    t.assignee_id AS "assigneeId",
    assignee.display_name AS "assigneeName",
    t.created_by_id AS "createdById",
    creator.display_name AS "createdByName",
    t.created_at AS "createdAt",
    t.updated_at AS "updatedAt"
FROM tasks t
INNER JOIN projects p ON p.id = t.project_id
INNER JOIN "user" creator ON creator.id = t.created_by_id
LEFT JOIN "user" assignee ON assignee.id = t.assignee_id
WHERE t.project_id = :projectId::int4
ORDER BY
    CASE t.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'TODO' THEN 2 ELSE 3 END ASC,
    CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
    t.created_at DESC;

/* Purpose: Read one task with project and user display data. */
/* @name GetTaskById */
SELECT
    t.id,
    t.project_id AS "projectId",
    p.name AS "projectName",
    t.title,
    t.description,
    t.status,
    t.priority,
    t.assignee_id AS "assigneeId",
    assignee.display_name AS "assigneeName",
    t.created_by_id AS "createdById",
    creator.display_name AS "createdByName",
    t.created_at AS "createdAt",
    t.updated_at AS "updatedAt"
FROM tasks t
INNER JOIN projects p ON p.id = t.project_id
INNER JOIN "user" creator ON creator.id = t.created_by_id
LEFT JOIN "user" assignee ON assignee.id = t.assignee_id
WHERE t.id = :taskId::int4;

/* Purpose: Create a task only when the target project exists. */
/* @name CreateTask */
WITH target_project AS (
    SELECT id
    FROM projects
    WHERE id = :projectId::int4
),
created_task AS (
    INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, created_by_id)
    SELECT target_project.id, :title, :description, :status, :priority, :assigneeId::int4, :createdById::int4
    FROM target_project
    RETURNING id
)
SELECT
    target_project.id AS "projectId",
    created_task.id AS "taskId"
FROM target_project
LEFT JOIN created_task ON true;

/* Purpose: Update task fields allowed for the current actor. */
/* @name UpdateTask */
WITH target_task AS (
    SELECT id, assignee_id
    FROM tasks
    WHERE id = :taskId::int4
),
updated_task AS (
    UPDATE tasks t
    SET
        title = COALESCE(:title, t.title),
        description = COALESCE(:description, t.description),
        status = COALESCE(:status, t.status),
        priority = COALESCE(:priority, t.priority),
        assignee_id = CASE WHEN :replaceAssignee::bool THEN :assigneeId::int4 ELSE t.assignee_id END,
        updated_at = now()
    FROM target_task
    WHERE t.id = target_task.id
      AND (
          :actorRole::text = 'ADMIN'
          OR (
              target_task.assignee_id = :actorId::int4
              AND :status::text IS NOT NULL
              AND NOT :adminFieldPatch::bool
          )
      )
    RETURNING t.id
)
SELECT
    target_task.id,
    target_task.assignee_id AS "assigneeId",
    updated_task.id AS "updatedId"
FROM target_task
LEFT JOIN updated_task ON true;

/* Purpose: List approval requests with filters and reviewer metadata. */
/* @name ListApprovalRequests */
SELECT
    ar.id,
    ar.project_id AS "projectId",
    p.name AS "projectName",
    ar.title,
    ar.description,
    ar.status,
    ar.requester_id AS "requesterId",
    requester.display_name AS "requesterName",
    ar.reviewer_id AS "reviewerId",
    reviewer.display_name AS "reviewerName",
    ar.reviewed_at AS "reviewedAt",
    ar.review_comment AS "reviewComment",
    ar.created_at AS "createdAt",
    ar.updated_at AS "updatedAt"
FROM approval_requests ar
INNER JOIN projects p ON p.id = ar.project_id
INNER JOIN "user" requester ON requester.id = ar.requester_id
LEFT JOIN "user" reviewer ON reviewer.id = ar.reviewer_id
WHERE (:search::text IS NULL OR ar.title ILIKE '%' || :search::text || '%' OR ar.description ILIKE '%' || :search::text || '%')
  AND (:projectId::int4 IS NULL OR ar.project_id = :projectId::int4)
  AND (:status::text IS NULL OR ar.status = :status::text)
ORDER BY
    CASE WHEN :sort = 'oldest' THEN ar.created_at END ASC NULLS LAST,
    ar.created_at DESC
LIMIT :limit::int4
OFFSET :offset::int4;

/* Purpose: Count approval requests for paginated list metadata. */
/* @name CountApprovalRequests */
SELECT count(*)::int4 AS total
FROM approval_requests ar
WHERE (:search::text IS NULL OR ar.title ILIKE '%' || :search::text || '%' OR ar.description ILIKE '%' || :search::text || '%')
  AND (:projectId::int4 IS NULL OR ar.project_id = :projectId::int4)
  AND (:status::text IS NULL OR ar.status = :status::text);

/* Purpose: Read one approval request with project and user display data. */
/* @name GetApprovalRequestById */
SELECT
    ar.id,
    ar.project_id AS "projectId",
    p.name AS "projectName",
    ar.title,
    ar.description,
    ar.status,
    ar.requester_id AS "requesterId",
    requester.display_name AS "requesterName",
    ar.reviewer_id AS "reviewerId",
    reviewer.display_name AS "reviewerName",
    ar.reviewed_at AS "reviewedAt",
    ar.review_comment AS "reviewComment",
    ar.created_at AS "createdAt",
    ar.updated_at AS "updatedAt"
FROM approval_requests ar
INNER JOIN projects p ON p.id = ar.project_id
INNER JOIN "user" requester ON requester.id = ar.requester_id
LEFT JOIN "user" reviewer ON reviewer.id = ar.reviewer_id
WHERE ar.id = :requestId::int4;

/* Purpose: Create a pending approval request for an existing project. */
/* @name CreateApprovalRequest */
WITH target_project AS (
    SELECT id
    FROM projects
    WHERE id = :projectId::int4
),
created_request AS (
    INSERT INTO approval_requests (project_id, title, description, status, requester_id)
    SELECT target_project.id, :title, :description, 'PENDING', :requesterId::int4
    FROM target_project
    RETURNING id
)
SELECT
    target_project.id AS "projectId",
    created_request.id AS "requestId"
FROM target_project
LEFT JOIN created_request ON true;

/* Purpose: Review a pending approval request once. */
/* @name ReviewApprovalRequest */
WITH target_request AS (
    SELECT id, status
    FROM approval_requests
    WHERE id = :requestId::int4
),
reviewed_request AS (
    UPDATE approval_requests ar
    SET
        status = :nextStatus,
        reviewer_id = :reviewerId::int4,
        reviewed_at = now(),
        review_comment = :reviewComment,
        updated_at = now()
    FROM target_request
    WHERE ar.id = target_request.id
      AND target_request.status = 'PENDING'
    RETURNING ar.id
)
SELECT
    target_request.id,
    target_request.status,
    reviewed_request.id AS "reviewedId"
FROM target_request
LEFT JOIN reviewed_request ON true;

/* Purpose: Load dashboard summary counts. */
/* @name GetDashboardCounts */
SELECT
    (
        SELECT count(*)::int4
        FROM projects
        WHERE status = 'ACTIVE'
    ) AS "activeProjectCount",
    (
        SELECT count(*)::int4
        FROM tasks
        WHERE status = 'IN_PROGRESS'
    ) AS "inProgressTaskCount";

/* Purpose: List the current user's open dashboard tasks. */
/* @name ListDashboardMyTasks */
SELECT
    t.id,
    t.project_id AS "projectId",
    p.name AS "projectName",
    t.title,
    t.description,
    t.status,
    t.priority,
    t.assignee_id AS "assigneeId",
    assignee.display_name AS "assigneeName",
    t.created_by_id AS "createdById",
    creator.display_name AS "createdByName",
    t.created_at AS "createdAt",
    t.updated_at AS "updatedAt"
FROM tasks t
INNER JOIN projects p ON p.id = t.project_id
INNER JOIN "user" creator ON creator.id = t.created_by_id
LEFT JOIN "user" assignee ON assignee.id = t.assignee_id
WHERE t.assignee_id = :assigneeId::int4
  AND t.status <> 'DONE'
ORDER BY
    CASE t.status WHEN 'IN_PROGRESS' THEN 1 WHEN 'TODO' THEN 2 ELSE 3 END ASC,
    CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
    t.updated_at DESC
LIMIT :limit::int4;

/* Purpose: List pending approval requests for the dashboard. */
/* @name ListDashboardPendingRequests */
SELECT
    ar.id,
    ar.project_id AS "projectId",
    p.name AS "projectName",
    ar.title,
    ar.description,
    ar.status,
    ar.requester_id AS "requesterId",
    requester.display_name AS "requesterName",
    ar.reviewer_id AS "reviewerId",
    reviewer.display_name AS "reviewerName",
    ar.reviewed_at AS "reviewedAt",
    ar.review_comment AS "reviewComment",
    ar.created_at AS "createdAt",
    ar.updated_at AS "updatedAt"
FROM approval_requests ar
INNER JOIN projects p ON p.id = ar.project_id
INNER JOIN "user" requester ON requester.id = ar.requester_id
LEFT JOIN "user" reviewer ON reviewer.id = ar.reviewer_id
WHERE ar.status = 'PENDING'
ORDER BY ar.created_at DESC
LIMIT :limit::int4;

/* Purpose: List recent board posts for the dashboard. */
/* @name ListDashboardRecentPosts */
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
ORDER BY p.created_at DESC
LIMIT :limit::int4;
