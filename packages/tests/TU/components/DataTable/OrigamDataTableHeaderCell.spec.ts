// Unit tests for <OrigamDataTableHeaderCell> — multi-sort rank badge
// (issue #409, bug 3).
//
// `sortedItems(column)` computed
// `sortBy.value.findIndex(x => x.key === column.key! + 1)` — the `+ 1` is
// applied to `column.key` INSIDE the comparison instead of to the result of
// `findIndex`. `column.key! + 1` coerces a string key ('name') to `NaN` (or
// string-concatenates a numeric key), so the comparison never matches,
// `findIndex` always returns `-1`, and the multi-sort badge renders the
// literal text "-1" for every sorted column instead of its 1-based rank.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableHeaderCell from '@origam/components/DataTable/OrigamDataTableHeaderCell.vue'
import { createOrigam } from '@origam/origam'

import {
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts'

import type { IDataTableSortItem } from '@origam/interfaces'

function mountHeaderCell (sortBy: IDataTableSortItem[]) {
    return mount(OrigamDataTableHeaderCell, {
        props: {
            column: {key: 'name', title: 'Name', sortable: true},
            x: 0,
            y: 0,
            multiSort: true
        } as never,
        global: {
            plugins: [createOrigam()],
            provide: {
                [ORIGAM_DATA_TABLE_SELECT_KEY as symbol]: {
                    isSelected: () => false,
                    toggleSelect: vi.fn(),
                    someSelected: ref(false),
                    allSelected: ref(false),
                    selectAll: vi.fn()
                },
                [ORIGAM_DATA_TABLE_SORT_KEY as symbol]: {
                    sortBy: ref(sortBy),
                    toggleSort: vi.fn(),
                    isSorted: (column: { key: string }) => sortBy.some(s => s.key === column.key)
                }
            }
        }
    })
}

describe('OrigamDataTableHeaderCell — multi-sort rank badge (#409)', () => {
    it('shows rank 1 for the first sorted column, not -1', () => {
        const wrapper = mountHeaderCell([{key: 'name', order: 'asc'}])

        expect(wrapper.find('.origam-data-table-header-cell__sort-badge').text()).toBe('1')
    })

    it('shows rank 2 for the second sorted column', () => {
        const wrapper = mountHeaderCell([
            {key: 'other', order: 'asc'},
            {key: 'name', order: 'desc'}
        ])

        expect(wrapper.find('.origam-data-table-header-cell__sort-badge').text()).toBe('2')
    })
})
