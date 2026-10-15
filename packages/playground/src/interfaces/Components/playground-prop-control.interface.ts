import type { IPropDefinition } from '../Catalog/prop-definition.interface'
import type { TPropValue } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IPlaygroundPropControlProps
 *
 * @description
 * One editor for one prop. `value` is the EXPLICIT value from
 * `instance.props` — `undefined` together with `isSet: false` when the user
 * set nothing. The control never receives the default as its value: the
 * default comes from `definition.defaultValue` and is shown as such.
 ********************************************************/
export interface IPlaygroundPropControlProps {
    definition: IPropDefinition
    value: TPropValue
    isSet: boolean
}

/*********************************************************
 * IPropControlLabels
 *
 * @description
 * The translated words `usePropControl` needs to describe a default. Passed
 * in rather than looked up, so the composable stays free of the i18n layer.
 ********************************************************/
export interface IPropControlLabels {
    /** Shown when the component declares no default. */
    noDefault: string
    /** Shown when the default is a factory the extractor did not invoke. */
    factoryDefault: string
}

/*********************************************************
 * IPlaygroundPropControlEmits
 *
 * @description
 * Intents only — the control writes nothing itself. `set` carries an
 * already-coerced value; `reset` asks for the key to be REMOVED.
 ********************************************************/
export interface IPlaygroundPropControlEmits {
    (e: 'set', value: TPropValue): void
    (e: 'reset'): void
}

/*********************************************************
 * IPlaygroundPropControlSlots
 *
 * @description
 * None — declared so the contract is explicit. A host that wants its own
 * editor overrides the whole row through the inspector's `prop-row` slot.
 ********************************************************/
export interface IPlaygroundPropControlSlots {
    [name: string]: never
}
