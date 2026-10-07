import type { IEventDefinition } from './event-definition.interface'
import type { IPropDefinition } from './prop-definition.interface'
import type { ISlotDefinition } from './slot-definition.interface'
import type { IComponentSnippet } from './component-snippet.interface'

/*********************************************************
 * IComponentDefinition
 *
 * @description
 * Everything the playground knows about ONE component without having loaded
 * its implementation. The whole catalogue of these is cheap to hold in
 * memory; the components themselves are not, which is the separation the
 * registry is built around.
 *
 * @description
 * ⛔ `name` is the full `OrigamBtn`, not `Btn` and not `origam-btn`, because
 * it is the key that has to agree with three things at once: the named export
 * in `components/{family}/index.ts`, the key the metadata extractors emit,
 * and the basename of the SFC. `packages/marketing`'s catalogue uses a
 * kebab-case `slug` plus a PascalCase short `name` instead — a host mapping
 * one onto the other is a two-line adapter, whereas a registry keyed on
 * anything but the export name has to guess at it.
 *
 * @description
 * `family` is load-bearing, not decoration. The DS groups 218 SFCs into 96
 * `components/{Family}/index.ts` barrels, and that barrel is the unit a
 * loader fetches — so `family` is how `getComponent('OrigamBtnToggle')`
 * knows to import `origam/components/Btn`. It is also what identifies the
 * sub-components that cannot render alone: 9 of the 11 `OrigamDataTable*`
 * components require their parent.
 ********************************************************/
export interface IComponentDefinition {
    /** The exported component name — `OrigamBtn`. The registry's key. */
    name: string
    /** The tag a template uses — `origam-btn`. Derived from `name`. */
    tag: string
    /**
     * The `components/{Family}/` directory. The unit a loader fetches, and
     * what groups a parent with the sub-components that need it.
     */
    family: string
    /** Human-facing label. Defaults to `name` minus the `Origam` prefix. */
    label: string
    /** One-line description, from the component's own JSDoc when it has one. */
    description?: string
    /**
     * Grouping for a catalogue list — "Data Display", "Form & Input".
     *
     * ⛔ Optional on purpose: a category is an EDITORIAL judgement, not
     * something any extractor can measure, and getting it wrong is a
     * recurring and visible annoyance (a text-rendering component filed under
     * "Form & Input" because its name starts with "Text"). The chain leaves
     * it empty rather than inferring it from the name; a host that has a
     * curated taxonomy supplies it.
     */
    category?: string
    /** Props, in declaration order. */
    props: IPropDefinition[]
    /** Emits. */
    events: IEventDefinition[]
    /** Slots — type-level source only; the runtime descriptor cannot see them. */
    slots: ISlotDefinition[]
    /** Starting points. Empty is valid; it just means a blank instance renders. */
    snippets: IComponentSnippet[]
    /**
     * `true` when this component is a sub-component that only renders inside a
     * sibling of its family. Measured, not guessed — such a component either
     * throws or renders nothing on its own, so the playground must offer it as
     * a child rather than as a root instance.
     */
    requiresParent: boolean
}
