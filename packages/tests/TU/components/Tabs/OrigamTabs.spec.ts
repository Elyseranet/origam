// Unit tests for <OrigamTabs>
//
// Strategy: mount OrigamTabs with OrigamTab children (group registration).
// OrigamTab throws if mounted outside OrigamTabs — we use the real components
// together. OrigamDefaultsProvider is transparent (rendered as slot passthrough).
//
// Coverage:
//  - modelValue-driven selection (initial + after click)
//  - update:modelValue emit on tab click
//  - ARIA tablist + orientation
//  - indicator / direction / density / centered / fixed class modifiers
//  - keyboard navigation (ArrowRight / ArrowLeft / Home / End)
//  - disabled tab: aria-disabled, no selection on click

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import OrigamTabs from '@origam/components/Tabs/OrigamTabs.vue'
import OrigamTab from '@origam/components/Tabs/OrigamTab.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        OrigamDefaultsProvider: { template: '<slot/>' },
        OrigamIcon: { template: '<span/>' }
    }
})

// Build a typical <OrigamTabs> + 3 <OrigamTab> tree
const buildTabs = (tabsProps: Record<string, any> = {}, tabProps: Record<string, any>[] = []) => {
    const tabs = tabProps.length
        ? tabProps
        : [{ value: 'a', text: 'Tab A' }, { value: 'b', text: 'Tab B' }, { value: 'c', text: 'Tab C' }]

    return mount(OrigamTabs, {
        props: { modelValue: tabs[0].value, ...tabsProps },
        slots: {
            default: () => tabs.map(tp => h(OrigamTab, tp))
        },
        attachTo: document.body,
        global: makeGlobal()
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OrigamTabs — rendering', () => {
    it('renders with role="tablist"', () => {
        const wrapper = buildTabs()
        expect(wrapper.attributes('role')).toBe('tablist')
        wrapper.unmount()
    })

    it('renders the correct number of tab buttons', () => {
        const wrapper = buildTabs()
        expect(wrapper.findAll('[role="tab"]').length).toBe(3)
        wrapper.unmount()
    })

    it('has origam-tabs base class', () => {
        const wrapper = buildTabs()
        expect(wrapper.classes()).toContain('origam-tabs')
        wrapper.unmount()
    })
})

describe('OrigamTabs — class modifiers', () => {
    it('adds origam-tabs--default indicator class by default', () => {
        const wrapper = buildTabs()
        expect(wrapper.classes()).toContain('origam-tabs--default')
        wrapper.unmount()
    })

    it('adds origam-tabs--pills when indicator=pills', () => {
        const wrapper = buildTabs({ indicator: 'pills' })
        expect(wrapper.classes()).toContain('origam-tabs--pills')
        wrapper.unmount()
    })

    it('adds origam-tabs--underline when indicator=underline', () => {
        const wrapper = buildTabs({ indicator: 'underline' })
        expect(wrapper.classes()).toContain('origam-tabs--underline')
        wrapper.unmount()
    })

    it('adds origam-tabs--direction-horizontal by default', () => {
        const wrapper = buildTabs()
        expect(wrapper.classes()).toContain('origam-tabs--direction-horizontal')
        wrapper.unmount()
    })

    it('adds origam-tabs--direction-vertical when direction=vertical', () => {
        const wrapper = buildTabs({ direction: 'vertical' })
        expect(wrapper.classes()).toContain('origam-tabs--direction-vertical')
        wrapper.unmount()
    })

    it('adds origam-tabs--fixed when fixed=true', () => {
        const wrapper = buildTabs({ fixed: true })
        expect(wrapper.classes()).toContain('origam-tabs--fixed')
        wrapper.unmount()
    })

    it('adds origam-tabs--centered when centered=true', () => {
        const wrapper = buildTabs({ centered: true })
        expect(wrapper.classes()).toContain('origam-tabs--centered')
        wrapper.unmount()
    })
})

describe('OrigamTabs — ARIA orientation', () => {
    it('has aria-orientation=horizontal by default', () => {
        const wrapper = buildTabs()
        expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
        wrapper.unmount()
    })

    it('has aria-orientation=vertical when direction=vertical', () => {
        const wrapper = buildTabs({ direction: 'vertical' })
        expect(wrapper.attributes('aria-orientation')).toBe('vertical')
        wrapper.unmount()
    })
})

describe('OrigamTabs — tag prop', () => {
    it('renders as <nav> when tag=nav', () => {
        const wrapper = buildTabs({ tag: 'nav' })
        expect(wrapper.element.tagName.toLowerCase()).toBe('nav')
        wrapper.unmount()
    })
})

describe('OrigamTabs — selection state', () => {
    it('marks the first tab as active (aria-selected=true) when modelValue matches first tab', () => {
        const wrapper = buildTabs({ modelValue: 'a' })
        const tabs = wrapper.findAll('[role="tab"]')
        expect(tabs[0].attributes('aria-selected')).toBe('true')
        expect(tabs[1].attributes('aria-selected')).toBe('false')
        wrapper.unmount()
    })

    it('marks the second tab active when modelValue matches second tab', () => {
        const wrapper = buildTabs({ modelValue: 'b' })
        const tabs = wrapper.findAll('[role="tab"]')
        expect(tabs[1].attributes('aria-selected')).toBe('true')
        wrapper.unmount()
    })

    it('clicking a tab emits update:modelValue with its value', async () => {
        const wrapper = buildTabs({ modelValue: 'a' })
        const tabs = wrapper.findAll('[role="tab"]')
        await tabs[1].trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['b'])
        wrapper.unmount()
    })

    it('active tab gets origam-tab--active class', () => {
        const wrapper = buildTabs({ modelValue: 'b' })
        const tabs = wrapper.findAll('[role="tab"]')
        expect(tabs[1].classes()).toContain('origam-tab--active')
        wrapper.unmount()
    })
})

