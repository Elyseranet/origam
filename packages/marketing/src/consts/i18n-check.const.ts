/**
 * i18n-check.const.ts — static rules of the i18n coverage check (scripts/i18n-check.mjs).
 */

// Attributes that carry genuinely user-facing text when static. Everything
// else (class, id, tag, href, item-title, data-cy, role, …) is layout/wiring,
// not copy — deliberately NOT included, or every config-string prop in the
// codebase (e.g. `item-title="title"` telling <origam-select> which field to
// read) would false-positive.
export const TRANSLATABLE_ATTRS = new Set(['aria-label', 'title', 'placeholder', 'alt'])

// Channel C — explicit allowlist for keys built via template-literal
// interpolation the static scan can't resolve from the call site. Each entry
// documents exactly where it comes from so a future reader can re-verify it
// against the source rather than trusting this list blindly.
export const DYNAMIC_KEY_ALLOWLIST = [
    // src/pages/changelog.vue:36-45 — `t(`changelog.type.${type}`, ...)`,
    // `type` ranges over the literal keys of the local `fallbacks` map.
    'changelog.type.unreleased',
    'changelog.type.major',
    'changelog.type.minor',
    'changelog.type.patch',
    // src/pages/changelog.vue:47-56 — `t(`changelog.highlight.${type}`, ...)`
    'changelog.highlight.added',
    'changelog.highlight.changed',
    'changelog.highlight.fixed',
    'changelog.highlight.deprecated',
    // src/pages/why-origam.vue + src/components/WhyOrigamThemeDemo.vue —
    // `t(`why_origam.demo.identity_${entry.key}`, ...)`, `entry.key` ranges
    // over the 8 brand identities in `WHY_DEMO_THEMES` (why-origam-demo.const.ts).
    'why_origam.demo.identity_origam',
    'why_origam.demo.identity_apple',
    'why_origam.demo.identity_cartoon',
    'why_origam.demo.identity_ecom',
    'why_origam.demo.identity_editorial',
    'why_origam.demo.identity_geek',
    'why_origam.demo.identity_glass',
    'why_origam.demo.identity_material'
]

// Fields whose translation is resolved at runtime from the database (doc
// reference tables), not from any static string in this repo — see
// `server/utils/reference-mappers.ts` (`descriptionKey: row.description_key`).
// Static extraction cannot enumerate these; documented here so check 1 does
// not misreport them, rather than silently missing them without explanation.
export const DB_BACKED_KEY_FIELDS_NOTE =
    'descriptionKey/descriptionFallback on components|directives|types|enums|interfaces|consts|composables|utils ' +
    'catalog pages are populated from server/db (reference-mappers.ts) at runtime, not from static literals in src/. ' +
    'Out of scope for static extraction by design.'
