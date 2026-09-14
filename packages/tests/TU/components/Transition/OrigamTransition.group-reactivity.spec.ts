// Regression test for BUG 1 (transition.composable.ts:29 & :97):
// `tag` used to be a plain `shallowRef` evaluated once at setup —
// `<component :is="tag">` never re-rendered as `TransitionGroup` when
// `group` flipped to `true` AFTER mount, so every item past the first
// silently vanished (plain `Transition` only tracks its first child).
//
// Fix: `tag` is now `computed(() => props.group ? TransitionGroup :
// Transition)`, tracked like any other prop-derived value.
//
// This spec mounts the REAL components (not the composable in
// isolation) with `@vue/test-utils`, toggles `group` reactively via
// `setProps` AFTER the initial mount (mirroring the exact runtime
// scenario from the bug report), and asserts every keyed item is
// still present in the rendered DOM for BOTH families backed by the
// two duplicated call sites:
//   - useCssTransition    → OrigamFade (CSS family)
//   - useWindowTransition → OrigamWindowXTranslate (Window family)

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, type Component } from 'vue'

import OrigamFade from '@origam/components/Transition/OrigamFade.vue'
import OrigamWindowXTranslate from '@origam/components/Transition/OrigamWindowXTranslate.vue'

const ITEMS = [1, 2, 3]

function mountGroupHost (component: Component) {
    // Mirrors the real Variant markup (`v-if="state.group"` block vs a
    // single `v-else-if` target) — `Transition` (singular) only ever
    // receives one child, `TransitionGroup` receives the full keyed list.
    const Host = defineComponent({
        props: { group: { type: Boolean, default: false } },
        setup (props) {
            return () => h(
                component,
                { group: props.group },
                {
                    default: () => props.group
                        ? ITEMS.map((item) => h(
                            'div',
                            { key: item, 'data-cy': `item-${item}` },
                            `Item ${item}`
                        ))
                        : h('div', { key: 'single', 'data-cy': 'item-1' }, 'Item 1')
                }
            )
        }
    })

    // @vue/test-utils stubs out Transition/TransitionGroup by default
    // (`config.global.stubs.transition = true`), replacing both with a
    // stub that renders every slot child unconditionally — that would
    // hide this exact bug (a real `<Transition>` silently drops every
    // item past the first; the stub does not). Disable the stub so the
    // real Vue built-ins run.
    return mount(Host, {
        props: { group: false },
        global: { stubs: { transition: false, 'transition-group': false } }
    })
}

describe('BUG 1 regression — tag switches reactively after mount (useCssTransition / OrigamFade)', () => {
    it('renders only the first item while group=false (Transition tracks a single child)', () => {
        const wrapper = mountGroupHost(OrigamFade)
        expect(wrapper.findAll('[data-cy^="item-"]')).toHaveLength(1)
    })

    it('renders every item once group flips to true AFTER mount', async () => {
        const wrapper = mountGroupHost(OrigamFade)

        await wrapper.setProps({ group: true })
        await wrapper.vm.$nextTick()

        const rendered = wrapper.findAll('[data-cy^="item-"]')
        expect(rendered).toHaveLength(ITEMS.length)
        for (const item of ITEMS) {
            expect(wrapper.find(`[data-cy="item-${item}"]`).exists()).toBe(true)
        }
    })
})

describe('BUG 1 regression — tag switches reactively after mount (useWindowTransition / OrigamWindowXTranslate)', () => {
    it('renders only the first item while group=false (Transition tracks a single child)', () => {
        const wrapper = mountGroupHost(OrigamWindowXTranslate)
        expect(wrapper.findAll('[data-cy^="item-"]')).toHaveLength(1)
    })

    it('renders every item once group flips to true AFTER mount', async () => {
        const wrapper = mountGroupHost(OrigamWindowXTranslate)

        await wrapper.setProps({ group: true })
        await wrapper.vm.$nextTick()

        const rendered = wrapper.findAll('[data-cy^="item-"]')
        expect(rendered).toHaveLength(ITEMS.length)
        for (const item of ITEMS) {
            expect(wrapper.find(`[data-cy="item-${item}"]`).exists()).toBe(true)
        }
    })
})
