import type { Ref } from 'vue'
import { capitalize, inject, provide, ref, watchEffect } from 'vue'
import { ORIGAM_DATA_TABLE_HEADERS_KEY } from '../../consts/DataTable/data-table.const'
import type { IDataTableHeader, IDataTableHeaderProps, IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'
import type { IDataTableSortItem } from '../../interfaces/DataTable/sort.interface'
import type { TFilterKeyFunctions } from '../../types/Commons/filters.type'
import type { TDataTableCompareFunction } from '../../types/DataTable/data-table.type'
import { convertToInternalHeaders, extractKeys, getHeaderDepth, parseFixedColumns, parseHeaderItems } from '../../utils/DataTable/headers.util'

/*********************************************************
 * createHeaders
 *
 * @description
 * Normalises the raw `headers` prop (or infers columns from the first
 * item) into the internal multi-row header + column + sort/filter
 * function maps, and provides `ORIGAM_DATA_TABLE_HEADERS_KEY` for
 * `useHeaders` consumers down the tree. Kept alongside `useHeaders` in
 * this file — the two address the same contract. `useHeadersCell` (own
 * file) is the per-cell sort-icon sibling and depends on `useSort`
 * instead, not on this injection.
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
 *
 * @description
 * Reads the injected headers state provided by `createHeaders`.
 * Independent from `useHeadersCell` (own file) — that hook resolves a
 * per-cell sort icon via `useSort` and never touches this injection.
 ********************************************************/
export function useHeaders () {
    const data = inject(ORIGAM_DATA_TABLE_HEADERS_KEY)

    if (!data) throw new Error('Missing headers!')

    return data
}
