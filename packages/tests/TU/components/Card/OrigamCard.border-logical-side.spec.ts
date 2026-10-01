// Issue #1013 — THE TEST THAT MATTERS MOST IN THIS LOT.
//
// `useBorder` learning to read the four logical-per-side props is only half
// the wiring. The other half is `useStateEffect`, which does NOT wrap
// `props`: it hands `useBorder` a `reactive({ get x () {…} })` bag whose
// getter list is CURATED BY HAND
// (packages/ds/src/composables/Commons/stateEffect.composable.ts). A getter
// bag only exposes the keys it names, so a prop missing from that list is
// dropped before it ever reaches `useBorder` — with no error, no warning,
// and a perfectly green type-check.
//
// That is not a hypothetical. The composable's own comment records the bug
// having happened THREE times, once exactly this way: "`borderBlock` /
// `borderInline` hit exactly this gap a second time: `useBorder` itself was
// fixed to read them, but this curated getter list was never updated to
// forward them, so every one of the ~30 components routed through
// `useStateEffect` (Card, Btn, Sheet, Alert, …) still silently dropped them
// even after that fix."
//
// Measured for this lot: 22-23 component interfaces reach `useBorder` ONLY
// through that bag. `OrigamCard` is one of them — it calls `useStateEffect`
// (OrigamCard.vue:167) and never `useBorder` directly — which is precisely
// what makes it the right witness. A composable-level spec CANNOT observe
// this omission; only a mounted consumer can.
//
// ⛔ Assertions read `el.style.getPropertyValue(...)`, never
// `getComputedStyle`. Under jsdom the latter never resolves a `var()` and
// substitutes a fabricated `16px` default that looks like a measurement.
// The inline style attribute involves no cascade and no custom-property
// resolution, so reading it back is sound — and it is literally the channel
// these composables paint through.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'

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

const WIDTH_CASES = [
    { prop: 'borderInlineStart', edge: 'inline-start' },
    { prop: 'borderInlineEnd', edge: 'inline-end' },
    { prop: 'borderBlockStart', edge: 'block-start' },
    { prop: 'borderBlockEnd', edge: 'block-end' }
] as const

const COLOR_CASES = [
    { prop: 'borderInlineStartColor', edge: 'inline-start' },
    { prop: 'borderInlineEndColor', edge: 'inline-end' },
    { prop: 'borderBlockStartColor', edge: 'block-start' },
    { prop: 'borderBlockEndColor', edge: 'block-end' }
] as const

describe('#1013 — logical-per-side border props survive useStateEffect and reach the DOM', () => {
    it.each(WIDTH_CASES)('$prop paints border-$edge-* on the rendered root element', ({ prop, edge }) => {
        const wrapper = mount(OrigamCard, { props: { [prop]: 4 } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue(`border-${edge}-width`)).toBe('4px')
        expect(el.style.getPropertyValue(`border-${edge}-style`)).toBe('solid')
        // jsdom's CSSOM lowercases the `currentColor` identifier on
        // read-back, the same normalisation browsers apply.
        expect(el.style.getPropertyValue(`border-${edge}-color`)).toBe('currentcolor')
    })

    it.each(WIDTH_CASES)('$prop accepts a full "width style color" string through the same path', ({ prop, edge }) => {
        const wrapper = mount(OrigamCard, { props: { [prop]: '2px dashed red' } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue(`border-${edge}-width`)).toBe('2px')
        expect(el.style.getPropertyValue(`border-${edge}-style`)).toBe('dashed')
        expect(el.style.getPropertyValue(`border-${edge}-color`)).toBe('red')
    })

    it.each(COLOR_CASES)('$prop paints border-$edge-color on the rendered root element', ({ prop, edge }) => {
        const wrapper = mount(OrigamCard, { props: { [prop]: 'red' } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue(`border-${edge}-color`)).toBe('red')
    })

    it('all four edges paint independently on one element', () => {
        const wrapper = mount(OrigamCard, {
            props: {
                borderInlineStart: 1,
                borderInlineEnd: 2,
                borderBlockStart: 3,
                borderBlockEnd: 4
            }
        })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-inline-start-width')).toBe('1px')
        expect(el.style.getPropertyValue('border-inline-end-width')).toBe('2px')
        expect(el.style.getPropertyValue('border-block-start-width')).toBe('3px')
        expect(el.style.getPropertyValue('border-block-end-width')).toBe('4px')
    })

    it('the decided tiebreak holds through a real consumer: physical wins over logical for one edge', () => {
        const wrapper = mount(OrigamCard, { props: { borderInlineStart: 1, borderLeft: 9 } })
        const el = wrapper.element as HTMLElement

        // Both declarations land in the inline style attribute; the later
        // one wins the cascade. The CSSOM keeps them as distinct
        // properties, so assert on source order in the serialised
        // attribute — that IS what the browser resolves.
        const attr = el.getAttribute('style') ?? ''
        const logical = attr.indexOf('border-inline-start-width')
        const physical = attr.indexOf('border-left-width')

        expect(logical).toBeGreaterThanOrEqual(0)
        expect(physical).toBeGreaterThan(logical)
    })

    it('⛔ negative control: with no logical-per-side prop, no such declaration reaches the element', () => {
        // Without this, every assertion above would also pass on a
        // component that emitted all four edges unconditionally.
        const wrapper = mount(OrigamCard, { props: { border: 2 } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-inline-start-width')).toBe('')
        expect(el.style.getPropertyValue('border-inline-end-width')).toBe('')
        expect(el.style.getPropertyValue('border-block-start-width')).toBe('')
        expect(el.style.getPropertyValue('border-block-end-width')).toBe('')
        // …and the global prop still paints, proving the element does
        // receive the style bindings at all — i.e. the four empty reads
        // above are a real absence, not an unbound element.
        expect(el.style.getPropertyValue('border-width')).toBe('2px')
    })

    it('⛔ the pre-existing axis props still paint — the new rung did not displace them', () => {
        // Regression guard on the rung inserted between the axis loop and
        // the physical loop. If the insertion had replaced rather than
        // preceded the axis emission, this is what would catch it.
        const wrapper = mount(OrigamCard, { props: { borderBlock: 4, borderInline: 2 } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-block-width')).toBe('4px')
        expect(el.style.getPropertyValue('border-inline-width')).toBe('2px')
    })
})
