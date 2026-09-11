// Unit tests for <OrigamDrawer>
//
// Strategy: OrigamDrawer uses Teleport (with `defer`) which in jsdom does NOT
// render inline even when `:disabled="true"`. The Teleport content remains
// as a comment node placeholder.
//
// We work around this by:
//  1. Using VTU's `global.stubs: { Teleport: true }` to collapse Teleport
//     and render content inline. This works because OrigamTransition (which
//     wraps the nav) is also stubbed as a transparent pass-through.
//  2. The scrim is outside the Teleport and is findable on `document.body`.
//
// Tests that verify the scrim click emit can't use the Teleport stub trick
// (scrim is outside Teleport scope in the template), so we query body for it.
//
// Drawer layout integration (useLayoutItem, push/clipped, SSR boot) is NOT
// tested here — those require a full layout tree and are better covered by e2e.

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import OrigamDrawer from '@origam/components/Drawer/OrigamDrawer.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------
const OrigamTransitionStub = defineComponent({
    name: 'OrigamTransition',
    props: ['transition'],
    template: '<slot/>'
})

const OrigamOverlayScrimStub = defineComponent({
    name: 'OrigamOverlayScrim',
    props: ['active', 'scrim', 'style'],
    emits: ['click'],
    template: `<div data-stub="scrim" @click="$emit('click')"/>`
})

const makeGlobal = () => ({
    plugins: [createOrigam()],
    stubs: {
        // Collapse <Teleport> so content renders inline inside the wrapper.
        // This is the canonical VTU approach for components that use Teleport
        // but whose logic we want to test without an actual DOM target.
        Teleport: true,
        OrigamTransition: OrigamTransitionStub,
        OrigamOverlayScrim: OrigamOverlayScrimStub
    }
})

const mountDrawer = (props: Record<string, any> = {}, slots: Record<string, any> = {}) => {
    return mount(OrigamDrawer, {
        props: { modelValue: true, ...props },
        slots,
        attachTo: document.body,
        global: makeGlobal()
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('OrigamDrawer — open/close via modelValue', () => {
    it('renders the drawer element when modelValue=true', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('nav.origam-drawer').exists()).toBe(true)
        wrapper.unmount()
    })

    it('does NOT render the drawer element when modelValue=false', () => {
        const wrapper = mountDrawer({ modelValue: false })
        expect(wrapper.find('nav.origam-drawer').exists()).toBe(false)
        wrapper.unmount()
    })

    it('emits update:modelValue=false when scrim is clicked', async () => {
        const wrapper = mountDrawer({ modelValue: true, temporary: true })
        // Scrim is outside the Teleport in the component template, so it's
        // always reachable from document.body regardless of the stub.
        const scrim = document.querySelector('[data-stub="scrim"]')
        expect(scrim).not.toBeNull()
        scrim!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([false])
        wrapper.unmount()
    })
})

describe('OrigamDrawer — classes', () => {
    afterEach(() => {
        document.querySelectorAll('[data-stub="scrim"]').forEach(el => el.remove())
    })

    it('has origam-drawer base class', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer')
        wrapper.unmount()
    })

    it('has origam-drawer--left by default (location=left)', () => {
        const wrapper = mountDrawer({ modelValue: true, location: 'left' })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--left')
        wrapper.unmount()
    })

    it('has origam-drawer--right when location=right', () => {
        const wrapper = mountDrawer({ modelValue: true, location: 'right' })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--right')
        wrapper.unmount()
    })

    it('has origam-drawer--temporary when temporary=true', () => {
        const wrapper = mountDrawer({ modelValue: true, temporary: true })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--temporary')
        wrapper.unmount()
    })

    it('has origam-drawer--active when open', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--active')
        wrapper.unmount()
    })

    it('has origam-drawer--rail when rail=true', () => {
        const wrapper = mountDrawer({ modelValue: true, rail: true })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--rail')
        wrapper.unmount()
    })

    it('has origam-drawer--floating when floating=true', () => {
        const wrapper = mountDrawer({ modelValue: true, floating: true })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--floating')
        wrapper.unmount()
    })

    it('propagates consumer class prop', () => {
        const wrapper = mountDrawer({ modelValue: true, class: 'my-nav' })
        expect(wrapper.find('nav').classes()).toContain('my-nav')
        wrapper.unmount()
    })
})

