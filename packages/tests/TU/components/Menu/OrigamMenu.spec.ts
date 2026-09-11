// Unit tests for <OrigamMenu> — useDefaults wiring (issue #242)
//
// Strategy: OrigamMenu composes OrigamOverlay (teleported, Floating-UI
// positioning). jsdom has no real layout engine so the real
// `locationStrategy` resolution throws — stub OrigamOverlay the same way
// OrigamDialog.spec.ts does: a transparent pass-through honouring
// modelValue and rendering the default slot. That's enough to render
// OrigamMenu's own `.origam-menu__content` (a BEM child OrigamMenu renders
// itself, not something the overlay owns).
//
// OrigamMenu did not call useDefaults() so any theme config targeting
// `origam-menu` (rounded, border, elevation, …) was a silent no-op — this
// locks the mechanism by asserting the un-passed prop resolves to a
// measurable class on `.origam-menu__content` (never the teleport root,
// per the DS's classes-first convention).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamMenu from '@origam/components/Menu/OrigamMenu.vue'
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

// Mirrors OrigamDialog.spec.ts's OrigamOverlayStub — transparent pass-through
// so Menu's own `filterProps`/refs calls don't crash.
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup(props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)
        expose({
            filterProps: (_props: unknown, _excludes?: string[]) => ({}),
            contentEl,
            activatorEl,
            globalTop
        })
        return () => h('div', { 'data-stub': 'overlay', class: props.class }, [
            slots.activator?.({ props: {} }),
            props.modelValue ? slots.default?.() : null
        ])
    }
})

const makeGlobal = (plugins: unknown[]) => ({
    plugins,
    stubs: {
        OrigamOverlay: OrigamOverlayStub,
        OrigamTranslateScale: { template: '<div><slot/></div>' }
    }
})

async function mountMenuThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-menu': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamMenu, {
        props: { modelValue: true, ...props } as never,
        attachTo: document.body,
        global: makeGlobal([origam])
    })
    await nextTick()
    return wrapper
}

describe('OrigamMenu — useDefaults (theme components wiring)', () => {
    it('resolves rounded="lg" from theme.components[\'origam-menu\'] on the __content BEM-child (not the teleport root)', async () => {
        const wrapper = await mountMenuThemed({ rounded: 'lg' })
        const content = wrapper.find('.origam-menu__content')
        expect(content.exists()).toBe(true)
        expect(content.classes()).toContain('origam--rounded-lg')
    })

    it('resolves border=true from theme.components[\'origam-menu\'] when not passed', async () => {
        const wrapper = await mountMenuThemed({ border: true })
        const content = wrapper.find('.origam-menu__content')
        expect(content.classes()).toContain('origam-menu--border')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountMenuThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const content = wrapper.find('.origam-menu__content')
        expect(content.classes()).toContain('origam--rounded-sm')
        expect(content.classes()).not.toContain('origam--rounded-lg')
    })
})
