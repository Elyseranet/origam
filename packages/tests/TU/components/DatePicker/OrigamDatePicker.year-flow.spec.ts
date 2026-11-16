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

        await wrapper.find('.origam-date-picker-controls__mode-btn').trigger('click')
        expect(view(wrapper)).toContain('origam-date-picker--years')

        const year2020 = wrapper.findAll('.origam-date-picker-years .origam-btn').find(b => b.text() === '2020')!
        await year2020.trigger('click')

        expect(view(wrapper)).toContain('origam-date-picker--months')
        expect(wrapper.emitted('update:year')?.at(-1)).toEqual([2020])
        expect(wrapper.emitted('update:month')).toBeUndefined()

        await wrapper.findAll('.origam-date-picker-months .origam-btn')[2].trigger('click')

        expect(view(wrapper)).toContain('origam-date-picker--month')
        expect(wrapper.emitted('update:month')?.at(-1)).toEqual([2])
    })

    it('re-picking the current year also moves on to the months grid', async () => {
        const wrapper = mountPicker()

        await wrapper.find('.origam-date-picker-controls__mode-btn').trigger('click')
        const year2024 = wrapper.findAll('.origam-date-picker-years .origam-btn').find(b => b.text() === '2024')!
        await year2024.trigger('click')

        expect(view(wrapper)).toContain('origam-date-picker--months')
    })
})
