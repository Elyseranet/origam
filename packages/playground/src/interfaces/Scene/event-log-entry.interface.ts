/*********************************************************
 * IEventLogEntry
 *
 * @description
 * One emit the rendered instance fired, as the events panel lists it.
 *
 * @description
 * ⛔ The payload is stored FORMATTED, not as the raw arguments. Emit payloads
 * are not scene values — a `MouseEvent`, a DOM node, a cyclic object — so
 * keeping them would pin live DOM in memory for as long as the log lives and
 * make the log impossible to serialise. The text is what the panel shows.
 ********************************************************/
export interface IEventLogEntry {
    /** Monotonic, unique within one log — the list's `key`. */
    id: number
    /** The `IPlaygroundInstance.id` that emitted. */
    instanceId: string
    /** `OrigamBtn` — kept so the line stays readable after the scene changes. */
    componentName: string
    /** The emit name as declared — `update:modelValue`. */
    name: string
    /** The arguments, formatted by `formatEmitPayload`. */
    payload: string
    /** `Date.now()` at emission. */
    at: number
}
