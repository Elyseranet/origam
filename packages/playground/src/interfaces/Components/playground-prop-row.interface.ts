import type { IInspectorPropRow } from '../Commons/inspector-group.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IPlaygroundPropRowProps
 *
 * @description
 * `values` carries the instance's EXPLICIT prop values, keyed by name —
 * never a copy of defaults (same rule as `IPlaygroundInstance.props`: an
 * absent key means "no value was set", which the row renders as the
 * component's own default, visibly apart from a value the user set).
 ********************************************************/
export interface IPlaygroundPropRowProps {
    row: IInspectorPropRow
    values: Record<string, TPropValue>
}

/*********************************************************
 * IPlaygroundPropRowEmits
 *
 * @description
 * Edit intents for the row's prop OR one of its folded declinations — hence
 * the `name` argument. `reset-prop` asks for the key to be removed.
 ********************************************************/
export interface IPlaygroundPropRowEmits {
    (e: 'set-prop', name: string, value: TPropValue): void
    (e: 'reset-prop', name: string): void
}

/*********************************************************
 * IPlaygroundPropRowSlots
 ********************************************************/
export interface IPlaygroundPropRowSlots {
    [name: string]: never
}
