// Regression coverage for the C4/ADR-005 defect on <OrigamDatePicker>
// (classeur reconciliation 2026-09-11, "tete de file" lot — OrigamDatePicker,
// C4 column, gravite majeur).
//
// `month`/`year` (from `ICalendarProps`, no `withDefaults` default) were
// seeded via:
//
//     const month = ref(Number(props.month ?? adapter.getMonth(...)))
//     const year  = ref(Number(props.year ?? adapter.getYear(...)))
//
// Both are EAGER reads in the body of `setup()`. Vue runs `setup()` BEFORE
// the `beforeCreate` hook where the ADR-005 theme-props resolver patches
// `instance.props` (root CLAUDE.md), so a theme setting a default `month`/
// `year` on `origam-date-picker` is captured too late and silently lost.
//
// Same family as #429 (OrigamMediaController) and #448 (OrigamPagination
// `start`) — fixed the same way: lazy UNSEEDED seed, read on first access.

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePicker from '@origam/components/DatePicker/OrigamDatePicker.vue'
import { createOrigam } from '@origam/origam'

import type { IOrigamTheme } from '@origam/interfaces'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach((el) => el.remove())
})

const THEME: IOrigamTheme = {
    name: 'date-picker-defaults-theme',
    mode: 'light',
    components: {
        'origam-date-picker': { month: 0, year: 2031 }
    },
    vars: {}
}

function mountThemedDatePicker () {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('date-picker-defaults-theme', 'light')

    return mount(OrigamDatePicker, {
        global: { plugins: [origam] }
    })
}

describe('OrigamDatePicker — theme.components["origam-date-picker"] month/year defaults', () => {
    it('a theme default for year is NOT lost at mount', () => {
        const wrapper = mountThemedDatePicker()
        const monthBtn = wrapper.find('.origam-date-picker-controls__month-btn')

        expect(monthBtn.exists()).toBe(true)
        expect(monthBtn.text()).toContain('2031')
    })
})
