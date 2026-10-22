/**
 * db.ts — TypeORM DataSource for the standalone ingestion pipeline (ticket B).
 *
 * Reuses the SAME DataSource factory as the Nitro runtime and the migration CLI
 * (server/db/data-source.ts), so the script, the API and the migrations all
 * agree on one source of truth. No credential is hardcoded — everything comes
 * from the environment (DATABASE_URL or the discrete DB_* vars). Run via `tsx`
 * (the entities are decorator classes); plain `node` is no longer supported.
 */

import { execSync } from 'node:child_process'

import type { DataSource } from 'typeorm'

import { createDataSource } from '../server/db/data-source'
import { REPO_ROOT } from './extract.mjs'

let ds: DataSource | null = null

/** Lazily create + initialize the shared DataSource for the pipeline. */
export async function getDb (): Promise<DataSource> {
    if (!ds) { ds = createDataSource(); await ds.initialize() }
    return ds
}

/** Tear down the connection pool (call once at the end of the script). */
export async function closeDb (): Promise<void> {
    if (ds) { await ds.destroy(); ds = null }
}

/** Short git sha of the DS source at run time (for doc_sync_run audit). */
export function sourceCommit (): string | null {
    try {
        return execSync('git rev-parse --short HEAD', { cwd: REPO_ROOT })
            .toString().trim()
    } catch {
        return null
    }
}
