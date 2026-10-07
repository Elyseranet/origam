import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/**
 * Util catalog entry — one row in the flat helper list displayed on /utils.
 * Grouped by category (Commons, Bracket, …) on the index page.
 *
 * Mirrors {@link IComposableEntry} from composables-catalog.interface.ts but
 * documents a plain utility function (no `use` prefix, no reactive return).
 */
export interface IUtilEntry {
    /** kebab-case slug used as the URL segment: /utils/{slug}
     *  e.g. convertToUnit → convert-to-unit, mergeDeep → merge-deep
     */
    slug: string
    /** Util function name, e.g. "convertToUnit" */
    name: string
    /** MDI icon name for the catalog card */
    icon: string
    /** i18n key for the short description */
    descriptionKey: string
    /** Inline fallback description (English) */
    descriptionFallback: string
    /** Category / folder grouping, e.g. "Commons", "Bracket" */
    category: string
    /** Related util slugs (other helpers it pairs with) */
    related: string[]
}

/**
 * A runnable code snippet shown in the Examples section.
 */
export interface IUtilExample {
    titleKey: string
    titleFallback: string
    code: string
    lang: string
}

/**
 * Full documentation object for one util.
 * Consumed by /utils/[slug].vue.
 */
export interface IUtilDoc {
    /** Must match the catalog entry slug exactly */
    slug: string
    /** Util function name, e.g. "convertToUnit" */
    name: string
    /** Category / folder, e.g. "Commons" */
    category: string
    /** MDI icon name */
    icon: string
    /** i18n key for the hero description */
    descriptionKey: string
    descriptionFallback: string
    /**
     * Full TypeScript signature as a code snippet.
     * Sourced from the util's function signature in the real file.
     */
    signature: string
    /**
     * Parameters accepted by the util.
     * Maps to the real function parameters.
     */
    params: IReferenceRow[]
    /**
     * Return value description — a single row (a function has one return
     * type), never an array, unlike every other table on these pages.
     * Maps to the real function return type.
     */
    returns: IReferenceRow
    /**
     * Source path relative to repo root, e.g.
     * "packages/ds/src/utils/Commons/commons.util.ts"
     */
    sourceFile: string
    /** 2-3 runnable usage examples */
    examples: IUtilExample[]
    /**
     * Related util slugs (cross-references).
     * Rendered as "Related utils" section.
     */
    related: string[]
    /**
     * Note rendered as an info callout below the signature.
     * Use for deprecation warnings, phase notes, or important caveats.
     */
    noteKey?: string
    noteFallback?: string
}
