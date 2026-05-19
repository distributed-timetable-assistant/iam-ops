# Ory Stack Guide (Kratos + Elements + Hydra + Oathkeeper)

This repo is a local, dockerized reference setup that combines:

- **Ory Kratos** for identities + self-service authentication flows (sessions/cookies).
- **Ory Elements** in a **Next.js UI** (`kratos-auth/`) to render Kratos flows.
- **Ory Hydra** for OAuth2 / OpenID Connect (tokens for APIs + external clients).
- **Ory Oathkeeper** as a “gatekeeper” reverse proxy in front of services (authn/z + request mutation).

If you only need “login once, browse multiple internal services”, you can stop at **Kratos + Oathkeeper**.
If you also need standards-based API authorization for SPAs/mobile/3rd-party clients, add **Hydra**.

## Table of contents

- [Concepts](#concepts)
- [How this repo is wired](#how-this-repo-is-wired)
- [Workflows](#workflows)
  - [Workflow 1: Browser login (Kratos session cookie)](#workflow-1-browser-login-kratos-session-cookie)
  - [Workflow 2: SSO “gatekeeper” to upstream services (Oathkeeper + Kratos)](#workflow-2-sso-gatekeeper-to-upstream-services-oathkeeper--kratos)
  - [Workflow 3: OAuth2/OIDC login & tokens (Hydra + Kratos)](#workflow-3-oauth2oidc-login--tokens-hydra--kratos)
- [Adding a new protected service behind Oathkeeper](#adding-a-new-protected-service-behind-oathkeeper)
- [Best practices (production checklist)](#best-practices-production-checklist)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

## Concepts

### Kratos: identities + authentication

Kratos is your **identity system**. It handles:

- user registration/login/logout
- account recovery + email verification (if enabled)
- sessions (commonly browser cookies)
- identity schemas (“traits”, like email/name)

Kratos is **headless**: it exposes APIs for “self-service flows”. Your UI renders the flow and submits it.

### Elements: UI building blocks for Kratos flows

Ory Elements is a UI component library (React) that knows how to render Kratos flows (login/registration/etc).
This repo uses it in `kratos-auth/` to provide `/auth/*` pages.

### Hydra: OAuth2 / OpenID Connect tokens

Hydra is an OAuth2/OIDC server. It issues:

- `access_token` (API authorization)
- `refresh_token` (session renewal for clients)
- `id_token` (OIDC identity token)

Hydra does **not** “own” user passwords or identities. Instead, it delegates:

- **login UI** to a *login app*
- **consent UI** to a *consent app*

In this repo, the login/consent app is the Next.js service in `kratos-auth/`.

### Oathkeeper: “gatekeeper” reverse proxy for services

Oathkeeper sits in front of your services and evaluates each request using:

- **Authenticators** (who is calling?)
- **Authorizers** (is the caller allowed?)
- **Mutators** (how to pass identity to the upstream)

In this repo, Oathkeeper uses the `cookie_session` authenticator to validate an existing Kratos session cookie by
calling Kratos `GET /sessions/whoami` internally.

## How this repo is wired

### Local endpoints

- Next.js UI: `http://localhost:3000`
- Kratos public: `http://localhost:4433`
- Kratos admin: `http://localhost:4434`
- Hydra public (OIDC): `http://localhost:4444`
- Hydra admin: `http://localhost:4445`
- Oathkeeper proxy (gatekeeper): `http://localhost:4455`
- Oathkeeper API: `http://localhost:4456`
- MailSlurper UI: `http://localhost:4436`

### Key configuration and integration points

- Kratos config: `docker/config/kratos.yml`
- Identity schema: `docker/config/identity.schema.json`
- Hydra config: `docker/config/hydra.yml`
- Oathkeeper config: `docker/config/oathkeeper.yml`
- Oathkeeper access rules: `docker/config/rules.json`
- Hydra login/consent/logout handlers (Next.js):
  - `kratos-auth/app/hydra/login/route.ts`
  - `kratos-auth/app/hydra/consent/route.ts`
  - `kratos-auth/app/hydra/logout/route.ts`

### What “Gatekeeper” means here

This repo uses “gatekeeper” as a *pattern*:

- user logs in once (Kratos session cookie)
- Oathkeeper validates that session for each request
- Oathkeeper forwards the request to protected upstream services
- upstream services receive identity context via headers

This is great for “internal tools behind SSO” and quick local setups.

## Workflows

### Workflow 1: Browser login (Kratos session cookie)

Goal: the browser has a Kratos session cookie that represents the logged-in identity.

1. User opens a Kratos flow page in the Next.js UI:
   - `http://localhost:3000/auth/login`
   - `http://localhost:3000/auth/registration`
   - `http://localhost:3000/auth/settings`
2. The UI creates/fetches the corresponding Kratos self-service flow.
3. The user submits the form.
4. Kratos sets a session cookie for the browser.

Verification (human-friendly):

- Visit `http://localhost:3000/auth/settings` and confirm you’re authenticated.

Verification (API-level idea):

- The session cookie should make `GET http://localhost:4433/sessions/whoami` return an identity.

### Workflow 2: SSO “gatekeeper” to upstream services (Oathkeeper + Kratos)

Goal: you can access multiple upstream services through Oathkeeper after logging in once.

In this repo:

- Protected service 1 is available at `http://localhost:4455/svc1`
- Protected service 2 is available at `http://localhost:4455/svc2`

What happens on each request to `/svc1` or `/svc2`:

1. Browser calls Oathkeeper (`:4455`).
2. Oathkeeper uses `cookie_session` to check the Kratos session cookie:
   - `check_session_url: http://kratos:4433/sessions/whoami`
3. If not authenticated, Oathkeeper redirects to:
   - `http://localhost:3000/auth/login?return_to=<original-url>`
4. If authenticated, Oathkeeper forwards to the upstream and injects headers such as:
   - `x-user-id`
   - `x-user-email`

Why this is useful:

- You can put *many* internal services behind a single auth “front door”.
- Your upstream services do not need to know how to talk to Kratos; they just trust Oathkeeper’s headers (inside
  a trusted network boundary).

### Workflow 3: OAuth2/OIDC login & tokens (Hydra + Kratos)

Goal: a client (SPA/mobile/3rd-party) gets OAuth2/OIDC tokens from Hydra, while actual user authentication is done
via Kratos.

Hydra redirects to the Next.js “login app” and “consent app”:

- Login: `http://localhost:3000/hydra/login`
- Consent: `http://localhost:3000/hydra/consent`
- Logout: `http://localhost:3000/hydra/logout`

How login works (high-level):

1. Client starts an OAuth2/OIDC flow against Hydra (e.g., Authorization Code + PKCE).
2. Hydra redirects the browser to `/hydra/login?login_challenge=...`.
3. The Next.js handler checks for an existing Kratos session:
   - If missing, it redirects to `/auth/login` and sets `return_to` back to the Hydra login URL.
   - If present, it accepts the Hydra login request using the Kratos identity ID as the subject.
4. Hydra redirects to consent; the consent handler:
   - re-checks the Kratos session
   - reads requested scopes
   - accepts consent and can embed claims (subject, email, name) based on Kratos traits
5. Hydra completes the OAuth2/OIDC flow and issues tokens to the client.

When to use this workflow:

- You need standardized delegated authorization (scopes, audiences, third-party clients).
- You want API calls authenticated by `Authorization: Bearer <token>` rather than browser cookies.

How this relates to Oathkeeper:

- Oathkeeper can protect APIs by validating Bearer tokens (commonly via Hydra introspection, depending on your
  token strategy). This repo currently demonstrates “cookie session gatekeeper”; you can extend it with a second
  authenticator chain for APIs.

## Example end-to-end test workflow (local)

This section is a “smoke test” you can run to confirm the whole stack works, using **complete URLs** and a mix of
browser + CLI checks.

### 0) Start everything

Terminal A (containers):

```bash
docker compose -f docker/docker-compose.yml up -d
```

Terminal B (Next.js UI):

```bash
cd kratos-auth
corepack enable
yarn install
yarn dev
```

### 1) Verify the UIs and APIs are reachable

Open these in your browser:

- Next.js UI: `http://localhost:3000`
- Kratos public: `http://localhost:4433/health/ready`
- Hydra public: `http://127.0.0.1:4444/health/ready`
- Oathkeeper proxy: `http://localhost:4455`
- MailSlurper: `http://localhost:4436`

Hydra OIDC discovery (browser or curl):

- `http://127.0.0.1:4444/.well-known/openid-configuration`
- `http://127.0.0.1:4444/.well-known/jwks.json`

### 2) Create an identity and log in (Kratos + Elements)

1. Open registration: `http://localhost:3000/auth/registration`
2. Register a user (use a real-looking email; check MailSlurper if verification is enabled).
3. Log in: `http://localhost:3000/auth/login`
4. Confirm settings page works (proves session cookie is present):
   - `http://localhost:3000/auth/settings`

Optional API-level confirmation (Kratos whoami):

```bash
curl -sS -i http://localhost:4433/sessions/whoami
```

Note: without cookies, this should be unauthorized; the browser session is the “truth” for this workflow.

### 3) Test the “gatekeeper” SSO to upstream services (Oathkeeper + Kratos)

These routes are protected by Oathkeeper rules in `docker/config/rules.json`:

- Service 1: `http://localhost:4455/svc1`
- Service 2: `http://localhost:4455/svc2`

Test:

1. In a fresh/incognito window, open `http://localhost:4455/svc1`
   - Expected: redirect to `http://localhost:3000/auth/login?return_to=...`
2. Log in once.
3. Open both:
   - `http://localhost:4455/svc1`
   - `http://localhost:4455/svc2`
   - Expected: both succeed without re-login.

What to look for:

- The upstream response should include headers injected by Oathkeeper (configured in `docker/config/oathkeeper.yml`),
  such as `x-user-id` and `x-user-email` (the demo `traefik/whoami` service prints request details).

### 4) Test Hydra OAuth2/OIDC (login + consent + token issuance)

This verifies the Hydra ↔ Next.js login/consent integration (which itself depends on the Kratos browser session).

#### 4.1) Start a simple local callback endpoint

In Terminal C, run a “good enough” callback receiver:

```bash
python3 -m http.server 5555
```

Your redirect/callback URL will be:

- `http://127.0.0.1:5555/callback`

#### 4.2) Create an OAuth2 client in Hydra

Create a confidential client that can use the code flow and redirect to your local callback:

```bash
docker compose -f docker/docker-compose.yml exec -T hydra \
  hydra create oauth2-client \
  --endpoint http://127.0.0.1:4445 \
  --id example-client \
  --secret example-secret \
  --grant-type authorization_code \
  --grant-type refresh_token \
  --response-type code \
  --scope 'openid offline_access email profile' \
  --redirect-uri http://127.0.0.1:5555/callback
```

If your Hydra CLI does not support the command above, use the admin API directly:

```bash
curl -sS -X POST http://127.0.0.1:4445/admin/clients \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id":"example-client",
    "client_secret":"example-secret",
    "grant_types":["authorization_code","refresh_token"],
    "response_types":["code"],
    "scope":"openid offline_access email profile",
    "redirect_uris":["http://127.0.0.1:5555/callback"]
  }' | jq .
```

#### 4.3) Run an Authorization Code flow (in the browser)

Open this URL (single line) in your browser:

`http://127.0.0.1:4444/oauth2/auth?client_id=example-client&response_type=code&scope=openid%20email%20profile%20offline_access&state=state123&redirect_uri=http%3A%2F%2F127.0.0.1%3A5555%2Fcallback`

Expected behavior:

1. Hydra redirects to `http://127.0.0.1:3000/hydra/login?...`
2. If you are not logged in to Kratos, you get sent through:
   - `http://localhost:3000/auth/login?return_to=...`
3. After login, Hydra consent is accepted by:
   - `http://127.0.0.1:3000/hydra/consent?...`
4. Your browser ends up at:
   - `http://127.0.0.1:5555/callback?code=...&state=state123`

Copy the `code` from the browser URL.

#### 4.4) Exchange the code for tokens

```bash
CODE='PASTE_CODE_HERE'
curl -sS -u 'example-client:example-secret' \
  -d grant_type=authorization_code \
  -d redirect_uri='http://127.0.0.1:5555/callback' \
  -d code="$CODE" \
  http://127.0.0.1:4444/oauth2/token | jq .
```

You should see an `access_token` and (because we included `openid`) an `id_token`.

#### 4.5) Validate the tokens are valid (introspection + userinfo)

Hydra defaults to **opaque** access tokens in many setups. The most reliable validation method is introspection.
In this repo/config, introspection is exposed on Hydra's **admin port** (`4445`):

```bash
ACCESS_TOKEN='PASTE_ACCESS_TOKEN_HERE'
curl -sS -u 'example-client:example-secret' \
  -d token="$ACCESS_TOKEN" \
  http://127.0.0.1:4445/oauth2/introspect | jq .
```

Expected:

- `active: true`
- `scope` contains what you requested (e.g., `openid email profile offline_access`)

If you requested OIDC scopes, you can also call the OIDC UserInfo endpoint:

```bash
curl -sS \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://127.0.0.1:4444/userinfo | jq .
```

Expected: JSON claims for the subject (`sub`) and any allowed claims (e.g., `email`) depending on your consent logic.

#### 4.6) Validate the ID token keys (JWKS)

The keys used to validate OIDC tokens are published at:

- `http://127.0.0.1:4444/.well-known/jwks.json`

If you are using **JWT access tokens** (not the default in many configs), validate them the same way:

- Fetch signing keys from `http://127.0.0.1:4444/.well-known/jwks.json`
- Verify the JWT signature and check:
  - `exp` is in the future
  - `aud` matches your API audience (if you use audiences)
  - `scope`/claims match what you expect

### 5) (Optional) Prove Hydra admin is private

Hydra admin is on `http://127.0.0.1:4445` from your host, and also reachable inside the Docker network.
In real deployments, keep admin ports private (no public ingress).

## Adding a new protected service behind Oathkeeper

This is the common “gatekeeper” extension workflow.

1) Add a new service container in `docker/docker-compose.yml` on the `intranet` network.

2) Add an Oathkeeper rule in `docker/config/rules.json`:

- Match a path prefix (e.g., `/billing`)
- Use `cookie_session` (SSO) or a token-based authenticator (API)
- Set `upstream.url` to your container name + port (e.g., `http://billing:8080`)
- Optionally `strip_path` so the upstream doesn’t see the prefix

3) Restart Oathkeeper (or the whole stack):

- `docker compose -f docker/docker-compose.yml up -d`

4) Validate:

- unauthenticated access redirects to `/auth/login`
- authenticated access forwards upstream response
- upstream sees injected headers (if you configured the header mutator)

## Best practices (production checklist)

This repo is intentionally optimized for local development; treat it as a reference, not production-ready defaults.

### Security boundaries and endpoint exposure

- Do not expose admin APIs publicly:
  - Kratos admin (`:4434`)
  - Hydra admin (`:4445`)
  - Oathkeeper API (`:4456`)
- Put Kratos/Hydra/Oathkeeper behind TLS and correct hostnames in non-local environments.
- Ensure upstream services trust Oathkeeper only inside a private network (Kubernetes namespace/VPC/subnet).

### Cookies and browser security

- Set secure cookie attributes for non-local deployments:
  - `Secure: true`
  - `SameSite` aligned with your cross-domain needs
  - `HttpOnly` where appropriate
- Make sure your “public base URL” and CORS allow-lists match your real domains.
- Keep CSRF protection enabled for browser flows (especially if you embed auth UIs).

### Secrets and configuration hygiene

- Rotate all dev secrets (`cookie/cipher` secrets, client secrets, DB credentials).
- Store secrets in a secret manager (Kubernetes Secrets, Vault, AWS/GCP secrets).
- Use non-dev modes and appropriate logging levels in production.

### Authorization model consistency

Decide early how you model permissions:

- **Kratos traits/roles**: what the user “is” (e.g., `role=admin`).
- **Hydra scopes**: what the client is allowed to do (e.g., `read:invoices`).
- **Oathkeeper rules**: how requests are enforced at the edge (paths/methods/scopes).

Keep a single source of truth for role→scope mapping (typically in your login/consent app or an authorization
service), and keep Oathkeeper rules simple and explicit.

### Token strategy for APIs (opaque vs JWT)

- **Opaque tokens + introspection**:
  - Pros: easy revocation, central validation
  - Cons: introspection call on each request unless you cache
- **JWT access tokens**:
  - Pros: offline validation, no network hop per request
  - Cons: revocation harder, key rotation/claim design matters

Pick one strategy and align Hydra + Oathkeeper + upstream expectations.

### Observability

- Add request IDs and propagate them from Oathkeeper → upstream.
- Log authentication/authorization decisions at the edge (but avoid leaking sensitive token material).

## Troubleshooting

- **Oathkeeper always redirects to login**:
  - Confirm Kratos is running and reachable from Oathkeeper (`kratos:4433` on `intranet`).
  - Confirm your browser is actually sending the Kratos session cookie to `localhost:4455`.
  - Check Oathkeeper logs for `unauthorized` vs configuration errors.
- **Hydra flow loops between login/consent**:
  - Confirm the Next.js `/hydra/*` routes can read the Kratos session cookie.
  - Confirm `PUBLIC_BASE_URL` matches the URL you’re actually using (host + port).
- **CORS errors**:
  - Ensure Kratos CORS allow-lists include your UI origins (`http://localhost:3000` and/or `http://127.0.0.1:3000`).
- **No emails**:
  - Confirm `mailslurper` container is running and Kratos courier points to it.
  - Check `http://localhost:4436` for captured mail.

## Glossary

- **Identity**: the user record in Kratos (ID + traits).
- **Session**: a browser login state, commonly represented by a cookie.
- **OAuth2 Client**: an application registered in Hydra (SPA/mobile/backend).
- **Scopes**: string permissions requested by clients, approved by the user/consent app.
- **Gatekeeper**: a pattern where a proxy (Oathkeeper) centralizes auth for upstream services.
