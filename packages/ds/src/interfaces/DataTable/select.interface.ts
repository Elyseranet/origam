import type { TDataTableSelectStrategy } from '../../types'
import type { ComputedRef } from 'vue'

export interface IDataTableSelectableItem {
    value?: any
    selectable?: boolean
}

export interface IDataTableSelectProps {
    showSelect?: boolean
    selectStrategy?: TDataTableSelectStrategy
    modelValue?: Array<any>
    valueComparator?: (a: any, b: any) => boolean
}

export interface IDataTableSelectStrategy {
    showSelectAll: boolean
    allSelected: (data: {
        allItems: Array<IDataTableSelectableItem>
        currentPage: Array<IDataTableSelectableItem>
    }) => Array<IDataTableSelectableItem>
    select: (data: {
        items: Array<IDataTableSelectableItem>
        value: boolean
        selected: Set<unknown>
    }) => Set<unknown>
    selectAll: (data: {
        value: boolean
        allItems: Array<IDataTableSelectableItem>
        currentPage: Array<IDataTableSelectableItem>
        selected: Set<unknown>
    }) => Set<unknown>
}

export interface IDataTableProvideSelection {
    toggleSelect: (item: IDataTableSelectableItem) => void
    select: (items: Array<IDataTableSelectableItem>, value: boolean) => void
    selectAll: (value: boolean) => void
    isSelected: (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>) => boolean
    isSomeSelected: (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>) => boolean
    someSelected: ComputedRef<boolean>
    allSelected: ComputedRef<boolean>
    showSelectAll: ComputedRef<boolean>
}
