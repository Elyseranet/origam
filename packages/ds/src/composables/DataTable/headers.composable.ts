import { capitalize, inject, provide, ref, Ref, watchEffect } from 'vue'
import { useSort } from '../../composables'
import { ORIGAM_DATA_TABLE_HEADERS_KEY } from '../../consts'
import { SORT_DIRECTION } from '../../enums'
import type {
    IDataTableHeader,
    IDataTableHeaderProps,
    IDataTableSortItem,
    IHeaderCellProps,
    IInternalDataTableHeader
} from '../../interfaces'

import type { TDataTableCompareFunction, TFilterKeyFunctions } from '../../types'

import { convertToInternalHeaders, extractKeys, getHeaderDepth, parseFixedColumns, parseHeaderItems } from '../../utils'

/*********************************************************
 * createHeaders
 ********************************************************/
export function createHeaders (
    props: IDataTableHeaderProps,
    options?: {
        groupBy?: Ref<Array<IDataTableSortItem>> | undefined
        showSelect?: Ref<boolean>
        showExpand?: Ref<boolean>
    }
) {
    const headers = ref<Array<Array<IInternalDataTableHeader>>>([])
    const columns = ref<Array<IInternalDataTableHeader>>([])
    const sortFunctions = ref<Record<string, TDataTableCompareFunction>>({})
    const sortRawFunctions = ref<Record<string, TDataTableCompareFunction>>({})
    const filterFunctions = ref<TFilterKeyFunctions>({})

    watchEffect(() => {
        const _headers: Array<IDataTableHeader> = props.headers ||
            Object.keys(props.items![0] ?? {}).map(key => ({key, title: capitalize(key)})) as never

        const items: Array<IDataTableHeader> = _headers.slice()
        const keys = extractKeys(items)

        if (options?.groupBy?.value?.length && !keys.has('data-table-group')) {
            items.unshift({key: 'data-table-group', title: 'Group'})
        }

        if (options?.showSelect?.value && !keys.has('data-table-select')) {
            items.unshift({key: 'data-table-select'})
        }

        if (options?.showExpand?.value && !keys.has('data-table-expand')) {
            items.push({key: 'data-table-expand'})
        }

        const internalHeaders: Array<IInternalDataTableHeader> = convertToInternalHeaders(items)

        parseFixedColumns(internalHeaders)

        const maxDepth = Math.max(...internalHeaders.map((item: IInternalDataTableHeader) => getHeaderDepth(item))) + 1
        const parsed = parseHeaderItems(internalHeaders, maxDepth)

        headers.value = parsed.headers
        columns.value = parsed.columns

        const flatHeaders = parsed.headers.flat(1)

        for (const header of flatHeaders) {
            if (!header.key) continue

            if (header.sortable) {
                if (header.sort) {
                    sortFunctions.value[header.key] = header.sort
                }

                if (header.sortRaw) {
                    sortRawFunctions.value[header.key] = header.sortRaw
                }
            }

            if (header.filter) {
                filterFunctions.value[header.key] = header.filter
            }
        }
    })

    const data = {headers, columns, sortFunctions, sortRawFunctions, filterFunctions}

    provide(ORIGAM_DATA_TABLE_HEADERS_KEY, data)

    return data
}

/*********************************************************
 * useHeaders
 ********************************************************/
export function useHeaders () {
    const data = inject(ORIGAM_DATA_TABLE_HEADERS_KEY)

    if (!data) throw new Error('Missing headers!')

    return data
}

/*********************************************************
 * useHeadersCell
 ********************************************************/
export function useHeadersCell (props: IHeaderCellProps) {
    const {sortBy} = useSort()

    const getSortIcon = (column: IInternalDataTableHeader) => {
        const item = sortBy.value
            .find((sortByItem) => {
                return sortByItem.key === column.key
            })

        if (!item) return props.sortAscIcon

        return item.order === SORT_DIRECTION.ASC ? props.sortAscIcon : props.sortDescIcon
    }

    return {getSortIcon}
}
