/**
 * data-source.ts — the TypeORM DataSource factory for the API-Reference store.
 *
 * Single source of truth for entities + migrations + naming strategy, shared by
 * the Nitro runtime (server/utils/db.ts), the migration CLI
 * (data-source.cli.ts) and the ingestion pipeline (scripts/lib/db.ts).
 *
 * This module is import-safe: it only EXPORTS factories — it never builds a
 * DataSource at import time. That matters for the Nitro runtime, where the
 * health endpoint must load even when the database is unconfigured (it reports
 * `configured: false` instead of crashing). `resolveConnection` (which throws
 * when nothing is configured) is therefore only invoked lazily, by the caller.
 *
 * Connection options come from the environment via connection.mjs — no secret
 * is hardcoded. `synchronize` is always off; the schema is owned exclusively by
 * the versioned migrations. `SnakeNamingStrategy` keeps DB identifiers in
 * snake_case, matching both the entity property names and the migration DDL.
 *
 * ⚠️ `typeorm-naming-strategies@4.1.0` declares `peerDependencies.typeorm:
 * "^0.2.0 || ^0.3.0"` — unsatisfied by the `typeorm@1.1.1` this repo runs
 * (#559). pnpm installs it anyway (repo-wide `strict-peer-dependencies=false`
 * in .npmrc, unrelated to this pair — see its own comment there). Measured
 * compatible (#832), not merely assumed: `SnakeNamingStrategy` stays
 * `instanceof DefaultNamingStrategy`, its 8 methods used by this DataSource
 * return the expected values, and — the strongest check — `migration:generate`
 * against the 16 entities below produces a BYTE-IDENTICAL migration body with
 * `SnakeNamingStrategy` vs no naming strategy at all (`DefaultNamingStrategy`),
 * because every `@Entity()` here names its table explicitly and every column
 * is already snake_case. The dependency is pinned to the exact measured
 * version (`"4.1.0"`, no `^`) so a future minor bump — against an
 * already-mismatched peer range pnpm will not warn about — cannot change
 * behaviour silently. Re-run the measurement before bumping it.
 */

import 'reflect-metadata'

import { DataSource, type DataSourceOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import { resolveConnection } from './connection.mjs'
import { MIGRATIONS_TABLE } from './db.const.mjs'
import { ENTITIES } from './entities'
import { InitDocReference1719600000001 } from './migrations/1719600000001-InitDocReference'
import { AddDocMeta1782000000001 } from './migrations/1782000000001-AddDocMeta'
import { AddDocEntrySvgKeys1785400000001 } from './migrations/1785400000001-AddDocEntrySvgKeys'

/** Build the DataSource options from the environment (throws if unconfigured). */
export function buildDataSourceOptions (env: NodeJS.ProcessEnv = process.env): DataSourceOptions {
    return {
        type: 'postgres',
        ...resolveConnection(env),
        entities: ENTITIES,
        migrations: [InitDocReference1719600000001, AddDocMeta1782000000001, AddDocEntrySvgKeys1785400000001],
        migrationsTableName: MIGRATIONS_TABLE,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        logging: false,
    } as DataSourceOptions
}

/** Build (not yet initialized) a DataSource from the environment. */
export function createDataSource (env: NodeJS.ProcessEnv = process.env): DataSource {
    return new DataSource(buildDataSourceOptions(env))
}
