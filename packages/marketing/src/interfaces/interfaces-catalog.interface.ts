import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/**
 * An interface-API entry in the /interfaces catalogue.
 *
 * Mirrors {@link ITypeEntry} from types-catalog.interface.ts but describes a
 * TypeScript interface (I prefix) instead of a type/enum.
 */
export interface IInterfaceEntry {
    /** kebab-case slug, used as the URL segment /interfaces/{slug} */
    slug: string
    /** Display name with the I prefix, e.g. "IColorProps" */
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
 * Full documentation for a TypeScript interface, loaded from
 * consts/interfaces/{slug}.const.ts. Mirrors {@link ITypeDoc} but exposes a
 * `props` table and an `extends` chain instead of enum `values`.
 */
export interface IInterfaceDoc {
    /** Must match the catalog entry slug exactly */
    slug: string
    /** Display name with the I prefix, e.g. "IColorProps" */
    name: string
    /** TypeScript interface definition as a string (for display in a code block) */
    definition: string
    /** Category, mirrors the catalog */
    category: string
    /** i18n key for the description */
    descriptionKey: string
    descriptionFallback: string
    /**
     * Names of the parent interfaces this one `extends`. Rendered as chips
     * linking to /interfaces/{kebab-case(parent)} when a matching slug exists.
     */
    extends: string[]
    /**
     * Declared property rows, rendered as a Props table. A property's
     * `required` here is the INVERSE of the legacy `optional` field
     * (`required = !optional`) — see `mapInterfacePropRow`.
     */
    props: IReferenceRow[]
    /**
     * List of component / composable slugs that consume this interface.
     * Rendered as "Used by" chips.
     */
    usedBy: IInterfaceUsedByEntry[]
    /** Optional GitHub source path (relative to repo root) */
    sourceFile?: string
    /** 1-3 code usage snippets */
    examples?: IInterfaceExample[]
}

/** Reference to a component or composable that uses this interface */
export interface IInterfaceUsedByEntry {
    /** Component or composable slug, e.g. "btn" or "use-color" */
    slug: string
    /** Display name, e.g. "Btn" or "useColor" */
    name: string
    /** What kind of consumer this is */
    kind: 'component' | 'composable'
}

/** A usage snippet shown in the Examples section */
export interface IInterfaceExample {
    titleKey: string
    titleFallback: string
    code: string
    lang: string
}
