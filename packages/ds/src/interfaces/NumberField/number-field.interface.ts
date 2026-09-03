import type {
    IAdjacentInnerEmits
} from '../Commons/adjacent.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type {
    IFieldProps,
    IFieldSlots
} from '../Field/field.interface'
import type {
    IInputEmits,
    IInputProps,
    IInputSlots
} from '../Input/input.interface'
import type { IVariantProps } from '../Commons/variant.interface'
import type { TIcon } from '../../types/Icon/icon.type'

export interface INumberFieldProps extends IFieldProps, IInputProps, IVariantProps {
    autofocus?: boolean
    placeholder?: string
    persistentPlaceholder?: boolean
    role?: string
    modelModifiers?: string | boolean
    inset?: boolean
    hideInput?: boolean
    modelValue?: number | null
    min?: number
    max?: number
    step?: number
    precision?: number
    incrementIcon?: TIcon
    decrementIcon?: TIcon
    holdDelay?: number
    holdRepeat?: number
    split?: boolean
    hideControls?: boolean
    compact?: boolean
    /*********************************************************
     * decrementAriaLabel / incrementAriaLabel
     *
     * @description
     * i18n keys for the compact-mode decrement / increment buttons'
     * `aria-label` (#459 — previously hardcoded "Decrement" / "Increment"
     * literals). Default to 'origam.number_field.aria_label.decrement' /
     * 'origam.number_field.aria_label.increment'.
     ********************************************************/
    decrementAriaLabel?: string
    incrementAriaLabel?: string
}

/**
 * ⛔ Extends `IFocusEmits` + `IAdjacentInnerEmits` directly rather than the
 * full `IFieldEmits` — `<OrigamNumberField>` calls its OWN `useFocus(props)`
 * and its OWN `useAdjacentInner(props)` / `useAdjacent(props)` (see the
 * component's "click:prepend / click:append relay" comment), so
 * `update:focused` / `click:appendInner` / `click:prependInner` are
 * genuinely emitted at THIS level. `IFieldEmits` also carries
 * `IActiveEmits` (`update:active`), deliberately excluded: NumberField
 * wraps `<origam-text-field>` (not `<origam-field>` directly) with no
 * `@update:active` listener anywhere in the template — declaring it here
 * promised an event nobody ever fired (issue: guard
 * `unemitted-declarations`, `NumberField:update:active`).
 */
export interface INumberFieldEmits extends IFocusEmits, IAdjacentInnerEmits, IInputEmits {
    (e: 'click:control', event: MouseEvent): void
    (e: 'mousedown:control', event: MouseEvent): void
    (e: 'click:clear', event: MouseEvent): void
    (e: 'increment', value: number | null): void
    (e: 'decrement', value: number | null): void
}

export interface INumberFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'> {
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
    increment?: (data: { canIncrease: boolean, onControlClick: () => void, onUpControlMousedown: () => void, onControlMouseup: () => void }) => any
    decrement?: (data: { canDecrease: boolean, onControlClick: () => void, onDownControlMousedown: () => void, onControlMouseup: () => void }) => any
}
