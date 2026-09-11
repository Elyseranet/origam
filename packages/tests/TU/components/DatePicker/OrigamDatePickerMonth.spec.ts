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

// ── `color` prop (#550, C1) ────────────────────────────────────────────────
//
// `color` came from `IColorProps` and was exposed by the story, but nothing
// read it. The usual transversal channel (`useTextColor` on the root) could
// NOT serve it here and that is measurable, not a preference: the scoped
// rule `&__day` declares `color: var(--origam-date-picker__day---color, …)`
// on every cell, and that token is declared globally in `light.css` /
// `dark.css` — so the fallback never fires and a colour set on the root,
// which only acts by inheritance, loses to that direct declaration.
//
// The prop therefore feeds the TOKEN instead: a custom property set on the
// root is inherited by the cells and beats the `:root` one (nearest
// ancestor), with no specificity contest at all. `--origam-btn---color` is
// set alongside it because a day's label is rendered by `<origam-btn>`,
// which declares `color: var(--origam-btn---color, …)` on itself and would
// otherwise ignore the day token.
//
// ⛔ Same jsdom caveat as the Header spec: what is asserted here is the
// emitted surface (raw `style` attribute + the `useStyle()` rule), never a
// computed colour. The rendered colour is measured in Chromium —
// `packages/tests/e2e/date-picker-color.spec.ts`.
describe('OrigamDatePickerMonth — color prop', () => {
    it('emits no colour variable when `color` is absent', () => {
        const wrapper = mountMonth()

        const style = wrapper.attributes('style') ?? ''
        expect(style).not.toContain('--origam-date-picker__day---color')
        expect(style).not.toContain('--origam-btn---color')
    })

    it('feeds the day token AND the btn token for a tokenised value', () => {
        const wrapper = mountMonth({color: 'primary'})

        const style = wrapper.attributes('style') ?? ''
        expect(style).toContain('--origam-date-picker__day---color: var(--origam-color__action--primary---fgSubtle)')
        expect(style).toContain('--origam-btn---color: var(--origam-color__action--primary---fgSubtle)')
    })

    it('feeds a raw CSS colour untouched', () => {
        const wrapper = mountMonth({color: '#ff0080'})

        const style = wrapper.attributes('style') ?? ''
        expect(style).toContain('--origam-date-picker__day---color: #ff0080')
        expect(style).toContain('--origam-btn---color: #ff0080')
    })

    it('changes the emitted value when the prop changes', async () => {
        const wrapper = mountMonth({color: 'primary'})

        await wrapper.setProps({color: 'success'} as never)

        const style = wrapper.attributes('style') ?? ''
        expect(style).toContain('--origam-date-picker__day---color: var(--origam-color__feedback--success---fgSubtle)')
        expect(style).not.toContain('primary---fgSubtle')
    })

    it('carries the variables into the rule useStyle() injects in <head>', () => {
        const wrapper = mountMonth({color: 'primary'})

        const id = wrapper.attributes('id')
        expect(id).toBeTruthy()

        const sheets = Array.from(document.head.querySelectorAll('style'))
            .map((el) => el.textContent ?? '')
            .filter((text) => text.includes(`#${id}`))

        expect(sheets.length).toBeGreaterThan(0)
        // The custom-property name is case-sensitive and must NOT be
        // kebab-mangled by `toKebabCase` on the way into the sheet.
        expect(sheets.join('\n')).toContain('--origam-date-picker__day---color: var(--origam-color__action--primary---fgSubtle)')
    })
})
