// Issue #1013 — the LOGICAL-PER-SIDE border grid: `borderInlineStart` /
// `borderInlineEnd` / `borderBlockStart` / `borderBlockEnd` plus their four
// `*Color` twins.
//
// ⛔ WHY THESE TESTS ASSERT ON THE DECLARATION ARRAY AND NEVER ON
// `getComputedStyle`. Under Vitest/jsdom, `getComputedStyle(el).someProp`
// NEVER resolves a `var()` reference: the declaration is silently dropped
// and jsdom substitutes a FABRICATED default of `16px`, which looks exactly
// like a real measurement. That produces false "conforme" (a test asserting
// `16px` passes on an element with no border at all) and false "défaut" (two
// `var()`-driven values both read `16px`, so a working prop looks dead).
// Since the boolean opt-in path here emits
// `var(--origam-border__width---thin)`, a computed-style assertion on it
// would be measuring jsdom's fiction.
//
// `borderStyles` is an `Array<string>` of literal declarations rendered as
// an INLINE style, so the array itself — and `el.style.getPropertyValue()`,
// which involves no cascade and no custom-property resolution — are the
// reliable instruments here.
//
// ⚠️ WHAT THESE TESTS DO NOT ESTABLISH, stated so nobody mistakes their
// scope: they prove the correct DECLARATIONS are emitted and in the correct
// ORDER. They do not prove painted pixels, and they cannot observe
// writing-mode behaviour — the LTR/RTL mapping of `border-inline-start` is
// the browser's own, and jsdom does not implement it. A browser verdict on
// that would need a Playwright spec driving a component story with these
// props exposed as controls; no such control exists on any story today, so
// it is NOT claimed here. See the PR for #1013.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IBorderProps } from '@origam/interfaces'

import { useBorder } from '@origam/composables/Commons/border.composable'
import { BORDER_LOGICAL_SIDE_MAP, BORDER_PROP_KEYS } from '@origam/consts/Commons/border.const'

function stylesFor (props: IBorderProps): Array<string> {
    const reactiveProps = reactive<IBorderProps>({ ...props })
    let api!: ReturnType<typeof useBorder>

    const Host = defineComponent({
        name: 'OrigamBorderLogicalSideHost',
        setup () {
            api = useBorder(reactiveProps, 'origam-host')

            return () => h('div')
        }
    })

    mount(Host)

    return api.borderStyles.value
}

/** Index of a declaration in the emitted array, or -1. */
function indexOf (styles: Array<string>, declaration: string): number {
    return styles.indexOf(declaration)
}

describe('#1013 — the four logical-per-side width props emit the native logical longhands', () => {
    // The table drives the test so a future 5th member of the map cannot be
    // added without a matching assertion appearing automatically.
    const CASES = [
        { prop: 'borderInlineStart', edge: 'inline-start' },
        { prop: 'borderInlineEnd', edge: 'inline-end' },
        { prop: 'borderBlockStart', edge: 'block-start' },
        { prop: 'borderBlockEnd', edge: 'block-end' }
    ] as const

    it.each(CASES)('$prop with a bare number emits border-$edge-{width,style,color}', ({ prop, edge }) => {
        const styles = stylesFor({ [prop]: 4 } as IBorderProps)

        // A bare width alone paints nothing (`border-style` defaults to
        // `none`), so the composable must default style + color too.
        expect(styles).toContain(`border-${edge}-width: 4px`)
        expect(styles).toContain(`border-${edge}-style: solid`)
        expect(styles).toContain(`border-${edge}-color: currentColor`)
    })

    it.each(CASES)('$prop with a full "width style color" string emits all three facets parsed', ({ prop, edge }) => {
        const styles = stylesFor({ [prop]: '2px dashed red' } as IBorderProps)

        expect(styles).toContain(`border-${edge}-width: 2px`)
        expect(styles).toContain(`border-${edge}-style: dashed`)
        expect(styles).toContain(`border-${edge}-color: red`)
    })

    it.each(CASES)('$prop with the boolean opt-in emits the thin design token, not a hardcoded width', ({ prop, edge }) => {
        const styles = stylesFor({ [prop]: true } as IBorderProps)

        expect(styles).toContain(`border-${edge}-width: var(--origam-border__width---thin)`)
        expect(styles).toContain(`border-${edge}-style: solid`)
    })

    it.each(CASES)('$prop absent emits NO declaration for border-$edge (negative control)', ({ edge }) => {
        // Without this control, every assertion above could pass on a
        // composable that emits all four edges unconditionally.
        const styles = stylesFor({ border: 2 })

        expect(styles.some((s) => s.startsWith(`border-${edge}-`))).toBe(false)
        // …while proving the composable did emit something at all, so the
        // absence above is not simply an empty array.
        expect(styles).toContain('border-width: 2px')
    })

    it('the four props are independent — each paints only its own edge', () => {
        const styles = stylesFor({
            borderInlineStart: 1,
            borderInlineEnd: 2,
            borderBlockStart: 3,
            borderBlockEnd: 4
        })

        expect(styles).toContain('border-inline-start-width: 1px')
        expect(styles).toContain('border-inline-end-width: 2px')
        expect(styles).toContain('border-block-start-width: 3px')
        expect(styles).toContain('border-block-end-width: 4px')
    })
})

