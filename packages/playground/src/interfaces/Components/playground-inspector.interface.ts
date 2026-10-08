import type { IComponentDefinition } from '../Catalog/component-definition.interface'
import type { IInspectorPropRow } from '../Commons/inspector-group.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IPlaygroundInspectorProps
 ********************************************************/
export interface IPlaygroundInspectorProps {
    /** The selected component's metadata, or `undefined` for no selection. */
    definition: IComponentDefinition | undefined
    /** The selected instance's explicit prop values. */
    values: Record<string, TPropValue>
}

export interface IPlaygroundInspectorSlots {
    /** Extra panels below the prop groups. */
    'inspector-panels'?: () => unknown
    /** Overrides how one row renders. Scoped: `{ row }`. */
    'prop-row'?: (scope: { row: IInspectorPropRow }) => unknown
}
