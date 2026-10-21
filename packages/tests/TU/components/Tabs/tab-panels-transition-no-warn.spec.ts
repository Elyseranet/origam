// Regression for #1207 — TabPanels pushed `transition` as a slot default to
// <origam-tab-panel>, which does not declare it (the panel reads the panels
// context instead): dev warning on every <OrigamCodeGroup>.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import OrigamTabPanels from '@origam/components/Tabs/OrigamTabPanels.vue'
import OrigamTabPanel from '@origam/components/Tabs/OrigamTabPanel.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamTabPanels — transition does not leak onto OrigamTabPanel (#1207)', () => {
    afterEach(() => vi.restoreAllMocks())

    it.each([false, 'slide'])('passing transition=%s logs no "has no effect" warning', (transition) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mount(OrigamTabPanels, {
            props: { transition } as never,
            slots: { default: () => h(OrigamTabPanel, { value: 'a' }) },
            global: { plugins: [createOrigam()] }
        })

        const offending = warn.mock.calls.filter(c => String(c[0]).includes('has no effect'))
        expect(offending).toEqual([])
        wrapper.unmount()
    })
})
