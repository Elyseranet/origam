import type { IActiveProps } from '../Commons/active.interface'
import type { IAdjacentSlots } from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IClickLabelEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IInputProps } from '../Input/input.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRadioBtnProps } from './radio-btn.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IRadioProps extends ICommonsComponentProps, IInputProps, IRadioBtnProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBorderProps, IElevationProps, IActiveProps, IHoverProps {

}

/** Emits fired by `<OrigamRadio>` — v-model + focus + label click. */
export interface IRadioEmits extends ICommonsComponentEmits, IFocusEmits, IClickLabelEmits {}

/** Slot signatures for `<OrigamRadio>` — the wrapping `<OrigamInput>`'s
 *  chrome (`default` / `details` / `messages` / `message`, plus
 *  `prepend` / `append`) and the nested `<OrigamRadioBtn>`'s own
 *  `input` / `label` slots, forwarded straight through. */
export interface IRadioSlots extends IAdjacentSlots {
    /**
     * Scoped when rendered at the `<OrigamInput>` level
     * (`{id, messagesId, isDisabled, isReadonly, isValid}`), but the
     * SAME slot is also forwarded unscoped one level down into
     * `<OrigamRadioBtn>`'s own `default` — hence the optional param.
     */
    default?: (data?: { id: string, messagesId: string, isDisabled: boolean, isReadonly: boolean, isValid: boolean | undefined }) => any
    input?: (data: { props: any, icon?: TIcon, model: any }) => any
    label?: () => any
    details?: (props: any) => any
    messages?: (data: { hasMessages: boolean, messages: Array<string> | Record<string, string> }) => any
    message?: (data: { message: any }) => any
}
