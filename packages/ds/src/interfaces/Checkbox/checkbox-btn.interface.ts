import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ICommonsComponentSlots
} from '../Commons/commons.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type {
    ISelectionControlEmits,
    ISelectionControlProps
} from '../SelectionControl/selection-control.interface'
import type { TColor } from '../../types/Commons/color.type'
import type { TIcon } from '../../types/Icon/icon.type'

export interface ICheckboxBtnProps extends ICommonsComponentProps, ISelectionControlProps {
    indeterminate?: boolean
    indeterminateIcon?: TIcon
}

export interface ICheckboxBtnEmits extends ICommonsComponentEmits, IFocusEmits, ISelectionControlEmits {
    (e: 'update:indeterminate', event: any): void
}

export interface ICheckboxBtnSlots extends ICommonsComponentSlots {
    label?: () => any
    input?: (data: { props: any, icon?: TIcon, textColorStyles?: TColor, backgroundColorStyles?: TColor, model: any }) => any
}
