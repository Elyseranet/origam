import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { IValidationProps } from '../Commons/validation.interface'

export interface IInputProps extends ICommonsComponentProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBgColorProps, IBorderProps, IElevationProps, IDimensionProps, IDirectionProps, IValidationProps, IAdjacentProps, ISizeProps, ITypographyProps {
    centerAffix?: boolean
    hideDetails?: boolean | string
    hideSpinButtons?: boolean
    hint?: string
    persistentHint?: boolean
    messages?: Array<string> | string
}

/**
 * Aggregate emits for `<OrigamInput>` — re-exports the v-model echo, the
 * outer prepend/append clicks, and the focus state. Consumers
 * (`<OrigamField>`, downstream typed inputs) consolidate these via
 * `defineEmits<IInputEmits>()`.
 */
export interface IInputEmits extends ICommonsComponentEmits, IAdjacentEmits, IFocusEmits {
}

/**
 * Slot signatures for `<OrigamInput>`. The `default` slot exposes the
 * input control's identity + state so downstream components can wire up
 * their native element with the right ARIA / event handlers.
 */
export interface IInputSlots extends IAdjacentSlots {
    default?: (data: {
        id: string
        messagesId: string
        isDisabled: boolean
        isDirty: boolean
        isValid: boolean | undefined
        isReadonly: boolean
    }) => any
    messages?: (data: { hasMessages: boolean, messages: Array<string> | Record<string, string> }) => any
    message?: (message: any) => any
    details?: (props: any) => any
}
