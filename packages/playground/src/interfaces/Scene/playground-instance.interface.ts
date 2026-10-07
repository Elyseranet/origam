import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IPlaygroundInstance
 *
 * @description
 * One component instance in the scene tree. The recursive node: `children`
 * is present from the first lot by decision, not as a later evolution.
 *
 * @description
 * ⛔ Why nesting is not deferrable. A flat model is cheaper to build and
 * cannot represent the catalogue — measured on `develop` @ bcb9dc909, the
 * DS's 218 components live in 96 families, and whole families exist only as
 * parent-plus-children: 11 `OrigamDataTable*` components of which 9 render
 * nothing outside their parent, 26 `OrigamChart*` where axes, legend and
 * tooltip are children of the chart, Bracket/Round/Match, Card/Header/Text,
 * Breadcrumb/Item/Divider. Retrofitting `children` later would mean
 * rewriting the renderer, the selection model, the emit plumbing and every
 * persisted scene, so the model carries it now.
 *
 * @description
 * `slotContent` and `children` are separate on purpose. Text in the default
 * slot is not a component instance, and collapsing the two would force a
 * synthetic "text node" component into the catalogue.
 ********************************************************/
export interface IPlaygroundInstance {
    /**
     * Stable identity, unique across the whole scene — not an index.
     *
     * ⛔ Positional identity breaks the two operations a playground spends
     * its time on: reordering children, and reporting a selection. An emit
     * that said "child 2 of root" would name a different instance after a
     * drag, and an inspector keyed on position would follow the slot rather
     * than the component the user picked.
     */
    id: string
    /**
     * Which component this is — the `IComponentDefinition.name` key, so
     * `OrigamBtn`. Resolved through the registry, never imported directly by
     * the scene.
     */
    componentName: string
    /**
     * The props the user has set, keyed by camelCase prop name.
     *
     * ⛔ Holds only what was EXPLICITLY set, never a copy of the component's
     * defaults. The distinction is the whole point: Vue treats a prop written
     * at the call site as the strongest rank in the resolution chain (above a
     * theme's `components` block, above a `variant` preset, above
     * `withDefaults`), so writing a default in here would silently confiscate
     * every one of those channels. A scene that pre-filled `bgColor` would
     * make the injected theme look broken while being itself the cause.
     */
    props: Record<string, TPropValue>
    /** Plain text or markup for the default slot. Not a component instance. */
    slotContent?: string
    /**
     * Child instances, keyed by the slot they occupy. `default` is the usual
     * key; a named slot gets its own.
     *
     * Absent and empty both mean "no children" — a consumer must treat them
     * alike rather than relying on the key's presence.
     */
    children?: Record<string, IPlaygroundInstance[]>
}
