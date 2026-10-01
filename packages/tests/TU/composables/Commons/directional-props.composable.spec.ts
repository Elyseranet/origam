// Runtime proof for the directional padding / margin / rounded props —
// originally the 16 previously-INERT ones, now 28 with the 12 logical-
// per-side props issue #1013 added (`paddingInlineStart`,
// `marginBlockEnd`, `roundedStartStart`, … ). The new 12 were never inert:
// they are tested here from the commit that introduced them, because the
// bar below is the one that catches a prop wired to nothing, whenever it
// was declared.
//
// "Inert" is precise here: each of these 16 was declared on its Commons
// interface (so it type-checked, showed up in Histoire controls, and was
// editable in the Theme Builder) while NO composable read it — the value
// reached nothing and produced no declaration. Verified before the fix by
// grepping composables/ utils/ consts/ for the prop names: the only hits
// were `paddingTop` in virtual.composable.ts (a scroll offset, unrelated)
// and a comment in margin.composable.ts that claimed a fall-through path
// which did not exist.
//
// The bar every assertion below meets, per the ticket: TWO DISTINCT VALUES
// of the prop must produce TWO DISTINCT outputs. Asserting a single value
// renders "something" would pass just as well against a hardcoded constant,
// which is exactly the failure mode that let these 16 sit inert.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IMarginProps, IPaddingProps, IRoundedProps } from '@origam/interfaces'

import { useMargin } from '@origam/composables/Commons/margin.composable'
import { usePadding } from '@origam/composables/Commons/padding.composable'
import { useRounded } from '@origam/composables/Commons/rounded.composable'

function host<P extends object, R> (composable: (p: P) => R, props: P): () => R {
    let api!: R

    const Host = defineComponent({
        name: 'OrigamDirectionalHost',
        setup () {
            api = composable(props)
            return () => h('div')
        }
    })

    mount(Host)
    return () => api
}

const paddingApi = (p: IPaddingProps) => host(usePadding, reactive(p) as IPaddingProps)()
const marginApi = (p: IMarginProps) => host(useMargin, reactive(p) as IMarginProps)()
const roundedApi = (p: IRoundedProps) => host(useRounded, reactive(p) as IRoundedProps)()

// ───────────────────────────────────────────────────────────────────────
// 1. Each of the 16 props emits a declaration, and DIFFERENT values emit
//    DIFFERENT declarations.
// ───────────────────────────────────────────────────────────────────────

describe('padding directionals — 6 props, distinct output per value', () => {
    const cases: Array<[keyof IPaddingProps, string]> = [
        ['paddingTop', 'padding-top'],
        ['paddingRight', 'padding-right'],
        ['paddingBottom', 'padding-bottom'],
        ['paddingLeft', 'padding-left'],
        ['paddingBlock', 'padding-block'],
        ['paddingInline', 'padding-inline'],
        // Logical-per-side grid, issue #1013 — the third grid. Added here
        // rather than in a new file so the three grids are exercised by one
        // table and cannot drift apart.
        ['paddingInlineStart', 'padding-inline-start'],
        ['paddingInlineEnd', 'padding-inline-end'],
        ['paddingBlockStart', 'padding-block-start'],
        ['paddingBlockEnd', 'padding-block-end'],
    ]

    it.each(cases)('%s emits %s and tracks the value', (prop, cssProp) => {
        const a = paddingApi({ [prop]: '8px' }).paddingStyles.value
        const b = paddingApi({ [prop]: '32px' }).paddingStyles.value

        expect(a).toContain(`${cssProp}: 8px`)
        expect(b).toContain(`${cssProp}: 32px`)
        expect(a).not.toEqual(b)
    })

    it.each(cases)('%s accepts a bare number as pixels', (prop, cssProp) => {
        expect(paddingApi({ [prop]: 12 }).paddingStyles.value).toContain(`${cssProp}: 12px`)
    })

    it.each(cases)('%s accepts a design-token scale step', (prop, cssProp) => {
        expect(paddingApi({ [prop]: '4' }).paddingStyles.value)
            .toContain(`${cssProp}: var(--origam-space---4)`)
    })
})

