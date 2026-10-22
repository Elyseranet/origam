/**
 * PATCH /api/admin/reference/:kind/:slug
 *
 * Edits the editorial ([ÉDIT]) fields of a doc_entry row.
 *
 * Body keys are in **camelCase** (matching the *Doc shape returned by the
 * public GET /api/reference/:kind/:slug) — no client-side conversion needed:
 *   category, icon, descriptionKey, descriptionFallback,
 *   noteKey, noteFallback, storyUrl, docUrl
 *
 * [SRC] fields (kind, slug, name, definition, signature, tag, value,
 * sourceFile, packageNote, kindExtra, domain, parentSlug, …) are
 * explicitly rejected with 400 — both camelCase and snake_case variants.
 *
 * On the first editorial write the row is flagged:
 *   edited_by_user = true, editorial_locked_at = now()
 * This lock prevents the re-sync pipeline from overwriting these fields.
 *
 * Response: the updated entry in camelCase (same field naming as *Doc).
 *
 * Cache invalidation: the Nitro cache for this doc is cleared so the next
 * public GET reflects the edit immediately.
 */

import { DocEntry } from '../../../../db/entities'
import { invalidateReferenceDoc } from '../../../../../src/utils/reference-cache.util'
import {
    ENTRY_EDIT_MAP,
    ENTRY_SRC_CAMEL,
    toDbPayload,
    toCamelEntry,
} from '../../../../../src/utils/admin-mappers.util'

import { useDb } from '../../../../../src/utils/db.util'
import { assertKind, assertSlug } from '../../../../../src/utils/reference-validation.util'
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
    const bodyKeys = Object.keys(body)

    // Reject [SRC] keys first — signals a client bug clearly
    const srcAttempt = bodyKeys.filter(k => ENTRY_SRC_CAMEL.has(k))
    if (srcAttempt.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Fields are read-only (source): ${srcAttempt.join(', ')}`,
        })
    }

    // Reject any unknown key not in the [ÉDIT] map
    const allowedCamel = [...ENTRY_EDIT_MAP.keys()]
    const unknownKeys = bodyKeys.filter(k => !ENTRY_EDIT_MAP.has(k))
    if (unknownKeys.length > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Unknown or non-editorial fields: ${unknownKeys.join(', ')}. Allowed (camelCase): ${allowedCamel.join(', ')}`,
        })
    }

    // Validate individual field types — all are nullable strings
    for (const [k, v] of Object.entries(body)) {
        if (v !== null && v !== undefined && typeof v !== 'string') {
            throw createError({ statusCode: 400, statusMessage: `Field '${k}' must be a string or null` })
        }
        if (typeof v === 'string' && v.length > 4096) {
            throw createError({ statusCode: 400, statusMessage: `Field '${k}' exceeds maximum length of 4096 characters` })
        }
    }

    const db = await useDb()
    const repo = db.getRepository(DocEntry)

    const entry = await repo
        .createQueryBuilder('e')
        .where('e.kind = :kind AND e.slug = :slug', { kind, slug })
        .getOne()

    if (!entry) {
        throw createError({ statusCode: 404, statusMessage: `${kind} '${slug}' not found` })
    }

    // Convert camelCase body → snake_case DB columns
    const dbPayload = toDbPayload(body, ENTRY_EDIT_MAP) as Partial<DocEntry> & {
        edited_by_user: boolean
        editorial_locked_at?: Date
    }
    dbPayload.edited_by_user = true
    if (!entry.editorial_locked_at) {
        dbPayload.editorial_locked_at = new Date()
    }

    await repo.update({ id: entry.id }, dbPayload)
    const updated = await repo.findOneBy({ id: entry.id })

    // Invalidate the Nitro cache for this doc so the public GET reflects edits
    // (non bloquant : invalidateReferenceDoc journalise et n'échoue jamais)
    await invalidateReferenceDoc(useStorage(), kind, slug)

    return toCamelEntry(updated!)
})
