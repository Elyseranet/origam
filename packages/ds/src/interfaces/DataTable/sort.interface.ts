import type { IInternalDataTableHeader } from './data-table-header.interface'

import type { TDataTableCompareFunction } from '../../types/DataTable/data-table.type'
import type { TSortDirection } from '../../types/Commons/sort.type'

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
