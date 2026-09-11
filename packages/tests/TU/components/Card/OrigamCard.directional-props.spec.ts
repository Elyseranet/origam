// Blast-radius verification for the 16 directional props THROUGH
// `useStateEffect` — the path that has now silently dropped props THREE
// separate times.
//
// Why this file exists as a component test rather than a composable test:
// `useStateEffect` does not forward `props` wholesale to `usePadding` /
// `useMargin` / `useRounded`. It hand-builds a `reactive({ get … })` bag
// naming ONE key per axis, and a getter bag only exposes the keys it
// names. So fixing `usePadding` to read `paddingTop` is NOT sufficient:
// without a matching getter in `stateEffect.composable.ts`, every one of
// the ~30 components routed through it (Card, Btn, Sheet, Alert, …) keeps
// dropping the prop, and a composable-level unit test stays green while
// the real component renders nothing.
//
// That is exactly the history: the per-side `borderTop`/… props were
// fixed in `useBorder`, then `borderBlock`/`borderInline` were fixed in
// `useBorder` a second time, and BOTH needed a follow-up commit here
// because the getter list was never updated. `useRounded` was worse
// still — `useStateEffect` passed it a bare `Ref`, an overload that
// carries a single scalar, making the four corner props structurally
// unreachable no matter what `useRounded` did internally.
//
// OrigamCard renders through `useStyle()` (a per-instance stylesheet
// injected into <head> as `#origam-card-N { … }`), not an inline `style`
// attribute — so these assertions go through `getComputedStyle` on an
// attached element, mirroring OrigamBtn.border-axis.spot-check.spec.ts.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'

function computedFor (props: Record<string, unknown>) {
    const wrapper = mount(OrigamCard, { props, attachTo: document.body })
    const style = getComputedStyle(wrapper.element)
    const read = (p: string) => style.getPropertyValue(p)

    return { read, done: () => wrapper.unmount() }
}

describe('OrigamCard — padding directionals through useStateEffect', () => {
    const cases: Array<[string, string]> = [
        ['paddingTop', 'padding-top'],
        ['paddingRight', 'padding-right'],
        ['paddingBottom', 'padding-bottom'],
        ['paddingLeft', 'padding-left'],
        ['paddingBlock', 'padding-block'],
        ['paddingInline', 'padding-inline'],
    ]

    it.each(cases)('%s reaches the DOM and two values differ', (prop, cssProp) => {
        const a = computedFor({ [prop]: '8px' })
        expect(a.read(cssProp)).toBe('8px')
        a.done()

        const b = computedFor({ [prop]: '37px' })
        expect(b.read(cssProp)).toBe('37px')
        b.done()
    })
})

describe('OrigamCard — margin directionals through useStateEffect', () => {
    const cases: Array<[string, string]> = [
        ['marginTop', 'margin-top'],
        ['marginRight', 'margin-right'],
        ['marginBottom', 'margin-bottom'],
        ['marginLeft', 'margin-left'],
        ['marginBlock', 'margin-block'],
        ['marginInline', 'margin-inline'],
    ]

    it.each(cases)('%s reaches the DOM and two values differ', (prop, cssProp) => {
        const a = computedFor({ [prop]: '9px' })
        expect(a.read(cssProp)).toBe('9px')
        a.done()

        const b = computedFor({ [prop]: '41px' })
        expect(b.read(cssProp)).toBe('41px')
        b.done()
    })
})

describe('OrigamCard — rounded corners through useStateEffect', () => {
    // These four were unreachable by construction before the fix:
    // `useStateEffect` called `useRounded(rounded)` with a bare Ref.
    const cases: Array<[string, string]> = [
        ['roundedTopLeft', 'border-top-left-radius'],
        ['roundedTopRight', 'border-top-right-radius'],
        ['roundedBottomLeft', 'border-bottom-left-radius'],
        ['roundedBottomRight', 'border-bottom-right-radius'],
    ]

    it.each(cases)('%s reaches the DOM and two values differ', (prop, cssProp) => {
        const a = computedFor({ [prop]: '3px' })
        expect(a.read(cssProp)).toBe('3px')
        a.done()

        const b = computedFor({ [prop]: '19px' })
        expect(b.read(cssProp)).toBe('19px')
        b.done()
    })
})

describe('OrigamCard — precedence survives the useStateEffect wiring', () => {
    it('paddingLeft overrides paddingInline, which overrides padding', () => {
        const { read, done } = computedFor({
            padding: '1px',
            paddingInline: '10px',
            paddingLeft: '50px'
        })

        expect(read('padding-left')).toBe('50px')
        done()
    })

    it('a corner overrides the rounded shorthand for that corner only', () => {
        const { read, done } = computedFor({ rounded: 'lg', roundedTopLeft: '0px' })

        expect(read('border-top-left-radius')).toBe('0px')
        // The other three corners keep the shorthand's rung. jsdom does not
        // resolve `var()`, so assert the declaration is NOT the override
        // rather than asserting a resolved pixel value.
        expect(read('border-top-right-radius')).not.toBe('0px')
        done()
    })
})
