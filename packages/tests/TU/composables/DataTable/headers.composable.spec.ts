// Tests for the DataTable headers composable.
//
// Covers:
//   - createHeaders: builds headers + columns from a simple flat list
//   - createHeaders: injects showSelect column when showSelect=true
//   - createHeaders: injects showExpand column when showExpand=true
//   - createHeaders: groupBy injects data-table-group column
//   - useHeadersCell / getSortIcon: returns sortAscIcon when unsorted,
//     sortAscIcon when column is sorted ASC, sortDescIcon when sorted DESC
//   - useHeaders: throws when missing context

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createHeaders } from '@origam/composables/DataTable/headers.composable'
import { provideSort } from '@origam/composables/DataTable/sort.composable'
import { SORT_DIRECTION } from '@origam/enums'
import type { IDataTableHeader, IDataTableSortItem } from '@origam/interfaces'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mountHeaders (
    props: { headers?: IDataTableHeader[]; items?: any[] },
    opts?: {
        showSelect?: boolean
        showExpand?: boolean
        groupBy?: IDataTableSortItem[]
    }
) {
    const showSelect = ref(opts?.showSelect ?? false)
    const showExpand = ref(opts?.showExpand ?? false)
    const groupBy = ref<IDataTableSortItem[]>(opts?.groupBy ?? [])

    let api!: ReturnType<typeof createHeaders>

    const Host = defineComponent({
        name: 'HeadersHost',
        setup () {
            api = createHeaders(props, { showSelect, showExpand, groupBy })
            return () => h('div')
        }
    })

    mount(Host)
    return { showSelect, showExpand, groupBy, api: () => api }
}

// ---------------------------------------------------------------------------
// createHeaders — flat list
// ---------------------------------------------------------------------------

describe('createHeaders — flat list', () => {
    it('builds columns for each header key', async () => {
        const headers: IDataTableHeader[] = [
            { key: 'name', title: 'Name' },
            { key: 'age', title: 'Age' }
        ]
        const { api } = mountHeaders({ headers })
        await nextTick()

        const keys = api().columns.value.map(c => c.key)
        expect(keys).toContain('name')
        expect(keys).toContain('age')
    })

    it('headers is a 2D array with the flat list in the first row', async () => {
        const headers: IDataTableHeader[] = [
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' }
        ]
        const { api } = mountHeaders({ headers })
        await nextTick()

        expect(api().headers.value).toHaveLength(1)
        expect(api().headers.value[0]).toHaveLength(2)
    })

    it('sortable defaults to true when key is provided', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name' }]
        const { api } = mountHeaders({ headers })
        await nextTick()

        const col = api().columns.value.find(c => c.key === 'name')
        expect(col?.sortable).toBe(true)
    })

    it('sortable=false is preserved', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name', sortable: false }]
        const { api } = mountHeaders({ headers })
        await nextTick()

        const col = api().columns.value.find(c => c.key === 'name')
        expect(col?.sortable).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// createHeaders — special columns injection
// ---------------------------------------------------------------------------

describe('createHeaders — showSelect injection', () => {
    it('prepends data-table-select column when showSelect=true', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name' }]
        const { api } = mountHeaders({ headers }, { showSelect: true })
        await nextTick()

        const keys = api().columns.value.map(c => c.key)
        expect(keys[0]).toBe('data-table-select')
    })

    it('does NOT prepend data-table-select when showSelect=false', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name' }]
        const { api } = mountHeaders({ headers }, { showSelect: false })
        await nextTick()

        const keys = api().columns.value.map(c => c.key)
        expect(keys).not.toContain('data-table-select')
    })

    it('does NOT duplicate data-table-select when already in headers', async () => {
        const headers: IDataTableHeader[] = [
            { key: 'data-table-select' },
            { key: 'name', title: 'Name' }
        ]
        const { api } = mountHeaders({ headers }, { showSelect: true })
        await nextTick()

        const selectCols = api().columns.value.filter(c => c.key === 'data-table-select')
        expect(selectCols).toHaveLength(1)
    })
})

describe('createHeaders — showExpand injection', () => {
    it('appends data-table-expand column when showExpand=true', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name' }]
        const { api } = mountHeaders({ headers }, { showExpand: true })
        await nextTick()

        const keys = api().columns.value.map(c => c.key)
        expect(keys[keys.length - 1]).toBe('data-table-expand')
    })

    it('does NOT append data-table-expand when showExpand=false', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name' }]
        const { api } = mountHeaders({ headers }, { showExpand: false })
        await nextTick()

        const keys = api().columns.value.map(c => c.key)
        expect(keys).not.toContain('data-table-expand')
    })
})

describe('createHeaders — groupBy injection', () => {
    it('prepends data-table-group column when groupBy is non-empty', async () => {
        const headers: IDataTableHeader[] = [{ key: 'name', title: 'Name' }]
        const { api } = mountHeaders({ headers }, { groupBy: [{ key: 'category' }] })
        await nextTick()

        const keys = api().columns.value.map(c => c.key)
        expect(keys[0]).toBe('data-table-group')
    })
})

