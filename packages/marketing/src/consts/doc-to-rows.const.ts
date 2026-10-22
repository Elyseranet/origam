/**
 * doc-to-rows.const.ts — static keys of the doc → rows mapper (scripts/doc-to-rows.ts).
 */

/** Component-only rich blocks that ride in kind_extra (ADR §3.4). */
export const COMPONENT_EXTRA_KEYS = [
    'anatomy', 'cssVars', 'exposed', 'composable',
    'a11y', 'tokens', 'playground', 'previewVariants',
]
