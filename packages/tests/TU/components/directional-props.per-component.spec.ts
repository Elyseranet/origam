// Per-COMPONENT verification of the spacing / shape prop surface.
//
// The 16 directional props were implemented in `usePadding` / `useMargin` /
// `useRounded` and forwarded through `useStateEffect` (commit 121b5450).
// That fixed every component that CALLS one of those composables. It did
// nothing for the components that declare the props through their
// `IXxxProps` interface chain and never call the composable at all — a
// different failure mode, invisible to a composable-level unit test.
//
// This file pins the wiring at the COMPONENT level: mount the real
// component with a prop, read the resolved value off the DOM, and require
// two distinct inputs to produce two distinct outputs. A component that
// ignores the prop returns '' for both and fails.
//
// Values are deliberately explicit CSS lengths ('8px', '37px') rather than
// scale steps ('4'): the scale form resolves to a utility CLASS
// (`.origam--p-4`) whose stylesheet is not loaded in jsdom, so it would
// assert nothing here. Lengths take the inline-style path and are readable
// through `getComputedStyle`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Component } from 'vue'

import { createOrigam } from '@origam/origam'

// OrigamInput / OrigamPagination resolve `rtl` and `locale` through the
// plugin's provide/inject, and several components read `matchMedia` at setup.
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

import OrigamCardHeader from '@origam/components/Card/OrigamCardHeader.vue'
import OrigamCardText from '@origam/components/Card/OrigamCardText.vue'
import OrigamChart from '@origam/components/Chart/OrigamChart.vue'
import OrigamClassIcon from '@origam/components/Icon/OrigamClassIcon.vue'
import OrigamComponentIcon from '@origam/components/Icon/OrigamComponentIcon.vue'
import OrigamCounter from '@origam/components/Counter/OrigamCounter.vue'
import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamLigatureIcon from '@origam/components/Icon/OrigamLigatureIcon.vue'
import OrigamSvgIcon from '@origam/components/Icon/OrigamSvgIcon.vue'
import OrigamBracket from '@origam/components/Bracket/OrigamBracket.vue'
import OrigamMediaScrubber from '@origam/components/Media/OrigamMediaScrubber.vue'
import OrigamSliderFieldTrack from '@origam/components/SliderField/OrigamSliderFieldTrack.vue'
import OrigamPagination from '@origam/components/Pagination/OrigamPagination.vue'

const PADDING: Array<[string, string]> = [
    ['padding', 'padding-top'],
    ['paddingTop', 'padding-top'],
    ['paddingRight', 'padding-right'],
    ['paddingBottom', 'padding-bottom'],
    ['paddingLeft', 'padding-left'],
    ['paddingBlock', 'padding-block'],
    ['paddingInline', 'padding-inline'],
]

const MARGIN: Array<[string, string]> = [
    ['margin', 'margin-top'],
    ['marginTop', 'margin-top'],
    ['marginRight', 'margin-right'],
    ['marginBottom', 'margin-bottom'],
    ['marginLeft', 'margin-left'],
    ['marginBlock', 'margin-block'],
    ['marginInline', 'margin-inline'],
]

const ROUNDED: Array<[string, string]> = [
    // The shorthand emits `border-radius` verbatim; jsdom's getComputedStyle
    // does NOT expand a shorthand into its four longhands, so the corner
    // properties read '' here even when the declaration landed. Assert on the
    // shorthand itself — the per-corner rungs below are emitted as physical
    // longhands and are read directly.
    ['rounded', 'border-radius'],
    ['roundedTopLeft', 'border-top-left-radius'],
    ['roundedTopRight', 'border-top-right-radius'],
    ['roundedBottomLeft', 'border-bottom-left-radius'],
    ['roundedBottomRight', 'border-bottom-right-radius'],
]

const BORDER: Array<[string, string]> = [
    ['borderTop', 'border-top-width'],
    ['borderRight', 'border-right-width'],
    ['borderBottom', 'border-bottom-width'],
    ['borderLeft', 'border-left-width'],
]

/**
 * Mount `cmp` with `props` and read the resolved style off the styled element.
 *
 * `selector` targets a BEM child when the component paints the axis there
 * rather than on its root — OrigamMediaScrubber rounds its __track (the
 * visible bar), not the outer wrapper, which is the correct design.
 */
