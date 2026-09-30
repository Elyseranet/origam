// ADR-005 lot 1 — `variant` as a props PRESET, not a CSS layer.
//
// The ADR's own words (D1): "This is the whole definition of a variant. No
// SCSS accompanies it." The class `{name}--variant-{value}` keeps being
// emitted by `useVariant()`, but the DS attaches no rule to it — it belongs
// to the CONSUMER as an override hook. The `no-variant-css` guard holds that
// half of the contract; these specs hold the other half: that a preset
// actually RESOLVES, and resolves at the right rank.
//
// PRECEDENCE — arbitrated by the maintainer on 2026-08-12 (Q2), which
// INVERTED the ordering D2 originally proposed. Strongest first:
//
//     1. prop written at the call site
//     2. theme default (`components` / a provider)
//     3. variant preset            ← the weakest of the three
//     4. the component's own `withDefaults`
//
// Verbatim reasoning: a variant sets `bgColor` — "rien n'oblige
// l'utilisateur a garder le bgColor en ghost, il peut le transformer en
// primary". A variant is a CONVENIENCE DEFAULT, not an identity the DS
// defends. Whatever the DS must guarantee belongs in a token or a prop.
//
// These specs drive `installThemePropsResolver` directly against small
// stand-in components, exactly as `theme-props-resolver.spec.ts` does — the
// mechanism is generic over the whole catalogue, so a stand-in exercises it
// more honestly than a real component (whose own SCSS would confound the
// reading).

import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import {
    installThemePropsResolver,
    resolveVariantPresetRegistry
} from '@origam/composables/Commons/theme-props-resolver.composable'
import type { IOrigamTheme } from '@origam/interfaces'
import type { TVariantPresetRegistry } from '@origam/types'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

// A stand-in in the same family as the 178/217 the resolver exists for: it
// calls no `useDefaults()`, knows nothing about presets, and simply reads its
// props. `bgColor` / `elevation` mirror the two channels a real `outlined`
// preset drives; `withDefaults`' role is played by the `default` options.
const PresetCard = defineComponent({
    name: 'PresetCard',
    props: {
        variant: { type: String, default: 'flat' },
        bgColor: { type: String, default: 'FROM_WITH_DEFAULTS' },
        elevation: { type: String, default: 'FROM_WITH_DEFAULTS' }
    },
    setup (props) {
        return () => h('span', {
            'data-bg': props.bgColor,
            'data-elevation': props.elevation,
            'data-variant': props.variant
        })
    }
})

// The DS-shipped table shape, per D1. Deliberately written the way lot 4 will
// write Btn's: the preset carries the SAME `var(--origam-…, fallback)` string
// the SCSS rule carried, never a re-expression in semantic rungs — see the
// measurement recorded on `TVariantPresets`.
const CARD_PRESETS: TVariantPresetRegistry = {
    'preset-card': {
        outlined: {
            bgColor: 'var(--origam-card---background-color-outlined, transparent)',
            elevation: '0'
        },
        elevated: {
            elevation: 'var(--origam-card---box-shadow-elevated, var(--origam-shadow---md))'
        }
    }
}

function mountWith (presets: TVariantPresetRegistry, props: Record<string, unknown> = {}) {
    return mount(PresetCard, {
        props,
        global: {
            plugins: [{
                install (app) {
                    installThemePropsResolver(app, new Map(), presets)
                }
            }]
        }
    })
}

describe('resolveVariantPresetRegistry — D4 collapse of DS table + theme.variants', () => {
    it('returns the shipped table untouched when no theme declares variants', () => {
        expect(resolveVariantPresetRegistry(CARD_PRESETS, [])).toEqual(CARD_PRESETS)
    })

    it('lets a theme override ONE prop of ONE variant, keeping its siblings', () => {
        const merged = resolveVariantPresetRegistry(CARD_PRESETS, [
            { 'preset-card': { outlined: { elevation: 'BRAND' } } }
        ])

        // the brand's value wins on `elevation` …
        expect(merged['preset-card'].outlined.elevation).toBe('BRAND')
        // … and the DS's `bgColor` for the same variant survives (mergeDeep,
        // the same semantics `provideDefaults` already has)
        expect(merged['preset-card'].outlined.bgColor)
            .toBe('var(--origam-card---background-color-outlined, transparent)')
        // … and an untouched sibling variant is intact
        expect(merged['preset-card'].elevated.elevation)
            .toBe('var(--origam-card---box-shadow-elevated, var(--origam-shadow---md))')
    })

    it('lets a theme introduce a variant the DS never shipped (consumer-authored variants)', () => {
        const merged = resolveVariantPresetRegistry(CARD_PRESETS, [
            { 'preset-card': { 'brand-hero': { bgColor: 'HERO' } } }
        ])

        expect(merged['preset-card']['brand-hero']).toEqual({ bgColor: 'HERO' })
    })

    it('applies several themes in order, the last one winning', () => {
        const merged = resolveVariantPresetRegistry(CARD_PRESETS, [
            { 'preset-card': { outlined: { elevation: 'FIRST' } } },
            { 'preset-card': { outlined: { elevation: 'SECOND' } } }
        ])

        expect(merged['preset-card'].outlined.elevation).toBe('SECOND')
    })

    it('does not mutate the shipped table', () => {
        const before = JSON.stringify(CARD_PRESETS)
        resolveVariantPresetRegistry(CARD_PRESETS, [{ 'preset-card': { outlined: { elevation: 'X' } } }])
        expect(JSON.stringify(CARD_PRESETS)).toBe(before)
    })
})

