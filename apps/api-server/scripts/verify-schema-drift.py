#!/usr/bin/env python3

import os
import subprocess
import sys
import time
import uuid
from difflib import unified_diff
from pathlib import Path

ENV_FILE = Path(sys.argv[1] if len(sys.argv) > 1 else ".env")
SCHEMA_FILE = Path("database/schema.sql").resolve()
DEFAULT_POSTGRES_IMAGE = "postgres:16-alpine"
DOCKER_HOST_ALIAS = "host.docker.internal"
MAX_DIFF_LINES = 200
TEMP_DB_TIMEOUT_SECONDS = 30
SCHEMA_SNAPSHOT_SQL = r"""
WITH schema_objects AS (
    SELECT
        'extension' AS kind,
        'public' AS parent,
        extname AS name,
        extname AS definition
    FROM pg_extension
    WHERE extname <> 'plpgsql'

    UNION ALL

    SELECT
        'table' AS kind,
        n.nspname AS parent,
        quote_ident(c.relname) AS name,
        c.relkind::text AS definition
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
        AND c.relkind = 'r'

    UNION ALL

    SELECT
        'column' AS kind,
        n.nspname || '.' || quote_ident(c.relname) AS parent,
        a.attname AS name,
        jsonb_build_object(
            'type',
            pg_catalog.format_type(a.atttypid, a.atttypmod),
            'notNull',
            a.attnotnull,
            'default',
            pg_get_expr(d.adbin, d.adrelid),
            'identity',
            a.attidentity
        )::text AS definition
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid
        AND d.adnum = a.attnum
    WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND a.attnum > 0
        AND NOT a.attisdropped

    UNION ALL

    SELECT
        'constraint' AS kind,
        n.nspname || '.' || quote_ident(c.relname) AS parent,
        con.conname AS name,
        pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'

    UNION ALL

    SELECT
        'index' AS kind,
        schemaname || '.' || quote_ident(tablename) AS parent,
        indexname AS name,
        indexdef AS definition
    FROM pg_indexes
    WHERE schemaname = 'public'

    UNION ALL

    SELECT
        'trigger' AS kind,
        n.nspname || '.' || quote_ident(c.relname) AS parent,
        t.tgname AS name,
        pg_get_triggerdef(t.oid) AS definition
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
)
SELECT kind || E'\t' || parent || E'\t' || name || E'\t' || definition
FROM schema_objects
ORDER BY kind, parent, name, definition;
""".strip()


def fail(message):
    print(f"db:verify failed: {message}", file=sys.stderr)
    sys.exit(1)


def load_env_file(path):
    if not path.exists():
        return

    for line in path.read_text().splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def required_env(name):
    value = os.getenv(name)

    if not value:
        fail(f"missing {name}. Check {ENV_FILE}.")

    return value


load_env_file(ENV_FILE)

postgres_image = os.getenv("POSTGRES_IMAGE", DEFAULT_POSTGRES_IMAGE)
pg_host = required_env("PGHOST")
pg_port = required_env("PGPORT")
pg_database = required_env("PGDATABASE")
pg_user = required_env("PGUSER")
pg_password = required_env("PGPASSWORD")
docker_host = DOCKER_HOST_ALIAS if pg_host in ("127.0.0.1", "localhost") else pg_host

if not SCHEMA_FILE.exists():
    fail(f"schema source not found at {SCHEMA_FILE}.")


def run_result(command, env=None, input=None):
    try:
        return subprocess.run(
            command,
            env=env,
            input=input,
            text=True,
            capture_output=True,
            check=False,
        )
    except FileNotFoundError:
        fail("Docker CLI is not installed or not available on PATH.")


def run(command, env=None, input=None):
    result = run_result(command, env=env, input=input)

    if result.returncode != 0:
        if result.stdout:
            sys.stdout.write(result.stdout)

        if result.stderr:
            sys.stderr.write(result.stderr)

        fail(f"Docker command failed with exit code {result.returncode}.")

    return result.stdout


def normalize_snapshot(text):
    lines = []

    for line in text.splitlines():
        line = line.rstrip()

        if not line or line.startswith("--"):
            continue

        lines.append(line)

    return "\n".join(lines) + "\n"


def snapshot_expected_schema():
    container_name = f"nmm-schema-verify-{uuid.uuid4().hex[:12]}"

    run(["docker", "run", "--rm", "-d", "--name", container_name, "-e", "POSTGRES_PASSWORD=postgres", postgres_image])

    try:
        wait_for_temp_db(container_name)
        run(
            [
                "docker",
                "exec",
                "-i",
                container_name,
                "psql",
                "-v",
                "ON_ERROR_STOP=1",
                "-U",
                "postgres",
                "-d",
                "postgres",
            ],
            input=SCHEMA_FILE.read_text(),
        )

        return run(
            [
                "docker",
                "exec",
                container_name,
                "psql",
                "-X",
                "-v",
                "ON_ERROR_STOP=1",
                "-A",
                "-t",
                "-U",
                "postgres",
                "-d",
                "postgres",
                "-c",
                SCHEMA_SNAPSHOT_SQL,
            ]
        )
    finally:
        subprocess.run(["docker", "stop", container_name], text=True, capture_output=True, check=False)


def wait_for_temp_db(container_name):
    deadline = time.monotonic() + TEMP_DB_TIMEOUT_SECONDS

    while time.monotonic() < deadline:
        logs = run_result(["docker", "logs", container_name])
        output = f"{logs.stdout}\n{logs.stderr}"

        if "PostgreSQL init process complete" in output:
            break

        time.sleep(0.2)
    else:
        fail("temporary PostgreSQL container did not finish initialization.")

    while time.monotonic() < deadline:
        ready = run_result(["docker", "exec", container_name, "pg_isready", "-U", "postgres", "-d", "postgres"])

        if ready.returncode == 0:
            return

        time.sleep(0.2)

    fail("temporary PostgreSQL container did not become ready.")


def snapshot_actual_schema():
    return run(
        [
            "docker",
            "run",
            "--rm",
            "-e",
            "PGPASSWORD",
            "-e",
            "PGSSLMODE",
            "--add-host",
            f"{DOCKER_HOST_ALIAS}:host-gateway",
            postgres_image,
            "psql",
            "-X",
            "-v",
            "ON_ERROR_STOP=1",
            "-A",
            "-t",
            "-h",
            docker_host,
            "-p",
            pg_port,
            "-U",
            pg_user,
            "-d",
            pg_database,
            "-c",
            SCHEMA_SNAPSHOT_SQL,
        ],
        env={**os.environ, "PGPASSWORD": pg_password, "PGSSLMODE": os.getenv("PGSSLMODE", "disable")},
    )


print(f"Running PostgreSQL schema drift check with {postgres_image}.", flush=True)

expected_snapshot = normalize_snapshot(snapshot_expected_schema())
actual_snapshot = normalize_snapshot(snapshot_actual_schema())

if expected_snapshot != actual_snapshot:
    diff_lines = list(
        unified_diff(
            expected_snapshot.splitlines(),
            actual_snapshot.splitlines(),
            fromfile="schema.sql",
            tofile=pg_database,
            lineterm="",
        )
    )

    sys.stderr.write("\n".join(diff_lines[:MAX_DIFF_LINES]))

    if len(diff_lines) > MAX_DIFF_LINES:
        sys.stderr.write(f"\n... diff truncated after {MAX_DIFF_LINES} lines ...")

    sys.stderr.write("\n")
    fail("schema drift detected. Update schema.sql or the current PostgreSQL schema.")

print("db:verify passed: schema.sql matches the current PostgreSQL schema.")
