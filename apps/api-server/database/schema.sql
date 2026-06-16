/* Purpose: Provide UUID generation for Better Auth-owned records. */
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/* Purpose: Keep updated_at columns current with PostgreSQL triggers. */
CREATE EXTENSION IF NOT EXISTS moddatetime;

/* Purpose: Store Better Auth user identity plus app profile, role, and account status. */
CREATE TABLE "user" (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login_id VARCHAR(80) UNIQUE,
    display_username VARCHAR(80),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    image TEXT,
    display_name VARCHAR(80) NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CONSTRAINT user_role_check CHECK (
        role::text = ANY (ARRAY['USER'::character varying, 'ADMIN'::character varying]::text[])
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CONSTRAINT user_status_check CHECK (
        status::text = ANY (ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying]::text[])
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_login_id_required_check CHECK (is_anonymous OR login_id IS NOT NULL)
);

/* Purpose: Refresh the user updated_at value on profile or status changes. */
CREATE TRIGGER set_user_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Store Better Auth session tokens and expiry for signed-in users. */
CREATE TABLE "session" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the session updated_at value on session updates. */
CREATE TRIGGER set_session_updated_at
BEFORE UPDATE ON "session"
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up session lookups by user. */
CREATE INDEX idx_session_user_id ON "session"(user_id);
/* Purpose: Speed up Better Auth session lookups by token. */
CREATE INDEX idx_session_token ON "session"(token);
/* Purpose: Speed up expired session cleanup. */
CREATE INDEX idx_session_expires_at ON "session"(expires_at);

/* Purpose: Store Better Auth credential and future provider account links. */
CREATE TABLE account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT account_provider_account_unique UNIQUE (provider_id, account_id)
);

/* Purpose: Refresh the account updated_at value on account changes. */
CREATE TRIGGER set_account_updated_at
BEFORE UPDATE ON account
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up account lookups by user. */
CREATE INDEX idx_account_user_id ON account(user_id);

/* Purpose: Store Better Auth one-time verification tokens. */
CREATE TABLE verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the verification updated_at value on verification changes. */
CREATE TRIGGER set_verification_updated_at
BEFORE UPDATE ON verification
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up verification lookup by identifier. */
CREATE INDEX idx_verification_identifier ON verification(identifier);

/* Purpose: Store board posts written by users. */
CREATE TABLE posts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the post updated_at value on content or counter changes. */
CREATE TRIGGER set_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up post list filtering by author. */
CREATE INDEX idx_posts_author_id ON posts(author_id);
/* Purpose: Speed up recent post ordering. */
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

/* Purpose: Store comments attached to board posts. */
CREATE TABLE comments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the comment updated_at value on content changes. */
CREATE TRIGGER set_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up comment list loading by post. */
CREATE INDEX idx_comments_post_id ON comments(post_id);

/* Purpose: Store operational projects and their ownership. */
CREATE TABLE projects (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT project_status_check CHECK (
        status::text = ANY (
            ARRAY[
                'PLANNED'::character varying,
                'ACTIVE'::character varying,
                'COMPLETED'::character varying,
                'ARCHIVED'::character varying
            ]::text[]
        )
    ),
    owner_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    created_by_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the project updated_at value on project changes. */
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up project filtering by status. */
CREATE INDEX idx_projects_status ON projects(status);
/* Purpose: Speed up project lookup by owner. */
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
/* Purpose: Speed up recent project ordering. */
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

/* Purpose: Store project tasks with assignment, status, and priority. */
CREATE TABLE tasks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT task_status_check CHECK (
        status::text = ANY (
            ARRAY['TODO'::character varying, 'IN_PROGRESS'::character varying, 'DONE'::character varying]::text[]
        )
    ),
    priority VARCHAR(20) NOT NULL CONSTRAINT task_priority_check CHECK (
        priority::text = ANY (ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying]::text[])
    ),
    assignee_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    created_by_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the task updated_at value on task changes. */
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up task lists by project. */
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
/* Purpose: Speed up task lists by assignee. */
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
/* Purpose: Speed up task filtering by status. */
CREATE INDEX idx_tasks_status ON tasks(status);

/* Purpose: Store project approval requests and review results. */
CREATE TABLE approval_requests (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT approval_request_status_check CHECK (
        status::text = ANY (
            ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying]::text[]
        )
    ),
    requester_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    reviewer_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* Purpose: Refresh the approval request updated_at value on review changes. */
CREATE TRIGGER set_approval_requests_updated_at
BEFORE UPDATE ON approval_requests
FOR EACH ROW
EXECUTE FUNCTION moddatetime(updated_at);

/* Purpose: Speed up approval request filtering by project. */
CREATE INDEX idx_approval_requests_project_id ON approval_requests(project_id);
/* Purpose: Speed up approval request filtering by status. */
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
/* Purpose: Speed up approval request filtering by requester. */
CREATE INDEX idx_approval_requests_requester_id ON approval_requests(requester_id);