// ⛔ THE SPEC THAT WOULD HAVE CAUGHT THE SILENT NO-OP.
//
// `collectTargetKeys` used to early-out — returning `null`, patching nothing —
// whenever neither a theme nor an ancestor provider named a key. Since #360 a
// bare `createOrigam()` installs NO theme at all, so `themedKeysUnion` is
// empty and the injected defaults map is `{}`: every condition was false and
// the preset was unreachable. Nothing warned; the variant simply did nothing.
//
// D1 requires the opposite in as many words: "the DS must ship a working
// definition of `outlined` with no theme installed". This is the only point
// where the ADR was silent, and it is the shape of failure the whole lot
// risked shipping.
describe('variant preset — applies with NO theme registered at all (ADR-005 D1)', () => {
    it('resolves a preset prop when the union is empty and no provider exists', () => {
        const wrapper = mountWith(CARD_PRESETS, { variant: 'outlined' })

        expect(wrapper.attributes('data-bg'))
            .toBe('var(--origam-card---background-color-outlined, transparent)')
        expect(wrapper.attributes('data-elevation')).toBe('0')
    })

    it('leaves a prop the active variant does not name on its withDefaults value', () => {
        const wrapper = mountWith(CARD_PRESETS, { variant: 'elevated' })

        // `elevated` names only `elevation`, so `bgColor` must fall through
        expect(wrapper.attributes('data-bg')).toBe('FROM_WITH_DEFAULTS')
        expect(wrapper.attributes('data-elevation'))
            .toBe('var(--origam-card---box-shadow-elevated, var(--origam-shadow---md))')
    })

    it('resolves nothing for a variant value absent from the table', () => {
        const wrapper = mountWith(CARD_PRESETS, { variant: 'does-not-exist' })

        expect(wrapper.attributes('data-bg')).toBe('FROM_WITH_DEFAULTS')
        expect(wrapper.attributes('data-elevation')).toBe('FROM_WITH_DEFAULTS')
    })

    it('resolves the preset of the withDefaults variant when none is passed', () => {
        // `variant` defaults to 'flat', which the table does not name — proving
        // the preset lookup reads the RESOLVED variant, not only a passed one.
        const wrapper = mountWith({
            'preset-card': { flat: { elevation: 'FLAT_PRESET' } }
        })

        expect(wrapper.attributes('data-elevation')).toBe('FLAT_PRESET')
    })

    it('patches nothing at all for a component with no preset table and no theme', () => {
        const wrapper = mountWith({ 'other-card': { outlined: { bgColor: 'X' } } }, { variant: 'outlined' })

        expect(wrapper.attributes('data-bg')).toBe('FROM_WITH_DEFAULTS')
    })
})

