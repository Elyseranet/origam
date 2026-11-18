// #1253 — `color` (prop of <OrigamTabs>, mirrored to each <OrigamTab>) must
// reach the pills active-tab tokens. jsdom cannot resolve var(): we assert the
// emitted inline declaration; the painted result is covered by e2e/tabs.spec.ts.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'

import OrigamTab from '@origam/components/Tabs/OrigamTab.vue'
import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'

const mountTabs = (props: Record<string, unknown>) => mount({
    components: { OrigamTabs, OrigamTab },
    props: ['extra'],
    template: '<origam-tabs model-value="a" variant="pills" v-bind="extra"><origam-tab value="a">A</origam-tab></origam-tabs>'
}, { props: { extra: props }, global: { plugins: [createOrigam()], stubs: { OrigamIcon: { template: '<span/>' } } } })

const BG = '--origam-tabs__item--pills--active---background-color'
const FG = '--origam-tabs__item--pills--active---color'

describe('OrigamTabs pills — color (#1253)', () => {
    it('emits the intent bg/fg tokens on the tab', () => {
        const tab = mountTabs({ color: 'success' }).find('.origam-tab')
        expect(tab.attributes('style')).toContain(`${BG}: var(--origam-color__`)
        expect(tab.attributes('style')).toContain(`${FG}: var(--origam-color__`)
        expect(tab.attributes('style')).toContain('success')
    })

    it('follows a color bound to a value that starts undefined (story / v-model usage)', async () => {
        const wrapper = mountTabs({ color: undefined })
        expect(wrapper.find('.origam-tab').attributes('style') ?? '').not.toContain(BG)
        await wrapper.setProps({ extra: { color: 'danger' } })
        expect(wrapper.find('.origam-tab').attributes('style')).toContain('danger')
    })

    it('emits nothing without color (SCSS fallback stays primary)', () => {
        const tab = mountTabs({}).find('.origam-tab')
        expect(tab.attributes('style') ?? '').not.toContain(BG)
    })
})
