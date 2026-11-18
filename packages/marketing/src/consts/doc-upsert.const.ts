/**
 * doc-upsert.const.ts — column masks and collection specs of the documentation upsert (scripts/db-upsert.ts). Server/tooling only: imports TypeORM entities.
 */

import {
    DocDirectiveArg, DocDirectiveModifier, DocEmit, DocExample, DocParam, DocProp,
    DocRelation, DocReturn, DocSlot, DocValue,
} from '../server/db/entities/index.ts'

export const NULL_KEY = ' null'

/** doc_entry column masks. */
export const ENTRY_SRC = ['name', 'definition', 'signature', 'tag', 'value', 'source_file', 'parent_slug']

export const ENTRY_EDIT = [
    'category', 'domain', 'icon', 'description_key', 'description_fallback',
    'package_note', 'note_key', 'note_fallback', 'story_url', 'doc_url', 'kind_extra',
    'svg_title_key', 'svg_title_fallback', 'svg_desc_key', 'svg_desc_fallback',
]

/**
 * Per-collection reconciliation spec.
 *   entity— the TypeORM entity class
 *   key   — natural-identity columns (matched across runs)
 *   src   — [SRC] columns (written by both seed and re-sync)
 *   edit  — [ÉDIT] columns (written only by seed, and only when unlocked)
 *   orphan— whether the table has an `orphaned_at` soft-delete column
 */
export const CHILD_SPECS = {
    props: { entity: DocProp, key: ['name'], src: ['type_label', 'optional', 'required', 'position'], edit: ['type_slug', 'type_kind', 'default_value', 'description_key', 'description_fallback'], orphan: true },
    values: { entity: DocValue, key: ['value'], src: ['position'], edit: ['description_key', 'description_fallback'], orphan: true },
    params: { entity: DocParam, key: ['name'], src: ['type', 'required', 'default_value', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    returns: { entity: DocReturn, key: ['name'], src: ['type', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    emits: { entity: DocEmit, key: ['event'], src: ['payload_label', 'position'], edit: ['payload_slug', 'payload_kind', 'description_key', 'description_fallback'], orphan: true },
    slots: { entity: DocSlot, key: ['slot'], src: ['slot_props', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    examples: { entity: DocExample, key: ['position'], src: [], edit: ['title_key', 'title_fallback', 'code', 'lang'], orphan: false },
    directiveArgs: { entity: DocDirectiveArg, key: ['name'], src: ['type', 'required', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    directiveModifiers: { entity: DocDirectiveModifier, key: ['name'], src: ['type', 'required', 'position'], edit: ['description_key', 'description_fallback'], orphan: true },
    relations: { entity: DocRelation, key: ['rel_type', 'to_kind', 'to_slug', 'to_name', 'prop_name'], src: ['position'], edit: ['description_key', 'description_fallback'], orphan: true },
}

/** All collections written by the first seed. */
export const SEED_COLLECTIONS = Object.keys(CHILD_SPECS)

/** Collections refreshed by the re-sync (structural facts of the 4 DS families). */
export const SRC_COLLECTIONS = ['props', 'values', 'params', 'returns']
