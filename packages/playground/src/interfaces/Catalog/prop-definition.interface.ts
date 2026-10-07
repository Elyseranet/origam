import type { CONTROL_KIND } from '../../enums/Commons/control-kind.enum'
import type { METADATA_SOURCE } from '../../enums/Commons/metadata-source.enum'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IPropDefinition
 *
 * @description
 * One editable prop, as the metadata chain produces it. This is the
 * EXTRACTION-shaped contract: every field is something a stage measured, and
 * `source` says which one.
 *
 * @description
 * ⛔ Why this is NOT `IReferenceRow`
 * (`packages/marketing/src/interfaces/reference-row.interface.ts`), despite
 * that interface describing a prop row and having earned its place by folding
 * 16 near-identical ones into one. Two reasons, and both are about direction
 * rather than shape:
 *
 *   1. `IReferenceRow` carries `descriptionKey` — an i18n key — and a
 *      `type?: IComponentTypeRef` whose `slug` addresses marketing's own
 *      `/types/{slug}` route. Both are HOST concerns. An embeddable component
 *      that receives its theme as a prop must not also own its host's
 *      translation catalogue or its URL scheme.
 *   2. It lives in `packages/marketing`, and marketing is a HOST of this
 *      package. Importing it here would invert the dependency.
 *
 * So the two coexist on purpose: this one is what the compiler knows, that
 * one is what a documentation table renders. The seam between them is the
 * prop-row slot — the playground hands the host an `IPropDefinition` and the
 * host maps it onto its own `IReferenceRow` in a single adapter, keeping the
 * i18n keys and the route slugs on the host's side where they belong.
 * `label`/`description` below are named after `IReferenceRow`'s fields so
 * that adapter stays a rename rather than a translation.
 ********************************************************/
export interface IPropDefinition {
    /**
     * The prop name as a template passes it, camelCase — `bgColor`, not
     * `bg-color`. This is the key the runtime descriptor uses and the key an
     * instance's `props` record is keyed by.
     */
    name: string
    /** Human-facing label. Defaults to `name` when nothing better is known. */
    label: string
    /**
     * The declared type, as the TypeScript printer renders it — e.g.
     * `"tonal" | "outlined" | "filled" | undefined`, or just `TColor` when
     * the type carries an alias the printer kept. Display string only: never
     * parse this to decide a control, use `control` and `options`.
     */
    tsType: string | null
    /**
     * The runtime `type` entry, reduced to constructor names.
     *
     * ⛔ `['Boolean', 'Number', 'String']` means the compiler could NOT narrow
     * the declared type — 65.1 % of authored props land here. It is an absence
     * of information, not a list of three accepted kinds. `null` (9.8 %) is
     * the same absence, stated plainly.
     */
    runtimeType: string | string[] | null
    /** `true` only when the descriptor marks it required — 80 props do. */
    required: boolean
    /**
     * The default the component itself declares, from `withDefaults`.
     *
     * ⛔ Only the RUNTIME source can supply this, and it may be absent even
     * when the component has one: a `default` that is a FUNCTION is a FACTORY
     * for Object/Array props and the value itself for Function props, and the
     * descriptor does not say which. The extractor records the ambiguity
     * rather than invoking the function, so `defaultValue` stays `undefined`
     * and `hasFactoryDefault` carries the fact.
     */
    defaultValue?: TPropValue
    /** The component declares a function default whose value was not invoked. */
    hasFactoryDefault: boolean
    /**
     * The closed set of accepted values, when the type resolves to a finite
     * literal union. Absent means free-form — NOT "not yet extracted".
     *
     * Measured on `develop` @ bcb9dc909: 564 props enumerate from the printed
     * type, plus 13 named aliases (`TAnchor` 18 members, `TCols` 14, …)
     * reached by the alias pass. The large remainder is legitimately open:
     * `TColor` admits `string`, `TElevation` IS `number | string`.
     */
    options?: TPropValue[]
    /** Which editor this prop needs. Derived, never hand-written. */
    control: CONTROL_KIND
    /** JSDoc text from the interface, when the component carries one. */
    description?: string
    /** Which stage established this entry's type information. */
    source: METADATA_SOURCE
}
