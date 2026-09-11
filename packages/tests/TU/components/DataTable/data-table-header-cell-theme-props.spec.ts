// ADR-005 — `headerProps` read eagerly in `setup()` (issue #371, point 2).
//
// `<OrigamDataTableHeaderCell>` and `<OrigamDataTableHeadersCellMobile>`
// both wrote `const headerProps = mergeProps(props.headerProps ?? {})`
// directly in the body of `setup()`. Vue runs `setup()` BEFORE the
// `beforeCreate` hook where the theme-props-resolver patches
// `instance.props` — a theme naming `headerProps` under
// `theme.components['origam-data-table-header-cell']` (or the mobile
// counterpart) therefore never reached the component, and nothing warned.
//
// Fix: wrap the read in a `computed`, deferring evaluation to render time,
// after the resolver has run (same pattern as MediaController #429,
// Audio #648, DatePicker).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableHeaderCell from '@origam/components/DataTable/OrigamDataTableHeaderCell.vue'
import OrigamDataTableHeadersCellMobile from '@origam/components/DataTable/OrigamDataTableHeadersCellMobile.vue'
import { createOrigam } from '@origam/origam'

import {
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts'

import type { IOrigamTheme } from '@origam/interfaces'

const sonde = (components: IOrigamTheme['components']) => {
    const theme: IOrigamTheme = { name: 'sonde', components, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('sonde', undefined)
    return origam
}

const selectionProvide = () => ({
    [ORIGAM_DATA_TABLE_SELECT_KEY as symbol]: {
        isSelected: () => false,
        toggleSelect: vi.fn(),
        someSelected: ref(false),
        allSelected: ref(false),
        selectAll: vi.fn()
    },
    [ORIGAM_DATA_TABLE_SORT_KEY as symbol]: {
        sortBy: ref([]),
        toggleSort: vi.fn(),
        isSorted: () => false
    }
})

describe('OrigamDataTableHeaderCell — headerProps ADR-005 (#371)', () => {
    it('a theme-provided headerProps reaches the rendered <th>', () => {
        const wrapper = mount(OrigamDataTableHeaderCell, {
            props: {
                column: { key: 'name', title: 'Name', sortable: false },
                x: 0,
                y: 0
            } as never,
            global: {
                plugins: [sonde({ 'origam-data-table-header-cell': { headerProps: { 'data-theme-test': 'via-theme' } } })],
                provide: selectionProvide()
            }
        })

        expect(wrapper.attributes('data-theme-test')).toBe('via-theme')
    })
})

describe('OrigamDataTableHeadersCellMobile — headerProps ADR-005 (#371)', () => {
    // Root element is the `<tr>` — the theme-driven `headerProps` lands on
    // the `<th>` (`origam-data-table-column-cell` with `tag="th"`) nested
    // inside it, not on the wrapper row itself.
    it('a theme-provided headerProps reaches the rendered <th>', () => {
        const wrapper = mount(OrigamDataTableHeadersCellMobile, {
            props: {
                columns: [{ key: 'name', title: 'Name' }]
            } as never,
            global: {
                plugins: [sonde({ 'origam-data-table-headers-cell-mobile': { headerProps: { 'data-theme-test': 'via-theme' } } })],
                provide: selectionProvide()
            }
        })

        expect(wrapper.find('th').attributes('data-theme-test')).toBe('via-theme')
    })
})
