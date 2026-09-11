// Regression coverage for #473 — `prevProps` / `nextProps` were plain
// object literals built once at the top level of setup(), not `computed()`.
// They captured `props.prevIcon` / `props.nextIcon` as a one-time snapshot,
// which broke in two independent ways:
//
//   1. Reactivity (C3) — a consumer changing `prevIcon`/`nextIcon` reactively
//      after mount saw no update on the rendered nav button icon.
//   2. ADR-005 theme channel (C4) — the plain object was built during
//      setup(), before the theme-props resolver patches `instance.props`
//      in `beforeCreate` (which runs AFTER setup()). A theme naming
//      `theme.components['origam-window'].prevIcon` / `.nextIcon` could
//      never reach the button.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'

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

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

function mountWindow (props: Record<string, unknown> = {}, plugins: unknown[] = [createOrigam()]) {
    return mount(OrigamWindow, {
        props: { continuous: true, ...props } as never,
        global: { plugins }
    })
}

describe('OrigamWindow — prevIcon/nextIcon reactivity (#473)', () => {
    it('updates the prev button icon when prevIcon changes reactively after mount', async () => {
        const wrapper = mountWindow({ prevIcon: 'mdi-arrow-left' })

        const prevIconEl = wrapper.find('.origam-window__prev .origam-icon')
        expect(prevIconEl.classes()).toContain('mdi-arrow-left')

        await wrapper.setProps({ prevIcon: 'mdi-chevron-double-left' })
        await wrapper.vm.$nextTick()

        const updated = wrapper.find('.origam-window__prev .origam-icon')
        expect(updated.classes()).toContain('mdi-chevron-double-left')
        expect(updated.classes()).not.toContain('mdi-arrow-left')
    })

    it('updates the next button icon when nextIcon changes reactively after mount', async () => {
        const wrapper = mountWindow({ nextIcon: 'mdi-arrow-right' })

        const nextIconEl = wrapper.find('.origam-window__next .origam-icon')
        expect(nextIconEl.classes()).toContain('mdi-arrow-right')

        await wrapper.setProps({ nextIcon: 'mdi-chevron-double-right' })
        await wrapper.vm.$nextTick()

        const updated = wrapper.find('.origam-window__next .origam-icon')
        expect(updated.classes()).toContain('mdi-chevron-double-right')
        expect(updated.classes()).not.toContain('mdi-arrow-right')
    })
})

const THEME: IOrigamTheme = {
    name: 'window-defaults-theme',
    mode: 'light',
    components: {
        'origam-window': { prevIcon: 'mdi-arrow-left-bold', nextIcon: 'mdi-arrow-right-bold' }
    },
    vars: {}
}

function mountThemedWindow (props: Record<string, unknown> = {}) {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('window-defaults-theme', 'light')

    return mountWindow(props, [origam])
}

describe('OrigamWindow — theme.components["origam-window"] resolution (#473)', () => {
    it('applies the themed prevIcon/nextIcon when the consumer passes none', () => {
        const wrapper = mountThemedWindow()

        expect(wrapper.find('.origam-window__prev .origam-icon').classes()).toContain('mdi-arrow-left-bold')
        expect(wrapper.find('.origam-window__next .origam-icon').classes()).toContain('mdi-arrow-right-bold')
    })

    it('an explicit prevIcon/nextIcon prop on the consumer still wins over the theme default', () => {
        const wrapper = mountThemedWindow({ prevIcon: 'mdi-arrow-left', nextIcon: 'mdi-arrow-right' })

        expect(wrapper.find('.origam-window__prev .origam-icon').classes()).toContain('mdi-arrow-left')
        expect(wrapper.find('.origam-window__prev .origam-icon').classes()).not.toContain('mdi-arrow-left-bold')
        expect(wrapper.find('.origam-window__next .origam-icon').classes()).toContain('mdi-arrow-right')
        expect(wrapper.find('.origam-window__next .origam-icon').classes()).not.toContain('mdi-arrow-right-bold')
    })
})
