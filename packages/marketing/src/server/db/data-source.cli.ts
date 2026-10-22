/**
 * data-source.cli.ts — eager DataSource instance for the TypeORM CLI ONLY.
 *
 * The `typeorm` CLI (`migration:run`/`revert`/`show`/`generate`, invoked via
 * tsx in the `db:*` package scripts) requires the `-d` file to default-export a
 * DataSource INSTANCE. Building it eagerly here calls `resolveConnection`, which
 * throws when the database is unconfigured — acceptable, because the CLI is only
 * ever run with the connection env set.
 *
 * The Nitro runtime and the ingestion pipeline must NOT import this file: they
 * use the import-safe factory from data-source.ts and create the DataSource
 * lazily, so an unconfigured environment never crashes the server.
 */

import { createDataSource } from './data-source'

export default createDataSource()
