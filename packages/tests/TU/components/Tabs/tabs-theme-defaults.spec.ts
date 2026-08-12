// Regression coverage for #279 — `<OrigamTabs>` (the PARENT, sole owner of
// the `indicator` prop, renamed from `variant` — ADR-005, Q4) never called
// `useDefaults()`, so `theme.components['origam-tabs']` (e.g.
// `indicator: 'pills'`) was completely inert — the resolved
// `props.indicator` always fell straight through to `withDefaults()`'s
// `'default'`, and the `slotDefaults` forwarded to descendant `<OrigamTab>`
// never picked up the theme's pill styling either (it reads straight off
// `props.indicator`).

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const THEME: IOrigamTheme = {
    name: 'tabs-defaults-theme',
    mode: 'light',
    components: {
        'origam-tabs': { indicator: 'pills', fixed: true }
    },
    vars: {}
}

const mountThemedTabs = (props: Record<string, unknown> = {}) => {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('tabs-defaults-theme', 'light')

    return mount(OrigamTabs, {
        attachTo: document.body,
        global: {
            plugins: [origam],
            stubs: { OrigamIcon: { template: '<span/>' } }
        },
        props: { modelValue: 'a', ...props }
    })
}

describe('OrigamTabs — theme.components["origam-tabs"] resolution (#279)', () => {
    it('applies the theme indicator ("pills") to the root class', () => {
        const wrapper = mountThemedTabs()
        expect(wrapper.classes()).toContain('origam-tabs--pills')
        expect(wrapper.classes()).not.toContain('origam-tabs--default')
        wrapper.unmount()
    })

    it('applies the theme fixed:true modifier', () => {
        const wrapper = mountThemedTabs()
        expect(wrapper.classes()).toContain('origam-tabs--fixed')
        wrapper.unmount()
    })

    it('an explicit indicator prop on the consumer still wins over the theme default', () => {
        const wrapper = mountThemedTabs({ indicator: 'underline' })
        expect(wrapper.classes()).toContain('origam-tabs--underline')
        expect(wrapper.classes()).not.toContain('origam-tabs--pills')
        wrapper.unmount()
    })
})
