// Unit tests for <OrigamDataTableRow> — select / expand invocation (issue #439).
//
// `handleCheckBoxClick` / `handleBtnClick` called `withModifiers(() => fn(),
// ['stop'])` as a bare STATEMENT, never wired to a `v-on` binding.
// `withModifiers` is a factory: it returns a NEW wrapped handler and stops
// nothing, invokes nothing, on its own. `toggleSelect` / `toggleExpand`
// were therefore never called, while `emits('select')` / `emits('expand')`
// fired unconditionally right after — the row LIES about having selected
// or expanded anything.
//
// `OrigamDataTableRow` reads its collaborators via `inject()`
// (`useSelection`, `useExpanded`, `useHeaders`, `useSort`) — normally wired
// by a parent `<OrigamDataTable>`. Tests provide minimal fakes through
// `global.provide` so the row can be exercised in isolation, spying on
// `toggleSelect` / `toggleExpand` directly rather than asserting on
// selection-set side effects.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableRow from '@origam/components/DataTable/OrigamDataTableRow.vue'
import { createOrigam } from '@origam/origam'

import {
    ORIGAM_DATA_TABLE_EXPAND_KEY,
    ORIGAM_DATA_TABLE_HEADERS_KEY,
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SHOW_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts'

import type { IDataTableItem } from '@origam/interfaces'

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

function makeItem (): IDataTableItem {
    return {
        key: 'row-1',
        index: 0,
        value: 'row-1',
        selectable: true,
        raw: {name: 'Item 1'},
        columns: {name: 'Item 1'}
    } as unknown as IDataTableItem
}

function mountRow (columnKey: 'data-table-select' | 'data-table-expand') {
    const toggleSelect = vi.fn()
    const toggleExpand = vi.fn()

    const wrapper = mount(OrigamDataTableRow, {
        props: {item: makeItem()} as never,
        global: {
            plugins: [createOrigam()],
            provide: {
                [ORIGAM_DATA_TABLE_SELECT_KEY as symbol]: {
                    isSelected: () => false,
                    toggleSelect,
                    someSelected: ref(false),
                    allSelected: ref(false),
                    selectAll: vi.fn()
                },
                [ORIGAM_DATA_TABLE_EXPAND_KEY as symbol]: {
                    expand: vi.fn(),
                    expanded: ref(new Set()),
                    expandOnClick: ref(false),
                    isExpanded: () => false,
                    toggleExpand
                },
                [ORIGAM_DATA_TABLE_HEADERS_KEY as symbol]: {
                    headers: ref([]),
                    columns: ref([{key: columnKey, title: ''}])
                },
                [ORIGAM_DATA_TABLE_SORT_KEY as symbol]: {
                    sortBy: ref([]),
                    toggleSort: vi.fn(),
                    isSorted: () => false
                },
                [ORIGAM_DATA_TABLE_SHOW_SELECT_KEY as symbol]: ref(true)
            }
        }
    })

    return {wrapper, toggleSelect, toggleExpand}
}

describe('OrigamDataTableRow — select checkbox (#439)', () => {
    it('calls toggleSelect(item) when the select checkbox is clicked', async () => {
        const {wrapper, toggleSelect} = mountRow('data-table-select')

        await wrapper.find('input[type="checkbox"]').trigger('click')

        expect(toggleSelect).toHaveBeenCalledTimes(1)
        expect(toggleSelect).toHaveBeenCalledWith(expect.objectContaining({key: 'row-1'}))
    })

    it('emits "select" when the select checkbox is clicked', async () => {
        const {wrapper} = mountRow('data-table-select')

        await wrapper.find('input[type="checkbox"]').trigger('click')

        expect(wrapper.emitted('select')).toBeTruthy()
    })
})

describe('OrigamDataTableRow — expand button (#439)', () => {
    it('calls toggleExpand(item) when the expand button is clicked', async () => {
        const {wrapper, toggleExpand} = mountRow('data-table-expand')

        await wrapper.find('button').trigger('click')

        expect(toggleExpand).toHaveBeenCalledTimes(1)
        expect(toggleExpand).toHaveBeenCalledWith(expect.objectContaining({key: 'row-1'}))
    })

    it('emits "expand" when the expand button is clicked', async () => {
        const {wrapper} = mountRow('data-table-expand')

        await wrapper.find('button').trigger('click')

        expect(wrapper.emitted('expand')).toBeTruthy()
    })
})
