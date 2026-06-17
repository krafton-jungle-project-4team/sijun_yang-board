#!/usr/bin/env python3

import os
import subprocess
import sys
from pathlib import Path

ENV_FILE = Path(sys.argv[1] if len(sys.argv) > 1 else ".env")
SCHEMA_FILE = Path("database/schema.sql").resolve()
DEFAULT_SQLDEF_IMAGE = "sqldef/psqldef:3.11.5"
DOCKER_HOST_ALIAS = "host.docker.internal"


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

sqldef_image = os.getenv("SQLDEF_IMAGE", DEFAULT_SQLDEF_IMAGE)
pg_host = required_env("PGHOST")
pg_port = required_env("PGPORT")
pg_database = required_env("PGDATABASE")
pg_user = required_env("PGUSER")
pg_password = required_env("PGPASSWORD")
docker_host = DOCKER_HOST_ALIAS if pg_host in ("127.0.0.1", "localhost") else pg_host

if not SCHEMA_FILE.exists():
    fail(f"schema source not found at {SCHEMA_FILE}.")

command = [
    "docker",
    "run",
    "--rm",
    "-v",
    f"{SCHEMA_FILE}:/schema.sql:ro",
    "-e",
    "PGPASSWORD",
    "-e",
    "PGSSLMODE",
    "--add-host",
    f"{DOCKER_HOST_ALIAS}:host-gateway",
    sqldef_image,
    "-h",
    docker_host,
    "-p",
    pg_port,
    "-U",
    pg_user,
    "--dry-run",
    "--enable-drop",
    "-f",
    "/schema.sql",
    pg_database,
]

print(f"Running sqldef schema drift check with {sqldef_image}.", flush=True)

try:
    result = subprocess.run(
        command,
        env={**os.environ, "PGPASSWORD": pg_password, "PGSSLMODE": os.getenv("PGSSLMODE", "disable")},
        text=True,
        capture_output=True,
        check=False,
    )
except FileNotFoundError:
    fail("Docker CLI is not installed or not available on PATH.")

if result.stdout:
    sys.stdout.write(result.stdout)

if result.stderr:
    sys.stderr.write(result.stderr)

output = f"{result.stdout}\n{result.stderr}"

if result.returncode != 0:
    fail(f"sqldef Docker run failed with exit code {result.returncode}.")

if "-- Nothing is modified --" not in output:
    fail("schema drift detected. sqldef dry-run output above must be empty.")

print("db:verify passed: schema.sql matches the current PostgreSQL schema.")
