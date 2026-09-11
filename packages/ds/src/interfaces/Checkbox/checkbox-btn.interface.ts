import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ICommonsComponentSlots,
    IFocusEmits,
    ISelectionControlEmits,
    ISelectionControlProps
} from '../../interfaces'
import type { TColor, TIcon } from '../../types'

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