describe('OrigamDrawer — tag prop', () => {
    it('renders as <aside> when tag=aside', () => {
        const wrapper = mountDrawer({ modelValue: true, tag: 'aside' })
        expect(wrapper.find('aside.origam-drawer').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders as <nav> by default', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('nav.origam-drawer').exists()).toBe(true)
        wrapper.unmount()
    })
})

describe('OrigamDrawer — slots', () => {
    it('renders #prepend slot inside origam-drawer__prepend', () => {
        const wrapper = mountDrawer(
            { modelValue: true },
            { prepend: () => h('span', { 'data-cy': 'prepend-content' }, 'Header') }
        )
        expect(wrapper.find('.origam-drawer__prepend').exists()).toBe(true)
        expect(wrapper.find('[data-cy="prepend-content"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders #default slot inside origam-drawer__content', () => {
        const wrapper = mountDrawer(
            { modelValue: true },
            { default: () => h('ul', { 'data-cy': 'nav-list' }) }
        )
        expect(wrapper.find('.origam-drawer__content').exists()).toBe(true)
        expect(wrapper.find('[data-cy="nav-list"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('renders #append slot inside origam-drawer__append', () => {
        const wrapper = mountDrawer(
            { modelValue: true },
            { append: () => h('span', { 'data-cy': 'append-content' }, 'Footer') }
        )
        expect(wrapper.find('.origam-drawer__append').exists()).toBe(true)
        expect(wrapper.find('[data-cy="append-content"]').exists()).toBe(true)
        wrapper.unmount()
    })

    it('does not render __prepend div when no prepend slot', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('.origam-drawer__prepend').exists()).toBe(false)
        wrapper.unmount()
    })

    it('does not render __append div when no append slot', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('.origam-drawer__append').exists()).toBe(false)
        wrapper.unmount()
    })
})

describe('OrigamDrawer — aria', () => {
    it('has aria-label defaulting to "Navigation"', () => {
        const wrapper = mountDrawer({ modelValue: true })
        expect(wrapper.find('nav').attributes('aria-label')).toBe('Navigation')
        wrapper.unmount()
    })

    it('uses the name prop as aria-label when provided', () => {
        const wrapper = mountDrawer({ modelValue: true, name: 'main-menu' })
        expect(wrapper.find('nav').attributes('aria-label')).toBe('main-menu')
        wrapper.unmount()
    })
})

describe('OrigamDrawer — expand-on-hover (rail mode)', () => {
    it('has origam-drawer--expand-on-hover class when expandOnHover=true', () => {
        const wrapper = mountDrawer({ modelValue: true, rail: true, expandOnHover: true })
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--expand-on-hover')
        wrapper.unmount()
    })

    it('adds origam-drawer--is-hovering on mouseenter', async () => {
        const wrapper = mountDrawer({ modelValue: true, rail: true, expandOnHover: true })
        await wrapper.find('nav').trigger('mouseenter')
        await nextTick()
        expect(wrapper.find('nav').classes()).toContain('origam-drawer--is-hovering')
        wrapper.unmount()
    })

    it('removes origam-drawer--is-hovering on mouseleave', async () => {
        const wrapper = mountDrawer({ modelValue: true, rail: true, expandOnHover: true })
        await wrapper.find('nav').trigger('mouseenter')
        await nextTick()
        await wrapper.find('nav').trigger('mouseleave')
        await nextTick()
        expect(wrapper.find('nav').classes()).not.toContain('origam-drawer--is-hovering')
        wrapper.unmount()
    })
})
