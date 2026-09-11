// Tests for the DataTable pagination composable.
//
// Covers:
//   - providePagination: startIndex, stopIndex, pageCount computeds
//   - nextPage / prevPage / setPage boundary clamping
//   - setItemsPerPage resets page to 1
//   - watchEffect: page auto-corrects when > pageCount
//   - itemsPerPage = -1 (show all) edge case
//   - usePaginatedItems: slicing, passthrough when itemsPerPage <= 0
//   - usePagination: throws when missing context

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
    providePagination,
    usePaginatedItems
} from '@origam/composables/DataTable/pagination.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mountPagination (opts: {
    page?: number
    itemsPerPage?: number
    itemsLength?: number
}) {
    const page = ref(opts.page ?? 1)
    const itemsPerPage = ref(opts.itemsPerPage ?? 10)
    const itemsLength = ref(opts.itemsLength ?? 100)

    let api!: ReturnType<typeof providePagination>

    const Host = defineComponent({
        name: 'PaginationHost',
        setup () {
            api = providePagination({ page, itemsPerPage, itemsLength })
            return () => h('div')
        }
    })

    mount(Host)
    return { page, itemsPerPage, itemsLength, api: () => api }
}

// ---------------------------------------------------------------------------
// providePagination — computed indices
// ---------------------------------------------------------------------------

describe('providePagination — startIndex / stopIndex / pageCount', () => {
    it('page 1, 10 per page, 100 items → start=0, stop=10, pageCount=10', () => {
        const { api } = mountPagination({ page: 1, itemsPerPage: 10, itemsLength: 100 })
        expect(api().startIndex.value).toBe(0)
        expect(api().stopIndex.value).toBe(10)
        expect(api().pageCount.value).toBe(10)
    })

    it('page 2, 10 per page, 100 items → start=10, stop=20', () => {
        const { api } = mountPagination({ page: 2, itemsPerPage: 10, itemsLength: 100 })
        expect(api().startIndex.value).toBe(10)
        expect(api().stopIndex.value).toBe(20)
    })

    it('last page with partial items → stopIndex clamped to itemsLength', () => {
        // 10 per page, 25 items → page 3 has 5 items
        const { api } = mountPagination({ page: 3, itemsPerPage: 10, itemsLength: 25 })
        expect(api().startIndex.value).toBe(20)
        expect(api().stopIndex.value).toBe(25)
        expect(api().pageCount.value).toBe(3)
    })

    it('itemsPerPage=-1 → startIndex=0, stopIndex=itemsLength, pageCount=1', () => {
        const { api } = mountPagination({ itemsPerPage: -1, itemsLength: 42 })
        expect(api().startIndex.value).toBe(0)
        expect(api().stopIndex.value).toBe(42)
        expect(api().pageCount.value).toBe(1)
    })

    it('itemsLength=0 → pageCount=1 (avoids /0)', () => {
        const { api } = mountPagination({ itemsPerPage: 10, itemsLength: 0 })
        expect(api().pageCount.value).toBe(1)
    })

    it('non-round division → pageCount rounds up', () => {
        const { api } = mountPagination({ itemsPerPage: 7, itemsLength: 20 })
        // ceil(20/7) = 3
        expect(api().pageCount.value).toBe(3)
    })
})

// ---------------------------------------------------------------------------
// providePagination — navigation
// ---------------------------------------------------------------------------

