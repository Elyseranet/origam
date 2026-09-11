# syntax=docker/dockerfile:1.7

# -----------------------------------------------------------------------------
# Marketing site image (Nuxt 4, SSR / Nitro node-server).
#
# Coolify builds this from the repo with:
#   - Build Pack       = Dockerfile
#   - Base Directory   = /            (build context = monorepo root)
#   - Dockerfile Loc.  = packages/marketing/Dockerfile
#   - Ports Exposes    = 3000
#
# The single image serves the marketing landing AND the embedded /docs
# (VitePress) + /stories (Histoire) static bundles (copied into public/ by
# `build:embeds`). One container = the whole origam.* site.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

# Native build deps (style-dictionary / sass / sharp / histoire).
RUN apk add --no-cache python3 make g++ libc6-compat

# Histoire's 200+ story build AND the Nuxt/Nitro marketing build (heavy: embeds
# + the TypeORM server bundle + SSR payload) need more heap than the default,
# which otherwise OOMs ("Reached heap limit") during the Nitro build.
ENV NODE_OPTIONS=--max-old-space-size=8192

# Enable pnpm via corepack (pinned to the repo's package manager).
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# --- Dependency layer: only invalidated when manifests / lockfile change. ---
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/ds/package.json packages/ds/package.json
COPY packages/docs/package.json packages/docs/package.json
COPY packages/stories/package.json packages/stories/package.json
COPY packages/tests/package.json packages/tests/package.json
COPY packages/marketing/package.json packages/marketing/package.json
COPY packages/figma-plugin/package.json packages/figma-plugin/package.json

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- Source: everything the marketing build (and its embeds) needs. ---
FROM deps AS source
COPY tsconfig*.json ./
COPY packages/ds packages/ds
COPY packages/docs packages/docs
COPY packages/stories packages/stories
COPY packages/marketing packages/marketing

# --- Tools stage: deps + source + tsx, WITHOUT the heavy lib/embeds/nuxt build.
#     Consumed by the docker-compose `migrate` service to run the TypeORM
#     migrations and the ingestion pipeline (db:migrate + docs:seed + docs:sync)
#     against the database. Cheap — it stops right after the source COPY. ---
FROM source AS tools

# --- Build stage: compile the lib, the embeds, and the Nuxt/Nitro app output.
FROM source AS build
# 1. Build the published lib (tokens + unbuild) — marketing imports `origam`.
RUN pnpm -F origam build
# 2. Build the embeds (Histoire stories + VitePress docs) into marketing/public.
RUN pnpm run build:embeds
# 3. Build the Nuxt app → packages/marketing/.output (self-contained server).
RUN pnpm -F @origam/marketing build

# -----------------------------------------------------------------------------
# Runtime stage — minimal Node image running the Nitro server.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime

LABEL org.opencontainers.image.source="https://github.com/arnaudprioul/origam"
LABEL org.opencontainers.image.title="origam-marketing"
LABEL org.opencontainers.image.description="Nuxt 4 marketing site for the origam design system (with embedded docs + stories)"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# `curl` is required by Coolify's healthcheck command (it prefers curl and
# the base alpine image ships neither curl nor a curl-compatible wget). Keep
# it minimal — only the curl package.
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV PORT=3000

# The Nuxt build output bundles the server, client and public/ assets.
COPY --from=build /app/packages/marketing/.output ./.output

EXPOSE 3000

# Hit the dedicated /api/health Nitro route on the IPv4 loopback (the server
# binds 0.0.0.0; using 127.0.0.1 avoids a localhost->IPv6 resolution miss).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
