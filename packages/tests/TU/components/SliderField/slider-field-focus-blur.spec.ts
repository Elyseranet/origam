// Does an `@focus` / `@blur` listener written on `<origam-slider-field>` ever
// fire? The doc's Emits table used to list `focus` and `blur` next to
// `start` / `end` / `update:modelValue`, as if they were component emits.
//
// They are not. `ISliderFieldEmits` declares only `ICommonsComponentEmits`
// (`update:modelValue`), `IFocusEmits` (`update:focused`), `start` and `end`,
// and the component never calls `emits('focus' | 'blur', …)` — its `@focus` /
// `@blur` handlers on the native `<input type="range">` call `useFocus`'s
// `onFocus()` / `onBlur()`, which emit `update:focused`.
//
// The remaining question was whether the listener nonetheless reaches the
// input through Vue's attrs fallthrough. It cannot, and the reason is plain
// DOM: `focus` and `blur` do not bubble. The listener lands on the component
// root (`<origam-input>`'s own root for the `field` variant, the `<section>`
// for `timer` / `audio`) — two levels above the input that actually takes
// focus — so a non-bubbling event fired on the input never reaches it.
//
// This is event propagation, not CSS resolution: jsdom implements
// `bubbles: false` on focus/blur faithfully, so the measurement here is
// sound (unlike a `getComputedStyle` on a `var()`-driven property — see
// CLAUDE.md §"getComputedStyle under jsdom").

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import { createOrigam } from '@origam/origam'

const mountSlider = (props: Record<string, unknown>) => mount(OrigamSliderField, {
    props: props as never,
    attachTo: document.body,
    global: { plugins: [createOrigam({})] }
})

describe('OrigamSliderField — focus / blur are not part of the emit surface', () => {
    it.each(['field', 'timer'])('a consumer @focus listener never fires (variant=%s)', async (variant) => {
        const onFocus = vi.fn()
        const wrapper = mountSlider({ modelValue: 50, variant, onFocus })

        const input = wrapper.get('input[type="range"]')
        await input.trigger('focus')

        expect(onFocus).not.toHaveBeenCalled()

        wrapper.unmount()
    })

    it.each(['field', 'timer'])('a consumer @blur listener never fires (variant=%s)', async (variant) => {
        const onBlur = vi.fn()
        const wrapper = mountSlider({ modelValue: 50, variant, onBlur })

        const input = wrapper.get('input[type="range"]')
        await input.trigger('focus')
        await input.trigger('blur')

        expect(onBlur).not.toHaveBeenCalled()

        wrapper.unmount()
    })

    it('neither `focus` nor `blur` appears on the emitted-events record', async () => {
        const wrapper = mountSlider({ modelValue: 50, variant: 'timer' })

        const input = wrapper.get('input[type="range"]')
        await input.trigger('focus')
        await input.trigger('blur')

        expect(wrapper.emitted('focus')).toBeUndefined()
        expect(wrapper.emitted('blur')).toBeUndefined()

        wrapper.unmount()
    })

    it('`update:focused` IS emitted, in both directions — that is the real channel', async () => {
        const wrapper = mountSlider({ modelValue: 50, variant: 'timer' })

        const input = wrapper.get('input[type="range"]')
        await input.trigger('focus')
        await input.trigger('blur')

        expect(wrapper.emitted('update:focused')).toEqual([[true], [false]])

        wrapper.unmount()
    })

    it('`focusin` DOES reach the root — it bubbles, unlike `focus`', async () => {
        const onFocusin = vi.fn()
        const wrapper = mountSlider({ modelValue: 50, variant: 'timer', onFocusin })

        wrapper.get('input[type="range"]').element
            .dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

        expect(onFocusin).toHaveBeenCalledTimes(1)

        wrapper.unmount()
    })
})
