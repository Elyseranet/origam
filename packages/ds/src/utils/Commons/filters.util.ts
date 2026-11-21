import type { IFilterItemsOptions } from '../../interfaces/Commons/filters.interface'
import type { IInternalItem } from '../../interfaces/List/list-children.interface'

import type { TFilterFunction, TFilterMatch } from '../../types/Commons/filters.type'

import { getPropertyFromItem, wrapInArray } from './commons.util'

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

/*********************************************************
 * isMatch
 *
 * @description
 * Is the value a real match (neither `-1` nor `false`).
 ********************************************************/
function isMatch (match: TFilterMatch) {
    return match !== -1 && match !== false
}

/**
 * Match every key of an object item; returns `false` when `filterMode: 'every'` rules the item out.
 */
function matchObjectKeys (
    item: IInternalItem,
    transformed: Record<string, unknown>,
    query: string,
    keys: string[] | false,
    filter: TFilterFunction,
    options: IFilterItemsOptions | undefined,
    customMatches: Record<string, TFilterMatch>,
    defaultMatches: Record<string, TFilterMatch>
) {
    const filterKeys = keys || Object.keys(transformed)

    for (const key of filterKeys) {
        const value = getPropertyFromItem(transformed, key)
        const keyFilter = options?.customKeyFilter?.[key]

        const match = keyFilter
            ? keyFilter(value, query, item)
            : filter(value, query, item)

        if (isMatch(match)) {
            if (keyFilter) customMatches[key] = match
            else defaultMatches[key] = match
        } else if (options?.filterMode === 'every') {
            return false
        }
    }

    return true
}

/*********************************************************
 * satisfiesFilterMode
 *
 * @description
 * Does the number of matches satisfy the `union` / `intersection` filter mode.
 ********************************************************/
function satisfiesFilterMode (
    filterMode: IFilterItemsOptions['filterMode'],
    defaultMatchesLength: number,
    customMatchesLength: number,
    customFiltersLength: number
) {
    if (!defaultMatchesLength && !customMatchesLength) return false

    if (filterMode === 'union') {
        return customMatchesLength === customFiltersLength || !!defaultMatchesLength
    }

    if (filterMode === 'intersection') {
        return customMatchesLength === customFiltersLength && !!defaultMatchesLength
    }

    return true
}

/*********************************************************
 * matchItem
 *
 * @description
 * Matches of one item against the query, or `null` when the item is filtered out.
 ********************************************************/
function matchItem (
    item: IInternalItem,
    transformed: Record<string, unknown>,
    query: string,
    keys: string[] | false,
    filter: TFilterFunction,
    options: IFilterItemsOptions | undefined,
    customFiltersLength: number
) {
    const customMatches: Record<string, TFilterMatch> = {}
    const defaultMatches: Record<string, TFilterMatch> = {}

    if (typeof item === 'object') {
        if (!matchObjectKeys(item, transformed, query, keys, filter, options, customMatches, defaultMatches)) return null
    } else {
        const match = filter(item, query, item)
        if (isMatch(match)) defaultMatches.title = match
    }

    const defaultMatchesLength = Object.keys(defaultMatches).length
    const customMatchesLength = Object.keys(customMatches).length

    if (!satisfiesFilterMode(options?.filterMode, defaultMatchesLength, customMatchesLength, customFiltersLength)) return null

    return {...defaultMatches, ...customMatches}
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
    options?: IFilterItemsOptions
) {
    const array: { index: number, matches: Record<string, TFilterMatch> }[] = []
    // always ensure we fall back to a functioning filter
    const filter = options?.default ?? defaultFilter
    const keys = options?.filterKeys ? wrapInArray(options.filterKeys) : false
    const customFiltersLength = Object.keys(options?.customKeyFilter ?? {}).length

    if (!items?.length) return array

    for (let i = 0; i < items.length; i++) {
        const [item, transformed = item] = wrapInArray(items[i]) as readonly [IInternalItem, Record<string, unknown>]
        const matches = query && !options?.noFilter
            ? matchItem(item, transformed as Record<string, unknown>, query, keys, filter, options, customFiltersLength)
            : {}

        if (matches) array.push({index: i, matches})
    }

    return array
}
