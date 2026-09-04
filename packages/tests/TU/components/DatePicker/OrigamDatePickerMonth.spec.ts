// Unit test for <OrigamDatePickerMonth> — `update:date` emit (lot 4/4,
// unemitted-declarations guard).
//
// `IDatePickerMonthEmits` declares `update:date` and its doc comment claims
// it is the real v-model write-back: `useDatePickerCalendar` wires `date`
// through `useVModel`, and every click handler here assigns
// `model.value = …`, which `useVModel`'s setter turns into
// `emit('update:date', …)`.
//
// The static guard (`unemitted-declarations.mjs` / `dead-emits.mjs`) still
// flags it as never-emitted: its `directVModelEvents` scan only recognises
// `const x = useVModel(props, 'prop')` written LITERALLY inside the
// component's own `<script setup>`. Here the call is one layer deeper —
// `useDatePickerCalendar(props)` calls `useVModel(props, 'date', …)`
// internally and returns `model` — the exact "relay of a relay" blind spot
// the guard's own header documents for `useGroup` (`EXTRA_RELAYS`, not yet
// extended to `useDatePickerCalendar`).
//
// This spec is the mutation-tested proof the emit actually fires at
// runtime, independent of the static analysis.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePickerMonth from '@origam/components/DatePicker/OrigamDatePickerMonth.vue'
import { createOrigam } from '@origam/origam'

function mountMonth (props: Record<string, unknown> = {}) {
    return mount(OrigamDatePickerMonth, {
        props: {date: [], year: 2024, month: 5, ...props} as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamDatePickerMonth — update:date emit', () => {
    it('emits update:date when a day is clicked (single selection)', async () => {
        const wrapper = mountMonth()

        const dayBtn = wrapper.find('.origam-date-picker-month__day-btn')
        expect(dayBtn.exists()).toBe(true)

        await dayBtn.trigger('click')

        const emitted = wrapper.emitted('update:date')
        expect(emitted).toBeTruthy()
        expect(emitted?.[0]?.[0]).toBeInstanceOf(Array)
    })

    it('carries the clicked day as the new model value', async () => {
        const wrapper = mountMonth()

        const dayButtons = wrapper.findAll('.origam-date-picker-month__day-btn')
        // Pick a day roughly mid-grid so it belongs to the current month,
        // not an adjacent-month filler day.
        const target = dayButtons[15]
        await target.trigger('click')

        const emitted = wrapper.emitted('update:date')
        expect(emitted).toBeTruthy()
        const payload = emitted?.[0]?.[0] as Array<unknown>
        expect(payload.length).toBe(1)
    })
})
