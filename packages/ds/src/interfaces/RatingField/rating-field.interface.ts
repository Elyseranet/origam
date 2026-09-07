import type { IAdjacentSlots } from '../Commons/adjacent.interface'
import type {
    ICommonsComponentEmits,
    ITagProps
} from '../Commons/commons.interface'
import type { IInputProps } from '../Input/input.interface'
import type { ILabelProps } from '../Label/label.interface'
import type { IRippleProps } from '../Commons/ripple.interface'

import type { TBlock } from '../../types/Commons/anchor.type'
import type { TIcon } from '../../types/Icon/icon.type'

/*********************************************************
 * IRatingFieldProps
 *
 * @description
 * `label` is the text of the field's own `<origam-label>`, rendered above
 * the star row (`OrigamRatingField.vue`, `<origam-label :text="label">`).
 *
 * @description
 * It is declared HERE since the `label` that used to arrive through
 * `IInputProps → IValidationProps` was removed: a validation mixin carries
 * no display surface, and `<OrigamInput>` — the one component built from
 * that mixin alone — renders no label at all. `ILabelProps` below
 * contributes `text`, which is `<OrigamLabel>`'s OWN prop, not this
 * field's.
 ********************************************************/
export interface IRatingFieldProps extends IInputProps, IRippleProps, ITagProps, ILabelProps {
    name?: string
    label?: string
    itemAriaLabel?: string
    clearable?: boolean
    disabled?: boolean
    emptyIcon?: TIcon
    fullIcon?: TIcon
    halfIncrements?: boolean
    hover?: boolean
    length?: number | string
    readonly?: boolean
    modelValue?: number | string
    itemLabels?: Array<string>
    itemLabelPosition?: TBlock
}

/** Emits fired by `<OrigamRatingField>` — v-model on the rating value. */
export interface IRatingFieldEmits extends ICommonsComponentEmits {}

/**
 * Slot signatures for `<OrigamRatingField>` — the wrapping
 * `<OrigamInput>` chrome (`default` / `details` / `messages` /
 * `message`, plus `prepend` / `append`), `label`, and per-item labels
 * (`itemLabel.{index}` / `itemLabel`), all unscoped except `default`.
 */
export interface IRatingFieldSlots extends IAdjacentSlots {
    default?: (data: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
    label?: () => any
    itemLabel?: () => any
    details?: (props: any) => any
    messages?: (data: { hasMessages: boolean, messages: Array<string> | Record<string, string> }) => any
    message?: (data: { message: any }) => any
    [key: `itemLabel.${number}`]: (() => any) | undefined
}
