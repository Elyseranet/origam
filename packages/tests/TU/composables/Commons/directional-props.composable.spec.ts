// Runtime proof for the 16 previously-INERT directional props.
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