describe('margin directionals — 6 props, distinct output per value', () => {
    const cases: Array<[keyof IMarginProps, string]> = [
        ['marginTop', 'margin-top'],
        ['marginRight', 'margin-right'],
        ['marginBottom', 'margin-bottom'],
        ['marginLeft', 'margin-left'],
        ['marginBlock', 'margin-block'],
        ['marginInline', 'margin-inline'],
        // Logical-per-side grid, issue #1013.
        ['marginInlineStart', 'margin-inline-start'],
        ['marginInlineEnd', 'margin-inline-end'],
        ['marginBlockStart', 'margin-block-start'],
        ['marginBlockEnd', 'margin-block-end'],
    ]

    it.each(cases)('%s emits %s and tracks the value', (prop, cssProp) => {
        const a = marginApi({ [prop]: '8px' }).marginStyles.value
        const b = marginApi({ [prop]: '32px' }).marginStyles.value

        expect(a).toContain(`${cssProp}: 8px`)
        expect(b).toContain(`${cssProp}: 32px`)
        expect(a).not.toEqual(b)
    })

    it.each(cases)('%s accepts the `auto` keyword', (prop, cssProp) => {
        expect(marginApi({ [prop]: 'auto' }).marginStyles.value).toContain(`${cssProp}: auto`)
    })
})

describe('rounded corners — 4 props, distinct output per value', () => {
    const cases: Array<[keyof IRoundedProps, string]> = [
        ['roundedTopLeft', 'border-top-left-radius'],
        ['roundedTopRight', 'border-top-right-radius'],
        ['roundedBottomLeft', 'border-bottom-left-radius'],
        ['roundedBottomRight', 'border-bottom-right-radius'],
        // Logical corner grid, issue #1013. Name order is {block}-{inline},
        // so `startEnd` is block-start inline-end = top-RIGHT in LTR.
        ['roundedStartStart', 'border-start-start-radius'],
        ['roundedStartEnd', 'border-start-end-radius'],
        ['roundedEndStart', 'border-end-start-radius'],
        ['roundedEndEnd', 'border-end-end-radius'],
    ]

    it.each(cases)('%s emits %s and tracks the value', (prop, cssProp) => {
        const a = roundedApi({ [prop]: '4px' }).roundedStyles.value
        const b = roundedApi({ [prop]: '20px' }).roundedStyles.value

        expect(a).toContain(`${cssProp}: 4px`)
        expect(b).toContain(`${cssProp}: 20px`)
        expect(a).not.toEqual(b)
    })

    it.each(cases)('%s resolves the utility rung vocabulary', (prop, cssProp) => {
        expect(roundedApi({ [prop]: 'lg' }).roundedStyles.value)
            .toContain(`${cssProp}: var(--origam-radius---lg, 12px)`)
    })

    it.each(cases)('%s resolves the named-variant vocabulary', (prop, cssProp) => {
        expect(roundedApi({ [prop]: 'large' }).roundedStyles.value)
            .toContain(`${cssProp}: var(--origam-radius---xl, 16px)`)
    })
})

// ───────────────────────────────────────────────────────────────────────
// 2. Precedence — the useBorder grammar, reproduced.
//    Later push wins within one inline `style` attribute, so the assertion
//    is on ORDER, not merely on presence.
// ───────────────────────────────────────────────────────────────────────

