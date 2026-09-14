// Regression coverage for #521 / #522 — <OrigamTab> and <OrigamTabPanel>
// declared an `id` prop and threw it away: their DOM id AND their
// cross-reference (`aria-controls` on the tab / `aria-labelledby` on the
// panel) were both computed from the internal group-registration id
// (`groupItem.id`), never from `props.id`.
//
// The naive fix — bind `:id="props.id || generated"` on each side alone —
// is not enough and would have been WRONG: the tab GUESSED the panel's DOM
// id from the generated-fallback naming scheme (`origam-tab-panel-${id}`),
// and the panel guessed the tab's the same way. If only the local id is
// fixed, a consumer-supplied `id` on one side silently breaks the ARIA
// pairing with the sibling, because the sibling's guess no longer matches
// the real DOM id. The fix instead publishes each side's OWN resolved id
// onto its group registration entry (`IGroupItem.domId`) so the sibling
// reads the REAL id instead of reconstructing a guess.
//
// This spec mounts <OrigamTabs> / <OrigamTabPanels> as SIBLINGS — the
// documented usage (see tabs-panels-aria-link.spec.ts, #441) — and proves
// the pairing holds in all four combinations: neither side customized,
// only the tab, only the panel, and both.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'

import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'
import OrigamTab from '@origam/components/Tabs/OrigamTab.vue'
import OrigamTabPanels from '@origam/components/Tabs/OrigamTabPanels.vue'
import OrigamTabPanel from '@origam/components/Tabs/OrigamTabPanel.vue'
import { createOrigam } from '@origam/origam'

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

const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamDefaultsProvider: { template: '<slot/>' },
        OrigamIcon: { template: '<span/>' }
    }
})

function buildSiblingUsage (tabId?: string, panelId?: string) {
    const SiblingUsage = defineComponent({
        name: 'SiblingUsage',
        setup () {
            return () => [
                h(OrigamTabs, { modelValue: 'a' }, {
                    default: () => [
                        h(OrigamTab, { value: 'a', text: 'Tab A', ...(tabId ? { id: tabId } : {}) }),
                        h(OrigamTab, { value: 'b', text: 'Tab B' })
                    ]
                }),
                h(OrigamTabPanels, { modelValue: 'a' }, {
                    default: () => [
                        h(OrigamTabPanel, { value: 'a', ...(panelId ? { id: panelId } : {}) }, () => 'Panel A'),
                        h(OrigamTabPanel, { value: 'b' }, () => 'Panel B')
                    ]
                })
            ]
        }
    })

    return mount(SiblingUsage, { attachTo: document.body, global: makeGlobal() })
}

describe('OrigamTab / OrigamTabPanel — ARIA pairing with a consumer id (#521, #522)', () => {
    it('neither side customized: aria-controls / aria-labelledby still cross-reference the real ids (no regression)', async () => {
        const wrapper = buildSiblingUsage()
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[0]
        const panel = wrapper.findAll('[role="tabpanel"]')[0]

        expect(tab.attributes('id')).toBeTruthy()
        expect(panel.attributes('id')).toBeTruthy()
        expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
        expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))

        wrapper.unmount()
    })

    it('tab customized, panel default: the tab id is honored AND the panel still points at it', async () => {
        const wrapper = buildSiblingUsage('my-tab-id')
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[0]
        const panel = wrapper.findAll('[role="tabpanel"]')[0]

        expect(tab.attributes('id')).toBe('my-tab-id')
        expect(panel.attributes('aria-labelledby')).toBe('my-tab-id')
        expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))

        wrapper.unmount()
    })

    it('panel customized, tab default: the panel id is honored AND the tab still points at it', async () => {
        const wrapper = buildSiblingUsage(undefined, 'my-panel-id')
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[0]
        const panel = wrapper.findAll('[role="tabpanel"]')[0]

        expect(panel.attributes('id')).toBe('my-panel-id')
        expect(tab.attributes('aria-controls')).toBe('my-panel-id')
        expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))

        wrapper.unmount()
    })

    it('both sides customized: both ids are honored and the cross-reference still holds', async () => {
        const wrapper = buildSiblingUsage('my-tab-id', 'my-panel-id')
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[0]
        const panel = wrapper.findAll('[role="tabpanel"]')[0]

        expect(tab.attributes('id')).toBe('my-tab-id')
        expect(panel.attributes('id')).toBe('my-panel-id')
        expect(tab.attributes('aria-controls')).toBe('my-panel-id')
        expect(panel.attributes('aria-labelledby')).toBe('my-tab-id')

        wrapper.unmount()
    })

    it('the untouched second pair (tab b / panel b) is still linked correctly alongside a customized first pair', async () => {
        const wrapper = buildSiblingUsage('my-tab-id', 'my-panel-id')
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[1]
        const panel = wrapper.findAll('[role="tabpanel"]')[1]

        expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
        expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))

        wrapper.unmount()
    })
})
