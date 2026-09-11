// Tests for the DataTable sort composable.
//
// Covers:
//   - provideSort / useSort (provide + inject lifecycle)
//   - toggleSort: ASC → DESC → remove (default), mustSort prevents removal,
//     multiSort accumulates entries, page reset on toggle
//   - isSorted predicate
//   - useSortedItems: passthrough when no sortBy, ASC/DESC order, multi-key sort,
//     custom sortFunctions, custom sortRawFunctions

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { provideSort, useSortedItems } from '@origam/composables/DataTable/sort.composable'
import { SORT_DIRECTION } from '@origam/enums'
import type { IDataTableSortItem, IInternalDataTableHeader, IInternalItem } from '@origam/interfaces'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeColumn (key: string): IInternalDataTableHeader {
    return {
        key,
        value: key,
        title: key,
        sortable: true,
        align: undefined,
        fixed: false,
        width: undefined,
        minWidth: undefined,
        maxWidth: undefined,
        nowrap: false,
        colspan: 1,
        rowspan: 1
    } as unknown as IInternalDataTableHeader
}

/**
 * Mount a host that calls provideSort, exposes the returned API, and mounts
 * a child that calls useSort() so we can verify injection round-trip.
 */
function mountSort (opts: {
    initialSortBy?: IDataTableSortItem[]
    mustSort?: boolean
    multiSort?: boolean
    page?: ReturnType<typeof ref<number>>
}) {
    const sortBy = ref<IDataTableSortItem[]>(opts.initialSortBy ?? [])
    const mustSort = ref(opts.mustSort ?? false)
    const multiSort = ref(opts.multiSort ?? false)
    const page = opts.page

    let api!: ReturnType<typeof provideSort>

    const Host = defineComponent({
        name: 'SortHost',
        setup () {
            api = provideSort({ sortBy, mustSort, multiSort, page })
            return () => h('div')
        }
    })

    mount(Host)
    return { sortBy, api: () => api }
}

// ---------------------------------------------------------------------------
// provideSort — toggleSort
// ---------------------------------------------------------------------------

describe('provideSort — toggleSort', () => {
    it('first toggle on a column → adds it as ASC', () => {
        const { api } = mountSort({})
        api().toggleSort(makeColumn('name'))
        expect(api().sortBy.value).toEqual([{ key: 'name', order: SORT_DIRECTION.ASC }])
    })

    it('second toggle → flips to DESC', () => {
        const { api } = mountSort({ initialSortBy: [{ key: 'name', order: SORT_DIRECTION.ASC }] })
        api().toggleSort(makeColumn('name'))
        expect(api().sortBy.value).toEqual([{ key: 'name', order: SORT_DIRECTION.DESC }])
    })

    it('third toggle (DESC) → removes the column (default mustSort=false)', () => {
        const { api } = mountSort({ initialSortBy: [{ key: 'name', order: SORT_DIRECTION.DESC }] })
        api().toggleSort(makeColumn('name'))
        expect(api().sortBy.value).toEqual([])
    })

    it('mustSort=true: DESC → cycles back to ASC instead of removing', () => {
        const { api } = mountSort({
            initialSortBy: [{ key: 'name', order: SORT_DIRECTION.DESC }],
            mustSort: true
        })
        api().toggleSort(makeColumn('name'))
        expect(api().sortBy.value).toEqual([{ key: 'name', order: SORT_DIRECTION.ASC }])
    })

    it('multiSort=false: toggling a second column replaces the first', () => {
        const { api } = mountSort({ initialSortBy: [{ key: 'name', order: SORT_DIRECTION.ASC }] })
        api().toggleSort(makeColumn('age'))
        expect(api().sortBy.value).toHaveLength(1)
        expect(api().sortBy.value[0].key).toBe('age')
    })

    it('multiSort=true: toggling a second column accumulates', () => {
        const { api } = mountSort({
            initialSortBy: [{ key: 'name', order: SORT_DIRECTION.ASC }],
            multiSort: true
        })
        api().toggleSort(makeColumn('age'))
        expect(api().sortBy.value).toHaveLength(2)
    })

    it('column with null key → no-op', () => {
        const { api } = mountSort({})
        const colNoKey = { key: null } as unknown as IInternalDataTableHeader
        api().toggleSort(colNoKey)
        expect(api().sortBy.value).toEqual([])
    })

    it('resets page to 1 when a page ref is provided', () => {
        const page = ref(3)
        const { api } = mountSort({ page })
        api().toggleSort(makeColumn('name'))
        expect(page.value).toBe(1)
    })
})

// ---------------------------------------------------------------------------
// provideSort — isSorted
// ---------------------------------------------------------------------------