describe('precedence grammar (mirrors useBorder)', () => {
    it('padding: side beats axis beats shorthand, for the targeted edge only', () => {
        const styles = paddingApi({
            padding: '2px',
            paddingBlock: '10px',
            paddingTop: '99px'
        }).paddingStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        expect(idx('padding:')).toBeGreaterThanOrEqual(0)
        expect(idx('padding-block:')).toBeGreaterThan(idx('padding:'))
        expect(idx('padding-top:')).toBeGreaterThan(idx('padding-block:'))
    })

    it('padding: an untargeted edge keeps cascading from the rung below', () => {
        const styles = paddingApi({ paddingBlock: '10px', paddingTop: '99px' }).paddingStyles.value

        // `paddingTop` overrides the block-start edge; block-end still
        // resolves from `paddingBlock` because nothing more specific
        // targets it.
        expect(styles).toContain('padding-block: 10px')
        expect(styles).toContain('padding-top: 99px')
        expect(styles.some(s => s.startsWith('padding-bottom:'))).toBe(false)
    })

    it('margin: side beats axis beats shorthand', () => {
        const styles = marginApi({
            margin: '2px',
            marginInline: '10px',
            marginLeft: '99px'
        }).marginStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        expect(idx('margin-inline:')).toBeGreaterThan(idx('margin:'))
        expect(idx('margin-left:')).toBeGreaterThan(idx('margin-inline:'))
    })

    it('rounded: a corner beats the shorthand for that corner only', () => {
        const styles = roundedApi({ rounded: 'lg', roundedTopLeft: '0px' }).roundedStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        expect(idx('border-radius:')).toBe(0)
        expect(idx('border-top-left-radius:')).toBeGreaterThan(idx('border-radius:'))
        expect(styles.some(s => s.startsWith('border-top-right-radius:'))).toBe(false)
    })

    // ── Logical-per-side grid, issue #1013 ───────────────────────────
    // The rung inserted between the axis and the physical loop. Both
    // boundaries need pinning: it must BEAT the axis prop (one edge is
    // narrower than two) and LOSE to the physical prop for the edge they
    // share. The second half is the one that is a decision rather than a
    // deduction, so it is the one most likely to be "tidied" later by
    // someone who reads the two as interchangeable.

    it('padding: logical side beats the axis rung for its own edge', () => {
        const styles = paddingApi({
            paddingInline: '10px',
            paddingInlineStart: '99px'
        }).paddingStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        expect(idx('padding-inline-start:')).toBeGreaterThan(idx('padding-inline:'))
    })

    it('padding: the physical side wins over the logical side for the same edge', () => {
        const styles = paddingApi({
            paddingInlineStart: '99px',
            paddingLeft: '1px'
        }).paddingStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        // Both are emitted — the browser resolves them by order, and the
        // physical one is last. Asserting only presence would pass with
        // the order reversed, which is the whole point of the rung.
        expect(idx('padding-inline-start:')).toBeGreaterThanOrEqual(0)
        expect(idx('padding-left:')).toBeGreaterThan(idx('padding-inline-start:'))
    })

    it('margin: the physical side wins over the logical side for the same edge', () => {
        const styles = marginApi({
            marginBlockStart: '99px',
            marginTop: '1px'
        }).marginStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        expect(idx('margin-top:')).toBeGreaterThan(idx('margin-block-start:'))
    })

    it('rounded: the physical corner wins over the logical corner, which wins over the shorthand', () => {
        const styles = roundedApi({
            rounded: 'lg',
            roundedStartStart: '7px',
            roundedTopLeft: '0px'
        }).roundedStyles.value

        const idx = (needle: string) => styles.findIndex(s => s.startsWith(needle))

        expect(idx('border-radius:')).toBe(0)
        expect(idx('border-start-start-radius:')).toBeGreaterThan(idx('border-radius:'))
        expect(idx('border-top-left-radius:')).toBeGreaterThan(idx('border-start-start-radius:'))
    })

    it('a logical side leaves the opposite edge of its axis alone', () => {
        const styles = paddingApi({paddingInlineStart: '8px'}).paddingStyles.value

        expect(styles).toContain('padding-inline-start: 8px')
        expect(styles.some(s => s.startsWith('padding-inline-end:'))).toBe(false)
        expect(styles.some(s => s.startsWith('padding-left:'))).toBe(false)
    })

    it('directionals still apply when the shorthand took the utility-class path', () => {
        // Regression guard: `padding="4"` used to `return` early with an
        // empty style array. If that early return came back, the
        // directional below would vanish.
        const api = paddingApi({ padding: '4', paddingLeft: '30px' })

        expect(api.paddingClasses.value).toContain('origam--p-4')
        expect(api.paddingStyles.value).toContain('padding-left: 30px')
    })
})

// ───────────────────────────────────────────────────────────────────────
// 3. Documented non-emitting inputs. These assert the ABSENCE of a
//    declaration, which is the documented contract — not an oversight.
// ───────────────────────────────────────────────────────────────────────

