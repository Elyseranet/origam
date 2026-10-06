import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/**
 * A constant entry in the /consts catalogue.
 *
 * Mirrors {@link IEnumEntry} from enums-catalog.interface.ts but documents a
 * SCREAMING_SNAKE_CASE constant exported from the DS source.
 */
export interface IConstEntry {
    /** kebab-case slug, used as the URL segment /consts/{slug} */
    slug: string
    /** Display name, e.g. "BREAKPOINTS_ARRAY", "PREDEFINED_DENSITY" */
    name: string
    /** MDI icon name for the catalog card */
    icon: string
    /** Category grouping label */
    category: string
    /** i18n key for the short description */
    descriptionKey: string
    /** Inline English fallback description */
    descriptionFallback: string
}

/** Reference to a part of the DS that consumes this constant. */
export interface IConstUsedByEntry {
    /** Where it is used, e.g. "useDisplay", "OrigamGrid" */
    name: string
    /** Optional link target (component slug → /components/{slug}) */
    slug?: string
}

/** A usage snippet shown in the Examples section. */
export interface IConstExample {
    titleKey: string
    titleFallback: string
    code: string
    lang: string
}

/**
 * Full documentation for a SCREAMING_SNAKE_CASE constant, loaded from
 * consts/consts/{slug}.const.ts. Mirrors {@link IEnumDoc}.
 */
export interface IConstDoc {
    /** Must match the catalog entry slug exactly */
    slug: string
    /** Display name, e.g. "BREAKPOINTS_ARRAY" */
    name: string
    /** Category, mirrors the catalog */
    category: string
    /** i18n key for the description */
    descriptionKey: string
    descriptionFallback: string
    /**
     * The TypeScript definition as a string (for display in a code block).
     * Recopy the real value; truncate with an ellipsis comment if huge.
     */
    definition: string
    /**
     * A scalar value when the constant is a primitive (string/number/boolean).
     * Mutually exclusive with `values`.
     */
    value?: string
    /**
     * Copiable members when the constant is an object or array. Each row's
     * `label` is the value reference or member (e.g. "'sm'" or
     * "mobileBreakpoint: 'lg'") — these rows have no separate name.
     * Mutually exclusive with `value`.
     */
    values?: IReferenceRow[]
    /**
     * Parts of the DS that consume this constant.
     * Rendered as "Used by" chips.
     */
    usedBy: IConstUsedByEntry[]
    /** Source path relative to repo root */
    sourceFile?: string
    /** 1-3 code usage snippets */
    examples?: IConstExample[]
}
