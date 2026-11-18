/**
 * key-convention.const.ts — i18n key namespace per documentation kind (scripts/key-convention.mjs).
 */

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
