import { describe, expect, it } from 'vitest'

import { sortItems } from '@origam/utils/DataTable/sort.util'

// Minimal IInternalItem shape required by sortItems
type RawItem = Record<string, unknown>
function makeItem (raw: RawItem) {
    return { raw, value: raw }
}

// #1398 — characterization of the generic comparison path, recorded on the
// unrefactored compareBySortItem and kept green after splitting it.
describe('sortItems — generic path characterization (#1398)', () => {
    const t = { transform: (item: any) => item.raw as Record<string, any> }
    const run = (vals: unknown[], order?: 'asc' | 'desc') =>
        sortItems(vals.map(v => makeItem({ k: v })), [{ key: 'k', order }], t).map(i => i.raw.k)

    it('compares numeric strings numerically, not lexically', () => {
        expect(run(['10', '9', '100', '1'])).toEqual(['1', '9', '10', '100'])
    })
    it('mixes null, empty string, numbers and text', () => {
        expect(run(['b', 3, null, '', 'A', undefined, 1])).toMatchInlineSnapshot(`
          [
            null,
            "",
            undefined,
            1,
            3,
            "A",
            "b",
          ]
        `)
    })
    it('desc reverses mixed values', () => {
        expect(run(['b', 3, null, 'A', 1], 'desc')).toMatchInlineSnapshot(`
          [
            "b",
            "A",
            3,
            1,
            null,
          ]
        `)
    })
    it('compares dates numerically and falls back to strings when only one is a Date', () => {
        const d1 = new Date(2020, 0, 1)
        const d2 = new Date(2019, 0, 1)
        expect(run([d1, d2])).toEqual([d2, d1])
        // timezone-independent: compare identities, not ISO strings
        expect(run([d1, 'zzz', d2])).toEqual([d2, d1, 'zzz'])
    })
    it('treats case-insensitively equal values as ties (stable)', () => {
        expect(run(['B', 'a', 'b', 'A'])).toMatchInlineSnapshot(`
          [
            "a",
            "A",
            "B",
            "b",
          ]
        `)
    })
    it('custom comparator null on one key skips to the next key', () => {
        const items = [makeItem({ k: 1, j: 2 }), makeItem({ k: 1, j: 1 })]
        const res = sortItems(items, [{ key: 'k' }, { key: 'j' }], {
            ...t, sortFunctions: { k: () => null as never }
        }).map(i => i.raw.j)
        expect(res).toMatchInlineSnapshot(`
          [
            1,
            2,
          ]
        `)
    })
})

