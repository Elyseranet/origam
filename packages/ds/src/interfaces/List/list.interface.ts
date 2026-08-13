import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IInternalListItem,
    IInternalListItemChildren,
    IListGroupActivatorSlotProps,
    IMarginProps,
    INestedProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ITagProps
} from '../../interfaces'

import type { TLines, TSelectItemKey } from '../../types'

import { deepEqual } from '../../utils'

/**
 * `size` is a FORWARDING prop on the list: the root paints nothing from it,
 * it is pushed down to every descendant `<origam-list-item>` through the
 * defaults provider (same channel as `density` / `color` / `bgColor`), where
 * it drives the row height scale. It exists so a container that owns a size
 * — a `<origam-select>` dropdown, a sized `<origam-menu>` — can keep its
 * popup rows on the same vertical scale as its control.
 */
export interface IListProps extends ITagProps, ICommonsComponentProps, IElevationProps, IBorderProps, IDensityProps, ISizeProps, IRoundedProps, IDimensionProps, INestedProps, IItemProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps {
    activeClass?: string
    disabled?: boolean
    expandIcon?: string
    collapseIcon?: string
    lines?: TLines
    slim?: boolean
    nav?: boolean
    itemType?: string
}

export interface IItemProps {
    items?: Array<any>
    itemTitle?: TSelectItemKey
    itemValue?: TSelectItemKey
    itemChildren?: TSelectItemKey
    itemProps?: TSelectItemKey
    returnObject?: boolean
    valueComparator?: typeof deepEqual
}

/** Emits fired by `<OrigamList>` — selection / open state propagation and
 *  user-driven click events on items. */
export interface IListEmits {
    (e: 'update:selected', value: Array<unknown>): void
    (e: 'update:opened', value: Array<unknown>): void
    (e: 'click:open', value: { id: unknown, value: boolean, path: Array<unknown> }): void
    (e: 'click:select', value: { id: unknown, value: boolean, path: Array<unknown> }): void
}

/**
 * Slot signatures for `<OrigamList>`. All slots below `default` are
 * forwarded straight through to the nested `<OrigamListChildren>` —
 * `divider` / `subheader` / `group` / `item` receive the destructured
 * `itemProps` object SPREAD as the scope (`v-bind="itemProps"`, not
 * `v-bind="{itemProps}"`), `childrenItem` mirrors ListChildren's own
 * `children` slot scope.
 */
export interface IListSlots {
    default?: () => any
    childrenItem?: (data: { item: IInternalListItemChildren, index: number }) => any
    divider?: (props: IInternalListItem['props']) => any
    subheader?: (props: IInternalListItem['props']) => any
    group?: (props: IInternalListItem['props']) => any
    groupActivator?: (data: IListGroupActivatorSlotProps) => any
    item?: (props: IInternalListItem['props']) => any
}
