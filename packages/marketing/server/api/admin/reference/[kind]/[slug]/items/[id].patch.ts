/**
 * PATCH /api/admin/reference/:kind/:slug/items/:id
 *
 * Updates the editorial description of a child item row (prop / value / param /
 * emit / slot / return / directive_arg / directive_modifier). The target
 * collection is identified by the `?collection=<name>` query parameter.
 *
 * Body keys in **camelCase**: { descriptionKey?, descriptionFallback? }
 * Returns the updated item in camelCase.
 *
 * Allowed collections:
 *   prop | value | param | return | emit | slot | directive_arg | directive_modifier
 */

import {
    DocEntry, DocProp, DocValue, DocParam, DocReturn,
    DocEmit, DocSlot, DocDirectiveArg, DocDirectiveModifier,
} from '../../../../../../db/entities'
import type { Repository } from 'typeorm'
import { ALLOWED_COLLECTIONS, ITEM_EDIT_MAP } from '../../../../../../../src/consts/admin-mappers.const'
import type { TAdminCollectionKey } from '../../../../../../../src/types/admin.type'
import { toDbPayload, toCamelItem } from '../../../../../../../src/utils/admin-mappers.util'

import { useDb } from '../../../../../../../src/utils/db.util'
import { assertKind, assertSlug } from '../../../../../../../src/utils/reference-validation.util'

function getCollectionRepo (db: Awaited<ReturnType<typeof useDb>>, collection: TAdminCollectionKey): Repository<any> {
    switch (collection) {
        case 'prop': return db.getRepository(DocProp)
        case 'value': return db.getRepository(DocValue)
        case 'param': return db.getRepository(DocParam)
        case 'return': return db.getRepository(DocReturn)
        case 'emit': return db.getRepository(DocEmit)
        case 'slot': return db.getRepository(DocSlot)
        case 'directive_arg': return db.getRepository(DocDirectiveArg)
        case 'directive_modifier': return db.getRepository(DocDirectiveModifier)
    }
}

export default defineEventHandler(async (event) => {
    const kind = getRouterParam(event, 'kind') ?? ''
    const slug = getRouterParam(event, 'slug') ?? ''
    const id = getRouterParam(event, 'id') ?? ''
    assertKind(kind)
    assertSlug(slug)

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid item id (expected UUID)' })
    }

    const query = getQuery(event)
    const collection = query.collection as string | undefined
    if (!collection || !ALLOWED_COLLECTIONS.includes(collection as TAdminCollectionKey)) {
        throw createError({
            statusCode: 400,
            statusMessage: `Query param 'collection' is required. Allowed values: ${ALLOWED_COLLECTIONS.join(', ')}`,
        })
    }

    const raw = await readBody(event)
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw createError({ statusCode: 400, statusMessage: 'Body must be a JSON object' })
    }
    const body = raw as Record<string, unknown>

    // Reject unknown keys
    const unknownKeys = Object.keys(body).filter(k => !ITEM_EDIT_MAP.has(k))
    if (unknownKeys.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown or non-editorial fields: ${unknownKeys.join(', ')}. Allowed (camelCase): ${[...ITEM_EDIT_MAP.keys()].join(', ')}`,
        })
    }

    // Validate field types
    for (const camel of ITEM_EDIT_MAP.keys()) {
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

    const repo = getCollectionRepo(db, collection as TAdminCollectionKey)
    const item = await repo.findOneBy({ id })

    if (!item || item.entry_id !== entry.id) {
        throw createError({ statusCode: 404, statusMessage: `${collection} '${id}' not found for ${kind}/${slug}` })
    }

    // Convert camelCase → snake_case and merge with existing values
    const dbPayload = toDbPayload(body, ITEM_EDIT_MAP)

    await repo.update({ id }, {
        description_key: 'descriptionKey' in body
            ? (dbPayload.description_key as string | null)
            : item.description_key,
        description_fallback: 'descriptionFallback' in body
            ? (dbPayload.description_fallback as string | null)
            : item.description_fallback,
        edited_by_user: true,
        editorial_locked_at: item.editorial_locked_at ?? new Date(),
    })

    const updated = await repo.findOneBy({ id })
    return toCamelItem(updated as Record<string, unknown>)
})
