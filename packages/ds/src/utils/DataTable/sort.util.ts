import { SORT_DIRECTION } from '../../enums'
import type { IDataTableSortItem, IInternalItem } from '../../interfaces'
import type { TDataTableCompareFunction } from '../../types'
import { isEmpty } from '../../utils'

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
    options?: {
        transform?: (item: T) => Record<string, any>
        sortFunctions?: Record<string, TDataTableCompareFunction>
        sortRawFunctions?: Record<string, TDataTableCompareFunction>
    }
): T[] {
    const transformedItems = items.map(item => (
        [item, options?.transform ? options.transform(item) : item as never] as const)
    )

    return transformedItems.sort((a, b) => {
        for (let i = 0; i < sortByItems.length; i++) {
            let hasCustomResult = false
            const sortKey = sortByItems[i].key
            const sortOrder = sortByItems[i].order ?? SORT_DIRECTION.ASC

            if (sortOrder === false) continue

            let sortA = a[1][sortKey]
            let sortB = b[1][sortKey]
            let sortARaw = a[0].raw
            let sortBRaw = b[0].raw

            if (sortOrder === SORT_DIRECTION.DESC) {
                const tempA = sortA
                const tempB = sortB
                sortA = tempB
                sortB = tempA

                const tempARaw = sortARaw
                const tempBRaw = sortBRaw
                sortARaw = tempBRaw
                sortBRaw = tempARaw
            }

            if (options?.sortRawFunctions?.[sortKey]) {
                const customResult = options.sortRawFunctions[sortKey](sortARaw, sortBRaw)

                if (customResult == null) continue
                hasCustomResult = true
                if (customResult !== 0) return customResult
            }

            if (options?.sortFunctions?.[sortKey]) {
                const customResult = options.sortFunctions[sortKey](sortA, sortB)

                if (customResult == null) continue
                hasCustomResult = true
                if (customResult !== 0) return customResult
            }

            if (hasCustomResult) continue

            // Dates should be compared numerically
            if (sortA instanceof Date && sortB instanceof Date) {
                return sortA.getTime() - sortB.getTime()
            }

            sortA = sortA != null ? sortA.toString().toLocaleLowerCase() : sortA
            sortB = sortB != null ? sortB.toString().toLocaleLowerCase() : sortB

            if (sortA !== sortB) {
                if (isEmpty(sortA) && isEmpty(sortB)) return 0
                if (isEmpty(sortA)) return -1
                if (isEmpty(sortB)) return 1
                if (!isNaN(sortA) && !isNaN(sortB)) return Number(sortA) - Number(sortB)
                return sortA.localeCompare(sortB) // TODO - Work with language
            }
        }

        return 0
    }).map(([item]) => item)
}
