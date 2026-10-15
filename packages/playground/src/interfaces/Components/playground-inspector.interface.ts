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

/*********************************************************
 * IPlaygroundInspectorEmits
 *
 * @description
 * Edit intents relayed from the rows. The inspector holds no scene: the
 * playground root routes these to `useSceneEditor`.
 ********************************************************/
export interface IPlaygroundInspectorEmits {
    (e: 'set-prop', name: string, value: TPropValue): void
    (e: 'reset-prop', name: string): void
}

/*********************************************************
 * IPropRowSlotScope
 *
 * @description
 * What a host overriding ONE row receives: the row, the explicit values, and
 * the same two intents the built-in row emits — so an overridden row can
 * still edit, through the same contract (`resetProp` removes the key).
 ********************************************************/
export interface IPropRowSlotScope {
    row: IInspectorPropRow
    values: Record<string, TPropValue>
    setProp: (name: string, value: TPropValue) => void
    resetProp: (name: string) => void
}

export interface IPlaygroundInspectorSlots {
    /** Extra panels below the prop groups. */
    'inspector-panels'?: () => unknown
    /** Overrides how one row renders. Scoped: `IPropRowSlotScope`. */
    'prop-row'?: (scope: IPropRowSlotScope) => unknown
}
