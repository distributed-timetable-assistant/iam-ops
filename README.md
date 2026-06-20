# iam-ops

Kubernetes manifests for the IAM stack used in this environment.

This repo now contains Kustomize bases plus `overlays/stage` for each app in the stack:

- `gatekeeper`
- `hydra-db`
- `hydra`
- `kratos`
- `kratos-auth`
- `mailslurper`
- `oauth2-proxy`
- `whoami-svc1`
- `whoami-svc2`

## Layout

Each app follows the same pattern:

- `base/`: the raw Kubernetes resources
- `overlays/stage/`: the stage overlay, which points back to `../../base` and sets `namespace: iam`

Example:

```text
kratos/
  base/
  overlays/
    stage/
```

## What This Deploys

- `kratos`: Ory Kratos public/admin APIs plus config, PVC, ingress, and certificate
- `hydra`: Ory Hydra public/admin APIs plus config, deployment, ingress, and certificate
- `hydra-db`: PostgreSQL backing store for Hydra
- `kratos-auth`: the IAM UI entrypoint
- `mailslurper`: SMTP test inbox for Kratos courier mail
- `oauth2-proxy`: two isolated OIDC gatekeepers, one for `/svc1` and one for `/svc2`
- `gatekeeper`: shared TLS certificate for the `login.outi.ir` host
- `whoami-svc1` and `whoami-svc2`: demo upstream services with separate auth boundaries

## Prerequisites

- `kubectl`
- A Kubernetes cluster with the `nginx` ingress class
- cert-manager with a `ClusterIssuer` named `letsencrypt` if you want to apply the certificate resources
- A namespace named `iam`
- The required secrets in that namespace:
  - `hydra-db`
  - `hydra`
  - `kratos`
  - `oauth2-proxy-svc1`
  - `oauth2-proxy-svc2`

Kratos is strict about its cipher secret: `secrets.cipher.0` must be a raw string no longer than 32 characters. If you generated a 32-byte key and base64-encoded it, the resulting 44-character value will be rejected and Kratos will crash on startup.

## Deploy

Apply the stage overlays from the repo root:

```bash
kubectl apply -k gatekeeper/overlays/stage
kubectl apply -k hydra-db/overlays/stage
kubectl apply -k hydra/overlays/stage
kubectl apply -k kratos/overlays/stage
kubectl apply -k kratos-auth/overlays/stage
kubectl apply -k mailslurper/overlays/stage
kubectl apply -k oauth2-proxy/overlays/stage
kubectl apply -k whoami-svc1/overlays/stage
kubectl apply -k whoami-svc2/overlays/stage
```

The GitHub Actions workflow follows the same pattern and applies `*/overlays/stage` on pushes to `main`.

## Image Expectations

- `kratos-auth/base/deployment.yaml` expects an image named `ghcr.io/distributed-timetable-assistant/kratos-auth:latest`
- `kratos-auth/base/kustomization.yaml` generates a ConfigMap from `kratos-auth/base/public/*.svg` and mounts it at `/app/public`
- The other workloads use published upstream images such as `oryd/kratos`, `oryd/hydra`, `quay.io/oauth2-proxy/oauth2-proxy`, and `oryd/mailslurper`

If you change the `kratos-auth` image name or registry, update the deployment manifest accordingly.

## Authentication Scope

- `whoami-svc1` and `whoami-svc2` now use separate `oauth2-proxy` instances.
- Each proxy has its own cookie, OIDC client credentials, and callback path.
- A browser session established for `/svc1` does not automatically authorize `/svc2`.
- Kratos still handles the user identity session, while Hydra still issues the OIDC authorization result that each proxy exchanges for its own session.

## GHCR Pull Access

`kratos-auth` uses a GHCR image, so the `iam` namespace needs a pull secret named `ghcr-credentials`.

Example:

```bash
kubectl -n iam create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN_WITH_read:packages \
  --docker-email=YOUR_EMAIL
```

If you make the package public in GHCR, you can remove `imagePullSecrets` from the deployment.

## Hostnames

The manifests currently reference these example hostnames:

- `iam.st.dita.hasankarimi.ir`
- `kratos.st.dita.hasankarimi.ir`
- `hydra.st.dita.hasankarimi.ir`
- `gatekeeper.st.dita.hasankarimi.ir`
- `mail.st.dita.hasankarimi.ir`

If your cluster uses different DNS names, update the ingress and certificate manifests in the corresponding `base/` folders.

## Notes

- This repo no longer contains the old docker-compose/local-dev setup.
- The `kubernetes/` wrapper directory was flattened into top-level app folders to match the `dita-ops` layout style.
- Validation: `kubectl kustomize <app>/overlays/stage` works for every app in the repo.
