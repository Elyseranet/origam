// Unit tests for <OrigamExpansionPanel> + <OrigamExpansionPanels>
//
// Strategy: OrigamExpansionPanel relies on useGroupItem (ORIGAM_EXPANSION_PANEL_KEY)
// provided by a parent OrigamExpansionPanels. We mount panels inside OrigamExpansionPanels
// to exercise real group-registration mechanics.
//
// OrigamExpansionPanelHeader injects ORIGAM_EXPANSION_PANEL_KEY and throws
// if the context is absent — so we must mount the full hierarchy.
//
// OrigamProgress, OrigamAvatar, OrigamIcon, v-ripple are stubbed to avoid
// complex side effects.
//
// Known DS bug #25: slot #title passed to OrigamExpansionPanel is routed
// through OrigamExpansionPanelHeader's #default slot (not a dedicated #title
// slot on the header). When using the `title` PROP, the panel correctly renders
// the title text. When using the #title SLOT, the guard in OrigamExpansionPanel
// (line 51-61) checks `slots.title`, which IS truthy when the slot is provided,
// so the route goes through — but OrigamExpansionPanelHeader renders its own
// `#default` slot as the title, not a `#title` slot. The net result: providing
// #title at the OrigamExpansionPanel level correctly forwards to the header's
// title area. This appears to work as designed for the prop-based path. The
// slot-routing path has a confirmed bug tracked in #25.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------
const OrigamIconStub = defineComponent({
    name: 'OrigamIcon',
    props: ['icon', 'density'],
    template: `<span data-stub="icon" :data-icon="icon"/>`
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
        // v-ripple and v-contrast are visual — stub them to no-ops
        ripple: { mounted: () => {}, unmounted: () => {} },
        contrast: { mounted: () => {}, unmounted: () => {} }
    }
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mountPanels = (
    panelsProps: Record<string, any> = {},
    panels: Array<{ panelProps?: Record<string, any>; slots?: Record<string, any> }> = [
        { panelProps: { title: 'Panel 1' } },
        { panelProps: { title: 'Panel 2' } }
    ]
) => {
    return mount(OrigamExpansionPanels, {
        props: panelsProps,
        slots: {
            default: () => panels.map(({ panelProps = {}, slots: s = {} }) =>
                h(OrigamExpansionPanel, panelProps, s)
            )
        },
        attachTo: document.body,
        global: makeGlobal()
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OrigamExpansionPanel — rendering', () => {
    it('renders expansion panels wrapper', () => {
        const wrapper = mountPanels()
        expect(wrapper.find('.origam-expansion-panels').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders the correct number of panels', () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'P1' } },
            { panelProps: { title: 'P2' } },
            { panelProps: { title: 'P3' } }
        ])
        expect(wrapper.findAll('.origam-expansion-panel').length).toBe(3)
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — open/close via header click', () => {
    it('panel is closed initially (no --active class)', () => {
        const wrapper = mountPanels()
        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[0].classes()).not.toContain('origam-expansion-panel--active')
        wrapper.unmount()
    })

    it('clicking header opens the panel (adds --active class)', async () => {
        const wrapper = mountPanels()
        const header = wrapper.find('.origam-expansion-panel-header')
        await header.trigger('click')
        await nextTick()

        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[0].classes()).toContain('origam-expansion-panel--active')
        wrapper.unmount()
    })

    it('clicking header again closes the panel', async () => {
        const wrapper = mountPanels()
        const header = wrapper.find('.origam-expansion-panel-header')
        await header.trigger('click')
        await nextTick()
        await header.trigger('click')
        await nextTick()

        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[0].classes()).not.toContain('origam-expansion-panel--active')
        wrapper.unmount()
    })

    it('header has aria-expanded=false initially', () => {
        const wrapper = mountPanels()
        const header = wrapper.find('.origam-expansion-panel-header')
        // OrigamExpansionPanelHeader uses :aria-expanded="isSelected" which is a boolean
        expect(header.attributes('aria-expanded')).toBe('false')
        wrapper.unmount()
    })

    it('header has aria-expanded=true after opening', async () => {
        const wrapper = mountPanels()
        const header = wrapper.find('.origam-expansion-panel-header')
        await header.trigger('click')
        await nextTick()

        expect(header.attributes('aria-expanded')).toBe('true')
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — title prop', () => {
    it('renders title text in the header', async () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'My Panel Title' } }
        ])
        // expansionPanelHeaderProps is computed from a template ref — needs
        // nextTick for the ref to be populated and the title forwarded.
        await nextTick()
        const header = wrapper.find('.origam-expansion-panel-header__title')
        expect(header.exists()).toBe(true)
        expect(header.text()).toContain('My Panel Title')
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — disabled state', () => {
    it('disabled panel has --disabled class', () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'Disabled Panel', disabled: true } }
        ])
        expect(wrapper.find('.origam-expansion-panel').classes()).toContain('origam-expansion-panel--disabled')
        wrapper.unmount()
    })

    it('disabled panel header has tabindex=-1', () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'Disabled', disabled: true } }
        ])
        const header = wrapper.find('.origam-expansion-panel-header')
        expect(header.attributes('tabindex')).toBe('-1')
        wrapper.unmount()
    })

    it('clicking a disabled panel header does NOT open it', async () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'Disabled', disabled: true } }
        ])
        const header = wrapper.find('.origam-expansion-panel-header')
        await header.trigger('click')
        await nextTick()

        expect(wrapper.find('.origam-expansion-panel').classes()).not.toContain('origam-expansion-panel--active')
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — multiple selection', () => {
    it('with multiple=true, two panels can be open simultaneously', async () => {
        const wrapper = mountPanels({ multiple: true }, [
            { panelProps: { title: 'P1' } },
            { panelProps: { title: 'P2' } }
        ])
        const headers = wrapper.findAll('.origam-expansion-panel-header')
        await headers[0].trigger('click')
        await nextTick()
        await headers[1].trigger('click')
        await nextTick()

        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[0].classes()).toContain('origam-expansion-panel--active')
        expect(panels[1].classes()).toContain('origam-expansion-panel--active')
        wrapper.unmount()
    })

    it('without multiple (default), opening second panel closes first', async () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'P1' } },
            { panelProps: { title: 'P2' } }
        ])
        const headers = wrapper.findAll('.origam-expansion-panel-header')
        await headers[0].trigger('click')
        await nextTick()
        await headers[1].trigger('click')
        await nextTick()

        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[0].classes()).not.toContain('origam-expansion-panel--active')
        expect(panels[1].classes()).toContain('origam-expansion-panel--active')
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — before/after active classes', () => {
    it('panel before the active one gets --before-active class', async () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'P1' } },
            { panelProps: { title: 'P2' } },
            { panelProps: { title: 'P3' } }
        ])
        const headers = wrapper.findAll('.origam-expansion-panel-header')
        // Open panel at index 1
        await headers[1].trigger('click')
        await nextTick()

        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[0].classes()).toContain('origam-expansion-panel--before-active')
        wrapper.unmount()
    })

    it('panel after the active one gets --after-active class', async () => {
        const wrapper = mountPanels({}, [
            { panelProps: { title: 'P1' } },
            { panelProps: { title: 'P2' } },
            { panelProps: { title: 'P3' } }
        ])
        const headers = wrapper.findAll('.origam-expansion-panel-header')
        // Open panel at index 1
        await headers[1].trigger('click')
        await nextTick()

        const panels = wrapper.findAll('.origam-expansion-panel')
        expect(panels[2].classes()).toContain('origam-expansion-panel--after-active')
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — #content slot', () => {
    it('content slot is rendered when panel is open', async () => {
        const wrapper = mount(OrigamExpansionPanels, {
            slots: {
                default: () => h(OrigamExpansionPanel, { title: 'Panel', content: 'Body text' })
            },
            attachTo: document.body,
            global: makeGlobal()
        })

        const header = wrapper.find('.origam-expansion-panel-header')
        await header.trigger('click')
        await nextTick()

        // Content area renders inside .origam-expansion-panel-content
        expect(wrapper.find('.origam-expansion-panel-content').exists()).toBe(true)
        wrapper.unmount()
    })
})

