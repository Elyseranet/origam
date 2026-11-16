// Picking a year must chain to the months grid, then to the day grid.
// Bug: the years view wired `@update:year` to `handleUpdateMonth`, so picking
// a year never left the years grid (and emitted `update:month` with a year).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePicker from '@origam/components/DatePicker/OrigamDatePicker.vue'
import { createOrigam } from '@origam/origam'

// jsdom has no scrollIntoView; the years grid calls it on mount
Element.prototype.scrollIntoView ||= () => {}

function mountPicker () {
    return mount(OrigamDatePicker, {
        props: {modelValue: '2024-06-15'} as never,
        global: {plugins: [createOrigam()]}
    })
}

const view = (w: ReturnType<typeof mountPicker>) => w.find('.origam-date-picker').classes()

describe('OrigamDatePicker — year → month → day flow', () => {
    it('picking another year opens the months grid, picking a month opens the day grid', async () => {
        const wrapper = mountPicker()

        await wrapper.find('.origam-date-picker-controls__year-btn').trigger('click')
        expect(view(wrapper)).toContain('origam-date-picker--years')

        const year2020 = wrapper.findAll('.origam-date-picker-years .origam-btn').find(b => b.text() === '2020')!
        await year2020.trigger('click')

        expect(view(wrapper)).toContain('origam-date-picker--months')
        expect(wrapper.emitted('update:year')?.at(-1)).toEqual([2020])
        expect(wrapper.emitted('update:month')).toBeUndefined()

        await wrapper.findAll('.origam-date-picker-months .origam-btn')[2].trigger('click')

        expect(view(wrapper)).toContain('origam-date-picker--month')
        expect(wrapper.emitted('update:month')?.at(-1)).toEqual([2])

        // back on the day grid, prev/next must work again (they stayed disabled)
        const nav = wrapper.findAll('.origam-date-picker-controls__month .origam-btn')
        expect(nav.map(b => b.attributes('disabled'))).toEqual([undefined, undefined])
    })

    it('re-picking the current year also moves on to the months grid', async () => {
        const wrapper = mountPicker()

        await wrapper.find('.origam-date-picker-controls__year-btn').trigger('click')
        const year2024 = wrapper.findAll('.origam-date-picker-years .origam-btn').find(b => b.text() === '2024')!
        await year2024.trigger('click')

        expect(view(wrapper)).toContain('origam-date-picker--months')
    })
})

describe('OrigamDatePicker — prev/next arrows', () => {
    const navBtns = (w: ReturnType<typeof mountPicker>) => w.findAll('.origam-date-picker-controls__month .origam-btn')

    it('are enabled on the day grid and move to the next month', async () => {
        const wrapper = mountPicker()

        expect(navBtns(wrapper).map(b => b.attributes('disabled'))).toEqual([undefined, undefined])

        await navBtns(wrapper)[1].trigger('click')

        expect(wrapper.emitted('update:month')?.at(-1)).toEqual([6])
    })

    it('are disabled on the years grid', async () => {
        const wrapper = mountPicker()

        await wrapper.find('.origam-date-picker-controls__year-btn').trigger('click')

        expect(navBtns(wrapper).every(b => b.attributes('disabled') !== undefined)).toBe(true)
    })
})

describe('OrigamDatePickerControls — two buttons (#1365)', () => {
    const month = (w: ReturnType<typeof mountPicker>) => w.find('.origam-date-picker-controls__month-btn')
    const yearBtn = (w: ReturnType<typeof mountPicker>) => w.find('.origam-date-picker-controls__year-btn')

    it('shows the month and the year as two separate labelled buttons', () => {
        const wrapper = mountPicker()

        expect(month(wrapper).text()).toBe('June')
        expect(yearBtn(wrapper).text()).toBe('2024')
        expect(month(wrapper).attributes('aria-label')).toBe('Choose the month, currently June')
        expect(yearBtn(wrapper).attributes('aria-label')).toBe('Choose the year, currently 2024')
    })

    it('reflects the open grid through aria-expanded and a --open class', async () => {
        const wrapper = mountPicker()

        expect(month(wrapper).attributes('aria-expanded')).toBe('false')
        expect(yearBtn(wrapper).attributes('aria-expanded')).toBe('false')

        await yearBtn(wrapper).trigger('click')
        expect(yearBtn(wrapper).attributes('aria-expanded')).toBe('true')
        expect(yearBtn(wrapper).classes()).toContain('origam-date-picker-controls__year-btn--open')
        expect(month(wrapper).attributes('aria-expanded')).toBe('false')

        await yearBtn(wrapper).trigger('click')
        await month(wrapper).trigger('click')
        expect(month(wrapper).attributes('aria-expanded')).toBe('true')
        expect(month(wrapper).classes()).toContain('origam-date-picker-controls__month-btn--open')
        expect(yearBtn(wrapper).attributes('aria-expanded')).toBe('false')
    })
})
