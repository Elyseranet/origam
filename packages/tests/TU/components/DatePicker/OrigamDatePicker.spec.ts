// Unit tests for <OrigamDatePicker> — default header rendering + click
// (issue #410).
//
// Bug 1: the `#header` template forwarded to `<origam-picker>` was itself
// gated by `slots.header` — the CONSUMER's own slot, not "is there a default
// render". Without a consumer-supplied `#header` slot, nothing reached
// `<origam-picker>`, whose own `v-if="slots.header"` then hid the whole
// header region. `<OrigamDatePickerHeader>` — designed to show the picked
// date and click back to month view — never appeared on the documented,
// no-slot-needed path.
//
// Bug 2: `@click="!viewModeIsMonth ? handleClickDate : undefined"` evaluated
// the ternary once and bound its RESULT (a function reference or
// `undefined`) as the handler — `handleClickDate` was returned, never
// invoked. Even if bug 1 were fixed in isolation, clicking the header would
// still do nothing.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePicker from '@origam/components/DatePicker/OrigamDatePicker.vue'
import { createOrigam } from '@origam/origam'

function mountPicker (props: Record<string, unknown> = {}) {
    return mount(OrigamDatePicker, {
        props: {modelValue: '2024-06-15', ...props} as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamDatePicker — default header rendering (#410)', () => {
    it('renders <origam-date-picker-header> with no slot passed by the consumer', () => {
        const wrapper = mountPicker()

        expect(wrapper.find('.origam-date-picker-header').exists()).toBe(true)
    })

    it('shows the formatted selected date in the header by default', () => {
        const wrapper = mountPicker()

        expect(wrapper.find('.origam-date-picker-header__content').exists()).toBe(true)
    })
})

function datePickerClasses (wrapper: ReturnType<typeof mountPicker>): string[] {
    return wrapper.find('.origam-date-picker').classes()
}

describe('OrigamDatePicker — header click returns to month view (#410)', () => {
    it('clicking the header while viewing "months" switches back to the month grid', async () => {
        const wrapper = mountPicker()

        await wrapper.find('.origam-date-picker-controls__month-btn').trigger('click')
        expect(datePickerClasses(wrapper)).toContain('origam-date-picker--months')

        await wrapper.find('.origam-date-picker-header').trigger('click')

        expect(datePickerClasses(wrapper)).toContain('origam-date-picker--month')
        expect(datePickerClasses(wrapper)).not.toContain('origam-date-picker--months')
    })

    it('clicking the header while already on the month view is a no-op', async () => {
        const wrapper = mountPicker({viewMode: 'month'})

        expect(datePickerClasses(wrapper)).toContain('origam-date-picker--month')

        await wrapper.find('.origam-date-picker-header').trigger('click')

        expect(datePickerClasses(wrapper)).toContain('origam-date-picker--month')
    })
})
