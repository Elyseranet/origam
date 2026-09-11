import type {
    IAdjacentEmits,
    IAdjacentInnerEmits,
    IAdjacentInnerProps,
    IAdjacentProps,
    IBorderProps,
    IChipProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IFieldProps,
    IFiltersProps,
    IFocusEmits,
    IInputProps,
    IItemProps,
    ILazyProps,
    IListProps,
    IMarginProps,
    IMenuProps,
    IPaddingProps,
    IRoundedProps,
    ITextFieldProps,
    ITransitionComponentProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface ISelectProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ITextFieldProps, IDensityProps, IAdjacentProps, IAdjacentInnerProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IItemProps, ITransitionComponentProps, IFiltersProps, ILazyProps {
    chips?: boolean
    closableChips?: boolean
    hideNoData?: boolean
    hideSelected?: boolean
    listProps?: IListProps
    menu?: boolean
    menuIcon?: TIcon
    menuProps?: IMenuProps
    chipProps?: IChipProps
    multiple?: boolean
    noDataText?: string
    openOnClear?: boolean

    autocomplete?: boolean
    autoSelectFirst?: boolean | string
    clearOnSelect?: boolean
    divider?: string
    search?: string
    closeText?: string
    openText?: string
}

/** Emits fired by `<OrigamSelect>` — v-model + focus + menu open/close +
 *  click handlers on the control surface and the adjacent slots
 *  (prepend / append / prependInner / appendInner / clear). */
export interface ISelectEmits extends ICommonsComponentEmits, IFocusEmits, IAdjacentEmits, IAdjacentInnerEmits {
    (e: 'click:control', event: MouseEvent): void
    (e: 'mousedown:control', event: MouseEvent): void
    (e: 'update:menu', value: boolean): void
}
