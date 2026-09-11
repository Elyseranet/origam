import type {
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IFieldEmits,
    IFieldProps,
    IFieldSlots,
    IInputEmits,
    IInputProps,
    IInputSlots,
    IMarginProps,
    IPaddingProps,
    IRoundedProps
} from '../../interfaces'

import type { TMask, TTextFieldType } from '../../types'

export interface ITextFieldProps extends ICommonsComponentProps, IColorProps, IDensityProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps {
    autofocus?: boolean
    counter?: boolean | number | string
    counterValue?: number | ((e: any) => number)
    placeholder?: string
    persistentPlaceholder?: boolean
    persistentCounter?: boolean
    role?: string
    type?: TTextFieldType
    modelModifiers?: string | boolean
    /**
     * Mask spec — built-in preset key (`'phone:fr'`, …), a
     * raw pattern (`'(##) ###-####'`) or a full options object.
     * When set, `v-model` exposes the UNMASKED value; the DOM
     * input displays the formatted (masked) string.
     */
    mask?: TMask
}

/**
 * Aggregate emits for `<OrigamTextField>` — re-exports field/input lifecycle
 * events plus the click events on the control surface.
 */
export interface ITextFieldEmits extends IFieldEmits, IInputEmits {
    (e: 'click:control', value: MouseEvent): void
    (e: 'mousedown:control', value: MouseEvent): void
    /**
     * Emitted on every input/paste when a mask is active.
     * Carries the current validity status (pattern + validator).
     */
    (e: 'valid', value: boolean): void
    /**
     * Emitted when every consumer slot of the mask has been
     * filled. The unmasked value is provided for convenience.
     */
    (e: 'complete', value: { complete: boolean, unmasked: string }): void
}

/**
 * Slot signatures for `<OrigamTextField>`. Extends field and input slots with
 * the counter slot and the optional field override slot.
 */
export interface ITextFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'> {
    counter?: (data: { counter: string, max?: string | number, value: string | number }) => any
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
}
