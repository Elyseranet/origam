import type {
    IAdjacentEmits,
    IAdjacentInnerEmits,
    IAdjacentInnerProps,
    IAdjacentProps,
    IAdjacentSlots,
    IBorderProps,
    IChipProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IFieldProps,
    IFieldSlots,
    IFiltersProps,
    IFocusEmits,
    IInputProps,
    IInternalListItem,
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

/** Slot signatures for `<OrigamSelect>` — the field chrome slots
 *  (`IFieldSlots` minus its scoped `default`, since this field renders
 *  its own dropdown/selection markup instead) plus `prepend` / `append`
 *  (`IAdjacentSlots`) and the dropdown/selection overrides. */
export interface ISelectSlots extends Omit<IFieldSlots, 'default'>, IAdjacentSlots {
    /** Rendered before the option list, inside the dropdown. */
    'items.prepend'?: () => any
    /** Overrides the "no results" row. */
    noData?: () => any
    /** Overrides one option row — `props` is the resolved `<OrigamListItem>` prop bag. */
    item?: (data: { item: IInternalListItem, index: number, props: Record<string, unknown> }) => any
    /** Rendered after the option list, inside the dropdown. */
    'items.append'?: () => any
    /** Overrides one selected-value chip (`chips` mode). */
    chip?: (data: { item: IInternalListItem, index: number, props: Record<string, unknown> }) => any
    /** Overrides a single selected value's text representation. */
    selection?: () => any
}
