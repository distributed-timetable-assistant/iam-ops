# iam-ops (Kubernetes)

This folder rewrites the docker-compose setup into **Kustomize** manifests in the same style as `../dita-ops/*/base`.

## Prereqs

- An ingress controller named `nginx` (these ingresses set `spec.ingressClassName: nginx`)
- cert-manager with a `ClusterIssuer` named `letsencrypt` (only if you apply `certificate*.yml`)

## Apply

```bash
kubectl apply -k kubernetes
```

## Build/push `kratos-auth`

`kubernetes/kratos-auth/base/deployment.yml` expects an image `iam-ops/kratos-auth:latest`.

- Local build (adjust tag/registry):
  - `docker build -t iam-ops/kratos-auth:latest -f kratos-auth/Dockerfile kratos-auth`
  - `docker push iam-ops/kratos-auth:latest`

## Required Secrets (create before apply)

Create these secrets in the target namespace:

- `hydra-db` (Postgres env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)
- `hydra` (Hydra env: `DSN`, `SECRETS_SYSTEM`, `OIDC_SUBJECT_IDENTIFIERS_PAIRWISE_SALT`)
- `kratos` (Kratos env: `DSN`, `SECRETS_COOKIE`, `SECRETS_CIPHER`)
- `oauth2-proxy` (`OAUTH2_PROXY_CLIENT_ID`, `OAUTH2_PROXY_CLIENT_SECRET`, `OAUTH2_PROXY_COOKIE_SECRET`)

## Notes

- This setup replaces Oathkeeper “cookie_session gatekeeper” with `oauth2-proxy` + NGINX Ingress `auth_request`.
- You must create an OAuth2/OIDC client in Hydra for `oauth2-proxy` with redirect URL `https://gatekeeper.st.dita.hasankarimi.ir/oauth2/callback`.
- `whoami-svc1` and `whoami-svc2` are demo upstreams exposed through the `gatekeeper` ingress on `/svc1` and `/svc2`.
- Update hosts in `*/base/ingress*.yml` / `certificate*.yml` to match your domain.
