# iam-ops

Local, dockerized Ory Kratos + Oathkeeper + Hydra setup backed by SQLite, plus a Next.js UI (`kratos-auth/`) using Ory Elements.

Deep dive docs:

- `docs/ORY_STACK_GUIDE.md` (concepts, “gatekeeper”/SSO workflow, Hydra OAuth2/OIDC workflow, best practices)

## What’s in here

- `docker/docker-compose.yml`: Kratos + migration job, Kratos self-service UI (node), and MailSlurper
- `docker/config/hydra.yml`: Hydra config (OAuth2/OIDC issuer)
- `kratos-auth/app/hydra/*`: Hydra login/consent/logout endpoints integrated with Kratos sessions
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

1) Start the stack (Kratos, Hydra, Oathkeeper, MailSlurper):

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
- Hydra public API (OIDC): http://localhost:4444
- Hydra admin API: http://localhost:4445
- MailSlurper UI: http://localhost:4436
- MailSlurper API: http://localhost:4437
- Oathkeeper (SSO proxy): http://localhost:4455

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
  - `kratos-auth/.env` sets `NEXT_PUBLIC_ORY_SDK_URL=http://localhost:4433/`.
  - Optional overrides (server-side only): `HYDRA_ADMIN_URL`, `KRATOS_PUBLIC_URL`, `PUBLIC_BASE_URL`.

## “Gatekeeper” SSO (no re-login between services)

This repo includes Ory Oathkeeper as a reverse-proxy “gatekeeper”. It validates the user’s **existing Kratos session cookie** via `kratos:4433/sessions/whoami` and then forwards the request to upstream services.

Example protected services (for demo) are exposed via Oathkeeper:

- Service 1: http://localhost:4455/svc1
- Service 2: http://localhost:4455/svc2

Behavior:

- If you’re **not** logged in, Oathkeeper redirects you to http://localhost:3000/auth/login.
- After you log in once, you can open both `/svc1` and `/svc2` without being asked for credentials again (same browser session).

To add your own services, edit:

- `docker/config/rules.json` (add a new rule with an `upstream.url` pointing at your container)
- `docker/docker-compose.yml` (add the service container to the same `intranet` network)

## Hydra (OAuth2/OIDC) integrated with Kratos

Hydra is configured to use the Next.js app for login/consent/logout:

- Login: http://localhost:3000/hydra/login
- Consent: http://localhost:3000/hydra/consent
- Logout: http://localhost:3000/hydra/logout

Those endpoints check the existing Kratos browser session (`/sessions/whoami`). If you’re not logged in, they send you through the existing `/auth/login` UI and then continue the Hydra flow.

## Resetting local state

To wipe identities/sessions, stop containers and delete the SQLite files:

```bash
docker compose -f docker/docker-compose.yml down
rm -f users.db users.db-wal users.db-shm
```

Then start again with the Quickstart steps.

## Troubleshooting

- **Port already in use**: `4433`, `4434`, `4436`, `4437`, or `3000` are occupied — stop the conflicting process or change port mappings.
- **Oathkeeper not reachable**: ensure `4455`/`4456` are free and the `oathkeeper` container is running.
- **“CORS” errors in the browser**: verify you’re using `http://localhost:3000` (or `127.0.0.1:3000`) and that Kratos is running.
- **Emails not arriving**: confirm `mailslurper` is up and check http://localhost:4436.

## Security

This repo is meant for local development. Secrets in `docker/config/kratos.yml` (cookie/cipher) are intentionally insecure and must be changed before any real deployment.
