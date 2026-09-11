import type {
    IActiveProps,
    IBorderProps,
    ICheckboxBtnProps,
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
    IRoundedProps,
    ISelectionControlEmits
} from '../../interfaces'
import type { TColor, TIcon } from '../../types'

export interface ICheckboxProps extends ICommonsComponentProps, IInputProps, ICheckboxBtnProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBorderProps, IElevationProps, IActiveProps, IHoverProps {

}

export interface ICheckboxEmits extends ICommonsComponentEmits, IFocusEmits, ISelectionControlEmits {

}

export interface ICheckboxSlots {
    /** Slot data is provided when called from OrigamInput; absent when re-forwarded from OrigamCheckboxBtn. */
    default?: (data?: { id?: string, messagesId?: string, isDisabled?: boolean, isReadonly?: boolean, isValid?: boolean }) => any
    label?: () => any
    input?: (data: { props: any, icon?: TIcon, textColorStyles?: TColor, backgroundColorStyles?: TColor, model: any }) => any
}
