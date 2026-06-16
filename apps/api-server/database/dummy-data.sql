INSERT INTO "user" (id, email, display_name, role, status, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 'admin@example.com', 'Admin', 'ADMIN', 'ACTIVE', now(), now()),
    (2, 'user@example.com', 'Writer', 'USER', 'ACTIVE', now(), now()),
    (3, 'pending@example.com', 'Pending User', 'USER', 'PENDING', now(), now())
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('"user"', 'id'), GREATEST((SELECT max(id) FROM "user"), 1), true);

INSERT INTO session (id, user_id, expires_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 1, now() + interval '30 days'),
    ('22222222-2222-2222-2222-222222222222', 2, now() + interval '30 days'),
    ('33333333-3333-3333-3333-333333333333', 3, now() + interval '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO account (user_id, provider, provider_account_id)
VALUES
    (1, 'stub', 'admin@example.com'),
    (2, 'stub', 'user@example.com'),
    (3, 'stub', 'pending@example.com')
ON CONFLICT (provider, provider_account_id) DO NOTHING;

INSERT INTO posts (id, title, content, author_id, view_count, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, '첫 번째 게시글', 'SQL seed로 만든 첫 게시글입니다.', 2, 12, now() - interval '2 days', now() - interval '2 days'),
    (2, '운영 공지', '관리자가 작성한 공지입니다.', 1, 24, now() - interval '1 day', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('posts', 'id'), GREATEST((SELECT max(id) FROM posts), 1), true);

INSERT INTO post_tags (id, name)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 'notice'),
    (2, 'intro')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('post_tags', 'id'), GREATEST((SELECT max(id) FROM post_tags), 1), true);

INSERT INTO post_tag_links (post_id, tag_id)
VALUES
    (1, 2),
    (2, 1)
ON CONFLICT (post_id, tag_id) DO NOTHING;

INSERT INTO comments (id, post_id, author_id, content, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
    (1, 1, 1, '환영합니다.', now() - interval '1 day', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('comments', 'id'), GREATEST((SELECT max(id) FROM comments), 1), true);
