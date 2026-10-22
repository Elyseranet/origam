/**
 * DELETE /api/admin/reference/:kind/:slug/relations/:id
 *
 * Soft-deletes a relation by setting orphaned_at to now(). The record is
 * kept in the database so a subsequent re-sync can restore it if it comes back
 * in the DS source. The public GET /api/reference/** already filters
 * `orphaned_at IS NULL` so the relation disappears from the public API.
 *
 * Returns 204 No Content on success.
 */

import { DocEntry, DocRelation } from '../../../../../../db/entities'

import { useDb } from '../../../../../../../src/utils/db.util'
import { assertKind, assertSlug } from '../../../../../../../src/utils/reference-validation.util'
export default defineEventHandler(async (event) => {
    const kind = getRouterParam(event, 'kind') ?? ''
    const slug = getRouterParam(event, 'slug') ?? ''
    const id = getRouterParam(event, 'id') ?? ''
    assertKind(kind)
    assertSlug(slug)

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid relation id (expected UUID)' })
    }

    const db = await useDb()

    const entry = await db.getRepository(DocEntry)
        .createQueryBuilder('e')
        .where('e.kind = :kind AND e.slug = :slug', { kind, slug })
        .getOne()

    if (!entry) {
        throw createError({ statusCode: 404, statusMessage: `${kind} '${slug}' not found` })
    }

    const relRepo = db.getRepository(DocRelation)
    const relation = await relRepo.findOneBy({ id })

    if (!relation || relation.entry_id !== entry.id) {
        throw createError({ statusCode: 404, statusMessage: `Relation '${id}' not found for ${kind}/${slug}` })
    }

    await relRepo.update({ id }, { orphaned_at: new Date() })
    sendNoContent(event, 204)
})