describe('#1013 — the four logical-per-side *Color props', () => {
    const COLOR_CASES = [
        { prop: 'borderInlineStartColor', edge: 'inline-start' },
        { prop: 'borderInlineEndColor', edge: 'inline-end' },
        { prop: 'borderBlockStartColor', edge: 'block-start' },
        { prop: 'borderBlockEndColor', edge: 'block-end' }
    ] as const

    it.each(COLOR_CASES)('$prop with a raw CSS color emits border-$edge-color', ({ prop, edge }) => {
        const styles = stylesFor({ [prop]: 'red' } as IBorderProps)

        expect(styles).toContain(`border-${edge}-color: red`)
    })

    it.each(COLOR_CASES)('$prop resolves a semantic intent through the FOREGROUND token family', ({ prop, edge }) => {
        const styles = stylesFor({ [prop]: 'primary' } as IBorderProps)

        // A border is a STROKE, so an intent must resolve via the
        // foreground token, never a background one — same rule #215 set
        // for the physical `*Color` family.
        const declaration = styles.find((s) => s.startsWith(`border-${edge}-color:`))

        expect(declaration).toBeDefined()
        expect(declaration).toMatch(/var\(--origam-color/)
        expect(declaration).not.toMatch(/---bg/)
    })

    it.each(COLOR_CASES)('$prop silently ignores a gradient (CSS border-color has no gradient form)', ({ prop, edge }) => {
        const styles = stylesFor({ [prop]: 'linear-gradient(to right, red, blue)' } as IBorderProps)

        expect(styles.some((s) => s.startsWith(`border-${edge}-color:`))).toBe(false)
    })

    it('a *Color prop beats the color embedded in its own edge width string', () => {
        const styles = stylesFor({
            borderInlineStart: '2px dashed red',
            borderInlineStartColor: 'blue'
        })

        // Both declarations are emitted; the inline style attribute is a
        // single cascade, so the LAST one wins. Assert on order, which is
        // the actual mechanism, rather than on mere presence.
        const embedded = indexOf(styles, 'border-inline-start-color: red')
        const override = indexOf(styles, 'border-inline-start-color: blue')

        expect(embedded).toBeGreaterThanOrEqual(0)
        expect(override).toBeGreaterThan(embedded)
    })
})

describe('#1013 — precedence: push order IS the cascade', () => {
    it('a logical per-side prop is pushed AFTER its own axis prop (edge beats axis)', () => {
        const styles = stylesFor({ borderInline: 1, borderInlineStart: 9 })

        const axis = indexOf(styles, 'border-inline-width: 1px')
        const edge = indexOf(styles, 'border-inline-start-width: 9px')

        expect(axis).toBeGreaterThanOrEqual(0)
        expect(edge).toBeGreaterThan(axis)
    })

    it('⛔ a PHYSICAL per-side prop is pushed AFTER the logical one for the same edge', () => {
        // The decided tiebreak (#1013). `borderLeft` and `borderInlineStart`
        // are two spellings of one edge in LTR at equal CSS specificity, so
        // declaration order is the whole mechanism. Resolved in favour of
        // PHYSICAL, matching the repo's only prior physical-vs-logical
        // tiebreak on `ROUNDED_CORNER_MAP` (spacing.const.ts:85-88), and
        // agreed with the padding/margin/rounded half of this ticket so all
        // four directional grids answer it identically.
        const styles = stylesFor({ borderInlineStart: 1, borderLeft: 9 })

        const logical = indexOf(styles, 'border-inline-start-width: 1px')
        const physical = indexOf(styles, 'border-left-width: 9px')

        expect(logical).toBeGreaterThanOrEqual(0)
        expect(physical).toBeGreaterThan(logical)
    })

    it('⛔ the same tiebreak holds on the *Color channel', () => {
        const styles = stylesFor({ borderInlineStartColor: 'red', borderLeftColor: 'blue' })

        const logical = indexOf(styles, 'border-inline-start-color: red')
        const physical = indexOf(styles, 'border-left-color: blue')

        expect(logical).toBeGreaterThanOrEqual(0)
        expect(physical).toBeGreaterThan(logical)
    })

    it('a logical per-side prop is pushed after the global border shorthand', () => {
        const styles = stylesFor({ border: 1, borderBlockStart: 9 })

        const global = indexOf(styles, 'border-width: 1px')
        const edge = indexOf(styles, 'border-block-start-width: 9px')

        expect(global).toBeGreaterThanOrEqual(0)
        expect(edge).toBeGreaterThan(global)
    })

    it('the full five-rung ladder emits in the documented order on one edge', () => {
        const styles = stylesFor({
            border: 1,
            borderInline: 2,
            borderInlineStart: 3,
            borderLeft: 4
        })

        const rungs = [
            indexOf(styles, 'border-width: 1px'),
            indexOf(styles, 'border-inline-width: 2px'),
            indexOf(styles, 'border-inline-start-width: 3px'),
            indexOf(styles, 'border-left-width: 4px')
        ]

        expect(rungs.every((r) => r >= 0)).toBe(true)
        // Strictly increasing = the JSDoc precedence table is real.
        expect(rungs).toEqual([...rungs].sort((a, b) => a - b))
        expect(new Set(rungs).size).toBe(rungs.length)
    })
})

describe('#1013 — shared value grammar: limits are inherited, not introduced', () => {
    // These two cases are PRE-EXISTING limits of `BORDER_REGEX`, shared
    // identically by `borderLeft` and `borderBlock` today. They are pinned
    // here — not fixed — so a future regex change has to acknowledge all
    // three directional grids at once rather than discovering the asymmetry
    // in production. Measured 2026-10-01.
    it('a calc() width does not parse and emits NOTHING — same as the physical grid', () => {
        const logical = stylesFor({ borderInlineStart: 'calc(2px + 1px) solid red' })
        const physical = stylesFor({ borderLeft: 'calc(2px + 1px) solid red' })

        expect(logical.some((s) => s.startsWith('border-inline-start-'))).toBe(false)
        // The negative control that makes this a statement about the SHARED
        // grammar rather than about my new code: the physical prop, shipped
        // in #215, fails identically.
        expect(physical.some((s) => s.startsWith('border-left-'))).toBe(false)
    })

    it('a fractional width does not parse and emits NOTHING — same as the physical grid', () => {
        const logical = stylesFor({ borderInlineStart: '0.5rem solid red' })
        const physical = stylesFor({ borderLeft: '0.5rem solid red' })

        expect(logical.some((s) => s.startsWith('border-inline-start-'))).toBe(false)
        expect(physical.some((s) => s.startsWith('border-left-'))).toBe(false)
    })

    it('a TOKENISED width in the documented var(--x) <style> form DOES parse', () => {
        const styles = stylesFor({ borderInlineStart: 'var(--origam-border__width---thin) solid var(--c)' })

        expect(styles).toContain('border-inline-start-width: var(--origam-border__width---thin)')
        expect(styles).toContain('border-inline-start-style: solid')
        expect(styles).toContain('border-inline-start-color: var(--c)')
    })
})

describe('#1013 — the prop surface is complete and self-consistent', () => {
    it('BORDER_LOGICAL_SIDE_MAP carries the four edges with matching width/color props', () => {
        expect(BORDER_LOGICAL_SIDE_MAP.map((m) => m.side)).toEqual([
            'block-start', 'block-end', 'inline-start', 'inline-end'
        ])

        BORDER_LOGICAL_SIDE_MAP.forEach(({ widthProp, colorProp }) => {
            expect(colorProp).toBe(`${widthProp}Color`)
        })
    })

    it('⛔ every prop the map names is enumerated in BORDER_PROP_KEYS', () => {
        // `BORDER_PROP_KEYS` drives the #726 field/input split: the four
        // components wrapping an `<origam-field>` inside an `<origam-input>`
        // withhold this surface from the input via `filterProps`. A key
        // missing here silently restores that defect for that one value.
        BORDER_LOGICAL_SIDE_MAP.forEach(({ widthProp, colorProp }) => {
            expect(BORDER_PROP_KEYS).toContain(widthProp)
            expect(BORDER_PROP_KEYS).toContain(colorProp)
        })
    })
})
