import { UnwrapRef } from 'vue'
import type { IGroupItem } from '../../interfaces'

import { deepEqual } from '../../utils'

/**
 * Get item index.
 *
 * @param items …
 * @param value …
 */
export function getItemIndex (items: UnwrapRef<Array<IGroupItem>>, value: unknown) {
    const ids = getIds(items, [value])

    if (!ids.length) return -1

    return items.findIndex(item => item.id === ids[0])
}

/**
 * Get ids.
 *
 * @param items      …
 * @param modelValue …
 */
export function getIds (items: UnwrapRef<Array<IGroupItem>>, modelValue: Array<any>) {
    const ids: Array<number> = []

    modelValue.forEach(value => {
        const item = items.find(item => deepEqual(value, item.value))
        const itemByIndex = items[value]

        if (item?.value != null) {
            ids.push(item.id)
        } else if (itemByIndex != null) {
            ids.push(itemByIndex.id)
        }
    })

    return ids
}

/**
 * Get values.
 *
 * @param items …
 * @param ids   …
 */
export function getValues (items: UnwrapRef<Array<IGroupItem>>, ids: Array<any>) {
    const values: Array<unknown> = []

    ids.forEach(id => {
        const itemIndex = items.findIndex(item => item.id === id)
        if (~itemIndex) {
            const item = items[itemIndex]
            values.push(item.value != null ? item.value : itemIndex)
        }
    })

    return values
}
