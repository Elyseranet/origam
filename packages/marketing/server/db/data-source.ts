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