describe('OrigamTabs — keyboard navigation', () => {
    it('ArrowRight selects the next tab', async () => {
        const wrapper = buildTabs({ modelValue: 'a' })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        // next() should advance to 'b'
        expect(emitted![0]).toEqual(['b'])
        wrapper.unmount()
    })

    it('ArrowLeft selects the previous tab (wraps from first to last)', async () => {
        const wrapper = buildTabs({ modelValue: 'a' })
        await wrapper.trigger('keydown', { key: 'ArrowLeft' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        // prev() wraps from 'a' to the last tab 'c'
        expect(emitted![0]).toEqual(['c'])
        wrapper.unmount()
    })

    it('ArrowUp selects the previous tab when direction=vertical', async () => {
        const wrapper = buildTabs({ modelValue: 'b', direction: 'vertical' })
        await wrapper.trigger('keydown', { key: 'ArrowUp' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['a'])
        wrapper.unmount()
    })

    it('ArrowDown selects the next tab when direction=vertical', async () => {
        const wrapper = buildTabs({ modelValue: 'a', direction: 'vertical' })
        await wrapper.trigger('keydown', { key: 'ArrowDown' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['b'])
        wrapper.unmount()
    })

    it('Home selects the first non-disabled tab', async () => {
        const wrapper = buildTabs({ modelValue: 'c' })
        await wrapper.trigger('keydown', { key: 'Home' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['a'])
        wrapper.unmount()
    })

    it('End selects the last non-disabled tab', async () => {
        const wrapper = buildTabs({ modelValue: 'a' })
        await wrapper.trigger('keydown', { key: 'End' })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['c'])
        wrapper.unmount()
    })
})

describe('OrigamTabs — disabled tab', () => {
    it('disabled tab has aria-disabled attribute', () => {
        const wrapper = buildTabs({ modelValue: 'a' }, [
            { value: 'a', text: 'A' },
            { value: 'b', text: 'B', disabled: true },
            { value: 'c', text: 'C' }
        ])
        const tabs = wrapper.findAll('[role="tab"]')
        expect(tabs[1].attributes('aria-disabled')).toBe('true')
        wrapper.unmount()
    })

    it('clicking a disabled tab does not change selection', async () => {
        const wrapper = buildTabs({ modelValue: 'a' }, [
            { value: 'a', text: 'A' },
            { value: 'b', text: 'B', disabled: true },
            { value: 'c', text: 'C' }
        ])
        const tabs = wrapper.findAll('[role="tab"]')
        await tabs[1].trigger('click')
        await nextTick()

        // No update:modelValue should be emitted for disabled tab
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeFalsy()
        wrapper.unmount()
    })
})

// Regression guard for #250: the root `<component :is="…">` used to read a
// bare `tag` in `<script setup>`, which resolves against Vue's raw $props —
// NOT the `useDefaults()` Proxy assigned to the local `props` variable —
// unless written as `props.tag` explicitly. See OrigamTable.vue / #249 for
// the full writeup of this footgun.
describe('OrigamTabs — useDefaults (theme components wiring)', () => {
    function buildTabsThemed (componentDefaults: Record<string, unknown>, tabsProps: Record<string, unknown> = {}) {
        const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-tabs': componentDefaults }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamTabs, {
            props: { modelValue: 'a', ...tabsProps },
            slots: { default: () => [h(OrigamTab, { value: 'a', text: 'Tab A' })] },
            attachTo: document.body,
            global: {
                plugins: [origam],
                stubs: {
                    OrigamDefaultsProvider: { template: '<slot/>' },
                    OrigamIcon: { template: '<span/>' }
                }
            }
        })
    }

    it('resolves tag="nav" from theme.components[\'origam-tabs\'] when not passed', () => {
        const wrapper = buildTabsThemed({ tag: 'nav' })
        expect(wrapper.element.tagName).toBe('NAV')
        wrapper.unmount()
    })
})
