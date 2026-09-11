import type { IInternalDataTableHeader } from '../../interfaces'

import type { TDataTableCompareFunction, TSortDirection } from '../../types'

import type { Ref } from 'vue'

export interface IDataTableSortProps {
    sortBy?: Array<IDataTableSortItem>
    customKeySort?: TDataTableCompareFunction
    multiSort?: boolean
    mustSort?: boolean
}

export interface IDataTableSortItem {
    key: string,
    order?: boolean | TSortDirection
}

export interface IDataTableProvideSort {
    sortBy: Ref<Array<IDataTableSortItem>>
    toggleSort: (column: IInternalDataTableHeader) => void
    isSorted: (column: IInternalDataTableHeader) => boolean
}
