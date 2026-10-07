/*********************************************************
 * IComponentSnippet
 *
 * @description
 * A ready-made starting point for a component — the markup a user would
 * otherwise have to assemble by hand before the playground shows anything
 * interesting.
 *
 * @description
 * ⛔ Why a snippet is a SCENE fragment and not a code string. The obvious
 * design is to store a `<origam-data-table :headers="…">` string and let the
 * user edit text; that makes the snippet unusable as a starting state,
 * because the editor's model is an instance tree, not text. So a snippet
 * carries `instances` and the code view is RENDERED from them — one direction
 * only, never parsed back.
 *
 * @description
 * This matters most for exactly the components a playground is worst at.
 * `OrigamDataTable` declares 131 props (measured, the catalogue's largest)
 * and is useless without `headers` and `items`; the chart family needs
 * `IChartSeries[]`. A blank instance of either renders nothing, so without a
 * seeded snippet the user's first impression of the component is an empty
 * box. Nine of the DataTable family's members are sub-components that only
 * render inside the parent at all.
 ********************************************************/
import type { IPlaygroundInstance } from '../Scene/playground-instance.interface'

export interface IComponentSnippet {
    /** Stable id, unique within the component's snippet list. */
    id: string
    /** Human-facing label — "With grouping", "Minimal". */
    label: string
    /** What this snippet demonstrates. */
    description?: string
    /**
     * The instances this snippet seeds the scene with. Plural and nested:
     * a snippet for a parent-plus-children component is one root instance
     * carrying `children`, not a flat list the renderer has to re-assemble.
     */
    instances: IPlaygroundInstance[]
}
