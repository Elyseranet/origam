// Regression for #441 — OrigamTab / OrigamTabPanel ARIA link is entirely
// broken in the DOCUMENTED sibling usage (OrigamTabs.md):
//
//     <OrigamTabs>…</OrigamTabs>
//     <OrigamTabPanels>…</OrigamTabPanels>
//
// `OrigamTab` computed `aria-controls` (panelId) by `inject(ORIGAM_TAB_PANELS_KEY)`
// and `OrigamTabPanel` computed `aria-labelledby` (tabLabelledBy) by
// `inject(ORIGAM_TABS_KEY)`. Both injections walk the ANCESTOR chain of the
// injecting component — but `OrigamTabPanels` is a SIBLING of `OrigamTabs` in
// this usage, never its ancestor (and vice versa), so both injections always
// resolved to `null` and both ARIA attributes were permanently `undefined`.
//
// This spec mounts the two component trees EXACTLY as the doc's sibling
// usage does (via a thin wrapper, matching the `Default (playground)` story
// variant covered by tabs.spec.ts's e2e `test.fail`) — NOT nested one inside
// the other, which would hide the bug.

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

// Mirrors OrigamTabs.story.vue's "Default (playground)" variant markup:
// <origam-tabs>…</origam-tabs> immediately followed by
// <origam-tab-panels>…</origam-tab-panels>, as SIBLINGS under one parent.
const SiblingUsage = defineComponent({
    name: 'SiblingUsage',
    setup () {
        return () => [
            h(OrigamTabs, {modelValue: 'a'}, {
                default: () => [
                    h(OrigamTab, {value: 'a', text: 'Tab A'}),
                    h(OrigamTab, {value: 'b', text: 'Tab B'})
                ]
            }),
            h(OrigamTabPanels, {modelValue: 'a'}, {
                default: () => [
                    h(OrigamTabPanel, {value: 'a'}, () => 'Panel A'),
                    h(OrigamTabPanel, {value: 'b'}, () => 'Panel B')
                ]
            })
        ]
    }
})

function buildSiblingUsage () {
    return mount(SiblingUsage, {
        attachTo: document.body,
        global: makeGlobal()
    })
}

describe('OrigamTab / OrigamTabPanel — sibling ARIA link (#441)', () => {
    // The link is resolved inside `onMounted` (see useGroupSiblingLink) —
    // `mounted` hooks queued during the initial synchronous render only run
    // on the following microtask, so an `await nextTick()` is required
    // before asserting, exactly like every other post-mount assertion in
    // this suite (see OrigamTabs.spec.ts's keyboard-navigation specs).
    it('aria-controls on the tab points at the matching panel DOM id', async () => {
        const wrapper = buildSiblingUsage()
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[0]
        const panel = wrapper.findAll('[role="tabpanel"]')[0]

        const controls = tab.attributes('aria-controls')
        const panelDomId = panel.attributes('id')

        expect(controls).toBeTruthy()
        expect(controls).toBe(panelDomId)

        wrapper.unmount()
    })

    it('aria-labelledby on the panel points at the matching tab DOM id', async () => {
        const wrapper = buildSiblingUsage()
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[0]
        const panel = wrapper.findAll('[role="tabpanel"]')[0]

        const labelledBy = panel.attributes('aria-labelledby')
        const tabDomId = tab.attributes('id')

        expect(labelledBy).toBeTruthy()
        expect(labelledBy).toBe(tabDomId)

        wrapper.unmount()
    })

    it('the second pair (tab b / panel b) is ALSO linked, not just the first', async () => {
        const wrapper = buildSiblingUsage()
        await nextTick()

        const tab = wrapper.findAll('[role="tab"]')[1]
        const panel = wrapper.findAll('[role="tabpanel"]')[1]

        expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
        expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))

        wrapper.unmount()
    })
})
