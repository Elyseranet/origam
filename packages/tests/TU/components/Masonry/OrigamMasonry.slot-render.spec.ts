// #733 — the JS (bucket-fill) path and its slot children.
//
// TWO DIFFERENT CLAIMS ARE PINNED HERE, AND THEY DID NOT BOTH HOLD.
//
//  1. "Items render empty" — the symptom #733 was opened on. It does NOT
//     reproduce: the specs below pass unchanged against the pre-fix
//     component, and so does the geometric measurement in Chromium
//     (packages/tests/e2e/masonry.spec.ts, describe '#733 — item geometry').
//     They are kept as the regression floor for that claim, not as its proof.
//
//  2. "Children survive a re-render" — a REAL defect, found while trying to
//     reproduce (1), and what the fix actually addresses. The template read
//        <component :is="{ render: () => child }" />
//     and that object literal is rebuilt on every render pass, so Vue saw a
//     different component type each time and destroyed / recreated the whole
//     child subtree instead of patching it. `preserves child component state
//     …` below is the spec that fails before the fix and passes after.
//
// WHY THESE ARE LEGITIMATE JSDOM ASSERTIONS (cf. CLAUDE.md, the
// `getComputedStyle` / `var()` trap): nothing here measures a CSS property.
// They assert DOM PRESENCE and NODE IDENTITY (`querySelector`, `textContent`,
// `===`), which jsdom implements faithfully. The GEOMETRIC verdict belongs to
// Playwright and lives in packages/tests/e2e/masonry.spec.ts.
//
// `align: 'center'` is passed on purpose: it forces the JS path
// unconditionally (see `supportsCssMasonry` in OrigamMasonry.vue), so the
// specs do not depend on jsdom's CSS.supports behaviour.

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { mount } from '@vue/test-utils'

import OrigamMasonry from '@origam/components/Masonry/OrigamMasonry.vue'

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

const CARDS = [
    { id: 1, label: 'alpha' },
    { id: 2, label: 'beta' },
    { id: 3, label: 'gamma' }
]

const slotCards = () => CARDS.map((c) =>
    h('div', { key: c.id, class: 'card' }, `#${c.id} ${c.label}`)
)

