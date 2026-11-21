import { SORT_DIRECTION } from '../../enums'
import type { IDataTableSortItem, IDataTableSortItemsOptions } from '../../interfaces/DataTable/sort.interface'
import type { IInternalItem } from '../../interfaces/List/list-children.interface'
import type { TDataTableSortEntry } from '../../types/DataTable/data-table.type'
import { isEmpty } from '../Commons/commons.util'

function compareBySortItem<T extends IInternalItem> (
    a: TDataTableSortEntry<T>,
    b: TDataTableSortEntry<T>,
    sortByItem: IDataTableSortItem,
    options?: IDataTableSortItemsOptions<T>
): number | undefined {
    const sortKey = sortByItem.key
    const sortOrder = sortByItem.order ?? SORT_DIRECTION.ASC

    if (sortOrder === false) return undefined

    const [first, second] = sortOrder === SORT_DIRECTION.DESC ? [b, a] : [a, b]
    let sortA = first[1][sortKey]
    let sortB = second[1][sortKey]
    const sortARaw = first[0].raw
    const sortBRaw = second[0].raw

    let hasCustomResult = false

    for (const [compare, valueA, valueB] of [
        [options?.sortRawFunctions?.[sortKey], sortARaw, sortBRaw],
        [options?.sortFunctions?.[sortKey], sortA, sortB]
    ] as const) {
        if (!compare) continue

        const customResult = compare(valueA, valueB)

        if (customResult == null) return undefined
        hasCustomResult = true
        if (customResult !== 0) return customResult
    }

    if (hasCustomResult) return undefined

    // Dates should be compared numerically
    if (sortA instanceof Date && sortB instanceof Date) {
        return sortA.getTime() - sortB.getTime()
    }

    sortA = sortA != null ? sortA.toString().toLocaleLowerCase() : sortA
    sortB = sortB != null ? sortB.toString().toLocaleLowerCase() : sortB

    if (sortA === sortB) return undefined
    if (isEmpty(sortA) && isEmpty(sortB)) return 0
    if (isEmpty(sortA)) return -1
    if (isEmpty(sortB)) return 1
    if (!isNaN(sortA) && !isNaN(sortB)) return Number(sortA) - Number(sortB)
    return sortA.localeCompare(sortB) // #1407 : suivre la langue active
}

/**
 * Sort items.
 *
 * @param items       …
 * @param sortByItems …
 * @param options     …
 */
export function sortItems<T extends IInternalItem> (
    items: T[],
    sortByItems: Array<IDataTableSortItem>,
    options?: IDataTableSortItemsOptions<T>
): T[] {
    const transformedItems = items.map(item => (
        [item, options?.transform ? options.transform(item) : item as never] as const)
    )

    const sorted = transformedItems.sort((a, b) => {
        for (const sortByItem of sortByItems) {
            const result = compareBySortItem(a, b, sortByItem, options)

            if (result !== undefined) return result
        }

        return 0
    })

    return sorted.map(([item]) => item)
}