function readRoot (
    cmp: Component,
    props: Record<string, unknown>,
    base: Record<string, unknown> = {},
    selector?: string
) {
    const wrapper = mount(cmp, {
        props: { ...base, ...props },
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
    const el = selector ? wrapper.element.querySelector(selector) : wrapper.element
    if (!el) throw new Error(`selector ${selector} matched nothing`)
    const style = getComputedStyle(el)

    return {
        read: (p: string) => style.getPropertyValue(p),
        classes: () => (el as HTMLElement).className,
        done: () => wrapper.unmount()
    }
}

/**
 * Assert one prop reaches the DOM with two distinct values.
 * `a` / `b` are deliberately unusual lengths so a default can never match.
 */
function assertReaches (
    cmp: Component,
    prop: string,
    cssProp: string,
    base: Record<string, unknown>,
    selector?: string,
    a = '8px',
    b = '37px',
    // What to FEED the prop, when it differs from what should come out —
    // the bracket border grammar takes a number and emits `Npx`.
    inA: unknown = a,
    inB: unknown = b
) {
    const first = readRoot(cmp, { [prop]: inA }, base, selector)
    const gotA = first.read(cssProp).trim()
    first.done()

    const second = readRoot(cmp, { [prop]: inB }, base, selector)
    const gotB = second.read(cssProp).trim()
    second.done()

    expect(gotA, `${prop} -> ${cssProp} (in ${String(inA)})`).toBe(a)
    expect(gotB, `${prop} -> ${cssProp} (in ${String(inB)})`).toBe(b)
}

/** Components that need required props to mount without throwing. */
const BASE: Record<string, Record<string, unknown>> = {
    OrigamChart: { series: [] },
    OrigamSliderFieldTrack: { start: 0, stop: 50, min: 0, max: 100, modelValue: 50 },
    OrigamMediaScrubber: {},
    OrigamPagination: { length: 5 },
    OrigamBracket: {
        rounds: [{ id: 'r1', name: 'Final', matches: [] }]
    },
    OrigamCounter: {},
    OrigamInput: {},
}

const SUITE: Array<{
    name: string
    cmp: Component
    axes: Array<[string, string]>
    selector?: string
}> = [
    { name: 'OrigamCardHeader', cmp: OrigamCardHeader, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    { name: 'OrigamCardText', cmp: OrigamCardText, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    { name: 'OrigamChart', cmp: OrigamChart, axes: [...PADDING, ...MARGIN, ...ROUNDED] },
    { name: 'OrigamClassIcon', cmp: OrigamClassIcon, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    { name: 'OrigamComponentIcon', cmp: OrigamComponentIcon, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    { name: 'OrigamLigatureIcon', cmp: OrigamLigatureIcon, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    { name: 'OrigamSvgIcon', cmp: OrigamSvgIcon, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    {
        name: 'OrigamCounter',
        cmp: OrigamCounter,
        axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER],
        // Root is an <origam-transition>; the styled element is the counter itself.
        selector: '.origam-counter'
    },
    { name: 'OrigamInput', cmp: OrigamInput, axes: [...PADDING, ...MARGIN, ...ROUNDED, ...BORDER] },
    { name: 'OrigamPagination', cmp: OrigamPagination, axes: [...PADDING, ...MARGIN, ...BORDER] },
    {
        name: 'OrigamMediaScrubber',
        cmp: OrigamMediaScrubber,
        axes: ROUNDED.slice(1),
        selector: '.origam-media-scrubber__track'
    },
    { name: 'OrigamSliderFieldTrack', cmp: OrigamSliderFieldTrack, axes: ROUNDED.slice(1) },
]

for (const { name, cmp, axes, selector } of SUITE) {
    describe(`${name} — declared spacing / shape props reach the DOM`, () => {
        it.each(axes)('%s -> %s', (prop, cssProp) => {
            assertReaches(cmp, prop, cssProp, BASE[name] ?? {}, selector)
        })
    })
}

// ── OrigamMediaScrubber: `id` / `dataCy` ────────────────────────────────
// Both were declared and inert. `dataCy` is the more damaging of the two:
// the interface documented it as flowing through `$attrs`, but DECLARING it
// as a prop removes it from `$attrs`, and the template hardcoded the
// attribute — so a parent forwarding its own selector was silently ignored.
describe('OrigamMediaScrubber — id / dataCy reach the host element', () => {
    function attrOf (props: Record<string, unknown>, attr: string) {
        const w = mount(OrigamMediaScrubber, {
            props,
            attachTo: document.body,
            global: { plugins: [createOrigam()] }
        })
        const got = w.element.getAttribute(attr)
        w.unmount()

        return got
    }

    it('id lands on the root and two values differ', () => {
        expect(attrOf({ id: 'scrub-a' }, 'id')).toBe('scrub-a')
        expect(attrOf({ id: 'scrub-b' }, 'id')).toBe('scrub-b')
    })

    it('dataCy overrides the hardcoded default', () => {
        expect(attrOf({ dataCy: 'my-scrubber' }, 'data-cy')).toBe('my-scrubber')
        expect(attrOf({ dataCy: 'other-scrubber' }, 'data-cy')).toBe('other-scrubber')
    })

    it('falls back to the historical selector so existing tests keep matching', () => {
        expect(attrOf({}, 'data-cy')).toBe('origam-media-scrubber')
    })
})

// ── OrigamBracket ───────────────────────────────────────────────────────
// The bracket deliberately paints `rounded` / `border` / `elevation` onto the
// MATCH CARD, not onto its own root: it emits `--origam-bracket-match---*`
// custom properties that the card's SCSS consumes. That design is documented
// in the component and is why the audit reports these props as unconsumed —
// it cannot see through the `bracketSurfaceVars(props)` util call.
//
// The directional rungs therefore had to follow the SAME target. Asserting on
// the emitted custom property is the honest check: it is what the component
// actually produces, and it is what the card reads one level down.
//
// Border widths use NUMBERS, not lengths: `resolveBracketBorderWidth` accepts
// utility keywords, booleans and numbers only — a pre-existing constraint of
// the bracket border grammar, unchanged here.
describe('OrigamBracket — directional rungs reach the match-card custom properties', () => {
    const ROUNDED_CASES: Array<[string, string]> = [
        ['roundedTopLeft', '--origam-bracket-match---border-top-left-radius'],
        ['roundedTopRight', '--origam-bracket-match---border-top-right-radius'],
        ['roundedBottomLeft', '--origam-bracket-match---border-bottom-left-radius'],
        ['roundedBottomRight', '--origam-bracket-match---border-bottom-right-radius'],
    ]

    it.each(ROUNDED_CASES)('%s -> %s', (prop, cssVar) => {
        assertReaches(OrigamBracket, prop, cssVar, BASE.OrigamBracket)
    })

    const BORDER_CASES: Array<[string, string]> = [
        ['borderTop', '--origam-bracket-match---border-top-width'],
        ['borderRight', '--origam-bracket-match---border-right-width'],
        ['borderBottom', '--origam-bracket-match---border-bottom-width'],
        ['borderLeft', '--origam-bracket-match---border-left-width'],
        ['borderBlock', '--origam-bracket-match---border-block-width'],
        ['borderInline', '--origam-bracket-match---border-inline-width'],
    ]

    it.each(BORDER_CASES)('%s -> %s', (prop, cssVar) => {
        assertReaches(OrigamBracket, prop, cssVar, BASE.OrigamBracket, undefined, '3px', '11px', 3, 11)
    })

    const BORDER_COLOR_CASES: Array<[string, string]> = [
        ['borderTopColor', '--origam-bracket-match---border-top-color'],
        ['borderRightColor', '--origam-bracket-match---border-right-color'],
        ['borderBottomColor', '--origam-bracket-match---border-bottom-color'],
        ['borderLeftColor', '--origam-bracket-match---border-left-color'],
    ]

    it.each(BORDER_COLOR_CASES)('%s -> %s', (prop, cssVar) => {
        assertReaches(
            OrigamBracket, prop, cssVar, BASE.OrigamBracket, undefined,
            'rgb(1, 2, 3)', 'rgb(4, 5, 6)'
        )
    })
})
