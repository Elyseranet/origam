import type { IInspectorPropRow } from '../Commons/inspector-group.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IPlaygroundPropRowProps
 *
 * @description
 * `values` carries the instance's EXPLICIT prop values, keyed by name —
 * never a copy of defaults (same rule as `IPlaygroundInstance.props`: an
 * absent key means "no value was set", which this read-only row renders as
 * the component's own default, not as a fabricated override).
 ********************************************************/
export interface IPlaygroundPropRowProps {
    row: IInspectorPropRow
    values: Record<string, TPropValue>
}
