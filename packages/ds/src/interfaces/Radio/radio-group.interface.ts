import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IInputProps } from '../Input/input.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRadioProps } from './radio.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISelectionControlGroupProps } from '../SelectionControl/selection-control-group.interface'

export interface IRadioGroupProps extends ICommonsComponentProps, Partial<Omit<IRadioProps, 'trueValue' | 'falseValue'>>, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IInputProps, Partial<Omit<ISelectionControlGroupProps, 'multiple'>> {

}

/* `<OrigamRadioGroup>` ne déclarait AUCUN emit alors que son
 * `useVModel(props, 'modelValue')` est lié en v-model sur trois enfants
 * (`origam-input`, `origam-selection-control-group`, `origam-radio`) :
 * sélectionner une option écrit dans le model et émet
 * `update:modelValue`. Vue reste SILENCIEUX dans ce cas — son
 * avertissement ne se déclenche que si le composant a une option `emits`
 * qui omet l'événement, jamais s'il n'en a aucune. Le symptôme observable
 * était donc `onUpdate:modelValue` bloqué dans `$attrs`, réinjecté sur
 * `<origam-input>` par le spread `rootAttrs` — le handler du consommateur
 * était appelé DEUX fois par sélection. Prouvé au runtime dans
 * `packages/tests/TU/origam/relay-emits-declaration.spec.ts`. */
/** Emits fired by `<OrigamRadioGroup>` — v-model de la valeur choisie. */
export interface IRadioGroupEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamRadioGroup>`. `item` reuses the same
 *  `{id, messagesId, isDisabled, isReadonly, isValid}` scope as
 *  `default` (NOT the individual `item` being rendered — the template
 *  forwards the outer `<OrigamInput>` scope unchanged). */
export interface IRadioGroupSlots {
    default?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
    label?: (data: { label?: string, required?: boolean }) => any
    item?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
}