describe('documented no-ops', () => {
    it('boolean true on a directional emits nothing (no per-side default token exists)', () => {
        expect(paddingApi({ paddingTop: true }).paddingStyles.value).toEqual([])
        expect(marginApi({ marginTop: true }).marginStyles.value).toEqual([])
        expect(roundedApi({ roundedTopLeft: true }).roundedStyles.value).toEqual([])
    })

    it('a bare integer outside the spacing ladder emits nothing', () => {
        // '7' is not a rung; `var(--origam-space---7)` would be dropped by
        // the browser anyway. Matches what `padding="7"` already did.
        expect(paddingApi({ paddingTop: '7' }).paddingStyles.value).toEqual([])
    })

    // ── Escape-hatch passthrough, issue #1013 ────────────────────────
    // `resolveSpacingValue` returns the trimmed value VERBATIM as its
    // fallthrough (spacing.util.ts), which is what lets a whole `calc()`
    // or `var()` expression reach the declaration. #1015 converts
    // `OrigamBlockquote`, whose accent rule is a `padding-inline-start`
    // in `calc()`, so that passthrough is load-bearing for the next lot
    // and not merely a nice property — pinned here rather than assumed.
    it('a logical-side padding prop passes calc() / var() through verbatim', () => {
        const calc = 'calc(var(--origam-space---4) + 2px)'

        expect(paddingApi({paddingInlineStart: calc}).paddingStyles.value)
            .toContain(`padding-inline-start: ${calc}`)

        expect(paddingApi({paddingBlockEnd: 'var(--origam-space---6)'}).paddingStyles.value)
            .toContain('padding-block-end: var(--origam-space---6)')
    })

    it('a logical-side margin prop passes calc() and the auto keyword through', () => {
        expect(marginApi({marginInlineStart: 'auto'}).marginStyles.value)
            .toContain('margin-inline-start: auto')

        expect(marginApi({marginInlineEnd: 'calc(100% - 4rem)'}).marginStyles.value)
            .toContain('margin-inline-end: calc(100% - 4rem)')
    })

    it('⚠️ a logical CORNER does NOT share that verbatim fallthrough', () => {
        // Asymmetry worth pinning because it is surprising and it bit the
        // reading of this lot: `resolveRoundedCornerValue` gates on
        // `CUSTOM_BORDER_RADIUS_REGEX` instead of falling through, so
        // var()/calc() pass but an unrecognised expression is DROPPED —
        // where the same string on a padding prop would be emitted.
        expect(roundedApi({roundedStartStart: 'calc(4px + 2px)'}).roundedStyles.value)
            .toContain('border-start-start-radius: calc(4px + 2px)')

        // Not a radius the regex can describe, and not a var()/calc():
        // nothing is emitted, by design.
        expect(roundedApi({roundedStartStart: 'fit-content'}).roundedStyles.value).toEqual([])
    })

    it('shaped / shaped-invert stay owned by component SCSS', () => {
        expect(roundedApi({ roundedTopLeft: 'shaped' }).roundedStyles.value).toEqual([])
    })

    it('unset props emit nothing at all', () => {
        expect(paddingApi({}).paddingStyles.value).toEqual([])
        expect(marginApi({}).marginStyles.value).toEqual([])
        expect(roundedApi({}).roundedStyles.value).toEqual([])
    })
})

// ───────────────────────────────────────────────────────────────────────
// 4. Reactivity — a directional must survive a runtime value swap, since
//    that is what a Histoire control / Theme Builder edit actually does.
// ───────────────────────────────────────────────────────────────────────

describe('reactivity', () => {
    it('padding directional recomputes when the prop changes', () => {
        const props = reactive<IPaddingProps>({ paddingLeft: '8px' })
        const api = host(usePadding, props)

        expect(api().paddingStyles.value).toContain('padding-left: 8px')

        props.paddingLeft = '40px'
        expect(api().paddingStyles.value).toContain('padding-left: 40px')
        expect(api().paddingStyles.value).not.toContain('padding-left: 8px')
    })

    it('rounded corner recomputes when the prop changes', () => {
        const props = reactive<IRoundedProps>({ roundedBottomRight: '2px' })
        const api = host(useRounded, props)

        expect(api().roundedStyles.value).toContain('border-bottom-right-radius: 2px')

        props.roundedBottomRight = '16px'
        expect(api().roundedStyles.value).toContain('border-bottom-right-radius: 16px')
    })
})

// ───────────────────────────────────────────────────────────────────────
// 5. `useRounded`'s Ref overload must keep working unchanged — it is the
//    signature ~every component and `useStateEffect` used before this fix.
// ───────────────────────────────────────────────────────────────────────

describe('useRounded Ref overload (back-compat)', () => {
    it('still resolves the shorthand and emits no corner declarations', () => {
        const { ref } = require('vue') as typeof import('vue')
        const r = ref<string>('md')

        let api!: ReturnType<typeof useRounded>
        mount(defineComponent({
            name: 'OrigamRoundedRefHost',
            setup () {
                api = useRounded(r)
                return () => h('div')
            }
        }))

        expect(api.roundedStyles.value).toContain('border-radius: var(--origam-radius---md, 8px)')
        expect(api.roundedStyles.value.some(s => /border-top-left-radius/.test(s))).toBe(false)
    })
})
