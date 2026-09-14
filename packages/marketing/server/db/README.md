# API-Reference database (ADR 0001 — Ticket A)

PostgreSQL schema backing the marketing API Reference. Accessed through
[TypeORM](https://typeorm.io/) (client `pg`, pure JS — no native binary).

> Entities are declared with TypeORM **decorator** classes (`@Entity` /
> `@Column`) in `.ts`. The migrations and the ingestion pipeline therefore run
> through [`tsx`](https://tsx.is/) (not plain `node`). Every `@Column` carries
> an **explicit `type`**, so the entities never depend on `emitDecoratorMetadata`
> (unsupported by esbuild/Nitro) — only `experimentalDecorators` is needed, which
> both `tsx` and Nitro's esbuild support. Property names are kept in snake_case
> (identical to the columns); `SnakeNamingStrategy` enforces the same mapping.

> At this stage the site still reads the static `app/consts/**.const.ts` files.
> Nothing is rebranched yet. This layer only provisions the database, the schema
> and the migration tooling. Ticket B fills it; ticket C reads from it.

## Layout

| File | Role |
|---|---|
| `db.const.mjs` | Single source of truth: table names, kinds, relation types, env var names. Shared by the migrations, the ingestion script (ticket B) and the Nitro runtime. |
| `connection.mjs` | Resolves the TypeORM pg connection options from the environment. No secret hardcoded. |
| `entities/*.entity.ts` | One TypeORM decorator entity per table (snake_case columns) + `base.entity.ts` (shared id / timestamps, imports `reflect-metadata`) + `index.ts` barrel (`ENTITIES`). |
| `data-source.ts` | Import-safe `DataSource` factory (entities + migrations + `SnakeNamingStrategy` + connection). Builds nothing at import time. |
| `data-source.cli.ts` | Eager `DataSource` instance — default export consumed by the TypeORM CLI (`-d`) ONLY. The runtime/pipeline never import it. |
| `migrations/*.ts` | Versioned TypeORM migrations (raw SQL via `queryRunner`, `up` + `down`). |
| `../utils/db.ts` | Nitro-side lazy DataSource singleton (`useDb`, `pingDb`, `isDbConfigured`). |

## Environment variables

No credential is ever hardcoded — every value is read from the environment.

### Database connection

Convention Nuxt `runtimeConfig` : les variables sont préfixées `NUXT_`.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NUXT_DB_HOST` | yes | — | Forme primaire (set discret `NUXT_DB_*`). |
| `NUXT_DB_PORT` | no | `5432` | |
| `NUXT_DB_NAME` | yes | — | |
| `NUXT_DB_USER` | yes | — | |
| `NUXT_DB_PASSWORD` | yes | — | |
| `NUXT_DB_SSL` | no | off | `true` → TLS accepting the provider's self-signed chain (managed PG). |
| `DATABASE_URL` | optional | — | Override canonique `postgres://user:pass@host:5432/db` ; prend le pas sur le set `NUXT_DB_*` (pratique local/CLI). |

### Admin backoffice auth (ticket E1)

| Variable | Required | Notes |
|---|---|---|
| `NUXT_ADMIN_PASSWORD_HASH` | yes (for backoffice) | Scrypt hash of the admin password in `<salt-hex>:<hash-hex>` format (see below). Read by `server/utils/admin-auth.ts`. |
| `NUXT_SESSION_PASSWORD` | yes (for backoffice) | Session seal secret — minimum 32 random characters. Read by h3 `useSession`. |

**Generating the password hash** (no external dep — plain Node.js):

```bash
node -e "
  const { scryptSync, randomBytes } = require('crypto')
  const s = randomBytes(16).toString('hex')
  console.log(s + ':' + scryptSync('YOUR_PASSWORD', s, 64).toString('hex'))
"
```

**Generating the session secret**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy these into a local `.env` (git-ignored) for development; in stage/prod
Coolify provisions a PostgreSQL service (port `Y432`) and injects `DATABASE_URL`.

## Commands

```bash
# Apply all pending migrations (up)
pnpm -F @origam/marketing db:migrate

# Revert the last applied migration (down) — see "Rollback" below
pnpm -F @origam/marketing db:rollback

# Report whether pending migrations exist
pnpm -F @origam/marketing db:migrate:status

# Scaffold a NEW migration from the current entity/DB diff (hand-edit after):
pnpm -F @origam/marketing db:migrate:make -- ./server/db/migrations/MyChange
```

> All four scripts run the TypeORM CLI through `tsx` with an EXPLICIT
> `--tsconfig ./tsconfig.typeorm.json`
> (`tsx --tsconfig ./tsconfig.typeorm.json ./node_modules/typeorm/cli.js … -d ./server/db/data-source.cli.ts`).
> That flag is **mandatory**: `tsx` resolves the tsconfig from the CWD, and the
> package `tsconfig.json` `extends ./.nuxt/tsconfig.json`, across which
> `tsx`/`get-tsconfig` drops `experimentalDecorators`. esbuild then emits
> standard (TC39) decorators, which crash TypeORM's legacy decorators
> (`Cannot read properties of undefined (reading 'constructor')` at the first
> `@PrimaryGeneratedColumn`). `tsconfig.typeorm.json` is a standalone config (no
> nuxt `extends`) that keeps `experimentalDecorators` on. The same flag is wired
> into the `docs:*` pipeline scripts. The Nuxt runtime bundle uses
> `nitro.esbuild.options.tsconfigRaw.experimentalDecorators` instead;
> `nuxt typecheck` uses the package `tsconfig.json`.
>
> The initial `InitDocReference` migration is **hand-written** (raw SQL) — do
> NOT regenerate it; `migration:generate` cannot express the functional unique
> indexes (`md5` / `coalesce`), CHECK constraints and the shared trigger.

## Schema (ADR §3)

One generic root table `doc_entry` (discriminated by `kind`) + normalised child
tables for the requestable collections, a relation graph, a category table, a
sync-audit table and a placeholder `theme` table.

- **Root**: `doc_entry` — `UNIQUE(kind, slug)`, `kind` constrained to the 8
  families, rich component-only blocks stored in `kind_extra jsonb`.
- **Collections** (FK `entry_id`, cascade, ordered by `position`): `doc_prop`,
  `doc_value`, `doc_param`, `doc_return`, `doc_emit`, `doc_slot`, `doc_example`,
  `doc_directive_arg`, `doc_directive_modifier`.
- **Graph**: `doc_relation` (`used_by` / `related` / `family` / `extends`).
- **Navigation**: `doc_category`.
- **Audit**: `doc_sync_run` (one row per ingestion/re-sync run).
- **Placeholder**: `theme` (macro only — not implemented in this scope).

### Editorial vs source boundary

Each table that carries editorial (`[ÉDIT]`) columns has a **row-level
editorial lock** (`edited_by_user` + `editorial_locked_at`). The re-sync
(ticket B) only ever writes source (`[SRC]`) columns and never touches a locked
row's editorial fields. Items removed from the DS source are flagged via
`orphaned_at`, never hard-deleted.

`created_at` / `updated_at` are present on every table; `updated_at` is kept
current automatically by the shared `doc_set_updated_at` trigger.

## Rollback

`db:rollback` reverts the most recent migration. The `down` of
`InitDocReference` drops every object it created — all tables (in FK-safe order:
children → root → standalone) and the shared `doc_set_updated_at` trigger
function. It is fully reversible: `db:rollback` followed by `db:migrate` returns
to an identical schema.

```bash
pnpm -F @origam/marketing db:rollback     # drops all doc_* / theme tables + trigger fn
pnpm -F @origam/marketing db:migrate       # recreate from scratch
```

> The rollback drops data. In stage/prod, snapshot the database (Coolify backup)
> before rolling back a migration that has live editorial content.

## Seed & re-sync pipeline (ticket B)

`scripts/generate-api-docs.mjs` was reoriented from writing per-slug `.const.ts`
files to UPSERTing into this database. It reuses the same libs
(`extract` / `merge` / `read-existing`) — no logic is duplicated.

```bash
# First load: ingest the 1758 curated app/consts/**.const.ts files (all 8
# families) into the DB without loss. Idempotent; respects the editorial lock.
pnpm -F @origam/marketing docs:seed

# Re-sync: re-extract STRUCTURAL [SRC] facts from packages/ds/src for all 8
# families and UPSERT only the [SRC] columns each family can honestly derive
# (see RESYNC_POLICY). Editorial fields are never touched. Run on every DS change.
pnpm -F @origam/marketing docs:sync

# One family at a time — the eight domain keys are: enums, interfaces, consts,
# utils, composables, types, directives, components.
pnpm -F @origam/marketing docs:sync -- --domain=components

# Dry-run drift gates (write nothing, exit 1 if the DB would change):
pnpm -F @origam/marketing docs:seed:check
pnpm -F @origam/marketing docs:sync:check

# Legacy file writer (kept until the pages are rebranched — ticket F):
pnpm -F @origam/marketing docs:generate
```

Properties:
- **Idempotent** — a second identical run reports `created=0 updated=0 orphaned=0`.
- **Non-destructive** — re-sync only writes `[SRC]`; re-seed never overwrites a
  row whose `edited_by_user` lock is set. Items removed from the source are
  flagged `orphaned_at`, never deleted.
- **Audited** — every run writes a `doc_sync_run` row (counts + git sha of the DS).
- **Faithful to source** — re-sync regenerates `[SRC]` from `packages/ds/src`
  exactly (same rule as `merge.mjs`). NOTE: enums the curated files truncated for
  display (e.g. `mdi-icons`, 31 listed vs 7297 in source) are expanded to the
  full source set by re-sync — a display/policy question for the API/UI layer,
  not a data error.
- **Per-family claims** — "[SRC]" was calibrated on the four original families
  and does NOT hold column for column on the four added later. Each family
  declares what it can derive in `RESYNC_POLICY` (`scripts/generate-api-docs.mjs`);
  anything omitted stays exactly as the catalogue has it. A directive's
  `signature` is hand-written usage forms, a type's `definition` carries a
  hand-added enum expansion, a component's `parent_slug` is an editorial
  grouping — none of the three is overwritten.
- **Dead entries** — families whose extractor enumerates the whole family
  (`components`, `types`, `directives`) also flag entries the design system no
  longer has, with `doc_entry.orphaned_at`. Soft-flag only; the row and its
  curated prose survive, and the flag clears by itself if the symbol returns.

`--domain=<kind>` restricts a seed (e.g. `--domain=component`);
`--domain=<dir>` restricts a re-sync (e.g. `--domain=enums`).

## Deploy-time auto-sync (bootstrap plugin)

`server/plugins/00.db-bootstrap.ts` keeps the live database in sync with the
committed fixtures **at every server boot** — so a new / changed DS component
flows to the API-Reference automatically on the next deploy, with **no manual
step** (no truncate, no re-seed). Editorial `/admin` edits (`edited_by_user`
lock) are always preserved.

Sequence under a Postgres advisory lock (serialises across instances,
NON-FATAL if the DB is down):

1. `runMigrations()` — applies any pending migration (creates `doc_meta` on
   first boot after this feature ships).
2. Compute a **content hash** of the bundled `server/db/seed/*.json`
   (`fixtureHash`, order-stable over `DOC_KINDS`).
3. **Fast path** — if the hash equals `doc_meta.seed_fixture_hash` (last
   applied), skip entirely. This is the normal boot: ~0 work.
4. Otherwise:
   - **empty DB** → bulk-load `server/assets/db-seed.sql` (fast first deploy);
   - **populated DB** → idempotent `syncFixtures` in one transaction: create new
     entries + children, refresh `[SRC]` columns, **leave locked `[ÉDIT]` rows
     untouched**, flag removed items `orphaned_at` (never delete). Records a
     `doc_sync_run` row.
   - store the new hash.

The sync loop (`syncFixtures`) lives in `server/utils/doc-fixture-sync.ts` and is
the **same** code path the standalone `docs:seed` script uses (the script's
fixture branch calls it too) — no duplication between tooling and runtime. The
ingestion reconciliation (`ingestFull`, editorial-lock aware) is imported from
`scripts/lib/db-upsert.ts`; esbuild bundles it (and the fixtures, via the
`assets:db-seed` nitro `serverAssets` mount) into `.output`.

Idempotent: a second boot with unchanged fixtures takes the fast path (0
writes). Self-healing: a DB already in prod without a stored hash triggers one
idempotent sync on the next boot (safe — `[ÉDIT]` locks are respected).

### Fixture regeneration (CI)

`.github/workflows/docs-fixtures.yml` regenerates the committed fixtures when
`packages/ds/**` changes on `develop`: spins up Postgres, runs
`db:migrate → docs:sync → docs:dump → docs:playgrounds`, then opens (or
refreshes) a **PR to `develop`** via `peter-evans/create-pull-request` with
`server/db/seed/*.json` + `server/assets/db-seed.sql`. `develop` is a protected
branch, so the flow is PR-only (default `GITHUB_TOKEN`, no bypass secret) and the
PR is merged by hand. `docs:playgrounds` runs last so `db-seed.sql` is
regenerated (pg_dump, filtered clean — no `\restrict` /
`set_config('search_path'` / `CREATE EXTENSION`) from the final DB state.
Merging the PR → deploy → the boot-time sync above applies the fixtures.

## Healthcheck

`GET /api/health` reports `{ status, db: { configured, ok } }`. When the DB is
**not** configured the endpoint stays `200 ok` (the site still runs on the
static const files). When it **is** configured but unreachable, it returns
`503 degraded` so orchestrators can gate readiness on the database.

## Build heap

`nuxt build` for this package is heavy (embeds + 1758 API-reference consts + the
TypeORM server bundle) and OOMs at Node's default heap
(`FATAL ERROR: Reached heap limit` during "Building Nuxt Nitro server"). Build
with `NODE_OPTIONS=--max-old-space-size=8192` (already set in the `Dockerfile`
build stage). Pre-existing constraint — not specific to the TypeORM migration.
