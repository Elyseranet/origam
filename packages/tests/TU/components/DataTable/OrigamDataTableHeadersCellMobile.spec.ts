// Unit tests for <OrigamDataTableHeadersCellMobile> — "select all" append
// icon (issue #409, bug 2).
//
// `handleAppendCLick` called `selectAll(!allSelected)`. `allSelected` is the
// `ComputedRef<boolean>` returned by `useSelection()` (see
// `select.composable.ts:82`) — an object, always truthy — so `!allSelected`
// is always `false` and `selectAll(false)` fires unconditionally regardless
// of the actual selection state. The mobile "select all" icon can only ever
// deselect.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableHeadersCellMobile from '@origam/components/DataTable/OrigamDataTableHeadersCellMobile.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import { createOrigam } from '@origam/origam'

import {
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts'

function mountCell (allSelectedInitial: boolean) {
    const selectAll = vi.fn()

    const wrapper = mount(OrigamDataTableHeadersCellMobile, {
        props: {
            columns: [{key: 'data-table-select', title: ''}]
        } as never,
        global: {
            plugins: [createOrigam()],
            provide: {
                [ORIGAM_DATA_TABLE_SELECT_KEY as symbol]: {
                    isSelected: () => false,
                    toggleSelect: vi.fn(),
                    someSelected: ref(false),
                    allSelected: ref(allSelectedInitial),
                    selectAll
                },
                [ORIGAM_DATA_TABLE_SORT_KEY as symbol]: {
                    sortBy: ref([]),
                    toggleSort: vi.fn(),
                    isSorted: () => false
                }
            }
        }
    })

    return {wrapper, selectAll}
}

describe('OrigamDataTableHeadersCellMobile — select-all append click (#409)', () => {
    it('calls selectAll(true) when nothing is currently selected', async () => {
        const {wrapper, selectAll} = mountCell(false)

        await wrapper.findComponent(OrigamSelect).vm.$emit('click:append', new MouseEvent('click'))

        expect(selectAll).toHaveBeenCalledWith(true)
    })

    it('calls selectAll(false) when everything is currently selected', async () => {
        const {wrapper, selectAll} = mountCell(true)

        await wrapper.findComponent(OrigamSelect).vm.$emit('click:append', new MouseEvent('click'))

        expect(selectAll).toHaveBeenCalledWith(false)
    })
})
