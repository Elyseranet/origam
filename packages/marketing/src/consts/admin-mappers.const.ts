/**
 * admin-mappers.const.ts — allow-lists of the admin write API (camelCase body key → snake_case DB column).
 * Consumed by src/utils/admin-mappers.util.ts and the PATCH/POST handlers.
 */

import type { TAdminCollectionKey } from '../types/admin.type'

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

/** Child collections accepted by `PATCH …/items/:id`. */
export const ALLOWED_COLLECTIONS: ReadonlyArray<TAdminCollectionKey> = [
    'prop', 'value', 'param', 'return', 'emit', 'slot', 'directive_arg', 'directive_modifier',
]

/** Text fields validated for type/length (in camelCase). */
export const TEXT_FIELDS = ['toKind', 'toSlug', 'toName', 'propName', 'descriptionKey', 'descriptionFallback'] as const
