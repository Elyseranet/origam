// Unit tests for <OrigamContextualMenu> — openOnClick double-lock (issue #406)
//
// Repro (verified against the pre-fix code): `openOnClick` was declared on
// `IContextualMenuProps` (inherited from `IMenuProps`), documented in the
// story's own "Open on click" HstCheckbox control, accepted at any value
// without warning — and completely inert. Two independent barriers:
//   1. the template hardcoded `:open-on-click="false"` on `<origam-menu>`,
//      never reading `props.openOnClick`;
//   2. `openOnClick` also sat in the `filterProps` exclude list, so the
//      generic `v-bind="menuProps"` passthrough didn't carry it either.
// The exclude list also carried a typo (`openOnContextualMenu` instead of
// `openOnContextMenu`), a no-op that happened to not break anything only
// because of template attribute ordering — a fragility fixed alongside.
//
// Strategy: OrigamContextualMenu composes the real `OrigamMenu`, which in
// turn composes `OrigamOverlay` (teleported, Floating-UI positioning).
// jsdom has no layout engine, so stub `OrigamOverlay` the same transparent
// way `OrigamMenu.spec.ts` does — this lets `OrigamMenu` itself render for
// real, so `wrapper.findComponent(OrigamMenu).props(...)` reflects what the
// parent actually forwarded.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'

import OrigamContextualMenu from '@origam/components/ContextualMenu/OrigamContextualMenu.vue'
import OrigamMenu from '@origam/components/Menu/OrigamMenu.vue'
import { createOrigam } from '@origam/origam'

const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup (props, {slots, expose}) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)
        expose({
            filterProps: (_props: unknown, _excludes?: string[]) => ({}),
            contentEl,
            activatorEl,
            globalTop
        })
        return () => h('div', {'data-stub': 'overlay', class: props.class}, [
            slots.activator?.({props: {}}),
            props.modelValue ? slots.default?.() : null
        ])
    }
})

const makeGlobal = (plugins: unknown[]) => ({
    plugins,
    stubs: {
        OrigamOverlay: OrigamOverlayStub,
        OrigamTranslateScale: {template: '<div><slot/></div>'}
    }
})

function mountContextualMenu (props: Record<string, unknown> = {}) {
    const origam = createOrigam()
    return mount(OrigamContextualMenu, {
        props: {modelValue: true, ...props} as never,
        attachTo: document.body,
        global: makeGlobal([origam])
    })
}

describe('OrigamContextualMenu — openOnClick reaches the inner OrigamMenu (issue #406)', () => {
    it('forwards openOnClick=true to OrigamMenu (was hardcoded to false)', () => {
        const wrapper = mountContextualMenu({openOnClick: true})
        expect(wrapper.findComponent(OrigamMenu).props('openOnClick')).toBe(true)
    })

    it('forwards openOnClick=false to OrigamMenu', () => {
        const wrapper = mountContextualMenu({openOnClick: false})
        expect(wrapper.findComponent(OrigamMenu).props('openOnClick')).toBe(false)
    })

    it('defaults openOnClick to false when not passed', () => {
        const wrapper = mountContextualMenu()
        expect(wrapper.findComponent(OrigamMenu).props('openOnClick')).toBe(false)
    })
})

describe('OrigamContextualMenu — openOnContextMenu stays a single source of truth (issue #406 fragility)', () => {
    it('forwards openOnContextMenu=false to OrigamMenu (no longer shadowed by a bare-truthy attribute)', () => {
        const wrapper = mountContextualMenu({openOnContextMenu: false})
        expect(wrapper.findComponent(OrigamMenu).props('openOnContextMenu')).toBe(false)
    })

    it('defaults openOnContextMenu to true when not passed', () => {
        const wrapper = mountContextualMenu()
        expect(wrapper.findComponent(OrigamMenu).props('openOnContextMenu')).toBe(true)
    })
})
