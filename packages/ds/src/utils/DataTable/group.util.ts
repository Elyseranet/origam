import type { IDataTableGroup, IDataTableGroupableItem } from '../../interfaces'

import { getObjectValueByPath } from '../../utils'

/**
 * Group items by property.
 *
 * @param items   …
 * @param groupBy …
 */
export function groupItemsByProperty<T extends IDataTableGroupableItem> (items: Array<T>, groupBy: string) {
    if (!items.length) return []

    const groups = new Map<any, Array<T>>()
    for (const item of items) {
        const value = getObjectValueByPath(item.raw, groupBy)

        if (!groups.has(value)) {
            groups.set(value, [])
        }
        groups.get(value)!.push(item)
    }

    return groups
}

/**
 * Group items.
 *
 * @param items   …
 * @param groupBy …
 * @param depth   …
 * @param prefix  …
 */
export function groupItems<T extends IDataTableGroupableItem> (items: Array<T>, groupBy: Array<string>, depth = 0, prefix = 'root') {
    if (!groupBy.length) return []

    const groupedItems = groupItemsByProperty(items, groupBy[0])
    const groups: Array<IDataTableGroup<T>> = []

    const rest = groupBy.slice(1)
    groupedItems.forEach((items, value) => {
        const key = groupBy[0]
        const id = `${prefix}_${key}_${value}`
        groups.push({
            depth,
            id,
            key,
            value,
            items: rest.length ? groupItems(items, rest, depth + 1, id) : items,
            type: 'group'
        })
    })

    return groups
}

/**
 * Flatten items.
 *
 * @param items  …
 * @param opened …
 * @returns …
 */
export function flattenItems<T extends IDataTableGroupableItem> (items: Array<(T | IDataTableGroup<T>)>, opened: Set<string>): Array<(T | IDataTableGroup<T>)> {
    const flatItems: Array<(T | IDataTableGroup<T>)> = []

    for (const item of items) {
        // TODO: make this better
        if ('type' in item && item.type === 'group') {
            if (item.value != null) {
                flatItems.push(item)
            }

            if (opened.has(item.id) || item.value == null) {
                flatItems.push(...flattenItems(item.items, opened))
            }
        } else {
            flatItems.push(item)
        }
    }

    return flatItems
}
