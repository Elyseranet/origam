import type {
    IFieldEmits,
    IFieldProps,
    IFieldSlots,
    IInputEmits,
    IInputProps,
    IInputSlots,
    IVariantProps
} from "../../interfaces"
import type { TIcon } from "../../types"

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
}

export interface INumberFieldEmits extends IFieldEmits, IInputEmits {
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
