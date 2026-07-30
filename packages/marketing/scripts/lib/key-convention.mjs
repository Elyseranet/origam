/**
 * key-convention.mjs — deterministic i18n-key generation for orphaned
 * `*_key`/`*_fallback` pairs (ADR 325, task 1).
 *
 * 3 763 rows across `doc_entry` / `doc_prop` / `doc_param` / `doc_return` /
 * `doc_example` carry real curated `*_fallback` prose but an EMPTY `*_key` —
 * structurally impossible to translate (nothing for `doc_translation`, task 2,
 * to key off). This module derives the missing key mechanically from
 * structural facts already on the row (kind, slug, prop/param/return name) —
 * it NEVER invents prose. The one exception (`exampleTitleSlug`) still never
 * invents: it mechanically slugifies the EXISTING curated `title_fallback`
 * text, it doesn't compose new wording.
 *
 * The naming convention below is not invented either — it is the one already
 * used, unbroken, by the 14 498 keys that DO exist today (audited directly
 * against the live `doc_*` tables before writing this module):
 *
 *   doc_entry.description_key   <ns>.catalog.<slug_snake>.description
 *   doc_entry.note_key          <ns>.detail.<slug_snake>.note
 *   doc_prop.description_key    <ns>.<slug_snake>.props.<name_snake>.description
 *   doc_param.description_key   <ns>.detail.<slug_snake>.param_<name_snake>
 *   doc_return.description_key  <ns>.detail.<slug_snake>.returns              (unnamed)
 *                                <ns>.detail.<slug_snake>.return_<name_snake>  (named)
 *   doc_example.title_key       <ns>.<slug_snake>.examples.<title_slug>.title
 *
 * `<ns>` is the plural namespace segment (`kind + 's'`, verified against the
 * DB for all 8 kinds — see KIND_NAMESPACE). `directive` is the one kind whose
 * EXISTING keys skip the `.catalog.`/`.detail.` segment entirely
 * (`directives.<slug>.description`, `directives.<slug>.note`) — irrelevant
 * here since no directive row is orphaned, but documented so nobody "fixes"
 * it into the 7-kind shape later.
 */

import { toSlug } from './extract.mjs'

/** doc_entry.kind → the plural namespace segment used by every key. */
export const KIND_NAMESPACE = Object.freeze({
    component: 'components',
    composable: 'composables',
    const: 'consts',
    directive: 'directives',
    enum: 'enums',
    interface: 'interfaces',
    type: 'types',
    util: 'utils',
})

/** camelCase/PascalCase identifier → snake_case key segment (reuses the DS-wide kebab algorithm). */
export function toSnake (name) {
    return toSlug(name, 'standard').replace(/-/g, '_')
}

/** entry.slug (kebab-case) → snake_case key segment. */
export function slugSnake (slug) {
    return slug.replace(/-/g, '_')
}

/**
 * Mechanical slug for a doc_example title — derived 1:1 from the EXISTING
 * `title_fallback` (never invented): lowercase, non-alphanumerics collapsed
 * to `_`, capped to the first 4 words so keys stay legible. Collisions
 * between sibling examples of the same entry are disambiguated by the caller
 * via `dedupeSlug`.
 */
export function exampleTitleSlug (titleFallback) {
    const words = String(titleFallback)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
    const slug = words.join('_').replace(/_+$/, '')
    return slug || 'example'
}

/** Disambiguate a candidate slug against slugs already used in the same scope (mutates `used`). */
export function dedupeSlug (candidate, used) {
    if (!used.has(candidate)) { used.add(candidate); return candidate }
    let n = 2
    while (used.has(`${candidate}_${n}`)) n++
    const out = `${candidate}_${n}`
    used.add(out)
    return out
}

export function entryDescriptionKey (kind, slug) {
    return `${KIND_NAMESPACE[kind]}.catalog.${slugSnake(slug)}.description`
}

export function entryNoteKey (kind, slug) {
    return `${KIND_NAMESPACE[kind]}.detail.${slugSnake(slug)}.note`
}

/** doc_prop.description_key — shared shape for `interface` and `component` kinds. */
export function propKey (kind, slug, propName) {
    return `${KIND_NAMESPACE[kind]}.${slugSnake(slug)}.props.${toSnake(propName)}.description`
}

/** doc_param.description_key — shared shape for `util` and `composable` kinds. */
export function paramKey (kind, slug, paramName) {
    return `${KIND_NAMESPACE[kind]}.detail.${slugSnake(slug)}.param_${toSnake(paramName)}`
}

/** doc_return.description_key — unnamed (single, e.g. util) vs. named (composable, multiple). */
export function returnKey (kind, slug, returnName) {
    return returnName
        ? `${KIND_NAMESPACE[kind]}.detail.${slugSnake(slug)}.return_${toSnake(returnName)}`
        : `${KIND_NAMESPACE[kind]}.detail.${slugSnake(slug)}.returns`
}

/** doc_example.title_key — mechanical slug of the existing title_fallback, deduped within the entry. */
export function exampleTitleKey (kind, slug, titleFallback, used) {
    const leaf = dedupeSlug(exampleTitleSlug(titleFallback), used)
    return `${KIND_NAMESPACE[kind]}.${slugSnake(slug)}.examples.${leaf}.title`
}

/**
 * The single `enum. → enums.` namespace typo flagged in ADR 325 (task 3):
 * a stray key starting with the singular `enum.` segment instead of the
 * plural `enums.` every other enum key uses. Fixes ONLY the leading
 * namespace segment — it does not reshape the rest of the key (that would
 * be a content judgment call beyond "fix the namespace").
 */
export function fixEnumNamespace (key) {
    if (typeof key !== 'string') return key
    if (/^enum\.(?!s\.)/.test(key)) return key.replace(/^enum\./, 'enums.')
    return key
}
