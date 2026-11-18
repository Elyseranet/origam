/**
 * POST /api/admin/reference/:kind/:slug/examples
 *
 * Appends a new example to the entry. The position is automatically set to
 * (max existing position + 1) to place it at the end.
 *
 * Body keys in **camelCase**: { titleKey?, titleFallback?, code?, lang? }
 * Returns 201 + the created example in camelCase.
 */

import { DocEntry, DocExample } from '../../../../../db/entities'
import { EXAMPLE_EDIT_MAP } from '../../../../../../consts/admin-mappers.const'
import { toDbPayload, toCamelExample } from '../../../../../../utils/admin-mappers.util'

import { useDb } from '../../../../../../utils/db.util'
import { assertKind, assertSlug } from '../../../../../../utils/reference-validation.util'
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

    // Validate field types — all nullable strings except code which may be large
    for (const camel of EXAMPLE_EDIT_MAP.keys()) {
        const v = body[camel]
        if (v !== undefined && v !== null && typeof v !== 'string') {
            throw createError({ statusCode: 400, statusMessage: `Field '${camel}' must be a string or null` })
        }
    }
    if (typeof body.code === 'string' && body.code.length > 65536) {
        throw createError({ statusCode: 400, statusMessage: 'Field \'code\' exceeds maximum length of 65536 characters' })
    }

    // Reject unknown keys
    const unknownKeys = Object.keys(body).filter(k => !EXAMPLE_EDIT_MAP.has(k))
    if (unknownKeys.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown fields: ${unknownKeys.join(', ')}. Allowed (camelCase): ${[...EXAMPLE_EDIT_MAP.keys()].join(', ')}`,
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

    const exampleRepo = db.getRepository(DocExample)

    const maxRow = await exampleRepo
        .createQueryBuilder('r')
        .select('MAX(r.position)', 'max')
        .where('r.entry_id = :id', { id: entry.id })
        .getRawOne()

    const nextPosition = (maxRow?.max ?? -1) + 1

    // Convert camelCase → snake_case for DB
    const dbPayload = toDbPayload(body, EXAMPLE_EDIT_MAP)

    const example = exampleRepo.create({
        entry_id: entry.id,
        title_key: (dbPayload.title_key as string | null) ?? null,
        title_fallback: (dbPayload.title_fallback as string | null) ?? null,
        code: (dbPayload.code as string | null) ?? null,
        lang: (dbPayload.lang as string | null) ?? 'vue',
        position: nextPosition,
        edited_by_user: true,
        editorial_locked_at: new Date(),
    })
    await exampleRepo.save(example)

    setResponseStatus(event, 201)
    return toCamelExample(example)
})
