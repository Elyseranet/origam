/**
 * admin-mappers.ts — camelCase body → snake_case DB payload, and the inverse.
 *
 * The public read API (/api/reference/**) returns *Doc objects in camelCase.
 * The admin write API (PATCH /api/admin/reference/**) mirrors that shape:
 * the frontend builds its form from the *Doc response and sends the same
 * field names back — no client-side conversion required.
 *
 * This file is the inverse of reference-mappers.ts for the [ÉDIT] surface:
 *   camelCase request body key → snake_case DB column   (toDbPayload)
 *   TypeORM entity → camelCase response shape           (toCamel* helpers)
 *
 * Each map is authoritative for what the admin may write. [SRC] keys are
 * enumerated separately so handlers can reject them with 400.
 */

import type { DocEntry, DocExample, DocRelation } from '../../server/db/entities'

// ─── camelCase → snake_case write maps ────────────────────────────────────

/** [ÉDIT] fields allowed on a doc_entry PATCH, in the camelCase the frontend sends. */
export const ENTRY_EDIT_MAP: ReadonlyMap<string, string> = new Map([
    ['category', 'category'],
    ['icon', 'icon'],
    ['descriptionKey', 'description_key'],
    ['descriptionFallback', 'description_fallback'],
    ['noteKey', 'note_key'],
    ['noteFallback', 'note_fallback'],
    ['storyUrl', 'story_url'],
    ['docUrl', 'doc_url'],
])

/**
 * [SRC] camelCase keys that must be rejected with 400 when present in a PATCH body.
 * Both camelCase and snake_case variants are covered (defensive against accidental mixing).
 */
export const ENTRY_SRC_CAMEL = new Set([
    // camelCase
    'kind', 'slug', 'name', 'definition', 'signature', 'tag', 'value',
    'sourceFile', 'packageNote', 'kindExtra', 'domain', 'parentSlug',
    'id', 'createdAt', 'updatedAt', 'editedByUser', 'editorialLockedAt', 'orphanedAt',
    // snake_case — defensive rejection in case the caller accidentally sends raw DB keys
    'source_file', 'package_note', 'kind_extra', 'parent_slug',
    'created_at', 'updated_at', 'edited_by_user', 'editorial_locked_at', 'orphaned_at',
    // snake_case short names that coincide with DB column names not in ENTRY_EDIT_MAP
    'description_key', 'description_fallback',
    'note_key', 'note_fallback', 'story_url', 'doc_url',
])

/** [ÉDIT] fields allowed on a doc_example POST or PATCH. */
export const EXAMPLE_EDIT_MAP: ReadonlyMap<string, string> = new Map([
    ['titleKey', 'title_key'],
    ['titleFallback', 'title_fallback'],
    ['code', 'code'],
    ['lang', 'lang'],
])

/** Fields for POST doc_relation (full creation). `relType` is required and validated separately. */
export const RELATION_POST_MAP: ReadonlyMap<string, string> = new Map([
    ['relType', 'rel_type'],
    ['toKind', 'to_kind'],
    ['toSlug', 'to_slug'],
    ['toName', 'to_name'],
    ['propName', 'prop_name'],
    ['descriptionKey', 'description_key'],
    ['descriptionFallback', 'description_fallback'],
    ['position', 'position'],
])

/** [ÉDIT] fields for PATCH doc_relation (description only). */
export const RELATION_EDIT_MAP: ReadonlyMap<string, string> = new Map([
    ['descriptionKey', 'description_key'],
    ['descriptionFallback', 'description_fallback'],
])

/** [ÉDIT] fields for PATCH on child items (prop/value/param/…). */
export const ITEM_EDIT_MAP: ReadonlyMap<string, string> = new Map([
    ['descriptionKey', 'description_key'],
    ['descriptionFallback', 'description_fallback'],
])

/**
 * Converts a validated camelCase body to a DB-ready snake_case payload.
 * Only keys present in `map` and in `body` are included — unknown keys must
 * have been filtered out by the caller before this call.
 */
export function toDbPayload (
    body: Record<string, unknown>,
    map: ReadonlyMap<string, string>,
): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [camel, snake] of map) {
        if (Object.prototype.hasOwnProperty.call(body, camel)) {
            out[snake] = body[camel]
        }
    }
    return out
}

// ─── snake_case entity → camelCase response helpers ───────────────────────

/**
 * Returns the editorial surface of a doc_entry in the same camelCase shape
 * as the public *Doc API. Used as the PATCH response so the frontend can
 * update its local state without a full page reload.
 */
export function toCamelEntry (e: DocEntry) {
    return {
        id: e.id,
        kind: e.kind,
        slug: e.slug,
        name: e.name,
        category: e.category,
        icon: e.icon,
        descriptionKey: e.description_key,
        descriptionFallback: e.description_fallback,
        noteKey: e.note_key,
        noteFallback: e.note_fallback,
        storyUrl: e.story_url,
        docUrl: e.doc_url,
        editedByUser: e.edited_by_user,
        editorialLockedAt: e.editorial_locked_at,
        updatedAt: e.updated_at,
    }
}

/** Returns a doc_example in camelCase. */
export function toCamelExample (e: DocExample) {
    return {
        id: e.id,
        entryId: e.entry_id,
        titleKey: e.title_key,
        titleFallback: e.title_fallback,
        code: e.code,
        lang: e.lang,
        position: e.position,
        editedByUser: e.edited_by_user,
        editorialLockedAt: e.editorial_locked_at,
        updatedAt: e.updated_at,
    }
}

/** Returns a doc_relation in camelCase. */
export function toCamelRelation (r: DocRelation) {
    return {
        id: r.id,
        entryId: r.entry_id,
        relType: r.rel_type,
        toKind: r.to_kind,
        toSlug: r.to_slug,
        toName: r.to_name,
        propName: r.prop_name,
        descriptionKey: r.description_key,
        descriptionFallback: r.description_fallback,
        position: r.position,
        editedByUser: r.edited_by_user,
        editorialLockedAt: r.editorial_locked_at,
        orphanedAt: r.orphaned_at,
        updatedAt: r.updated_at,
    }
}

/** Returns a generic child item (prop / value / param / …) in camelCase (description fields only). */
export function toCamelItem (row: Record<string, unknown>) {
    return {
        id: row.id,
        entryId: row.entry_id,
        name: row.name,
        value: row.value,
        descriptionKey: row.description_key,
        descriptionFallback: row.description_fallback,
        position: row.position,
        editedByUser: row.edited_by_user,
        editorialLockedAt: row.editorial_locked_at,
        updatedAt: row.updated_at,
    }
}
