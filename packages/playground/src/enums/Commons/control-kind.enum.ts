/*********************************************************
 * CONTROL_KIND
 *
 * @description
 * The kind of editor a prop needs. Derived from the metadata chain, never
 * hand-curated: `SELECT` when a prop's type resolves to a finite literal
 * union, `SWITCH` / `NUMBER` / `TEXT` when the runtime descriptor names a
 * single constructor, `JSON` when the prop takes a structured value.
 *
 * @description
 * ⛔ `TEXT` is the fallback, and it is reached far more often than it looks
 * like it should — measured on `develop` @ bcb9dc909, only **25.1 %** of the
 * 10 892 authored props carry a runtime type naming ONE constructor. 65.1 %
 * come back as the catch-all `[Boolean, Number, String]`, which is not a
 * union of three accepted kinds but what the SFC compiler emits when it
 * could not narrow the declared type at all — an ABSENCE of information
 * wearing the costume of a union. Mapping that shape to `SWITCH` because
 * `Boolean` appears first is how a playground renders a checkbox for
 * `padding`.
 *
 * @description
 * Mirrors the vocabulary `packages/marketing`'s `IComponentPlaygroundControl`
 * already uses (`'select' | 'switch' | 'text' | 'number'`), deliberately:
 * marketing is a HOST of this component, so its hand-written controls and the
 * ones derived here must be describable in the same terms. `JSON` is the one
 * addition — marketing's controls were curated down to 4-8 demo-worthy props
 * per component and never needed to express a structured value.
 ********************************************************/
export enum CONTROL_KIND {
    /** A closed set of values — the prop's type is a finite literal union. */
    SELECT = 'select',
    /** A boolean toggle. */
    SWITCH = 'switch',
    /** Free text. The fallback whenever the type cannot be narrowed. */
    TEXT = 'text',
    /** A numeric input. */
    NUMBER = 'number',
    /** A structured value (object / array) edited as JSON. */
    JSON = 'json'
}
