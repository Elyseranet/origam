// ⛔ #577 — `click:prepend` / `click:append` are REMOVED from `<OrigamBtn>`,
// not merely deprecated any more. This is a functional/behavioural check
// (Vue emit dispatch), not a jsdom `getComputedStyle` question — see
// CLAUDE.md "`getComputedStyle` under jsdom NEVER resolves `var()`" for why
// that distinction matters here: a type-only removal from `IBtnEmits` would
// prove nothing about runtime behaviour, since TypeScript types vanish at
// build time regardless of what the compiled component still does.
//
// A/B against the parent commit (pre-#577): with `IBtnEmits extends
// IAdjacentEmits` and the `origam-btn__prepend` / `__append` spans bound to
// `@click="handleClickPrepend"` / `handleClickAppend`, a real click on
// either span invoked `vm.emit('click:prepend' | 'click:append', e)`, which
// dispatched to a `onClick:prepend` / `onClick:append` prop listener. That
// is the exact assertion this spec makes fail on `HEAD~1` and pass on
// `HEAD` — reproduced by hand before landing this file.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import { createOrigam } from '@origam/origam'
import { MDI_ICONS } from '@origam/enums'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

describe('OrigamBtn — click:prepend / click:append removed (#443, #577)', () => {
    it('a mouse click on the prepend zone never invokes an onClick:prepend listener', async () => {
        const onClickPrepend = vi.fn()

        const wrapper = mount(OrigamBtn, {
            props: {
                text: 'Button',
                prependIcon: MDI_ICONS.HEART,
                'onClick:prepend': onClickPrepend
            } as never,
            global: { plugins: [createOrigam()] }
        })

        await wrapper.find('.origam-btn__prepend').trigger('click')

        expect(onClickPrepend).not.toHaveBeenCalled()
    })

    it('a mouse click on the append zone never invokes an onClick:append listener', async () => {
        const onClickAppend = vi.fn()

        const wrapper = mount(OrigamBtn, {
            props: {
                text: 'Button',
                appendIcon: MDI_ICONS.ARROW_RIGHT,
                'onClick:append': onClickAppend
            } as never,
            global: { plugins: [createOrigam()] }
        })

        await wrapper.find('.origam-btn__append').trigger('click')

        expect(onClickAppend).not.toHaveBeenCalled()
    })

    it('the prepend/append slots still render — only the emit is gone, not the zone', () => {
        const wrapper = mount(OrigamBtn, {
            props: {
                text: 'Button',
                prependIcon: MDI_ICONS.HEART,
                appendIcon: MDI_ICONS.ARROW_RIGHT
            } as never,
            global: { plugins: [createOrigam()] }
        })

        expect(wrapper.find('.origam-btn__prepend').exists()).toBe(true)
        expect(wrapper.find('.origam-btn__append').exists()).toBe(true)
    })
})
