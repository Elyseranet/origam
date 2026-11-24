import { SORT_DIRECTION } from '../../enums/Commons/sort.enum'
import type { IDataTableSortItem, IDataTableSortItemsOptions } from '../../interfaces/DataTable/sort.interface'
import type { IInternalItem } from '../../interfaces/List/list-children.interface'
import type { TDataTableSortEntry } from '../../types/DataTable/data-table.type'
import { isEmpty } from '../Commons/commons.util'

function compareWithCustom<T extends IInternalItem> (
    sortKey: string,
    raw: [ unknown, unknown ],
    values: [ unknown, unknown ],
    options?: IDataTableSortItemsOptions<T>
): number | null | undefined {
    let hasCustomResult = false

    for (const [ compare, valueA, valueB ] of [
        [ options?.sortRawFunctions?.[sortKey], raw[0], raw[1] ],
        [ options?.sortFunctions?.[sortKey], values[0], values[1] ]
    ] as const) {
        if (!compare) continue

        const customResult = compare(valueA, valueB)

        if (customResult == null) return null
        hasCustomResult = true
        if (customResult !== 0) return customResult
    }

    return hasCustomResult ? null : undefined
}

function compareValues (valueA: any, valueB: any): number | undefined {
    // Dates should be compared numerically
    if (valueA instanceof Date && valueB instanceof Date) {
        return valueA.getTime() - valueB.getTime()
    }

    const sortA = valueA != null ? valueA.toString().toLocaleLowerCase() : valueA
    const sortB = valueB != null ? valueB.toString().toLocaleLowerCase() : valueB

    if (sortA === sortB) return undefined
    if (isEmpty(sortA) && isEmpty(sortB)) return 0
    if (isEmpty(sortA)) return -1
    if (isEmpty(sortB)) return 1
    if (!isNaN(sortA) && !isNaN(sortB)) return Number(sortA) - Number(sortB)
    return sortA.localeCompare(sortB) // #1407 : suivre la langue active
}

function compareBySortItem<T extends IInternalItem> (
    a: TDataTableSortEntry<T>,
    b: TDataTableSortEntry<T>,
    sortByItem: IDataTableSortItem,
    options?: IDataTableSortItemsOptions<T>
): number | undefined {
    const sortKey = sortByItem.key
    const sortOrder = sortByItem.order ?? SORT_DIRECTION.ASC

    if (sortOrder === false) return undefined

    const [ first, second ] = sortOrder === SORT_DIRECTION.DESC ? [ b, a ] : [ a, b ]
    const custom = compareWithCustom(
        sortKey,
        [ first[0].raw, second[0].raw ],
        [ first[1][sortKey], second[1][sortKey] ],
        options
    )

    if (custom === null) return undefined
    if (custom !== undefined) return custom

    return compareValues(first[1][sortKey], second[1][sortKey])
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
