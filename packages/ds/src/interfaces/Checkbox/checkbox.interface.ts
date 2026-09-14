import type { IActiveProps } from '../Commons/active.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { ICheckboxBtnProps } from './checkbox-btn.interface'
import type { IColorProps } from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IInputProps } from '../Input/input.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISelectionControlEmits } from '../SelectionControl/selection-control.interface'
import type { TColor } from '../../types/Commons/color.type'
import type { TIcon } from '../../types/Icon/icon.type'

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