describe('OrigamMasonry — JS path renders slot children (#733)', () => {
    /**
     * POSITIVE CONTROL.
     *
     * Before concluding anything from an ABSENCE, prove the harness can see
     * a PRESENCE. This mounts the exact same slot payload through a trivial
     * wrapper that renders it directly. If this ever goes red, the probe —
     * not the component — is broken, and no verdict about Masonry may be
     * drawn from the specs below.
     */
    it('positive control: the harness sees slot content when it IS rendered', () => {
        const Passthrough = defineComponent({
            setup (_, { slots }) {
                // Wrapped in an outer <div> on purpose: `querySelectorAll`
                // only walks DESCENDANTS, never the element it is called on.
                // A flat root would return 0 items and make this control fail
                // for a reason that has nothing to do with slot rendering.
                return () => h('div', [
                    h('div', { class: 'origam-masonry__item' }, slots.default?.())
                ])
            }
        })

        const wrapper = mount(Passthrough, { slots: { default: slotCards } })
        const items = wrapper.element.querySelectorAll('.origam-masonry__item')

        expect(items.length).toBe(1)
        expect(items[0].querySelectorAll('.card').length).toBe(3)
        expect(items[0].textContent).toContain('alpha')
    })

    it('wraps each slot child in its own .origam-masonry__item', () => {
        const wrapper = mount(OrigamMasonry, {
            props: { align: 'center' },
            slots: { default: slotCards }
        })

        expect(wrapper.element.classList.contains('origam-masonry--js')).toBe(true)
        expect(wrapper.element.querySelectorAll('.origam-masonry__item').length).toBe(3)
    })

    it('each .origam-masonry__item CONTAINS its child element and text', () => {
        const wrapper = mount(OrigamMasonry, {
            props: { align: 'center' },
            slots: { default: slotCards }
        })

        const items = Array.from(
            wrapper.element.querySelectorAll('.origam-masonry__item')
        ) as HTMLElement[]

        expect(items.length).toBe(3)
        items.forEach((item, idx) => {
            expect(
                item.querySelector('.card'),
                `item #${idx} has no .card child — the JS path dropped the slot content`
            ).not.toBeNull()
        })

        expect(items.map((i) => i.textContent?.trim())).toEqual([
            '#1 alpha',
            '#2 beta',
            '#3 gamma'
        ])
    })

    it('survives a re-render: content is still there after the parent updates', async () => {
        // This is the pass that actually killed the `{ render: () => child }`
        // pattern: the FIRST render could paint, the SECOND emptied the items.
        const Host = defineComponent({
            props: { bump: { type: Number, default: 0 } },
            setup (props) {
                return () => h(
                    OrigamMasonry,
                    { align: 'center' },
                    {
                        default: () => CARDS.map((c) =>
                            h('div', { key: c.id, class: 'card' }, `#${c.id} ${c.label}-${props.bump}`)
                        )
                    }
                )
            }
        })

        const wrapper = mount(Host, { props: { bump: 0 } })
        expect(wrapper.element.querySelectorAll('.origam-masonry__item .card').length).toBe(3)

        await wrapper.setProps({ bump: 1 })
        await nextTick()

        const items = Array.from(
            wrapper.element.querySelectorAll('.origam-masonry__item')
        ) as HTMLElement[]
        expect(items.length).toBe(3)
        expect(items.map((i) => i.textContent?.trim())).toEqual([
            '#1 alpha-1',
            '#2 beta-1',
            '#3 gamma-1'
        ])
    })

    /**
     * THE SPEC THAT ACTUALLY FAILS BEFORE THE FIX.
     *
     * A parent re-render must PATCH the children, not rebuild them. Three
     * independent signals are asserted, because each one alone could be
     * explained away:
     *
     *   - lifecycle counts   — no child is unmounted / remounted;
     *   - component state    — a value set in `onMounted` is still there;
     *   - DOM node identity  — the very same element object is still in place.
     *
     * Measured against the pre-fix component: +3 mounts and +3 unmounts per
     * re-render, and `sameDomNode === false`. Against the fixed one: 0, 0,
     * true. The same defect, measured in Chromium over one viewport resize:
     * 117 nodes added, 117 removed, 0 of 9 children keeping their node.
     */
    it('preserves child component state and DOM nodes across a parent re-render', async () => {
        let mounts = 0
        let unmounts = 0

        // `ticks` is set AFTER mount, so it is only non-zero on an instance
        // that was not torn down. A rebuilt child renders `:0`.
        const Stateful = defineComponent({
            props: { label: { type: String, default: '' } },
            setup (props) {
                const ticks = ref(0)
                onMounted(() => { mounts++; ticks.value = 42 })
                onUnmounted(() => { unmounts++ })
                return () => h('div', { class: 'card' }, `${props.label}:${ticks.value}`)
            }
        })

        const Host = defineComponent({
            props: { bump: { type: Number, default: 0 } },
            setup (props) {
                return () => h(OrigamMasonry, { align: 'center' }, {
                    default: () => [
                        h(Stateful, { key: 'a', label: 'a' }),
                        h(Stateful, { key: 'b', label: 'b' }),
                        // Only this one's props change, to force a real patch.
                        h(Stateful, { key: 'c', label: `c${props.bump}` })
                    ]
                })
            }
        })

        const wrapper = mount(Host, { props: { bump: 0 } })
        await nextTick()

        expect(mounts).toBe(3)
        expect(unmounts).toBe(0)

        const nodeBefore = wrapper.element.querySelector('.origam-masonry__item .card')
        expect(nodeBefore).not.toBeNull()

        await wrapper.setProps({ bump: 1 })
        await nextTick()

        expect(mounts, 'a child was remounted — the wrapper rebuilt it instead of patching').toBe(3)
        expect(unmounts, 'a child was unmounted on a plain re-render').toBe(0)

        // State survived: every child still reports the post-mount value.
        expect(wrapper.element.textContent).toBe('a:42b:42c1:42')

        // And it is literally the same DOM element, not an identical-looking one.
        const nodeAfter = wrapper.element.querySelector('.origam-masonry__item .card')
        expect(nodeAfter).toBe(nodeBefore)
    })
})
