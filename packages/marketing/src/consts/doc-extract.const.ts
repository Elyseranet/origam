/**
 * doc-extract.const.ts — static tables of the API-Reference extractor (scripts/extract.mjs, scripts/extract-vue.mjs).
 */

/**
 * The eight families of the API Reference, and where each one is read from.
 *
 * `components` is the odd one out: its source is a `.vue` SFC, not a `.ts`, and
 * its public surface is declared by macros that merely NAME an interface. It
 * carries `vue: true` and is handled by `extract-vue.mjs`; `listSourceFiles`
 * and `extractFile` do not apply to it.
 */
export const DOMAINS = {
    enums: { dir: 'enums', glob: '.enum.ts', kind: 'enum' },
    interfaces: { dir: 'interfaces', glob: '.interface.ts', kind: 'interface' },
    consts: { dir: 'consts', glob: '.const.ts', kind: 'const' },
    utils: { dir: 'utils', glob: '.util.ts', kind: 'util' },
    composables: { dir: 'composables', glob: '.composable.ts', kind: 'composable' },
    types: { dir: 'types', glob: '.type.ts', kind: 'type' },
    directives: { dir: 'directives', glob: '.directive.ts', kind: 'directive' },
    components: { dir: 'components', glob: '.vue', kind: 'component', vue: true },
}

/** Domains whose source is a `.ts` file the TypeScript Program can compile. */
export const TS_DOMAINS = Object.keys(DOMAINS).filter(k => !DOMAINS[k].vue)

/**
 * Families read as FUNCTIONS — one extraction path, two kinds. A composable is
 * a util that happens to live under `composables/` and to hand back an object.
 */
export const FN_KINDS = new Set(['util', 'composable'])

/** Slug style historically used per domain. */
export const SLUG_STYLE = {
    enums: 'standard',
    interfaces: 'percap',
    consts: 'standard',
    utils: 'standard',
    composables: 'standard',
    types: 'standard',
    directives: 'standard',
    components: 'standard',
}

/**
 * A payload-less emit is labelled `void`, which is the majority convention in
 * the curated data (25 rows against 6 spelled `—`). Normalising the 6 is an
 * update of 6 cells, not a loss.
 */
export const NO_PAYLOAD = 'void'

/** A slot that takes no slot-props is labelled `—` — the curated convention. */
export const NO_SLOT_PROPS = '—'
