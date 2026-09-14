// #700 — `<OrigamDatePicker text="…">` was silently ignored.
//
// `IDatePickerProps` reaches `text?: string` through
// `Omit<IDatePickerControlsProps, 'active'>` (the Omit drops `active`, NOT
// `text`), so the prop is genuinely declared and a consumer can pass it.
// Inside the component a module-scope `const text = computed(…)` — the
// "month and year" label derived from the displayed month/year — masked it:
// in `<script setup>` the template reads the bare name, so `:text="text"`
// forwarded the LOCAL, never the prop. `props.text` was read nowhere else,
// and `text` sits in the `filterProps` exclusion list, so no second path
// existed either.
//
// POSITIVE CONTROL — `<OrigamDatePickerControls text="…">` mounted directly.
// It is the same child, the same prop, the same rendered button; if the
// harness could not actuate `text` at all, the control would fail too and
// the verdict below would be a harness artefact rather than a defect.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePicker from '@origam/components/DatePicker/OrigamDatePicker.vue'
import OrigamDatePickerControls from '@origam/components/DatePicker/OrigamDatePickerControls.vue'
import { createOrigam } from '@origam/origam'

const CUSTOM_TEXT = 'Periode de reference'

function monthButtonText (wrapper: { find: (s: string) => { text: () => string } }): string {
    return wrapper.find('.origam-date-picker-controls__month-btn').text()
}

describe('OrigamDatePickerControls — positive control', () => {
    it('renders the `text` prop on the month button', () => {
        const wrapper = mount(OrigamDatePickerControls, {
            props: {text: CUSTOM_TEXT} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(monthButtonText(wrapper)).toContain(CUSTOM_TEXT)
    })
})

describe('OrigamDatePicker — the `text` prop reaches the controls (#700)', () => {
    it('renders the consumer-supplied `text` on the month button', () => {
        const wrapper = mount(OrigamDatePicker, {
            props: {modelValue: '2024-06-15', text: CUSTOM_TEXT} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(monthButtonText(wrapper)).toContain(CUSTOM_TEXT)
    })

    it('keeps the derived month-and-year label when no `text` is passed', () => {
        const wrapper = mount(OrigamDatePicker, {
            props: {modelValue: '2024-06-15'} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(monthButtonText(wrapper)).toBe('June 2024')
    })

    // `||`, not `??` — same operator as the `label` fix of #665 / #666
    // (PR #692). That button is the only place the user reads which month is
    // on screen, so an empty string falls back rather than blanking it.
    it('falls back to the month-and-year label on an empty `text`', () => {
        const wrapper = mount(OrigamDatePicker, {
            props: {modelValue: '2024-06-15', text: ''} as never,
            global: {plugins: [createOrigam()]}
        })

        expect(monthButtonText(wrapper)).toBe('June 2024')
    })
})
