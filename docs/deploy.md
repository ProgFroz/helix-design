# Deploying the Storybook

The Storybook of helix-design is a static site (`npm run build-storybook` → `storybook-static/`).
The `Dockerfile` in the repo root builds it with Node 22 and serves it with Caddy
(`deploy/Caddyfile`). It runs on Railway as one service.

## Railway service settings

Set these in the Railway dashboard (service → Settings):

| setting | value |
| --- | --- |
| Source | GitHub repo `ProgFroz/helix-design` |
| Root directory | `/` |
| Builder | Dockerfile |
| Dockerfile path | `Dockerfile` |
| Port | Railway injects `$PORT`; Caddy listens on it. Without `$PORT` the image falls back to `8080` (`EXPOSE 8080`). |
| Healthcheck path | `/` (returns 200) |
| Auto-deploy | on, from the branch `main` (GitHub repo trigger) |
| Environment variables | none required |
| Networking | generate a public domain |

No `railway.toml` or `railway.json` is used on purpose: the settings above live in the dashboard,
not in Config-as-Code.

## What the image does

- Stage 1 (`node:22-alpine`): `npm ci`, then `npm run build-storybook`. Only `.storybook/`,
  `stories/`, `src/` and `dist/` are copied into the build.
- Stage 2 (`caddy:2-alpine`): serves `storybook-static/` from `/srv` as a non-root user, with
  zstd/gzip compression. Hashed files under `/assets/` are cached as immutable; `index.html`,
  `iframe.html`, `index.json` and `project.json` are sent with `Cache-Control: no-cache`.
- A Docker `HEALTHCHECK` requests `http://127.0.0.1:${PORT:-8080}/`.

## Build and run locally

```sh
docker build -t helix-design-storybook .
docker run --rm -p 8080:8080 helix-design-storybook        # http://localhost:8080/
docker run --rm -e PORT=9000 -p 9000:9000 helix-design-storybook
```

Without Docker, serve a local build with the same Caddyfile:

```sh
npm ci
npm run build-storybook
PORT=8080 SITE_ROOT="$PWD/storybook-static" caddy run --config deploy/Caddyfile --adapter caddyfile
```
