// Regression tests — LOT 3 (#unemitted-declarations): OrigamDataTable
// declared `update:expanded`, `update:groupBy`, `update:itemsPerPage`,
// `update:modelValue`, `update:page`, `update:sortBy` in `IDataTableEmits`,
// and the static guard `unemitted-declarations.mjs` flagged all six as
// "never emitted" — its `directVModelEvents` scan only recognises
// `const x = useVModel(props, 'prop')` written LITERALLY inside the
// component's own `.vue` file. `OrigamDataTable.vue` never calls
// `useVModel` itself: it calls wrapper composables (`createSort`,
// `createPagination`, `createGroupBy`, `provideSelection`,
// `provideExpanded`) that call `useVModel` one layer down — invisible to
// the per-file regex, exactly like the pre-existing `useGroup` trap
// documented in `guards/lib/dead-emits.mjs`.
//
// Runtime measurement (this file) found the real split:
//   - `update:sortBy`, `update:page`, `update:itemsPerPage`,
//     `update:modelValue`, `update:expanded` DO fire — `getCurrentInstance()`
//     inside `useVModel` is called synchronously during
//     `OrigamDataTable`'s own `setup()` (through the wrapper composable),
//     so it captures `OrigamDataTable`'s instance and `vm.emit(...)`
//     really does emit on it. Fixed on the GUARD side: four `EXTRA_RELAYS`
//     entries (`provideSort`, `providePagination`, `provideSelection`,
//     `provideExpanded`) in `dead-emits.mjs`.
//   - `update:groupBy` does NOT fire — `grep -rn "groupBy\.value\s*=" src/`
//     returns zero matches anywhere in the DS. `toggleGroup()` only opens/
//     closes an already-grouped section (`opened` ref), never writes
//     `groupBy.value`. Fixed on the COMPONENT side: the declaration was
//     removed from `IDataTableEmits` (`data-table.interface.ts`) — `groupBy`
//     is a one-way, consumer-controlled prop.
//
// These specs pin the FIVE real emit paths at runtime so a future refactor
// that silently breaks one of them (e.g. extracting `toggleSort` into yet
// another composable layer without re-checking reachability) fails a red
// test instead of only a guard someone might not re-run.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
import { createOrigam } from '@origam/origam'

import type { IDataTableHeader, IDataTableSlotProps } from '@origam/interfaces'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const headers: Array<IDataTableHeader> = [
    { key: 'name', title: 'Name', value: 'name' },
    { key: 'age', title: 'Age', value: 'age' }
]
const items = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Carl', age: 40 }
]

function mountTable (extraProps: Record<string, unknown> = {}) {
    let captured: IDataTableSlotProps<unknown> | null = null
    const wrapper = mount(OrigamDataTable, {
        props: { headers, items, itemsPerPage: 2, ...extraProps } as never,
        global: { plugins: [createOrigam()] },
        slots: {
            default: (slotProps: IDataTableSlotProps<unknown>) => {
                captured = slotProps
                return h('div')
            }
        }
    })
    return { wrapper, getCaptured: () => captured as unknown as IDataTableSlotProps<unknown> }
}

describe('OrigamDataTable — emits réellement atteignables (relais useVModel indirects)', () => {
    it('émet update:sortBy via toggleSort', async () => {
        const { wrapper, getCaptured } = mountTable()
        await wrapper.vm.$nextTick()
        const { toggleSort, headers: internalHeaders } = getCaptured() as any
        toggleSort(internalHeaders[0][0])
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('update:sortBy')).toBeTruthy()
    })

    it('émet update:itemsPerPage via setItemsPerPage', async () => {
        const { wrapper, getCaptured } = mountTable()
        await wrapper.vm.$nextTick()
        const { setItemsPerPage } = getCaptured() as any
        setItemsPerPage(1)
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('update:itemsPerPage')).toBeTruthy()
    })

    it('émet update:page via le v-model de la pagination du footer', async () => {
        const { wrapper } = mountTable({ itemsPerPage: 1 })
        await wrapper.vm.$nextTick()
        const pagination = wrapper.findComponent({ name: 'OrigamPagination' })
        expect(pagination.exists()).toBe(true)
        await (pagination.vm as any).$emit('update:modelValue', 2)
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('update:page')).toBeTruthy()
    })

    it('émet update:modelValue via toggleSelect', async () => {
        const { wrapper, getCaptured } = mountTable({ showSelect: true })
        await wrapper.vm.$nextTick()
        const { toggleSelect, items: rows } = getCaptured() as any
        toggleSelect(rows[0])
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('émet update:expanded via toggleExpand', async () => {
        const { wrapper, getCaptured } = mountTable({ showExpand: true })
        await wrapper.vm.$nextTick()
        const { toggleExpand, items: rows } = getCaptured() as any
        toggleExpand(rows[0])
        await wrapper.vm.$nextTick()
        expect(wrapper.emitted('update:expanded')).toBeTruthy()
    })
})
