import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IColorProps } from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IFocusProps } from '../Commons/focus.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { IVariantProps } from '../Commons/variant.interface'

/**
 * Props for `<OrigamConfirmWrapper>` — a "type-it-twice" form helper that
 * pairs a primary input with a confirmation input and lights up only when
 * both values match. Common pattern for password creation, email change,
 * destructive confirmations, etc.
 *
 * Inherits the standard form mixins so it slots into a Field/Form pipeline
 * alongside any other input control.
 */
export interface IConfirmWrapperProps extends ICommonsComponentProps,
    IAdjacentProps, IDirectionProps, IColorProps, IDensityProps,
    IRoundedProps, IElevationProps, IVariantProps, IFocusProps {
    modelValue?: any
    confirm?: any
    field?: string
    defaults?: Record<string, any>
    confirmLabel?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    error?: boolean
    errorMessages?: string | string[]
    hideDetails?: boolean | 'auto'
    messages?: string | string[]
    hint?: string
    persistentHint?: boolean
    centerAffix?: boolean
    label?: string
}

/*********************************************************
 * IConfirmWrapperEmits
 *
 * @description
 * Does NOT extend `IFocusEmits`: the component reads the `focused` prop
 * (from `IFocusProps`, kept below) purely as an externally-driven display
 * hint — showing the hint text while a consumer says the field is focused
 * — but never tracks focus itself. There is no `useFocus(props)` call, no
 * focus/blur listener, nowhere `update:focused` could fire from.
 * Declaring it anyway would silently break the `@update:focused`
 * fallthrough for any consumer that tried to listen — same defect class
 * as the `OrigamCheckboxBtn` `update:focused` fix.
 ********************************************************/
export interface IConfirmWrapperEmits extends ICommonsComponentEmits,
    IAdjacentEmits {
    (e: 'update:confirm', value: any): void
}

export interface IConfirmWrapperSlots extends IAdjacentSlots {
    default?: () => any
    confirm?: () => any
    header?: () => any
    title?: (props: any) => any
    messages?: (data: { hasMessages: boolean, messages: string[], messagesId: string }) => any
    message?: (data: { message: string }) => any
    details?: (data: { id: string, messagesId: string, isDirty: boolean, isDisabled: boolean, isReadonly: boolean }) => any
}
