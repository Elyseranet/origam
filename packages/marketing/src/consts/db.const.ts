/**
 * db.const.ts — single source of truth for the API-Reference database layer.
 *
 * Shared verbatim by THREE consumers so no magic string drifts between them:
 *   1. the TypeORM migrations         (server/db/migrations/*.ts)
 *   2. the standalone ingestion script (scripts/generate-api-docs.mjs)
 *   3. the Nitro server runtime        (src/utils/*.util.ts, server/api/**)
 *
 * Plain values only (no enum, no decorator): the ingestion scripts import this
 * file with Node's native type stripping, outside the Nuxt/TS build.
 */

/** The 8 entity families documented by the API Reference (doc_entry.kind). */
export const DOC_KINDS = Object.freeze([
    'component',
    'composable',
    'const',
    'directive',
    'enum',
    'interface',
    'type',
    'util',
])

/**
 * Folder under src/consts/<dir>/ holding the legacy `_DOC` files, per kind.
 * Used by the first seed (ticket B) to read the curated prose without loss.
 */
export const DOC_KIND_DIRS = Object.freeze({
    component: 'components',
    composable: 'composables',
    const: 'consts',
    directive: 'directives',
    enum: 'enums',
    interface: 'interfaces',
    type: 'types',
    util: 'utils',
})

/** Edge types of the documentation graph (doc_relation.rel_type). */
export const REL_TYPES = Object.freeze([
    'used_by',
    'related',
    'family',
    'extends',
])

/** Sync-run outcome (doc_sync_run.status). */
export const SYNC_STATUSES = Object.freeze([
    'running',
    'success',
    'failed',
])

/** Physical table names — referenced by migrations, ingestion and the API. */
export const DB_TABLES = Object.freeze({
    DOC_ENTRY: 'doc_entry',
    DOC_PROP: 'doc_prop',
    DOC_VALUE: 'doc_value',
    DOC_PARAM: 'doc_param',
    DOC_RETURN: 'doc_return',
    DOC_EMIT: 'doc_emit',
    DOC_SLOT: 'doc_slot',
    DOC_EXAMPLE: 'doc_example',
    DOC_DIRECTIVE_ARG: 'doc_directive_arg',
    DOC_DIRECTIVE_MODIFIER: 'doc_directive_modifier',
    DOC_RELATION: 'doc_relation',
    DOC_CATEGORY: 'doc_category',
    DOC_SYNC_RUN: 'doc_sync_run',
    DOC_META: 'doc_meta',
    THEME: 'theme',
})

/**
 * Keys stored in the doc_meta key/value table.
 * `SEED_FIXTURE_HASH` gates the boot-time fixture sync: when the hash of the
 * bundled server/db/seed/*.json matches the last-applied value, the bootstrap
 * plugin takes the fast path and skips the idempotent upsert entirely.
 */
export const DOC_META_KEYS = Object.freeze({
    SEED_FIXTURE_HASH: 'seed_fixture_hash',
})

/** TypeORM migrations bookkeeping table. */
export const MIGRATIONS_TABLE = 'doc_typeorm_migrations'

/**
 * Environment variable names that configure the database connection.
 * NEVER hardcode a credential — every value comes from the environment.
 * Convention Nuxt `runtimeConfig` : les variables sont préfixées `NUXT_`
 * (NUXT_DB_HOST → runtimeConfig.db.host, …), identique aux autres projets.
 * Le set discret `NUXT_DB_*` est la forme primaire ; `DATABASE_URL` reste
 * accepté comme override canonique optionnel (pratique en local / docker).
 */
export const DB_ENV = Object.freeze({
    URL: 'DATABASE_URL',
    HOST: 'NUXT_DB_HOST',
    PORT: 'NUXT_DB_PORT',
    USER: 'NUXT_DB_USER',
    PASSWORD: 'NUXT_DB_PASSWORD',
    NAME: 'NUXT_DB_NAME',
    SSL: 'NUXT_DB_SSL',
})

/** Default discrete-mode values (host/port only — never a credential). */
export const DB_DEFAULTS = Object.freeze({
    PORT: 5432,
})