describe('providePagination — nextPage / prevPage / setPage', () => {
    it('nextPage increments page', async () => {
        const { api } = mountPagination({ page: 1, itemsPerPage: 10, itemsLength: 100 })
        api().nextPage()
        await nextTick()
        expect(api().page.value).toBe(2)
    })

    it('nextPage does not exceed pageCount', async () => {
        const { api } = mountPagination({ page: 10, itemsPerPage: 10, itemsLength: 100 })
        api().nextPage()
        await nextTick()
        expect(api().page.value).toBe(10)
    })

    it('prevPage decrements page', async () => {
        const { api } = mountPagination({ page: 5, itemsPerPage: 10, itemsLength: 100 })
        api().prevPage()
        await nextTick()
        expect(api().page.value).toBe(4)
    })

    it('prevPage does not go below 1', async () => {
        const { api } = mountPagination({ page: 1, itemsPerPage: 10, itemsLength: 100 })
        api().prevPage()
        await nextTick()
        expect(api().page.value).toBe(1)
    })

    it('setPage clamps to valid range', async () => {
        const { api } = mountPagination({ page: 1, itemsPerPage: 10, itemsLength: 100 })
        api().setPage(999)
        await nextTick()
        expect(api().page.value).toBe(10)

        api().setPage(-5)
        await nextTick()
        expect(api().page.value).toBe(1)
    })

    it('setPage to 3 out of 10 → exact value', async () => {
        const { api } = mountPagination({ page: 1, itemsPerPage: 10, itemsLength: 100 })
        api().setPage(3)
        await nextTick()
        expect(api().page.value).toBe(3)
    })
})

// ---------------------------------------------------------------------------
// providePagination — setItemsPerPage
// ---------------------------------------------------------------------------

describe('providePagination — setItemsPerPage', () => {
    it('changes itemsPerPage and resets page to 1', async () => {
        const { api } = mountPagination({ page: 5, itemsPerPage: 10, itemsLength: 100 })
        api().setItemsPerPage(25)
        await nextTick()
        expect(api().itemsPerPage.value).toBe(25)
        expect(api().page.value).toBe(1)
    })
})

// ---------------------------------------------------------------------------
// providePagination — watchEffect auto-correction
// ---------------------------------------------------------------------------

describe('providePagination — auto page correction', () => {
    it('when itemsLength shrinks making current page invalid, page is clamped', async () => {
        const { api, itemsLength } = mountPagination({ page: 5, itemsPerPage: 10, itemsLength: 100 })

        // Shrink list to 15 items → only 2 pages now
        itemsLength.value = 15
        await nextTick()
        expect(api().page.value).toBe(2)
    })
})

// ---------------------------------------------------------------------------
// usePaginatedItems
// ---------------------------------------------------------------------------

describe('usePaginatedItems', () => {
    it('slices items between startIndex and stopIndex', () => {
        const allItems = Array.from({ length: 25 }, (_, i) => `item-${i}`)
        const items = ref(allItems)
        const startIndex = ref(10)
        const stopIndex = ref(20)
        const itemsPerPage = ref(10)

        // usePaginatedItems needs a component context for getCurrentInstance.
        let api!: ReturnType<typeof usePaginatedItems>

        const Host = defineComponent({
            name: 'PaginatedItemsHost',
            emits: ['update:currentItems'],
            setup () {
                api = usePaginatedItems({ items, startIndex, stopIndex, itemsPerPage })
                return () => h('div')
            }
        })

        mount(Host)
        expect(api.paginatedItems.value).toEqual(allItems.slice(10, 20))
    })

    it('itemsPerPage <= 0 → returns all items (show-all mode)', () => {
        const allItems = ['a', 'b', 'c', 'd', 'e']
        const items = ref(allItems)
        const startIndex = ref(0)
        const stopIndex = ref(5)
        const itemsPerPage = ref(-1)

        let api!: ReturnType<typeof usePaginatedItems>

        const Host = defineComponent({
            name: 'PaginatedItemsAllHost',
            emits: ['update:currentItems'],
            setup () {
                api = usePaginatedItems({ items, startIndex, stopIndex, itemsPerPage })
                return () => h('div')
            }
        })

        mount(Host)
        // Vue wraps refs in a Proxy so identity check (toBe) fails —
        // use toEqual to compare values.
        expect(api.paginatedItems.value).toEqual(allItems)
    })
})

// ---------------------------------------------------------------------------
// usePagination — missing context
// ---------------------------------------------------------------------------

describe('usePagination — missing provide', () => {
    it('throws "Missing pagination!" when no ancestor provided pagination context', async () => {
        const { usePagination } = await import('@origam/composables/DataTable/pagination.composable')

        const Orphan = defineComponent({
            name: 'PaginationOrphan',
            setup () {
                expect(() => usePagination()).toThrow('Missing pagination!')
                return () => h('div')
            }
        })
        mount(Orphan)
    })
})
