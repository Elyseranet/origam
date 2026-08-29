// Regression coverage for #519 / #520 — <OrigamExpansionPanelHeader> and
// <OrigamExpansionPanelContent> declared an `id` prop and threw it away:
// their DOM id AND their cross-reference (`aria-controls` / `aria-labelledby`)
// were both computed from the internal `expansionPanel.id` (the group-item
// registration key), never from `props.id`.
//
// The naive fix — bind `:id="props.id || generated"` on each side alone —
// is not enough and would have been WRONG: `aria-controls` on the header and
// `aria-labelledby` on the content each point at the OTHER side's DOM id.
// If only the local id is fixed, a consumer-supplied `id` on one side
// silently breaks the ARIA pairing with the sibling, because the sibling
// would still be guessing the OLD generated-fallback naming scheme.
//
// This spec proves the pairing holds in all four combinations: neither side
// customized, only the header, only the content, and both — mirroring the
// asymmetric case the ticket calls out explicitly.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { createOrigam } from '@origam/origam'

import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'
import OrigamExpansionPanelHeader from '@origam/components/ExpansionPanel/OrigamExpansionPanelHeader.vue'
import OrigamExpansionPanelContent from '@origam/components/ExpansionPanel/OrigamExpansionPanelContent.vue'

const OrigamIconStub = defineComponent({
    name: 'OrigamIcon',
    props: ['icon', 'density'],
    template: `<span data-stub="icon"/>`
})

const OrigamAvatarStub = defineComponent({
    name: 'OrigamAvatar',
    props: ['image', 'density'],
    template: `<span data-stub="avatar"/>`
})

const OrigamProgressStub = defineComponent({
    name: 'OrigamProgress',
    props: ['active', 'indeterminate', 'modelValue', 'type', 'class', 'thickness'],
    template: `<div data-stub="progress"/>`
})

const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamIcon: OrigamIconStub,
        OrigamAvatar: OrigamAvatarStub,
        OrigamProgress: OrigamProgressStub,
        OrigamDefaultsProvider: { template: '<slot/>' }
    },
    directives: {
        ripple: { mounted: () => {}, unmounted: () => {} },
        contrast: { mounted: () => {}, unmounted: () => {} }
    }
})

// `#header` / `#wrapper` REPLACE the panel's own auto-rendered header/content
// (see OrigamExpansionPanel.vue) with our own instances — the only way to
// give the header and the content their OWN, independently-set `id` prop
// (the panel-forwarded props explicitly exclude `id`, by design, to avoid a
// DOM id duplicate between the panel root and its children).
function mountPanel (headerId?: string, contentId?: string) {
    return mount(OrigamExpansionPanels, {
        slots: {
            default: () => h(OrigamExpansionPanel, { content: 'Body' }, {
                header: () => h(OrigamExpansionPanelHeader, headerId ? { id: headerId } : {}, {
                    default: () => 'Title'
                }),
                wrapper: () => h(OrigamExpansionPanelContent, contentId ? { id: contentId } : {}, {
                    default: () => 'Body'
                })
            })
        },
        attachTo: document.body,
        global: makeGlobal()
    })
}

describe('OrigamExpansionPanelHeader / OrigamExpansionPanelContent — ARIA pairing (#519, #520)', () => {
    it('neither side customized: aria-controls / aria-labelledby still cross-reference the real ids (no regression)', async () => {
        const wrapper = mountPanel()
        await nextTick()

        const header = wrapper.find('.origam-expansion-panel-header')
        const content = wrapper.find('.origam-expansion-panel-content')

        expect(header.attributes('id')).toBeTruthy()
        expect(content.attributes('id')).toBeTruthy()
        expect(header.attributes('aria-controls')).toBe(content.attributes('id'))
        expect(content.attributes('aria-labelledby')).toBe(header.attributes('id'))

        wrapper.unmount()
    })

    it('header customized, content default: the header id is honored AND the content still points at it', async () => {
        const wrapper = mountPanel('my-header-id')
        await nextTick()

        const header = wrapper.find('.origam-expansion-panel-header')
        const content = wrapper.find('.origam-expansion-panel-content')

        expect(header.attributes('id')).toBe('my-header-id')
        expect(content.attributes('aria-labelledby')).toBe('my-header-id')
        expect(header.attributes('aria-controls')).toBe(content.attributes('id'))

        wrapper.unmount()
    })

    it('content customized, header default: the content id is honored AND the header still points at it', async () => {
        const wrapper = mountPanel(undefined, 'my-content-id')
        await nextTick()

        const header = wrapper.find('.origam-expansion-panel-header')
        const content = wrapper.find('.origam-expansion-panel-content')

        expect(content.attributes('id')).toBe('my-content-id')
        expect(header.attributes('aria-controls')).toBe('my-content-id')
        expect(content.attributes('aria-labelledby')).toBe(header.attributes('id'))

        wrapper.unmount()
    })

    it('both sides customized: both ids are honored and the cross-reference still holds', async () => {
        const wrapper = mountPanel('my-header-id', 'my-content-id')
        await nextTick()

        const header = wrapper.find('.origam-expansion-panel-header')
        const content = wrapper.find('.origam-expansion-panel-content')

        expect(header.attributes('id')).toBe('my-header-id')
        expect(content.attributes('id')).toBe('my-content-id')
        expect(header.attributes('aria-controls')).toBe('my-content-id')
        expect(content.attributes('aria-labelledby')).toBe('my-header-id')

        wrapper.unmount()
    })
})
