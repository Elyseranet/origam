/**
 * POST /api/admin/reference/:kind/:slug/relations
 *
 * Adds a new relation edge from this entry to another documented symbol.
 * `relType` must be one of: used_by, related, family, extends.
 *
 * Body keys in **camelCase**:
 *   relType (required), toKind?, toSlug?, toName?, propName?,
 *   descriptionKey?, descriptionFallback?, position?
 *
 * Returns 201 + the created relation in camelCase.
 */

import { DocEntry, DocRelation } from '../../../../../db/entities'
import { REL_TYPES } from '../../../../../../src/consts/db.const'
import { RELATION_POST_MAP, toDbPayload, toCamelRelation } from '../../../../../../src/utils/admin-mappers.util'

import { useDb } from '../../../../../../src/utils/db.util'
import { assertKind, assertSlug } from '../../../../../../src/utils/reference-validation.util'
/** Text fields validated for type/length (in camelCase). */
const TEXT_FIELDS = ['toKind', 'toSlug', 'toName', 'propName', 'descriptionKey', 'descriptionFallback'] as const

export default defineEventHandler(async (event) => {
    const kind = getRouterParam(event, 'kind') ?? ''
    const slug = getRouterParam(event, 'slug') ?? ''
    assertKind(kind)
    assertSlug(slug)

    const raw = await readBody(event)
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw createError({ statusCode: 400, statusMessage: 'Body must be a JSON object' })
    }
    const body = raw as Record<string, unknown>

    // Validate relType first (required, constrained)
    if (typeof body.relType !== 'string' || !(REL_TYPES as ReadonlyArray<string>).includes(body.relType)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Invalid or missing 'relType'. Valid values: ${(REL_TYPES as ReadonlyArray<string>).join(', ')}`,
        })
    }

    // Validate text field types and lengths
    for (const f of TEXT_FIELDS) {
        const v = body[f]
        if (v !== undefined && v !== null && typeof v !== 'string') {
            throw createError({ statusCode: 400, statusMessage: `Field '${f}' must be a string or null` })
        }
        if (typeof v === 'string' && v.length > 4096) {
            throw createError({ statusCode: 400, statusMessage: `Field '${f}' exceeds maximum length` })
        }
    }
    if (body.position !== undefined && (typeof body.position !== 'number' || !Number.isInteger(body.position))) {
        throw createError({ statusCode: 400, statusMessage: 'Field \'position\' must be an integer' })
    }

    // Reject unknown keys
    const unknownKeys = Object.keys(body).filter(k => !RELATION_POST_MAP.has(k))
    if (unknownKeys.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown fields: ${unknownKeys.join(', ')}. Allowed (camelCase): ${[...RELATION_POST_MAP.keys()].join(', ')}`,
        })
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

    // Auto-position if not provided
    let position = body.position as number | undefined
    if (position === undefined) {
        const maxRow = await relRepo
            .createQueryBuilder('r')
            .select('MAX(r.position)', 'max')
            .where('r.entry_id = :id', { id: entry.id })
            .getRawOne()
        position = (maxRow?.max ?? -1) + 1
    }

    // Convert camelCase → snake_case
    const dbPayload = toDbPayload(body, RELATION_POST_MAP)

    const relation = relRepo.create({
        entry_id: entry.id,
        rel_type: dbPayload.rel_type as string,
        to_kind: (dbPayload.to_kind as string | undefined) ?? null,
        to_slug: (dbPayload.to_slug as string | undefined) ?? null,
        to_name: (dbPayload.to_name as string | undefined) ?? null,
        prop_name: (dbPayload.prop_name as string | undefined) ?? null,
        description_key: (dbPayload.description_key as string | undefined) ?? null,
        description_fallback: (dbPayload.description_fallback as string | undefined) ?? null,
        position,
        edited_by_user: true,
        editorial_locked_at: new Date(),
    })
    await relRepo.save(relation)

    setResponseStatus(event, 201)
    return toCamelRelation(relation)
})
