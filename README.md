# iam-ops

Local, dockerized Ory Kratos setup (identity, login/registration, recovery, verification) backed by SQLite, plus a Next.js UI (`kratos-auth/`) using Ory Elements.

## What’s in here

- `docker/docker-compose.yml`: Kratos + migration job, Kratos self-service UI (node), and MailSlurper
- `docker/config/kratos.yml`: Kratos config (CORS, flows, SMTP courier, identity schema, etc.)
- `docker/config/identity.schema.json`: identity traits schema (email + optional name)
- `users.db*`: SQLite database used by Kratos (persisted in this repo for local dev)
- `kratos-auth/`: Next.js app providing `/auth/*` pages powered by `@ory/elements-react`

## Prerequisites

- Docker + Docker Compose v2 (Docker Desktop is fine)
- Node.js (for `kratos-auth/`) and either:
  - Yarn (recommended; repo is configured for Yarn 4 via `packageManager`), or
  - npm (a `package-lock.json` exists, but Yarn is the primary workflow here)

## Quickstart

1) Start Kratos (and MailSlurper):

```bash
docker compose -f docker/docker-compose.yml up -d
```

2) Start the Next.js UI:

```bash
cd kratos-auth
corepack enable
yarn install
yarn dev
```

Then open:

- Next.js UI: http://localhost:3000
- Kratos public API: http://localhost:4433
- Kratos admin API: http://localhost:4434
- MailSlurper UI: http://localhost:4436
- MailSlurper API: http://localhost:4437

## Common flows / URLs

The Kratos config points the browser-based flows at the Next.js UI:

- Login: http://localhost:3000/auth/login
- Registration: http://localhost:3000/auth/registration
- Settings: http://localhost:3000/auth/settings
- Recovery: http://localhost:3000/auth/recovery
- Verification: http://localhost:3000/auth/verification
- Error: http://localhost:3000/auth/error

## Configuration notes

- Database (SQLite):
  - Compose passes `DSN=sqlite:///var/lib/sqlite/users.db?...` to Kratos.
  - The repo root is bind-mounted to `/var/lib/sqlite` so `users.db` persists on your machine.
- CORS:
  - `docker/config/kratos.yml` allows `http://localhost:3000` and `http://127.0.0.1:3000`.
- Mail delivery:
  - Kratos courier is configured to send email to the `mailslurper` container.
- Frontend API base:
  - `kratos-auth/.env` sets `NEXT_PUBLIC_ORY_SDK_URL=http://127.0.0.1:4433/`.

## Resetting local state

To wipe identities/sessions, stop containers and delete the SQLite files:

```bash
docker compose -f docker/docker-compose.yml down
rm -f users.db users.db-wal users.db-shm
```

Then start again with the Quickstart steps.

## Troubleshooting

- **Port already in use**: `4433`, `4434`, `4436`, `4437`, or `3000` are occupied — stop the conflicting process or change port mappings.
- **“CORS” errors in the browser**: verify you’re using `http://localhost:3000` (or `127.0.0.1:3000`) and that Kratos is running.
- **Emails not arriving**: confirm `mailslurper` is up and check http://localhost:4436.

## Security

This repo is meant for local development. Secrets in `docker/config/kratos.yml` (cookie/cipher) are intentionally insecure and must be changed before any real deployment.
