// Consumer-level runtime proof for `borderBlock` / `borderInline` on a real
// component (not just the `useBorder` composable in isolation).
//
// `IBorderProps` is inherited by ~77 component interfaces; `ICardProps`
// (packages/ds/src/interfaces/Card/card.interface.ts) is one of them and
// binds `cardStyles` (which includes `borderStyles.value`) straight onto
// the rendered root element via `:style="cardStyles"`
// (packages/ds/src/components/Card/OrigamCard.vue). This locks that the
// fix in border.composable.ts actually PAINTS pixels through a consumer,
// not only that the composable's returned array contains the right
// strings — a prop can be "declared, typed, and even present in a style
// array" and still never reach the DOM if a parent-level bug drops it.

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

describe('OrigamCard — borderBlock / borderInline actually paint the root element', () => {
    it('borderBlock renders border-block-* on the rendered element style, computed via getComputedStyle', () => {
        const wrapper = mount(OrigamCard, { props: { borderBlock: 4 } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-block-width')).toBe('4px')
        expect(el.style.getPropertyValue('border-block-style')).toBe('solid')
        // jsdom's CSSOM lowercases the `currentColor` keyword token on
        // read-back (same normalization browsers apply to CSS identifiers)
        expect(el.style.getPropertyValue('border-block-color')).toBe('currentcolor')

        const computed = getComputedStyle(el)
        expect(computed.borderBlockWidth).toBe('4px')
        expect(computed.borderBlockStyle).toBe('solid')
    })

    it('borderInline renders border-inline-* on the rendered element style', () => {
        const wrapper = mount(OrigamCard, { props: { borderInline: '2px dashed red' } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-inline-width')).toBe('2px')
        expect(el.style.getPropertyValue('border-inline-style')).toBe('dashed')
        expect(el.style.getPropertyValue('border-inline-color')).toBe('red')

        const computed = getComputedStyle(el)
        expect(computed.borderInlineWidth).toBe('2px')
        expect(computed.borderInlineStyle).toBe('dashed')
        expect(computed.borderInlineColor).toBe('red')
    })

    it('borderBlock + borderInline together paint both axes independently on the same element', () => {
        const wrapper = mount(OrigamCard, { props: { borderBlock: 1, borderInline: 3 } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-block-width')).toBe('1px')
        expect(el.style.getPropertyValue('border-inline-width')).toBe('3px')
    })

    it('regression guard: without borderBlock / borderInline, no logical-axis declaration reaches the element (pre-fix baseline)', () => {
        const wrapper = mount(OrigamCard, { props: { border: 2 } })
        const el = wrapper.element as HTMLElement

        expect(el.style.getPropertyValue('border-block-width')).toBe('')
        expect(el.style.getPropertyValue('border-inline-width')).toBe('')
        // The physical global `border` prop still paints, proving the
        // element does receive `cardStyles` at all (i.e. an empty
        // border-block-width isn't just because nothing was ever bound).
        expect(el.style.getPropertyValue('border-width')).toBe('2px')
    })
})
