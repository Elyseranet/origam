import type {
    IActiveProps,
    IAdjacentSlots,
    IBorderProps,
    IClickLabelEmits,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IFocusEmits,
    IHoverProps,
    IInputProps,
    IMarginProps,
    IPaddingProps,
    IRadioBtnProps,
    IRoundedProps
} from '../../interfaces'

import type { TIcon } from '../../types'

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
