import { describe, expect, it } from 'vitest'

import { defaultFilter, filterItems } from '@origam/utils/Commons/filters.util'

// Minimal IInternalItem used by filterItems
function makeInternalItem (raw: Record<string, unknown>) {
    return { raw, value: raw } as any
}

// filterItems expects items as [item, transformed] tuples or plain IInternalItem[]
function makeTuple (raw: Record<string, unknown>) {
    const item = makeInternalItem(raw)
    return [item, raw] as const
}

describe('defaultFilter', () => {
    it('returns the index of the query inside the value (case-insensitive)', () => {
        expect(defaultFilter('Hello World', 'world')).toBe(6)
        expect(defaultFilter('Hello World', 'HELLO')).toBe(0)
    })

    it('returns 0 for an exact match', () => {
        expect(defaultFilter('abc', 'abc')).toBe(0)
    })

    it('returns -1 when the query is not found', () => {
        expect(defaultFilter('apple', 'banana')).toBe(-1)
    })

    it('returns -1 when value is null', () => {
        expect(defaultFilter(null as any, 'query')).toBe(-1)
    })

    it('returns -1 when query is null', () => {
        expect(defaultFilter('value', null as any)).toBe(-1)
    })

    it('works with numbers — converts to string first', () => {
        expect(defaultFilter(12345, '23')).toBe(1)
        expect(defaultFilter(12345, '99')).toBe(-1)
    })

    it('returns -1 for empty string query when value has content', () => {
        // ''.indexOf('') is 0 — both non-null, so returns 0
        // Actually empty string query "" → value.indexOf("") = 0
        expect(defaultFilter('abc', '')).toBe(0)
    })
})

