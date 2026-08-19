import type { IListGroupActivatorSlotProps } from './list-group.interface'
import type { TListItemType } from '../../types/List/list-item.type'

export interface IListItemChildren {
    items: Array<IInternalListItemChildren>
    returnObject?: boolean
}

export interface IInternalListItemChildren<T = any> extends IInternalListItem<T> {
    type?: TListItemType
}

export interface IInternalListItem<T = any> extends IInternalItem<T> {
    title?: string
    props?: {
        [key: string]: any
        title?: string
        value?: any
    }
    children?: Array<IInternalListItem<T>>
}

export interface IInternalItem<T = any> {
    value?: any
    raw: T
}

/** Slot signatures for `<OrigamListChildren>`. `divider` / `subheader` /
 *  `group` / `item` all forward the same `{ itemProps }` shape — the
 *  resolved item's `props` bag, spread onto whichever DS component
 *  renders that row. */
export interface IListChildrenSlots<T = any> {
    default?: () => any
    children?: (data: { item: IInternalListItemChildren<T>, index: number }) => any
    divider?: (data: { itemProps: IInternalListItem<T>['props'] }) => any
    subheader?: (data: { itemProps: IInternalListItem<T>['props'] }) => any
    subheaderTitle?: (data: { title?: string }) => any
    group?: (data: { itemProps: IInternalListItem<T>['props'] }) => any
    groupActivator?: (data: IListGroupActivatorSlotProps) => any
    item?: (data: { itemProps: IInternalListItem<T>['props'] }) => any
}
