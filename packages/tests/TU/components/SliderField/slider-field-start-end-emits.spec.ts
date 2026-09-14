// #C7 (lot mineur C2/C8/C7, 2026-09-11) — issue #465's "note complémentaire
// (C5/C7)" flagged that the "Events - start" / "Events - end" Variants of
// `slider-field.spec.ts` (e2e) only assert the slider is VISIBLE, never that
// `start` / `end` actually fire on pointerdown / pointerup. Same family as
// #456 (Select): a story + a passing test that together imply behaviour
// neither one exercises.
//
// `start` / `end` ARE real emits (`emits('start', model.value)` /
// `emits('end', model.value)` in OrigamSliderField.vue's `handleStart` /
// `handleEnd`) — this is not a dead-emit defect like Select's. What was
// missing is proof. `wrapper.emitted(...)` is one of the reliable jsdom
// signals per CLAUDE.md's "getComputedStyle under jsdom" table (alongside
// `wrapper.classes()` and the rendered HTML) — no `var()` resolution
// involved, so this doesn't need the Playwright/Histoire round-trip the e2e
// suite reserves for computed-style assertions.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import { createOrigam } from '@origam/origam'

const mountSlider = (props: Record<string, unknown>) => mount(OrigamSliderField, {
    props: props as never,
    attachTo: document.body,
    global: { plugins: [createOrigam({})] }
})

describe('OrigamSliderField — start / end fire on pointerdown / pointerup (#465)', () => {
    it.each(['field', 'timer'])('pointerdown on the native input emits `start` with the current value (variant=%s)', async (variant) => {
        const wrapper = mountSlider({ modelValue: 42, variant })

        const input = wrapper.get('input[type="range"]')
        await input.trigger('pointerdown')

        expect(wrapper.emitted('start')).toEqual([[42]])

        wrapper.unmount()
    })

    it.each(['field', 'timer'])('pointerup on the native input emits `end` with the current value (variant=%s)', async (variant) => {
        const wrapper = mountSlider({ modelValue: 42, variant })

        const input = wrapper.get('input[type="range"]')
        await input.trigger('pointerup')

        expect(wrapper.emitted('end')).toEqual([[42]])

        wrapper.unmount()
    })

    it('a full press-drag-release sequence emits start once, then end once, in order', async () => {
        const wrapper = mountSlider({ modelValue: 10, variant: 'field' })
        const input = wrapper.get('input[type="range"]')

        await input.trigger('pointerdown')
        await input.setValue('55')
        await input.trigger('pointerup')

        expect(wrapper.emitted('start')).toHaveLength(1)
        expect(wrapper.emitted('end')).toHaveLength(1)
        // `end` reads the model AFTER the drag committed the new value.
        expect(wrapper.emitted('end')![0]).toEqual([55])

        wrapper.unmount()
    })

    it('disabled suppresses both `start` and `end` — jsdom does not dispatch pointer events on a disabled form control', async () => {
        const wrapper = mountSlider({ modelValue: 10, variant: 'field', disabled: true })
        const input = wrapper.get('input[type="range"]')

        await input.trigger('pointerdown')
        expect(wrapper.emitted('start')).toBeUndefined()

        await input.trigger('pointerup')
        // Not `handleEnd`'s own guard (it has none) — the native `disabled`
        // attribute on the `<input>` itself blocks the event at the DOM
        // level, same as a real browser. Measured, not assumed: an earlier
        // version of this test asserted `end` still fires here and failed.
        expect(wrapper.emitted('end')).toBeUndefined()

        wrapper.unmount()
    })

    it('readonly does NOT disable the input — `start` short-circuits via handleStart\'s own guard, `end` still fires', async () => {
        const wrapper = mountSlider({ modelValue: 10, variant: 'field', readonly: true })
        const input = wrapper.get('input[type="range"]')

        await input.trigger('pointerdown')
        expect(wrapper.emitted('start')).toBeUndefined()

        await input.trigger('pointerup')
        expect(wrapper.emitted('end')).toEqual([[10]])

        wrapper.unmount()
    })
})