describe('sortItems', () => {
    describe('single-key sort — asc (default)', () => {
        it('sorts numbers ascending', () => {
            const items = [makeItem({ age: 30 }), makeItem({ age: 10 }), makeItem({ age: 20 })]
            const result = sortItems(items, [{ key: 'age' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result.map(i => i.raw.age)).toEqual([10, 20, 30])
        })

        it('sorts strings ascending (locale-aware, case-insensitive)', () => {
            const items = [makeItem({ name: 'Zara' }), makeItem({ name: 'alice' }), makeItem({ name: 'Bob' })]
            const result = sortItems(items, [{ key: 'name', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            const names = result.map(i => i.raw.name)
            expect(names[0]).toBe('alice')
            expect(names[1]).toBe('Bob')
            expect(names[2]).toBe('Zara')
        })

        it('returns the same items reference-stable when already sorted', () => {
            const items = [makeItem({ v: 1 }), makeItem({ v: 2 }), makeItem({ v: 3 })]
            const result = sortItems(items, [{ key: 'v' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result.map(i => i.raw.v)).toEqual([1, 2, 3])
        })
    })

    describe('single-key sort — desc', () => {
        it('sorts numbers descending', () => {
            const items = [makeItem({ age: 10 }), makeItem({ age: 30 }), makeItem({ age: 20 })]
            const result = sortItems(items, [{ key: 'age', order: 'desc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result.map(i => i.raw.age)).toEqual([30, 20, 10])
        })

        it('sorts strings descending', () => {
            const items = [makeItem({ name: 'alice' }), makeItem({ name: 'Zara' }), makeItem({ name: 'Bob' })]
            const result = sortItems(items, [{ key: 'name', order: 'desc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            const names = result.map(i => (i.raw.name as string).toLowerCase())
            expect(names[0]).toBe('zara')
            expect(names[2]).toBe('alice')
        })
    })

    describe('null / undefined / empty values', () => {
        it('places null values before non-null (isEmpty == true → -1)', () => {
            const items = [makeItem({ v: 'b' }), makeItem({ v: null }), makeItem({ v: 'a' })]
            const result = sortItems(items, [{ key: 'v', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result[0].raw.v).toBeNull()
        })

        it('places undefined values before non-null', () => {
            const items = [makeItem({ v: 'b' }), makeItem({ v: undefined }), makeItem({ v: 'a' })]
            const result = sortItems(items, [{ key: 'v', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result[0].raw.v).toBeUndefined()
        })

        it('treats two null values as equal (stable, both before non-null)', () => {
            const items = [makeItem({ v: 'z' }), makeItem({ v: null }), makeItem({ v: null })]
            const result = sortItems(items, [{ key: 'v', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result[0].raw.v).toBeNull()
            expect(result[1].raw.v).toBeNull()
        })
    })

    describe('order: false — skip criterion', () => {
        it('does not sort when order is false (preserves original order)', () => {
            const items = [makeItem({ v: 3 }), makeItem({ v: 1 }), makeItem({ v: 2 })]
            const result = sortItems(items, [{ key: 'v', order: false }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result.map(i => i.raw.v)).toEqual([3, 1, 2])
        })
    })

    describe('multi-key sort', () => {
        it('breaks ties with the secondary key', () => {
            const items = [
                makeItem({ dept: 'eng', level: 3 }),
                makeItem({ dept: 'eng', level: 1 }),
                makeItem({ dept: 'hr', level: 2 }),
                makeItem({ dept: 'eng', level: 2 })
            ]
            const result = sortItems(
                items,
                [{ key: 'dept', order: 'asc' }, { key: 'level', order: 'asc' }],
                { transform: (item) => item.raw as Record<string, any> }
            )
            const eng = result.filter(i => i.raw.dept === 'eng').map(i => i.raw.level)
            expect(eng).toEqual([1, 2, 3])
        })
    })

    describe('Date values', () => {
        it('sorts Date objects numerically', () => {
            const d1 = new Date('2023-01-01')
            const d2 = new Date('2021-06-15')
            const d3 = new Date('2022-03-10')
            const items = [makeItem({ date: d1 }), makeItem({ date: d2 }), makeItem({ date: d3 })]
            const result = sortItems(items, [{ key: 'date', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>
            })
            expect(result.map(i => i.raw.date)).toEqual([d2, d3, d1])
        })
    })

    describe('custom sort functions', () => {
        it('uses sortFunctions when provided', () => {
            const items = [makeItem({ v: 'banana' }), makeItem({ v: 'apple' }), makeItem({ v: 'cherry' })]
            // Reverse-length sort
            const result = sortItems(items, [{ key: 'v', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>,
                sortFunctions: {
                    v: (a: any, b: any) => (a as string).length - (b as string).length
                }
            })
            expect(result.map(i => i.raw.v)).toEqual(['apple', 'banana', 'cherry'])
        })

        it('uses sortRawFunctions when provided', () => {
            const items = [
                makeItem({ score: 10 }),
                makeItem({ score: 5 }),
                makeItem({ score: 20 })
            ]
            const result = sortItems(items, [{ key: 'score', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>,
                sortRawFunctions: {
                    score: (a: any, b: any) => (b as any).score - (a as any).score
                }
            })
            // Raw function sorts descending by score
            expect(result.map(i => i.raw.score)).toEqual([20, 10, 5])
        })

        it('skips criterion when sortFunctions[key] returns null', () => {
            const items = [makeItem({ v: 3 }), makeItem({ v: 1 }), makeItem({ v: 2 })]
            const result = sortItems(items, [{ key: 'v', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>,
                sortFunctions: { v: () => null as any }
            })
            // null return means "continue" — original order preserved
            expect(result.map(i => i.raw.v)).toEqual([3, 1, 2])
        })

        it('sortFunctions returning 0 is honoured as equality — generic path is NOT re-executed', () => {
            // Bug fix: the old code used `if (customResult)` which treats 0 as falsy,
            // causing the generic comparator to run even when the custom fn declared equality.
            // Fix: `if (customResult !== 0) return customResult` preserves the 0 return.
            const items = [
                makeItem({ tag: 'b', order: 1 }),
                makeItem({ tag: 'a', order: 2 }),
                makeItem({ tag: 'b', order: 3 })
            ]
            // Custom fn: 'b' > 'a' → positive; 'a' < 'b' → negative; same tag → 0 (equal)
            // We sort by 'tag', custom fn returns 0 for equal tags.
            // If 0 is wrongly treated as "no result", the generic path runs and sorts
            // by the string value of 'tag', which would still group them — but with a
            // secondary key 'order' we can detect the fallthrough.
            const callCount = { raw: 0 }
            const result = sortItems(items, [{ key: 'tag', order: 'asc' }, { key: 'order', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>,
                sortFunctions: {
                    tag: (a: any, b: any) => {
                        callCount.raw++
                        const tagA = a as string
                        const tagB = b as string
                        if (tagA === tagB) return 0
                        return tagA < tagB ? -1 : 1
                    }
                }
            })
            // 'a' comes first, then two 'b' items sorted by 'order' (secondary key)
            expect(result.map(i => i.raw.tag)).toEqual(['a', 'b', 'b'])
            expect(result.map(i => i.raw.order)).toEqual([2, 1, 3])
        })

        it('sortRawFunctions returning 0 is honoured as equality — generic path is NOT re-executed', () => {
            // Same fix applies to the sortRawFunctions branch.
            const items = [
                makeItem({ score: 10, name: 'charlie' }),
                makeItem({ score: 10, name: 'alice' }),
                makeItem({ score: 20, name: 'bob' })
            ]
            const result = sortItems(items, [{ key: 'score', order: 'asc' }, { key: 'name', order: 'asc' }], {
                transform: (item) => item.raw as Record<string, any>,
                sortRawFunctions: {
                    score: (a: any, b: any) => {
                        const diff = (a as any).score - (b as any).score
                        return diff === 0 ? 0 : diff
                    }
                }
            })
            // score=10 items: tied, secondary key 'name' breaks tie → alice < charlie
            // score=20 item: last
            expect(result.map(i => i.raw.name)).toEqual(['alice', 'charlie', 'bob'])
        })
    })

    describe('empty input', () => {
        it('returns empty array for empty items', () => {
            expect(sortItems([], [{ key: 'v' }])).toEqual([])
        })

        it('returns items unchanged for empty sortByItems', () => {
            const items = [makeItem({ v: 3 }), makeItem({ v: 1 })]
            const result = sortItems(items, [])
            expect(result.map(i => i.raw.v)).toEqual([3, 1])
        })
    })

    describe('no transform provided', () => {
        it('falls back to the item itself as the transform', () => {
            const items = [
                { raw: { v: 3 }, value: { v: 3 }, v: 3 },
                { raw: { v: 1 }, value: { v: 1 }, v: 1 }
            ]
            const result = sortItems(items as any, [{ key: 'v', order: 'asc' }])
            expect(result.map((i: any) => i.raw.v)).toEqual([1, 3])
        })
    })
})