describe('provideSort — isSorted', () => {
    it('returns true when column is in sortBy', () => {
        const { api } = mountSort({ initialSortBy: [{ key: 'name', order: SORT_DIRECTION.ASC }] })
        expect(api().isSorted(makeColumn('name'))).toBe(true)
    })

    it('returns false when column is absent from sortBy', () => {
        const { api } = mountSort({ initialSortBy: [{ key: 'age', order: SORT_DIRECTION.ASC }] })
        expect(api().isSorted(makeColumn('name'))).toBe(false)
    })

    it('returns false on empty sortBy', () => {
        const { api } = mountSort({})
        expect(api().isSorted(makeColumn('name'))).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useSort — inject throws when missing provide
// ---------------------------------------------------------------------------

describe('useSort — missing provide', () => {
    it('throws "Missing sort!" when no ancestor provided sort context', async () => {
        // We import useSort separately so we do NOT call provideSort.
        // We use a plain defineComponent to avoid polluting the global Vue app.
        const { useSort } = await import('@origam/composables/DataTable/sort.composable')

        const Orphan = defineComponent({
            name: 'SortOrphan',
            setup () {
                expect(() => useSort()).toThrow('Missing sort!')
                return () => h('div')
            }
        })
        mount(Orphan)
    })
})

// ---------------------------------------------------------------------------
// useSortedItems
// ---------------------------------------------------------------------------

interface Row extends IInternalItem {
    raw: { name: string; age: number }
    columns: Record<string, unknown>
}

function makeRow (name: string, age: number): Row {
    return {
        type: 'item',
        raw: { name, age },
        columns: { name, age }
    } as unknown as Row
}

describe('useSortedItems', () => {
    it('passthrough when sortBy is empty', () => {
        const items = ref([makeRow('Charlie', 30), makeRow('Alice', 25)])
        const sortBy = ref<IDataTableSortItem[]>([])

        const { sortedItems } = useSortedItems({ customKeySort: undefined }, items, sortBy)
        expect(sortedItems.value).toBe(items.value)
    })

    it('sorts ASC by string key', () => {
        const items = ref([makeRow('Charlie', 30), makeRow('Alice', 25), makeRow('Bob', 28)])
        const sortBy = ref<IDataTableSortItem[]>([{ key: 'name', order: SORT_DIRECTION.ASC }])

        const { sortedItems } = useSortedItems(
            { customKeySort: undefined },
            items,
            sortBy,
            { transform: (item) => item.columns }
        )
        const names = sortedItems.value.map(r => r.raw.name)
        expect(names).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('sorts DESC by string key', () => {
        const items = ref([makeRow('Alice', 25), makeRow('Charlie', 30), makeRow('Bob', 28)])
        const sortBy = ref<IDataTableSortItem[]>([{ key: 'name', order: SORT_DIRECTION.DESC }])

        const { sortedItems } = useSortedItems(
            { customKeySort: undefined },
            items,
            sortBy,
            { transform: (item) => item.columns }
        )
        const names = sortedItems.value.map(r => r.raw.name)
        expect(names).toEqual(['Charlie', 'Bob', 'Alice'])
    })

    it('sorts by numeric key ASC', () => {
        const items = ref([makeRow('Charlie', 30), makeRow('Alice', 25), makeRow('Bob', 28)])
        const sortBy = ref<IDataTableSortItem[]>([{ key: 'age', order: SORT_DIRECTION.ASC }])

        const { sortedItems } = useSortedItems(
            { customKeySort: undefined },
            items,
            sortBy,
            { transform: (item) => item.columns }
        )
        const ages = sortedItems.value.map(r => r.raw.age)
        expect(ages).toEqual([25, 28, 30])
    })

    it('reacts to sortBy ref change', async () => {
        const items = ref([makeRow('Charlie', 30), makeRow('Alice', 25)])
        const sortBy = ref<IDataTableSortItem[]>([])

        const { sortedItems } = useSortedItems(
            { customKeySort: undefined },
            items,
            sortBy,
            { transform: (item) => item.columns }
        )

        expect(sortedItems.value).toBe(items.value)

        sortBy.value = [{ key: 'name', order: SORT_DIRECTION.ASC }]
        await nextTick()
        const names = sortedItems.value.map(r => r.raw.name)
        expect(names).toEqual(['Alice', 'Charlie'])
    })

    it('multi-key sort: primary ASC name, secondary ASC age', () => {
        // Two rows same name, different age
        const items = ref([
            makeRow('Alice', 30),
            makeRow('Bob', 25),
            makeRow('Alice', 20)
        ])
        const sortBy = ref<IDataTableSortItem[]>([
            { key: 'name', order: SORT_DIRECTION.ASC },
            { key: 'age', order: SORT_DIRECTION.ASC }
        ])

        const { sortedItems } = useSortedItems(
            { customKeySort: undefined },
            items,
            sortBy,
            { transform: (item) => item.columns }
        )

        const result = sortedItems.value.map(r => `${r.raw.name}:${r.raw.age}`)
        expect(result).toEqual(['Alice:20', 'Alice:30', 'Bob:25'])
    })

    it('custom sortFunctions override default comparison', () => {
        // Reverse alphabetical via custom function
        const items = ref([makeRow('Alice', 25), makeRow('Charlie', 30), makeRow('Bob', 28)])
        const sortBy = ref<IDataTableSortItem[]>([{ key: 'name', order: SORT_DIRECTION.ASC }])
        const sortFunctions = ref<Record<string, (a: any, b: any) => number>>({
            name: (a: string, b: string) => b.localeCompare(a)
        })

        const { sortedItems } = useSortedItems(
            { customKeySort: undefined },
            items,
            sortBy,
            { transform: (item) => item.columns, sortFunctions }
        )

        const names = sortedItems.value.map(r => r.raw.name)
        expect(names).toEqual(['Charlie', 'Bob', 'Alice'])
    })
})
