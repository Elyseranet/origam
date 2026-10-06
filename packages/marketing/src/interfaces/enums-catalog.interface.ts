import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/**
 * An enum-API entry in the /enums catalogue.
 *
 * Mirrors {@link ITypeEntry} from types-catalog.interface.ts but is always
 * an enum — there is no `kind` field.
 */
export interface IEnumEntry {
    /** kebab-case slug, used as the URL segment /enums/{slug} */
    slug: string
    /** Display name, e.g. "DENSITY", "VARIANT" */
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

/**
 * Full documentation for a TypeScript enum, loaded from
 * consts/enums/{slug}.const.ts. Mirrors {@link ITypeDoc} without the
 * `kind` field (always an enum).
 */
export interface IEnumDoc {
    /** Must match the catalog entry slug exactly */
    slug: string
    /** Display name, e.g. "DENSITY", "VARIANT" */
    name: string
    /** TypeScript enum definition as a string (for display in a code block) */
    definition: string
    /** Category, mirrors the catalog */
    category: string
    /** i18n key for the description */
    descriptionKey: string
    descriptionFallback: string
    /**
     * The list of member values with optional per-value description. Each
     * row's `label` is the member reference (e.g. "DENSITY.COMPACT") —
     * these rows have no separate name.
     */
    values: IReferenceRow[]
    /**
     * List of component slugs from the components catalog that use this enum.
     * Rendered as "Used by" chips linking to /components/{slug}.
     */
    usedBy: IEnumUsedByEntry[]
    /** Optional GitHub source path (relative to repo root) */
    sourceFile?: string
    /** 1-3 code usage snippets */
    examples?: IEnumExample[]
}

/** Reference to a component that uses this enum */
export interface IEnumUsedByEntry {
    /** Component slug, e.g. "btn" */
    slug: string
    /** Display name, e.g. "Btn" */
    name: string
    /** Prop name where the enum is used, e.g. "density" */
    propName: string
}

/** A usage snippet shown in the Examples section */
export interface IEnumExample {
    titleKey: string
    titleFallback: string
    code: string
    lang: string
}
