// Unit tests for <OrigamExpansionPanelHeader> — typography props (the shared
// ITypographyProps surface wired by useTypography with the
// 'expansion-panel__header' varPrefix).
//
// OrigamExpansionPanelHeader injects ORIGAM_EXPANSION_PANEL_KEY and throws if
// the context is absent — the full hierarchy (OrigamExpansionPanels >
// OrigamExpansionPanel) must be mounted. OrigamExpansionPanel extends
// IExpansionPanelHeaderProps, so fontSize / lineHeight are accepted as panel
// props and forwarded to the header via filterProps (needs nextTick for the
// template ref to populate).
//
// The header binds :style="expansionPanelHeaderStyles" on its root element
// (.origam-expansion-panel-header), so typography vars land in the inline
// style="" attribute — readable via .attributes('style').
//
// Props with a real visual effect (SCSS reads the var on .origam-expansion-panel-header):
//   fontSize   → --origam-expansion-panel__header---font-size  (default 0.9375rem)
//   lineHeight → --origam-expansion-panel__header---line-height (default 1)
//
// fontFamily / fontWeight / letterSpacing are NOT exposed — the SCSS has no
// matching rules on this element.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { createOrigam } from '@origam/origam'

import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'

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

async function mountHeader (panelProps: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamExpansionPanels, {
        slots: {
            default: () => h(OrigamExpansionPanel, { title: 'Panel', ...panelProps })
        },
        attachTo: document.body,
        global: makeGlobal()
    })
    await nextTick()
    return wrapper
}

async function styleOf (panelProps: Record<string, unknown> = {}): Promise<string> {
    const wrapper = await mountHeader(panelProps)
    const style = wrapper.find('.origam-expansion-panel-header').attributes('style') ?? ''
    wrapper.unmount()
    return style
}

// `mountHeader` above only forwards panel PROPS. The regression below needs to
// forward a panel SLOT (`#title`) too, so it gets its own mount helper rather
// than widening `mountHeader`'s signature for every existing caller.
async function mountHeaderWithPanelSlots (
    panelProps: Record<string, unknown> = {},
    panelSlots: Record<string, () => unknown> = {}
) {
    const wrapper = mount(OrigamExpansionPanels, {
        slots: {
            default: () => h(OrigamExpansionPanel, panelProps, panelSlots)
        },
        attachTo: document.body,
        global: makeGlobal()
    })
    await nextTick()
    return wrapper
}

describe('OrigamExpansionPanelHeader — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', async () => {
        expect(await styleOf()).not.toContain('--origam-expansion-panel__header---font-size:')
    })

    it('fontSize="xl" sets the font-size var to the xl token', async () => {
        expect(await styleOf({ fontSize: 'xl' })).toContain('--origam-expansion-panel__header---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="sm" sets the font-size var to the sm token', async () => {
        expect(await styleOf({ fontSize: 'sm' })).toContain('--origam-expansion-panel__header---font-size: var(--origam-font__size---sm)')
    })
})

describe('OrigamExpansionPanelHeader — lineHeight prop', () => {
    it('emits no line-height override when lineHeight is unset', async () => {
        expect(await styleOf()).not.toContain('--origam-expansion-panel__header---line-height:')
    })

    it('lineHeight="loose" sets the line-height var to the loose token', async () => {
        expect(await styleOf({ lineHeight: 'loose' })).toContain('--origam-expansion-panel__header---line-height: var(--origam-font__lineHeight---loose)')
    })

    it('lineHeight="tight" sets the line-height var to the tight token', async () => {
        expect(await styleOf({ lineHeight: 'tight' })).toContain('--origam-expansion-panel__header---line-height: var(--origam-font__lineHeight---tight)')
    })
})

// Regression for the DS bug where `OrigamExpansionPanel` forwards a `#title`
// slot to `<origam-expansion-panel-header>` (`OrigamExpansionPanel.vue:51-58`),
// but the header itself only ever rendered `<slot name="default">` — no
// `<slot name="title">` existed, so the forwarded content was never invoked.
// Without a `title` prop, `hasTitle` was also `false` (`slots.default ||
// props.title`), so the title `<span>` didn't even mount. Discriminating:
// this test fails against the pre-fix header and passes against the fix.
describe('OrigamExpansionPanelHeader — #title slot forwarded from OrigamExpansionPanel', () => {
    it('renders custom #title slot content with no `title` prop set', async () => {
        const wrapper = await mountHeaderWithPanelSlots(
            { content: 'Body' },
            { title: () => h('strong', 'Custom Title') }
        )
        const title = wrapper.find('.origam-expansion-panel-header__title')
        expect(title.exists()).toBe(true)
        expect(title.text()).toContain('Custom Title')
        wrapper.unmount()
    })

    it('still falls back to the `title` prop when no #title slot is provided', async () => {
        const wrapper = await mountHeaderWithPanelSlots({ title: 'Panel', content: 'Body' })
        const title = wrapper.find('.origam-expansion-panel-header__title')
        expect(title.exists()).toBe(true)
        expect(title.text()).toBe('Panel')
        wrapper.unmount()
    })
})
