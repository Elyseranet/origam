/**
 * GET /api/admin/reference/sync/runs
 *
 * Returns the list of doc_sync_run rows, most recent first.
 *
 * Query params:
 *   limit  (optional, default 20, max 100)  — how many rows to return
 *
 * Returns: DocSyncRun[]
 */

import { DocSyncRun } from '../../../../db/entities'

import { useDb } from '../../../../../src/utils/db.util'
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const limitRaw = typeof query.limit === 'string' ? parseInt(query.limit, 10) : 20
    const limit = Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(limitRaw, 100)
        : 20

    const db = await useDb()

    const runs = await db
        .getRepository(DocSyncRun)
        .createQueryBuilder('r')
        .orderBy('r.started_at', 'DESC')
        .limit(limit)
        .getMany()

    return runs
})