// ---------------------------------------------------------------------------
// createHeaders — sortFunctions / filterFunctions extraction
// ---------------------------------------------------------------------------

describe('createHeaders — sortFunctions / filterFunctions', () => {
    it('sortFunctions is populated when header has sort function', async () => {
        const customSort = (a: any, b: any) => a - b
        const headers: IDataTableHeader[] = [
            { key: 'age', title: 'Age', sortable: true, sort: customSort }
        ]
        const { api } = mountHeaders({ headers })
        await nextTick()

        expect(api().sortFunctions.value['age']).toBe(customSort)
    })

    it('filterFunctions is populated when header has filter function', async () => {
        const customFilter = (value: any, search: string) => String(value).includes(search)
        const headers: IDataTableHeader[] = [
            { key: 'name', title: 'Name', filter: customFilter }
        ]
        const { api } = mountHeaders({ headers })
        await nextTick()

        expect(api().filterFunctions.value['name']).toBe(customFilter)
    })
})

// ---------------------------------------------------------------------------
// useHeadersCell — getSortIcon
// needs a sort context provided by an ancestor
// ---------------------------------------------------------------------------

describe('useHeadersCell — getSortIcon', () => {
    it('returns sortAscIcon when column is not in sortBy', async () => {
        const { useHeadersCell } = await import('@origam/composables/DataTable/headers.composable')

        let icon: any

        const sortBy = ref<IDataTableSortItem[]>([])
        const mustSort = ref(false)
        const multiSort = ref(false)

        const Parent = defineComponent({
            name: 'SortIconParent',
            setup () {
                provideSort({ sortBy, mustSort, multiSort })
                return () => h(Child)
            }
        })

        const Child = defineComponent({
            name: 'SortIconChild',
            setup () {
                const { getSortIcon } = useHeadersCell({
                    sortAscIcon: 'mdi-sort-ascending',
                    sortDescIcon: 'mdi-sort-descending'
                } as any)
                icon = getSortIcon({ key: 'name', sortable: true } as any)
                return () => h('div')
            }
        })

        mount(Parent)
        expect(icon).toBe('mdi-sort-ascending')
    })

    it('returns sortAscIcon when column is sorted ASC', async () => {
        const { useHeadersCell } = await import('@origam/composables/DataTable/headers.composable')

        let icon: any

        const sortBy = ref<IDataTableSortItem[]>([{ key: 'name', order: SORT_DIRECTION.ASC }])
        const mustSort = ref(false)
        const multiSort = ref(false)

        const Parent = defineComponent({
            name: 'SortIconParentAsc',
            setup () {
                provideSort({ sortBy, mustSort, multiSort })
                return () => h(Child)
            }
        })

        const Child = defineComponent({
            name: 'SortIconChildAsc',
            setup () {
                const { getSortIcon } = useHeadersCell({
                    sortAscIcon: 'mdi-sort-ascending',
                    sortDescIcon: 'mdi-sort-descending'
                } as any)
                icon = getSortIcon({ key: 'name', sortable: true } as any)
                return () => h('div')
            }
        })

        mount(Parent)
        expect(icon).toBe('mdi-sort-ascending')
    })

    it('returns sortDescIcon when column is sorted DESC', async () => {
        const { useHeadersCell } = await import('@origam/composables/DataTable/headers.composable')

        let icon: any

        const sortBy = ref<IDataTableSortItem[]>([{ key: 'name', order: SORT_DIRECTION.DESC }])
        const mustSort = ref(false)
        const multiSort = ref(false)

        const Parent = defineComponent({
            name: 'SortIconParentDesc',
            setup () {
                provideSort({ sortBy, mustSort, multiSort })
                return () => h(Child)
            }
        })

        const Child = defineComponent({
            name: 'SortIconChildDesc',
            setup () {
                const { getSortIcon } = useHeadersCell({
                    sortAscIcon: 'mdi-sort-ascending',
                    sortDescIcon: 'mdi-sort-descending'
                } as any)
                icon = getSortIcon({ key: 'name', sortable: true } as any)
                return () => h('div')
            }
        })

        mount(Parent)
        expect(icon).toBe('mdi-sort-descending')
    })
})

// ---------------------------------------------------------------------------
// useHeaders — missing context
// ---------------------------------------------------------------------------

describe('useHeaders — missing provide', () => {
    it('throws "Missing headers!" when no ancestor provided headers context', async () => {
        const { useHeaders } = await import('@origam/composables/DataTable/headers.composable')

        const Orphan = defineComponent({
            name: 'HeadersOrphan',
            setup () {
                expect(() => useHeaders()).toThrow('Missing headers!')
                return () => h('div')
            }
        })
        mount(Orphan)
    })
})