describe('variant preset — PRECEDENCE (arbitrage Q2: preset is the weakest but one)', () => {
    it('a prop at the CALL SITE beats the preset — the original bug, fixed', () => {
        // Pre-ADR this was unreachable: `&--variant-outlined { background-color:
        // transparent !important }` outranked the inline declaration `bgColor`
        // emits. Measured in Chromium: `!important` is the ONLY thing that beat
        // inline — the utility class already lost to the scoped rule on
        // specificity alone (0,2,0) vs (0,1,0).
        const wrapper = mountWith(CARD_PRESETS, { variant: 'outlined', bgColor: 'primary' })

        expect(wrapper.attributes('data-bg')).toBe('primary')
        // the preset still supplies the prop the call site did NOT set
        expect(wrapper.attributes('data-elevation')).toBe('0')
    })

    it('a THEME default beats the preset', () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'preset-card': { bgColor: 'FROM_THEME' } },
            variants: { 'preset-card': { outlined: { bgColor: 'FROM_PRESET' } } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(PresetCard, {
            props: { variant: 'outlined' },
            global: { plugins: [origam] }
        })

        expect(wrapper.attributes('data-bg')).toBe('FROM_THEME')
    })

    it('the preset beats withDefaults', () => {
        const wrapper = mountWith(CARD_PRESETS, { variant: 'outlined' })

        expect(wrapper.attributes('data-bg')).not.toBe('FROM_WITH_DEFAULTS')
    })

    it('the full chain resolves in one mount: call site > theme > preset > withDefaults', () => {
        const theme: IOrigamTheme = {
            name: 'brandy',
            components: { 'preset-card': { elevation: 'FROM_THEME' } },
            variants: { 'preset-card': { outlined: { bgColor: 'FROM_PRESET', elevation: 'PRESET_LOSES' } } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandy', undefined)

        const wrapper = mount(PresetCard, {
            props: { variant: 'outlined', variantProbe: undefined },
            global: { plugins: [origam] }
        })

        // theme wins over the preset on `elevation`
        expect(wrapper.attributes('data-elevation')).toBe('FROM_THEME')
        // preset wins over withDefaults on `bgColor` (no theme entry for it)
        expect(wrapper.attributes('data-bg')).toBe('FROM_PRESET')
    })

    it('a theme-declared variant preset reaches a component with no DS table', () => {
        // The "consumer-authored variants" follow-up needs no new machinery:
        // a user variant is just an entry in the theme, resolved by the code
        // that already resolves the theme.
        const theme: IOrigamTheme = {
            name: 'brandz',
            variants: { 'preset-card': { outlined: { bgColor: 'THEME_ONLY_PRESET' } } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandz', undefined)

        const wrapper = mount(PresetCard, {
            props: { variant: 'outlined' },
            global: { plugins: [origam] }
        })

        expect(wrapper.attributes('data-bg')).toBe('THEME_ONLY_PRESET')
    })
})

// ⛔ THE SPEC FOR THE KEY-UNION ARGUMENT.
//
// `collectTargetKeys` unions the prop keys of EVERY variant in the table, not
// those of the variant active at mount — the same argument
// `themedPropKeysUnion` makes for registered themes. `beforeCreate` runs once
// per instance and never again, so a key named ONLY by the variant switched
// TO would never have been intercepted: its slot would stay unpatched and the
// prop would sit frozen on its `withDefaults` value for the instance's life.
describe('variant preset — a RUNTIME variant switch re-resolves (the key union)', () => {
    it('picks up a key that only the destination variant names', async () => {
        // `from` names elevation only; `to` names bgColor only. If the union
        // were computed from the ACTIVE variant, `bgColor` would never be
        // patched and would stay at its withDefaults value after the switch.
        const presets: TVariantPresetRegistry = {
            'preset-card': {
                from: { elevation: 'FROM_ELEVATION' },
                to: { bgColor: 'TO_BG' }
            }
        }

        const variant = ref('from')
        const Host = defineComponent({
            setup () {
                return () => h(PresetCard, { variant: variant.value })
            }
        })

        const wrapper = mount(Host, {
            global: {
                plugins: [{
                    install (app) {
                        installThemePropsResolver(app, new Map(), presets)
                    }
                }]
            }
        })

        const card = wrapper.find('span')
        expect(card.attributes('data-elevation')).toBe('FROM_ELEVATION')
        expect(card.attributes('data-bg')).toBe('FROM_WITH_DEFAULTS')

        variant.value = 'to'
        await nextTick()

        expect(wrapper.find('span').attributes('data-bg')).toBe('TO_BG')
        // and the key the new variant does NOT name falls back again
        expect(wrapper.find('span').attributes('data-elevation')).toBe('FROM_WITH_DEFAULTS')
    })

    it('keeps a call-site prop winning across the switch', async () => {
        const presets: TVariantPresetRegistry = {
            'preset-card': {
                from: { bgColor: 'FROM_BG' },
                to: { bgColor: 'TO_BG' }
            }
        }

        const variant = ref('from')
        const Host = defineComponent({
            setup () {
                return () => h(PresetCard, { variant: variant.value, bgColor: 'CALL_SITE' })
            }
        })

        const wrapper = mount(Host, {
            global: {
                plugins: [{
                    install (app) {
                        installThemePropsResolver(app, new Map(), presets)
                    }
                }]
            }
        })

        expect(wrapper.find('span').attributes('data-bg')).toBe('CALL_SITE')

        variant.value = 'to'
        await nextTick()

        expect(wrapper.find('span').attributes('data-bg')).toBe('CALL_SITE')
    })
})

// The `variant` prop itself must never be resolved FROM a preset: the getter
// reads `props.variant` to know which entry to consult, so patching that same
// key on the preset channel would recurse without bound. `VARIANT_PROP_KEY`
// documents the guard; this pins it.
describe('variant preset — no unbounded recursion on the `variant` key itself', () => {
    it('survives a pathological table that names `variant`', () => {
        const presets: TVariantPresetRegistry = {
            'preset-card': {
                outlined: { variant: 'outlined', bgColor: 'STILL_RESOLVES' }
            }
        }

        expect(() => mountWith(presets, { variant: 'outlined' })).not.toThrow()

        const wrapper = mountWith(presets, { variant: 'outlined' })
        expect(wrapper.attributes('data-variant')).toBe('outlined')
        expect(wrapper.attributes('data-bg')).toBe('STILL_RESOLVES')
    })
})

describe('variant preset — one mixin only', () => {
    it('a single install leaves the theme tier and the preset tier BOTH reachable', () => {
        // Two `Object.defineProperty` calls on the same key replace one
        // another silently: the second accessor wins and the rank the first
        // carried disappears with no error. This is why the preset channel
        // lives inside the existing getter rather than in a second mixin.
        const mixins: Array<unknown> = []
        const spy = { mixin (m: unknown) { mixins.push(m); return spy } }

        installThemePropsResolver(spy as never, new Map(), CARD_PRESETS)

        expect(mixins).toHaveLength(1)
    })
})
