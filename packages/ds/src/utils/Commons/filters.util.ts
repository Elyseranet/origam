import type { IInternalItem } from '../../interfaces'

import type { TFilterFunction, TFilterKeyFunctions, TFilterKeys, TFilterMatch, TFilterMode } from '../../types'

import { getPropertyFromItem, wrapInArray } from '../../utils'

/**
 * Default filter.
 *
 * @param value …
 * @param query …
 */
export function defaultFilter (value: string | number, query: string | number) {
    if (value == null || query == null) return -1

    return value.toString().toLocaleLowerCase().indexOf(query.toString().toLocaleLowerCase())
}

/**
 * Filter items.
 *
 * @param items   …
 * @param query   …
 * @param options …
 */
export function filterItems (
    items: readonly (readonly [item: IInternalItem, transformed: Record<string, unknown>])[] | readonly IInternalItem[],
    query: string,
    options?: {
        customKeyFilter?: TFilterKeyFunctions
        default?: TFilterFunction
        filterKeys?: TFilterKeys
        filterMode?: TFilterMode
        noFilter?: boolean
    }
) {
    const array: { index: number, matches: Record<string, TFilterMatch> }[] = []
    // always ensure we fall back to a functioning filter
    const filter = options?.default ?? defaultFilter
    const keys = options?.filterKeys ? wrapInArray(options.filterKeys) : false
    const customFiltersLength = Object.keys(options?.customKeyFilter ?? {}).length

    if (!items?.length) return array

    loop:
        for (let i = 0; i < items.length; i++) {
            const [item, transformed = item] = wrapInArray(items[i]) as readonly [IInternalItem, Record<string, unknown>]
            const customMatches: Record<string, TFilterMatch> = {}
            const defaultMatches: Record<string, TFilterMatch> = {}
            let match: TFilterMatch = -1

            if (query && !options?.noFilter) {
                if (typeof item === 'object') {
                    const filterKeys = keys || Object.keys(transformed)

                    for (const key of filterKeys) {
                        const value = getPropertyFromItem(transformed, key)
                        const keyFilter = options?.customKeyFilter?.[key]

                        match = keyFilter
                            ? keyFilter(value, query, item)
                            : filter(value, query, item)

                        if (match !== -1 && match !== false) {
                            if (keyFilter) customMatches[key] = match
                            else defaultMatches[key] = match
                        } else if (options?.filterMode === 'every') {
                            continue loop
                        }
                    }
                } else {
                    match = filter(item, query, item)
                    if (match !== -1 && match !== false) {
                        defaultMatches.title = match
                    }
                }

                const defaultMatchesLength = Object.keys(defaultMatches).length
                const customMatchesLength = Object.keys(customMatches).length

                if (!defaultMatchesLength && !customMatchesLength) continue

                if (
                    options?.filterMode === 'union' &&
                    customMatchesLength !== customFiltersLength &&
                    !defaultMatchesLength
                ) continue

                if (
                    options?.filterMode === 'intersection' &&
                    (
                        customMatchesLength !== customFiltersLength ||
                        !defaultMatchesLength
                    )
                ) continue
            }

            array.push({index: i, matches: {...defaultMatches, ...customMatches}})
        }

    return array
}
