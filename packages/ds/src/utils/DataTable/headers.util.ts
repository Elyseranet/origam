import { DEFAULT_ACTION_HEADER, DEFAULT_HEADER } from '../../consts'

import type { IDataTableHeader, IInternalDataTableHeader } from '../../interfaces'

import { consoleError } from '../../utils'

/**
 * Extract keys.
 *
 * @param headers …
 * @param keys    …
 */
export function extractKeys (headers: Array<IDataTableHeader>, keys = new Set<string>()) {
    for (const item of headers) {
        if (item.key) keys.add(item.key)

        if (item.children) {
            extractKeys(item.children, keys)
        }
    }

    return keys
}

/**
 * Get data table headers default item.
 *
 * @param item …
 */
export function getDataTableHeadersDefaultItem (item: IDataTableHeader) {
    if (!item.key) return undefined
    if (item.key === 'data-table-group') return DEFAULT_HEADER
    if (['data-table-expand', 'data-table-select'].includes(item.key)) return DEFAULT_ACTION_HEADER
    return undefined
}

/**
 * Convert to internal headers.
 *
 * @param items …
 */
export function convertToInternalHeaders (items: Array<IDataTableHeader>) {
    const internalHeaders: Array<IInternalDataTableHeader> = []
    for (const item of items) {
        const defaultItem = {...getDataTableHeadersDefaultItem(item), ...item}
        const key = defaultItem.key ?? (typeof defaultItem.value === 'string' ? defaultItem.value : null)
        const value = defaultItem.value ?? key ?? null
        const internalItem: IInternalDataTableHeader = {
            ...defaultItem,
            key,
            value,
            sortable: defaultItem.sortable ?? (key != null || !!defaultItem.sort),
            children: defaultItem.children ? convertToInternalHeaders(defaultItem.children) : undefined
        }

        internalHeaders.push(internalItem)
    }

    return internalHeaders
}

/**
 * Parse fixed columns.
 *
 * @param items …
 */
export function parseFixedColumns (items: Array<IInternalDataTableHeader>) {
    let seenFixed = false

    const setFixed = (item: IInternalDataTableHeader, parentFixed = false) => {
        if (!item) return

        if (parentFixed) {
            item.fixed = true
        }

        if (item.fixed) {
            if (item.children) {
                for (let i = item.children.length - 1; i >= 0; i--) {
                    setFixed(item.children[i], true)
                }
            } else {
                if (!seenFixed) {
                    item.lastFixed = true
                } else if (isNaN(+item.width!)) {
                    consoleError(`Multiple fixed columns should have a static width (key: ${item.key})`)
                }
                seenFixed = true
            }
        } else {
            if (item.children) {
                for (let i = item.children.length - 1; i >= 0; i--) {
                    setFixed(item.children[i])
                }
            } else {
                seenFixed = false
            }
        }
    }

    const setFixedOffset = (item: IInternalDataTableHeader, fixedOffset = 0) => {
        if (!item) return fixedOffset

        if (item.children) {
            item.fixedOffset = fixedOffset
            for (const child of item.children) {
                fixedOffset = setFixedOffset(child, fixedOffset)
            }
        } else if (item.fixed) {
            item.fixedOffset = fixedOffset
            fixedOffset += parseFloat(item.width as string || '0') || 0
        }

        return fixedOffset
    }

    let fixedOffset = 0

    for (let i = items.length - 1; i >= 0; i--) {
        setFixed(items[i])
    }

    for (const item of items) {
        fixedOffset = setFixedOffset(item, fixedOffset)
    }
}

/**
 * Parse header items.
 *
 * @param items    …
 * @param maxDepth …
 */
export function parseHeaderItems (items: Array<IInternalDataTableHeader>, maxDepth: number) {
    const headers: Array<Array<IInternalDataTableHeader>> = []
    let currentDepth = 0
    const queue = priorityQueue(items)

    while (queue.size() > 0) {
        let rowSize = queue.count()
        let fraction = 1

        const row: Array<IInternalDataTableHeader> = []

        while (rowSize > 0) {
            const {element: item, priority} = queue.dequeue()!
            const diff = maxDepth - currentDepth - getHeaderDepth(item)

            row.push({
                ...item,
                rowspan: diff ?? 1,
                colspan: item.children ? extractLeaves(item).length : 1
            })

            if (item.children) {
                for (const child of item.children) {
                    // This internally sorts items that are on the same priority "row"
                    const sort = priority % 1 + (fraction / Math.pow(10, currentDepth + 2))
                    queue.enqueue(child, currentDepth + diff + sort)
                }
            }

            fraction += 1
            rowSize -= 1
        }
        currentDepth += 1
        headers.push(row)
    }

    const columns = items.map(item => extractLeaves(item)).flat()

    return {columns, headers}
}

/**
 * Get header depth.
 *
 * @param item  …
 * @param depth …
 * @returns …
 */
export function getHeaderDepth (item: IInternalDataTableHeader, depth = 0): number {
    if (!item.children) return depth

    return Math.max(depth, ...item.children.map(child => getHeaderDepth(child, depth + 1)))
}

/**
 * Extract leaves.
 *
 * @param item    …
 * @param columns …
 */
export function extractLeaves (item: IInternalDataTableHeader, columns: Array<IInternalDataTableHeader> = []) {
    if (!item.children) {
        columns.push(item)
    } else {
        for (const child of item.children) {
            extractLeaves(child, columns)
        }
    }

    return columns
}

/**
 * Priority queue.
 *
 * @param arr …
 */
export function priorityQueue<T> (arr: T[] = []) {
    const queue: { element: T, priority: number }[] = arr.map(element => ({element, priority: 0}))

    return {
        enqueue: (element: T, priority: number) => {
            let added = false
            for (let i = 0; i < queue.length; i++) {
                const item = queue[i]
                if (item.priority > priority) {
                    queue.splice(i, 0, {element, priority})
                    added = true
                    break
                }
            }

            if (!added) queue.push({element, priority})
        },
        size: () => queue.length,
        count: () => {
            let count = 0

            if (!queue.length) return 0

            const whole = Math.floor(queue[0].priority)
            for (let i = 0; i < queue.length; i++) {
                if (Math.floor(queue[i].priority) === whole) count += 1
            }

            return count
        },
        dequeue: () => {
            return queue.shift()
        }
    }
}