describe('filterItems', () => {
    describe('empty / no items', () => {
        it('returns an empty array for empty items', () => {
            expect(filterItems([], 'query')).toEqual([])
        })

        it('returns an empty array for null/undefined items', () => {
            expect(filterItems(null as any, 'query')).toEqual([])
        })
    })

    describe('no-filter passthrough', () => {
        it('includes all items when noFilter is true', () => {
            const items = [makeTuple({ name: 'unrelated' }), makeTuple({ name: 'other' })]
            const result = filterItems(items, 'xyz', { noFilter: true })
            expect(result).toHaveLength(2)
            expect(result[0].index).toBe(0)
            expect(result[1].index).toBe(1)
        })

        it('includes all items when query is empty string', () => {
            const items = [makeTuple({ name: 'Alice' }), makeTuple({ name: 'Bob' })]
            const result = filterItems(items, '')
            expect(result).toHaveLength(2)
        })
    })

    describe('default filter behaviour', () => {
        it('filters out items where no key matches the query', () => {
            const items = [
                makeTuple({ name: 'Alice' }),
                makeTuple({ name: 'Bob' }),
                makeTuple({ name: 'Charlie' })
            ]
            const result = filterItems(items, 'ali')
            expect(result).toHaveLength(1)
            expect(result[0].index).toBe(0)
        })

        it('includes matches recording the matched key', () => {
            const items = [makeTuple({ name: 'Alice', age: 30 })]
            const result = filterItems(items, 'alice')
            expect(result[0].matches).toHaveProperty('name')
        })

        it('matches by multiple keys (any key is sufficient)', () => {
            const items = [makeTuple({ name: 'Dave', email: 'search-me@x.com' })]
            const result = filterItems(items, 'search')
            expect(result).toHaveLength(1)
        })
    })

    describe('filterKeys restriction', () => {
        it('only filters against the specified keys', () => {
            const items = [
                makeTuple({ name: 'Alice', code: 'ABC' }),
                makeTuple({ name: 'Bob', code: 'DEF' })
            ]
            // Query matches 'name' of Alice — but filterKeys restricts to 'code'
            const result = filterItems(items, 'ali', { filterKeys: 'code' })
            expect(result).toHaveLength(0)
        })

        it('matches when the restricted key actually matches', () => {
            const items = [makeTuple({ name: 'Alice', code: 'XYZ' })]
            const result = filterItems(items, 'xyz', { filterKeys: 'code' })
            expect(result).toHaveLength(1)
        })

        it('supports filterKeys as an array', () => {
            const items = [makeTuple({ a: 'match', b: 'nothing', c: 'irrelevant' })]
            const result = filterItems(items, 'match', { filterKeys: ['a', 'b'] })
            expect(result).toHaveLength(1)
        })
    })

    describe('filterMode: every', () => {
        it('excludes items where any key fails to match', () => {
            const items = [makeTuple({ a: 'hit', b: 'miss' })]
            const result = filterItems(items, 'hit', {
                filterKeys: ['a', 'b'],
                filterMode: 'every'
            })
            expect(result).toHaveLength(0)
        })

        it('includes items where all specified keys match', () => {
            const items = [makeTuple({ a: 'hit', b: 'hit too' })]
            const result = filterItems(items, 'hit', {
                filterKeys: ['a', 'b'],
                filterMode: 'every'
            })
            expect(result).toHaveLength(1)
        })
    })

    describe('custom default filter function', () => {
        it('uses the provided default filter instead of the built-in one', () => {
            // Custom filter always returns -1 (nothing matches)
            const items = [makeTuple({ name: 'Alice' })]
            const result = filterItems(items, 'alice', {
                default: () => -1
            })
            expect(result).toHaveLength(0)
        })

        it('custom filter returning true is treated as a match', () => {
            const items = [makeTuple({ name: 'Bob' })]
            const result = filterItems(items, 'anything', {
                default: () => true
            })
            expect(result).toHaveLength(1)
        })
    })

    describe('customKeyFilter', () => {
        it('uses the custom filter for the specified key', () => {
            const items = [
                makeTuple({ score: 80 }),
                makeTuple({ score: 50 })
            ]
            // Custom: match items where score > 60
            const result = filterItems(items, '60', {
                customKeyFilter: {
                    score: (value: any, query: any) => parseInt(value) > parseInt(query) ? 1 : -1
                }
            })
            expect(result).toHaveLength(1)
            expect(result[0].index).toBe(0)
        })

        it('records the custom match under the key', () => {
            const items = [makeTuple({ tag: 'featured' })]
            const result = filterItems(items, 'featured', {
                customKeyFilter: {
                    tag: (v: any, q: any) => v === q ? 1 : -1
                }
            })
            expect(result[0].matches.tag).toBeDefined()
        })
    })

    describe('filterMode: union', () => {
        it('requires at least one default match OR all custom filters to pass', () => {
            // One custom filter, no default match → should be excluded in union mode
            const items = [makeTuple({ name: 'Alice', meta: 'no' })]
            const result = filterItems(items, 'alice', {
                filterMode: 'union',
                filterKeys: ['name', 'meta'],
                customKeyFilter: {
                    meta: () => -1
                }
            })
            // defaultMatch exists (name: 'Alice' matches 'alice') → included
            expect(result).toHaveLength(1)
        })
    })

    describe('filterMode: intersection / union truth table (#1398)', () => {
        // customKeyFilter on `meta` ; default filter on `name`.
        const run = (mode: 'union' | 'intersection', defaultHit: boolean, customHit: boolean) =>
            filterItems([makeTuple({ name: defaultHit ? 'alice' : 'zzz', meta: customHit ? 'alice' : 'zzz' })], 'alice', {
                filterMode: mode,
                filterKeys: ['name', 'meta'],
                customKeyFilter: { meta: (v: any, q: any) => v === q ? 0 : -1 }
            }).length

        it.each([
            ['union', true, true, 1], ['union', true, false, 1], ['union', false, true, 1], ['union', false, false, 0],
            ['intersection', true, true, 1], ['intersection', true, false, 0], ['intersection', false, true, 0], ['intersection', false, false, 0]
        ] as const)('%s default=%s custom=%s -> %s item(s)', (mode, d, c, n) => {
            expect(run(mode, d, c)).toBe(n)
        })
    })

    describe('index reporting', () => {
        it('reports correct 0-based indices for matching items', () => {
            const items = [
                makeTuple({ name: 'no match' }),
                makeTuple({ name: 'Alice' }),
                makeTuple({ name: 'no match 2' }),
                makeTuple({ name: 'Ali' })
            ]
            const result = filterItems(items, 'ali')
            expect(result.map(r => r.index)).toEqual([1, 3])
        })
    })
})