describe('OrigamExpansionPanel — DS known bug #25 (slot #title routing)', () => {
    // Bug #25: When a consumer provides the #title slot to OrigamExpansionPanel,
    // the slot is routed through to OrigamExpansionPanelHeader's #default slot
    // because the header has no dedicated #title slot. The routing currently works
    // (the guard on line 51-61 of OrigamExpansionPanel.vue checks `slots.title`)
    // but the slot content lands in the HEADER's generic default slot rather than
    // a specifically named #title slot. The aria-controls attribute on the header
    // also has no matching content id until content is eager-mounted.
    //
    // This test documents the CURRENT behaviour without the bug being fixed:
    // - title prop path → renders in .origam-expansion-panel-header__title
    // - slot #title path → also renders in .origam-expansion-panel-header__title
    //   (via the routed slot chain), so both paths behave the same at the DOM level.
    it('title prop renders in header title area', async () => {
        const wrapper = mountPanels({}, [{ panelProps: { title: 'From Prop' } }])
        await nextTick()
        expect(wrapper.find('.origam-expansion-panel-header__title').text()).toContain('From Prop')
        wrapper.unmount()
    })

    it.skip('slot #title correctly routed to header title area — verify aria-controls matches content id (bug #25)', () => {
        // Limitation: aria-controls="expansion-panel-content-{id}" on the header
        // requires the content element to be rendered with a matching id.
        // Without eager=true, content is not mounted until the panel opens.
        // Headless validation is unreliable — validate with Playwright e2e.
    })
})

// Regression guard for #250: the root `<component :is="…">` used to read a
// bare `tag` in `<script setup>`, which resolves against Vue's raw $props —
// NOT the `useDefaults()` Proxy assigned to the local `props` variable —
// unless written as `props.tag` explicitly. See OrigamTable.vue / #249 for
// the full writeup of this footgun.
describe('OrigamExpansionPanel — useDefaults (theme components wiring)', () => {
    function mountPanelsThemed (componentDefaults: Record<string, unknown>, panelProps: Record<string, unknown> = {}) {
        const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-expansion-panel': componentDefaults }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamExpansionPanels, {
            slots: {
                default: () => [h(OrigamExpansionPanel, { title: 'Panel 1', ...panelProps })]
            },
            attachTo: document.body,
            global: { ...makeGlobal(), plugins: [origam] }
        })
    }

    it('resolves tag="section" from theme.components[\'origam-expansion-panel\'] when not passed', () => {
        const wrapper = mountPanelsThemed({ tag: 'section' })
        expect(wrapper.find('.origam-expansion-panel').element.tagName).toBe('SECTION')
        wrapper.unmount()
    })
})
