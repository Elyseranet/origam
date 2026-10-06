/**
 * Per-directive documentation data — drives the /directives/[slug].vue template.
 * One file per directive under src/consts/directives/{slug}.const.ts.
 *
 * Terminology:
 * - value:     the expression passed to the directive (v-foo="VALUE")
 * - argument:  the named key inside the value object (for object-shape values)
 * - modifier:  dot-suffix on the directive (v-foo.modifier)
 * - related:   cross-references to components from the DS that use this directive
 */

import type { IComponentRelated } from '~/interfaces/components-catalog.interface'
import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/** A runnable code snippet shown in the Examples section */
export interface IDirectiveExample {
    titleKey: string
    titleFallback: string
    /** Full Vue template / JS snippet */
    code: string
    /** Highlight language, e.g. "vue", "ts" */
    lang: string
}

/**
 * Full documentation object for one directive.
 * Consumed by /directives/[slug].vue.
 */
export interface IDirectiveDoc {
    /** kebab-case slug — matches the URL segment and the filename */
    slug: string
    /** Display name including the v- prefix, e.g. "v-click-outside" */
    name: string
    /** MDI icon name */
    icon: string
    /** Human-readable category — always "Directive" for the chip */
    category: string
    /** i18n key for the hero description */
    descriptionKey: string
    descriptionFallback: string
    /**
     * TypeScript signature as a short display string.
     * Shown inline in the hero below the name.
     * E.g. 'v-click-outside="handler | options"'
     */
    signatureSummary: string
    /** Full signature snippet (multi-line) shown in the Signature section */
    signatureCode: string
    /** Language for the signature block (usually "ts") */
    signatureLang: string
    /** Argument/value shape rows — shown in the Value section */
    args?: IReferenceRow[]
    /** Modifier rows — shown in the Modifiers section */
    modifiers?: IReferenceRow[]
    /** Code examples shown in the Exemples section */
    examples: IDirectiveExample[]
    /**
     * Cross-references to DS components that internally use this directive
     * or that are commonly used alongside it.
     * Rendered as "Éléments liés" section.
     */
    related?: IComponentRelated[]
    /** Optional note rendered as a callout below the args table */
    noteKey?: string
    noteFallback?: string
    /** Link to the Histoire story, if available */
    storyUrl?: string
}
