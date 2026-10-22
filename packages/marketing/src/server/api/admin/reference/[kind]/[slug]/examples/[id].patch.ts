/**
 * PATCH /api/admin/reference/:kind/:slug/examples/:id
 *
 * Updates editorial fields of an existing example. Verifies that the example
 * belongs to the given entry (kind + slug) before updating.
 *
 * Body keys in **camelCase**: subset of { titleKey, titleFallback, code, lang }
 * Returns the updated example in camelCase.
 */

import { DocEntry, DocExample } from '../../../../../../db/entities'
import { EXAMPLE_EDIT_MAP } from '../../../../../../../consts/admin-mappers.const'
import { toDbPayload, toCamelExample } from '../../../../../../../utils/admin-mappers.util'

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

    const raw = await readBody(event)
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw createError({ statusCode: 400, statusMessage: 'Body must be a JSON object' })
    }
    const body = raw as Record<string, unknown>

    // Reject unknown keys
    const unknownKeys = Object.keys(body).filter(k => !EXAMPLE_EDIT_MAP.has(k))
    if (unknownKeys.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown fields: ${unknownKeys.join(', ')}. Allowed (camelCase): ${[...EXAMPLE_EDIT_MAP.keys()].join(', ')}`,
        })
    }

    // Validate field types
    for (const camel of EXAMPLE_EDIT_MAP.keys()) {
        const v = body[camel]
        if (v !== undefined && v !== null && typeof v !== 'string') {
            throw createError({ statusCode: 400, statusMessage: `Field '${camel}' must be a string or null` })
        }
    }
    if (typeof body.code === 'string' && body.code.length > 65536) {
        throw createError({ statusCode: 400, statusMessage: 'Field \'code\' exceeds maximum length of 65536 characters' })
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

    // Convert camelCase → snake_case and merge
    const dbPayload = toDbPayload(body, EXAMPLE_EDIT_MAP)

    await exampleRepo.update({ id }, {
        ...dbPayload,
        edited_by_user: true,
        editorial_locked_at: example.editorial_locked_at ?? new Date(),
    })

    const updated = await exampleRepo.findOneBy({ id })
    return toCamelExample(updated!)
})
