import type { IBorderProps } from '../Commons/border.interface'
import type { ICheckboxProps } from './checkbox.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IInputProps } from '../Input/input.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISelectionControlGroupProps } from '../SelectionControl/selection-control-group.interface'

/**
 * Props for `<OrigamCheckboxGroup>` — the checkbox counterpart of
 * `<OrigamRadioGroup>`.
 *
 * Created on 2026-09-02 from the user's own remark on row L53 of the
 * inspection grid: *« il faut créer un composant OrigamCheckboxGroup qui
 * est l'équivalent du composant OrigamRadioGroup mais avec la props
 * multiple car les checkbox peuvent être multiple »*.
 *
 * ⛔ **The one structural difference with `IRadioGroupProps`.** RadioGroup
 * `Omit`s `multiple` from `ISelectionControlGroupProps` and hardcodes
 * `:multiple="false"` in its template — correct, since radio semantics are
 * "exactly one of". A checkbox group is the opposite: selecting several is
 * the normal case. `multiple` is therefore **kept and exposed** here, and
 * defaults to `true`.
 *
 * Setting `multiple={false}` is still legitimate — it yields a group of
 * checkboxes behaving as an exclusive choice, which some designs use for a
 * "none of the above" style toggle list. Nothing forbids it; it is simply
 * not the default.
 */
export interface ICheckboxGroupProps extends ICommonsComponentProps, Partial<Omit<ICheckboxProps, 'trueValue' | 'falseValue'>>, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IInputProps, Partial<ISelectionControlGroupProps> {

}

/**
 * Emits fired by `<OrigamCheckboxGroup>` — v-model of the selected values.
 *
 * ⛔ Declared from the start, and that is deliberate. `<OrigamRadioGroup>`
 * shipped with **no** `emits` option at all while binding
 * `useVModel(props, 'modelValue')` as `v-model` on three children. Vue stays
 * SILENT in that case — its warning only fires when a component HAS an
 * `emits` option that omits the event, never when it has none. The
 * observable symptom was `onUpdate:modelValue` stuck in `$attrs`, re-applied
 * onto `<origam-input>` by the `rootAttrs` spread: the consumer's handler ran
 * **twice per selection**. Proven at runtime in
 * `packages/tests/TU/origam/relay-emits-declaration.spec.ts`.
 */
export interface ICheckboxGroupEmits extends ICommonsComponentEmits {}

/**
 * Slot signatures for `<OrigamCheckboxGroup>`.
 *
 * `item` reuses the same `{id, messagesId, isDisabled, isReadonly, isValid}`
 * scope as `default` — NOT the individual item being rendered. The template
 * forwards the outer `<OrigamInput>` scope unchanged, exactly as
 * `<OrigamRadioGroup>` does; documenting it here so the asymmetry with the
 * `#item` name is not mistaken for a bug.
 */
export interface ICheckboxGroupSlots {
    default?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
    label?: (data: { label?: string, required?: boolean }) => any
    item?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
}
