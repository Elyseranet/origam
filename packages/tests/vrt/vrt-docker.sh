#!/usr/bin/env bash
set -euo pipefail

# Runs the VRT suite inside the pinned Playwright Docker image, matching the
# environment the CI `vrt` job uses (.github/workflows/ci.yml). See VRT.md
# for why this indirection exists: screenshots are platform-sensitive
# (fonts, anti-aliasing) and are only trustworthy when compared inside the
# same OS + fontconfig they were captured in. Never trust a native macOS/
# Windows run of this suite as a verdict — only this script, or CI, count.
#
# Usage (from repo root, via `pnpm -F @origam/tests`):
#   pnpm test:vrt:docker          # compare against committed baselines
#   pnpm test:vrt:docker:update   # (re)generate baselines after a WANTED
#                                  # visual change — review the diff, then
#                                  # commit the updated *-linux.png files
#
# Mode is also selectable positionally: `bash vrt/vrt-docker.sh test|update`.

MODE="${1:-test}"
case "$MODE" in
    test|update) ;;
    *)
        echo "Usage: $0 [test|update]" >&2
        exit 1
        ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Pinned to the exact INSTALLED @playwright/test version (not the semver
# range in package.json — "^1.48.0" would silently drift from whatever
# actually got installed). Resolved via Node's module resolution from
# inside packages/tests so pnpm's workspace symlinks are honoured. Keeping
# the image version in lockstep with the installed package is what makes
# "generated via this script" and "compared in CI" the same environment —
# bump both together, never independently.
PLAYWRIGHT_VERSION="$(cd "$REPO_ROOT/packages/tests" && node -p "require('@playwright/test/package.json').version" 2>/dev/null || echo "")"
if [ -z "$PLAYWRIGHT_VERSION" ]; then
    echo "Could not resolve the installed @playwright/test version — run 'pnpm install' first." >&2
    exit 1
fi
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"

echo "== VRT (Docker) =========================================="
echo "Mode  : $MODE"
echo "Image : $IMAGE"
echo "==========================================================="

# Anonymous volumes shadow every node_modules directory in the workspace so
# the container gets its OWN Linux-native install (esbuild, sass, etc. ship
# platform-specific binaries) without ever touching — or being polluted by
# — the host's macOS node_modules. A named volume caches the pnpm store
# across runs so repeat invocations don't re-download the registry.
# (Plain `while read` instead of `mapfile` — macOS still ships bash 3.2,
# which has no `mapfile` builtin; this loop works on both bash 3.2+ and
# any modern bash a contributor might have via Homebrew.)
VOLUME_ARGS=(-v "$REPO_ROOT:/work" -v "origam-vrt-pnpm-store:/pnpm-store")
while IFS= read -r dir; do
    VOLUME_ARGS+=(-v "/work/$dir")
done < <(cd "$REPO_ROOT" && find . -maxdepth 3 -type d -name node_modules -not -path '*/node_modules/*' | sed 's#^\./##')

CONTAINER_CMD='
set -euo pipefail
corepack enable
export PNPM_HOME=/pnpm-home
export PATH="$PNPM_HOME:$PATH"
pnpm config set store-dir /pnpm-store
pnpm install --frozen-lockfile
pnpm -F origam tokens:build
pnpm -F @origam/stories build
'

if [ "$MODE" = "update" ]; then
    CONTAINER_CMD+='pnpm -F @origam/tests exec playwright test --config=playwright.vrt.config.ts --update-snapshots'
else
    CONTAINER_CMD+='pnpm -F @origam/tests exec playwright test --config=playwright.vrt.config.ts'
fi

docker run --rm \
    -w /work \
    -e CI=1 \
    -e E2E_STATIC=1 \
    "${VOLUME_ARGS[@]}" \
    "$IMAGE" \
    bash -c "$CONTAINER_CMD"

echo "==========================================================="
echo "Done. Snapshot files (if any changed) live under:"
echo "  packages/tests/vrt/btn-variant.spec.ts-snapshots/*-linux.png"
echo "Review with 'git diff --stat' / open the PNGs before committing."
echo "==========================================================="
