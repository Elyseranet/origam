import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/**
 * A type-API entry in the /types catalogue.
 * Covers both TypeScript types (T prefix) and enums.
 */
export interface ITypeEntry {
    /** kebab-case slug, used as the URL segment /types/{slug} */
    slug: string
    /** Display name with the T prefix, e.g. "TColor" or enum name "VARIANT" */
    name: string
    /** MDI icon name for the catalog card */
    icon: string
    /** 'type' = TS union/alias, 'enum' = TypeScript enum */
    kind: 'type' | 'enum'
    /** Category grouping label */
    category: string
    /** i18n key for the short description */
    descriptionKey: string
    /** Inline English fallback description */
    descriptionFallback: string
}

/**
 * Full documentation for a type/enum, loaded from consts/types/{slug}.const.ts.
 */
export interface ITypeDoc {
    /** Must match the catalog entry slug exactly */
    slug: string
    /** Display name, e.g. "TColor", "VARIANT" */
    name: string
    /** 'type' or 'enum' */
    kind: 'type' | 'enum'
    /** TypeScript definition as a string (for display in a code block) */
    definition: string
    /** Category, mirrors the catalog */
    category: string
    /** i18n key for the description */
    descriptionKey: string
    descriptionFallback: string
    /**
     * For enums: the list of member values with optional per-value
     * description (each row's `label` is the literal value — these rows
     * have no separate name). For types: empty array.
     */
    values: IReferenceRow[]
    /**
     * List of component slugs from the components catalog that use this type.
     * Rendered as "Used by" chips linking to /components/{slug}.
     */
    usedBy: ITypeUsedByEntry[]
    /** Optional GitHub source path (relative to repo root) */
    sourceFile?: string
    /** 1-3 code usage snippets */
    examples?: ITypeExample[]
}

/** Reference to a component that uses this type */
export interface ITypeUsedByEntry {
    /** Component slug, e.g. "btn" */
    slug: string
    /** Display name, e.g. "Btn" */
    name: string
    /** Prop name where the type is used, e.g. "color" */
    propName: string
}

/** A usage snippet shown in the Examples section */
export interface ITypeExample {
    titleKey: string
    titleFallback: string
    code: string
    lang: string
}
