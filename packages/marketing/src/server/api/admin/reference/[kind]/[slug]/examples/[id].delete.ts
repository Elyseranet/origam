/**
 * DELETE /api/admin/reference/:kind/:slug/examples/:id
 *
 * Permanently deletes an example row. Verifies ownership (entry_id matches
 * the resolved entry for kind/slug) before deleting.
 *
 * Returns 204 No Content on success.
 */

import { DocEntry, DocExample } from '../../../../../../db/entities'

import { useDb } from '../../../../../../../utils/db.util'
import { assertKind, assertSlug } from '../../../../../../../utils/reference-validation.util'
export default defineEventHandler(async (event) => {
    const kind = getRouterParam(event, 'kind') ?? ''
    const slug = getRouterParam(event, 'slug') ?? ''
    const id = getRouterParam(event, 'id') ?? ''
    assertKind(kind)
    assertSlug(slug)

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid example id (expected UUID)' })
    }

    const db = await useDb()

    const entry = await db.getRepository(DocEntry)
        .createQueryBuilder('e')
        .where('e.kind = :kind AND e.slug = :slug', { kind, slug })
        .getOne()

    if (!entry) {
        throw createError({ statusCode: 404, statusMessage: `${kind} '${slug}' not found` })
    }

    const exampleRepo = db.getRepository(DocExample)
    const example = await exampleRepo.findOneBy({ id })

    if (!example || example.entry_id !== entry.id) {
        throw createError({ statusCode: 404, statusMessage: `Example '${id}' not found for ${kind}/${slug}` })
    }

    await exampleRepo.delete({ id })
    sendNoContent(event, 204)
})
