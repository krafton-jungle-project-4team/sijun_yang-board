INSERT INTO "user" (
    id,
    login_id,
    display_username,
    email,
    email_verified,
    image,
    display_name,
    is_anonymous,
    role,
    status,
    created_at,
    updated_at
)
OVERRIDING SYSTEM VALUE
VALUES
    (
        1,
        'admin',
        'admin',
        'admin@example.com',
        true,
        NULL,
        'Admin',
        false,
        'ADMIN',
        'ACTIVE',
        now(),
        now()
    ),
    (
        2,
        'user',
        'user',
        'user@example.com',
        true,
        NULL,
        'Writer',
        false,
        'USER',
        'ACTIVE',
        now(),
        now()
    )
ON CONFLICT (id) DO UPDATE
SET
    login_id = EXCLUDED.login_id,
    display_username = EXCLUDED.display_username,
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    image = EXCLUDED.image,
    display_name = EXCLUDED.display_name,
    is_anonymous = EXCLUDED.is_anonymous,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

SELECT setval(pg_get_serial_sequence('"user"', 'id'), GREATEST((SELECT max(id) FROM "user"), 1), true);

INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES
    (
        '00000000-0000-4000-8000-000000000001',
        '1',
        'credential',
        1,
        '580174b5bc871dc2ab42532ed2917928:30460624c52e5f5564e8188fe07716e045790a3eddd21f9db3dc14b295f0090ded67c294e3fb82a7058e578cd516e5c06f7f89841c69acd46ef2657cc953d0ee',
        now(),
        now()
    ),
    (
        '00000000-0000-4000-8000-000000000002',
        '2',
        'credential',
        2,
        '204fc6a06670a2367bb77bc86170f7f0:8af0cf78f68dc7f2437e7b21e49b0d2809c0518d7071f29d3c0ee6a040599635b19f4fe65d84653bed60e977f3b254cef3e738a3defaec6755ed5e419248484f',
        now(),
        now()
    )
ON CONFLICT (provider_id, account_id) DO UPDATE
SET
    user_id = EXCLUDED.user_id,
    password = EXCLUDED.password,
    updated_at = now();

INSERT INTO posts (id, title, content, author_id, view_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 'Incident handoff reminder', 'Keep handoff notes short, link the active project, and call out pending approvals before shift change.', 2, 12, now() - interval '2 days', now() - interval '2 days'),
    (2, 'Maintenance window for billing ops', 'Billing exports pause on Friday 23:00 KST. Project owners should close urgent tasks before the window.', 1, 24, now() - interval '1 day', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('posts', 'id'), GREATEST((SELECT max(id) FROM posts), 1), true);

INSERT INTO projects (id, name, description, status, owner_id, created_by_id, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 'Billing operations launch', 'Coordinate billing export checks, approval routing, and rollout communication.', 'ACTIVE', 1, 1, now() - interval '5 days', now() - interval '1 day'),
    (2, 'Support knowledge refresh', 'Refresh internal articles and prepare support team review.', 'PLANNED', 2, 1, now() - interval '3 days', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('projects', 'id'), GREATEST((SELECT max(id) FROM projects), 1), true);

INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, created_by_id, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 1, 'Confirm export checklist', 'Validate the billing export checklist with finance operations.', 'IN_PROGRESS', 'HIGH', 2, 1, now() - interval '4 days', now() - interval '1 day'),
    (2, 1, 'Prepare rollout note', 'Draft the announcement for support and billing stakeholders.', 'TODO', 'MEDIUM', 1, 1, now() - interval '3 days', now() - interval '2 days'),
    (3, 2, 'Audit outdated articles', 'Collect stale knowledge posts for the support refresh.', 'TODO', 'LOW', 2, 1, now() - interval '2 days', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('tasks', 'id'), GREATEST((SELECT max(id) FROM tasks), 1), true);

INSERT INTO approval_requests (
    id,
    project_id,
    title,
    description,
    status,
    requester_id,
    reviewer_id,
    reviewed_at,
    review_comment,
    created_at,
    updated_at
)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 1, 'Approve billing rollout notice', 'Please review the stakeholder rollout note before publishing.', 'PENDING', 2, NULL, NULL, NULL, now() - interval '1 day', now() - interval '1 day'),
    (2, 2, 'Approve knowledge refresh scope', 'Scope is ready for admin review.', 'APPROVED', 2, 1, now() - interval '12 hours', 'Looks good.', now() - interval '2 days', now() - interval '12 hours')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('approval_requests', 'id'), GREATEST((SELECT max(id) FROM approval_requests), 1), true);

INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 1, 1, 'Confirmed for admin handoff.', now() - interval '1 day', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('comments', 'id'), GREATEST((SELECT max(id) FROM comments), 1), true);
