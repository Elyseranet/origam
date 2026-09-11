# origam — Docker images

This folder ships two production images that serve the static surfaces
of the design system:

| Image | Content | Local port |
|---|---|---|
| `ghcr.io/arnaudprioul/origam-docs` | VitePress documentation site (`docs/.vitepress/dist`) | `8080` |
| `ghcr.io/arnaudprioul/origam-stories` | Histoire component stories (`dist/stories`) | `8081` |

Both images are multi-stage `node:22-alpine` builds finalised on
`nginx:1.27-alpine`, with gzip, long-lived cache for hashed assets,
no-cache on `index.html`, an SPA fallback, and a `/healthz` endpoint
used by the container's `HEALTHCHECK`.

## Local — build & run

From the repository root:

```bash
# Build a single image
docker build -t origam-docs    -f docker/Dockerfile.docs    .
docker build -t origam-stories -f docker/Dockerfile.stories .

# Run a single image
docker run --rm -p 8080:80 origam-docs
docker run --rm -p 8081:80 origam-stories
```

Or via `docker compose`:

```bash
docker compose -f docker/docker-compose.yml up --build
# → docs    on http://localhost:8080
# → stories on http://localhost:8081
```

The compose file declares the same image tags published to GHCR, so
`docker compose pull` works without re-building once the registry
contains an image.

## Pull from GHCR (no build)

The release pipeline (`.github/workflows/docker.yml`) publishes
`latest` on every push to `main` and both `vX.Y.Z` and bare `X.Y.Z`
tags for each Git tag.

**Default visibility: PRIVATE.** GHCR keeps newly-pushed packages
private until you explicitly flip them to Public in the package
settings. Pulling a private image requires authentication.

### Authenticating to GHCR (one-time per machine)

```bash
# Generate a classic Personal Access Token at:
#   https://github.com/settings/tokens/new
# Scope required: read:packages (write:packages too if you push locally)

echo $GHCR_PAT | docker login ghcr.io -u arnaudprioul --password-stdin
```

### Pulling

```bash
docker pull ghcr.io/arnaudprioul/origam-docs:latest
docker pull ghcr.io/arnaudprioul/origam-stories:latest

# Or a specific release (both tag styles work — pick one and stick with it)
docker pull ghcr.io/arnaudprioul/origam-docs:v2.2.1
docker pull ghcr.io/arnaudprioul/origam-docs:2.2.1
```

Both images are published for `linux/amd64` and `linux/arm64`, so they
run natively on Apple Silicon and on standard cloud x86 hosts.

### GHCR storage quotas (private packages, free tier)

| GitHub plan | Private storage | Monthly transfer |
|---|---|---|
| Free | 500 MB | 1 GB |
| Pro | 2 GB | 10 GB |
| Team | 2 GB | 10 GB |

A typical origam image weighs ~50–80 MB. The Free tier comfortably
hosts 5–10 tagged versions; older tags get garbage-collected
automatically or you can purge them manually under
**Settings → Packages → origam-docs → Manage versions**.

## Deploy

Any platform that runs an OCI image works. A few one-liners:

### Coolify / Dokploy / CapRover

Point the service at the GHCR image, expose port `80`, set the
healthcheck to `GET /healthz`. No build context needed.

### Render / Railway / Fly.io

```bash
# Render: declare the image in the Web Service config
image:
  url: ghcr.io/arnaudprioul/origam-docs:latest
healthCheckPath: /healthz
```

### Caddy reverse proxy (single host)

```caddyfile
docs.origam.dev {
    reverse_proxy localhost:8080
}
stories.origam.dev {
    reverse_proxy localhost:8081
}
```

### Plain `docker run` on a VPS

```bash
docker run -d --name origam-docs --restart unless-stopped \
    -p 8080:80 ghcr.io/arnaudprioul/origam-docs:latest

docker run -d --name origam-stories --restart unless-stopped \
    -p 8081:80 ghcr.io/arnaudprioul/origam-stories:latest
```

## Notes

- The images do **not** run a Node process; they only serve the pre-built
  static assets through nginx. The build stage runs `npm ci
  --legacy-peer-deps` (required while `histoire@1.0.0-beta.1` pins
  Vite 6 peer) and `npm run tokens:build` before delegating to
  `docs:build` / `story:build`.
- For local development with hot-reload, run `npm run docs:dev` or
  `npm run story:dev` on the host — the compose file is for previewing
  the *built* artefact, not for editing.
- Image size is roughly **45 MB** (nginx + static bundle); the build
  stage is discarded.
