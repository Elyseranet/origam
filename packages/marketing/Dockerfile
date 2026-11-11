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
# The image serves the marketing site only. The embedded /docs (VitePress)
# and /stories (Histoire) bundles were removed with packages/docs and
# packages/stories on 2026-11-11.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

# Native build deps (sass / sharp).
RUN apk add --no-cache python3 make g++ libc6-compat

# The Nuxt/Nitro marketing build (heavy: the TypeORM server bundle + SSR
# payload) needs more heap than the default,
# which otherwise OOMs ("Reached heap limit") during the Nitro build.
ENV NODE_OPTIONS=--max-old-space-size=8192

# Enable pnpm via corepack (pinned to the repo's package manager).
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# --- Dependency layer: only invalidated when manifests / lockfile change. ---
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/ds/package.json packages/ds/package.json
COPY packages/tests/package.json packages/tests/package.json
COPY packages/marketing/package.json packages/marketing/package.json
# marketing hosts @origam/playground: prop-group classification (#1141), the
# engine and its committed catalogue (#1145).
COPY packages/playground/package.json packages/playground/package.json
# `pnpm.patchedDependencies` (root package.json, #1065) reads this directory
# during install. Without it the image failed at `pnpm install
# --frozen-lockfile` — ENOENT `patches/@nuxt__devtools@3.4.2.patch`,
# measured while verifying #1145.
COPY patches ./patches

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- Source: everything the marketing build needs. ---
FROM deps AS source
COPY tsconfig*.json ./
COPY packages/ds packages/ds
COPY packages/marketing packages/marketing
COPY packages/playground packages/playground

# The root tsconfig.json declares project `references` to
# packages/tests/{TU,e2e}/tsconfig.json. Those two files must exist here even
# though no test runs during the image build: the Vue transform resolves the
# tsconfig chain for every .vue file, and a reference pointing at a missing
# file aborts the whole build with
#   [TSCONFIG_ERROR] Failed to load tsconfig for 'src/pages/...': Tsconfig not found
#
# It surfaced with the Vite 8 / rolldown upgrade — the oxc transform resolves
# references strictly, where esbuild used to ignore a broken one. Nothing in
# the app changed, which is why it reads as a mystery: the marketing build
# passed locally (packages/tests is on disk) and failed only in the image.
#
# Only the tsconfigs are copied, not the specs: the build needs the references
# to RESOLVE, not the tests to exist.
COPY packages/tests/TU/tsconfig.json packages/tests/TU/tsconfig.json
COPY packages/tests/e2e/tsconfig.json packages/tests/e2e/tsconfig.json

# --- Tools stage: deps + source + tsx, WITHOUT the heavy lib/nuxt build.
#     Consumed by the docker-compose `migrate` service to run the TypeORM
#     migrations and the ingestion pipeline (db:migrate + docs:seed + docs:sync)
#     against the database. Cheap — it stops right after the source COPY. ---
FROM source AS tools

# --- Build stage: compile the lib and the Nuxt/Nitro app output.
FROM source AS build
# 1. Build the published lib (tokens + unbuild) — marketing imports `origam`.
RUN pnpm -F origam build
# 2. Generate `.nuxt/` (the `~` alias the SFC compiler resolves defineProps
#    types through). Outside Docker the package's `postinstall` does it; here
#    the install ran in `deps`, BEFORE the sources existed, so it never did —
#    measured while verifying #1145: 5 SFCs failed with « Failed to resolve
#    import source "~/interfaces/…" », on the parent commit too.
RUN pnpm -F @origam/marketing exec nuxt prepare
# 3. Build the Nuxt app → packages/marketing/.output (self-contained server).
RUN pnpm -F @origam/marketing build
# 4. TypeORM requires `pg` dynamically, which Nitro's tracer does not follow
#    (nitro.externals.traceInclude in nuxt.config.ts). Fail the image build —
#    not the first request — if it ever goes missing again (#1166).
RUN test -f packages/marketing/.output/server/node_modules/pg/package.json

# -----------------------------------------------------------------------------
# Runtime stage — minimal Node image running the Nitro server.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime

LABEL org.opencontainers.image.source="https://github.com/Elyseranet/origam"
LABEL org.opencontainers.image.title="origam-marketing"
LABEL org.opencontainers.image.description="Nuxt 4 marketing site for the origam design system"
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
