/**
 * PATCH /api/admin/reference/:kind/:slug/relations/:id
 *
 * Updates the editorial description fields of a relation edge.
 * The structural fields (relType, toKind, toSlug, toName, propName) are [SRC]
 * and rejected with 400.
 *
 * Body keys in **camelCase**: { descriptionKey?, descriptionFallback? }
 * Returns the updated relation in camelCase.
 */

import { DocEntry, DocRelation } from '../../../../../../db/entities'
import { RELATION_EDIT_MAP } from '../../../../../../../consts/admin-mappers.const'
import { toDbPayload, toCamelRelation } from '../../../../../../../utils/admin-mappers.util'

import { useDb } from '../../../../../../../utils/db.util'
import { assertKind, assertSlug } from '../../../../../../../utils/reference-validation.util'
export default defineEventHandler(async (event) => {
    const kind = getRouterParam(event, 'kind') ?? ''
    const slug = getRouterParam(event, 'slug') ?? ''
    const id = getRouterParam(event, 'id') ?? ''
    assertKind(kind)
    assertSlug(slug)

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid relation id (expected UUID)' })
    }

    const raw = await readBody(event)
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw createError({ statusCode: 400, statusMessage: 'Body must be a JSON object' })
    }
    const body = raw as Record<string, unknown>

    // Reject unknown keys
    const unknownKeys = Object.keys(body).filter(k => !RELATION_EDIT_MAP.has(k))
    if (unknownKeys.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown or non-editorial fields: ${unknownKeys.join(', ')}. Allowed (camelCase): ${[...RELATION_EDIT_MAP.keys()].join(', ')}`,
        })
    }

    // Validate field types
    for (const camel of RELATION_EDIT_MAP.keys()) {
        const v = body[camel]
        if (v !== undefined && v !== null && typeof v !== 'string') {
            throw createError({ statusCode: 400, statusMessage: `Field '${camel}' must be a string or null` })
        }
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

    // Convert camelCase → snake_case and merge with existing values
    const dbPayload = toDbPayload(body, RELATION_EDIT_MAP)

    await relRepo.update({ id }, {
        description_key: 'descriptionKey' in body
            ? (dbPayload.description_key as string | null)
            : relation.description_key,
        description_fallback: 'descriptionFallback' in body
            ? (dbPayload.description_fallback as string | null)
            : relation.description_fallback,
        edited_by_user: true,
        editorial_locked_at: relation.editorial_locked_at ?? new Date(),
    })

    const updated = await relRepo.findOneBy({ id })
    return toCamelRelation(updated!)
})
