// Tests for `useDefaults` / `provideDefaults` / `createDefaults`.
//
// Key constraint: `useDefaults` determines whether a prop was "explicitly
// passed" by checking `vm.vnode.props`. When @vue/test-utils passes props via
// `mount(Host, { props: { color: 'warning' } })` they land in vnode.props and
// are always treated as "passed" — the provider is skipped. Scenarios that
// verify provider resolution therefore mount a subtree where the child
// component does NOT receive the prop from its parent template at all.
//
// Prop passed to parent template   → vnode.props has it → own value wins.
// Prop NOT passed by parent        → vnode.props lacks it → provider lookup.

import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useDefaults, provideDefaults, createDefaults } from '@origam/composables/Commons/defaults.composable'

// ---------------------------------------------------------------------------
// createDefaults
// ---------------------------------------------------------------------------

describe('createDefaults', () => {
    it('returns a Ref wrapping the provided object', () => {
        const d = createDefaults({ global: { color: 'primary' } })
        expect(d.value).toEqual({ global: { color: 'primary' } })
    })

    it('returns a Ref wrapping an empty object when called with no args', () => {
        const d = createDefaults()
        expect(d.value).toEqual({})
    })
})

// ---------------------------------------------------------------------------
// useDefaults — empty props (early-return path)
// ---------------------------------------------------------------------------

describe('useDefaults — empty props', () => {
    it('returns the original props object when props has no keys', () => {
        // Must run inside a component setup.
        let result: any

        const Host = defineComponent({
            name: 'OrigamEmptyPropsHost',
            setup () {
                result = useDefaults({})
                return () => h('div')
            }
        })
        mount(Host)

        // The early-return path returns the original ref, not a Proxy.
        expect(result).toStrictEqual({})
    })
})

// ---------------------------------------------------------------------------
// useDefaults — Proxy transparency
// ---------------------------------------------------------------------------

describe('useDefaults — Proxy transparency', () => {
    it('Object.keys() includes all declared prop names', () => {
        let resolvedKeys: string[] = []

        // Child receives NO props from parent template — provider lookup active.
        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['color', 'variant', 'size'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedKeys = Object.keys(resolved)
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentKeys',
            setup () {
                provideDefaults({ 'origam-btn': { color: 'primary' } })
                // Child rendered WITHOUT explicit props so vnode.props is empty
                return () => h(Child)
            }
        })

        mount(Parent)
        expect(resolvedKeys).toContain('color')
        expect(resolvedKeys).toContain('variant')
        expect(resolvedKeys).toContain('size')
    })

    it('"in" operator works on proxy for declared prop names', () => {
        let resolved: any = {}

        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['color', 'variant'],
            setup (props) {
                resolved = useDefaults(props, 'origam-btn')
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentIn',
            setup () {
                provideDefaults({})
                return () => h(Child)
            }
        })

        mount(Parent)
        expect('color' in resolved).toBe(true)
        expect('variant' in resolved).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// useDefaults — global default resolution
// (child rendered without the prop → provider lookup fires)
// ---------------------------------------------------------------------------

describe('useDefaults — global default resolution', () => {
    it('global default used when prop is not explicitly passed by the parent', () => {
        let resolvedColor: unknown

        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['color'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                // Read after setup so the computed has run.
                resolvedColor = resolved.color
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentGlobal',
            setup () {
                provideDefaults({ global: { color: 'primary' } })
                // Pass color as undefined explicitly — in vue test-utils this
                // means vnode.props will contain "color: undefined".
                // The composable checks wasPropPassed via vnode.props iteration,
                // but the value is still undefined so it falls through.
                // → Actually we just don't pass it at all.
                return () => h(Child)
            }
        })

        mount(Parent)
        expect(resolvedColor).toBe('primary')
    })

    // ADR-005 pilot addendum — discovered while visually verifying the Kbd
    // preset tier. `<OrigamKbd :bg-color="state.bgColor">` (the standard
    // story/consumer pattern) puts `bgColor` in `vnode.props` EVEN WHILE
    // `state.bgColor` is `undefined` — Vue does not omit a dynamically
    // bound key just because its current value is undefined. Before the
    // `wasPropPassed` fix, this froze resolution at tier 1 and skipped the
    // theme default entirely; a plain `!== undefined` check on the OWN
    // value doesn't help because `usePassedProps`'s whole existence is to
    // avoid exactly that kind of check (see the boolean-coercion case in
    // the module doc) — the fix had to happen inside `wasPropPassed` itself.
    it('a prop explicitly bound to an undefined ref (h(Child, { color: undefined })) still falls through to the theme default', () => {
        let resolvedColor: unknown

        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['color'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedColor = resolved.color
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentVBindUndefined',
            setup () {
                provideDefaults({ 'origam-btn': { color: 'primary' } })
                // Mirrors `:color="state.color"` where `state.color` is
                // `undefined` — the key IS in vnode.props, its value is not.
                return () => h(Child, { color: undefined })
            }
        })

        mount(Parent)
        expect(resolvedColor).toBe('primary')
    })

    it('an explicitly passed NON-undefined value still wins over the theme default (regression guard)', () => {
        let resolvedColor: unknown

        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['color'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedColor = resolved.color
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentVBindDefined',
            setup () {
                provideDefaults({ 'origam-btn': { color: 'primary' } })
                return () => h(Child, { color: 'danger' })
            }
        })

        mount(Parent)
        expect(resolvedColor).toBe('danger')
    })

    it('component-specific default takes priority over global default', () => {
        let resolvedColor: unknown

        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['color'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedColor = resolved.color
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentComponentSpecific',
            setup () {
                provideDefaults({
                    global: { color: 'primary' },
                    'origam-btn': { color: 'danger' }
                })
                return () => h(Child)
            }
        })

        mount(Parent)
        expect(resolvedColor).toBe('danger')
    })
})

// ---------------------------------------------------------------------------
// provideDefaults — disabled option
// ---------------------------------------------------------------------------

describe('provideDefaults — disabled option', () => {
    it('disabled=true passes through parent defaults (child still sees root global)', () => {
        let resolvedColor: unknown

        const GrandChild = defineComponent({
            name: 'OrigamBtn',
            props: ['color'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedColor = resolved.color
                return () => h('div')
            }
        })

        const Middle = defineComponent({
            name: 'OrigamMiddle',
            setup () {
                // disabled=true → does NOT inject new defaults; parent's map passes through
                provideDefaults({ 'origam-btn': { color: 'danger' } }, { disabled: true })
                return () => h(GrandChild)
            }
        })

        const Root = defineComponent({
            name: 'OrigamRoot',
            setup () {
                provideDefaults({ global: { color: 'primary' } })
                return () => h(Middle)
            }
        })

        mount(Root)
        // Middle's disabled provider doesn't override; GrandChild gets root global 'primary'
        expect(resolvedColor).toBe('primary')
    })
})

// ---------------------------------------------------------------------------
// provideDefaults — scoped option
// ---------------------------------------------------------------------------

describe('provideDefaults — scoped option', () => {
    it('scoped=true resets the defaults to only own — parent global is not visible', () => {
        let resolvedVariant: unknown
        let resolvedColor: unknown

        const GrandChild = defineComponent({
            name: 'OrigamBtn',
            props: ['color', 'variant'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedColor = resolved.color
                resolvedVariant = resolved.variant
                return () => h('div')
            }
        })

        const Middle = defineComponent({
            name: 'OrigamMiddle',
            setup () {
                // scoped=true → only Middle's own defaults are visible below
                provideDefaults({ 'origam-btn': { color: 'danger' } }, { scoped: true })
                return () => h(GrandChild)
            }
        })

        const Root = defineComponent({
            name: 'OrigamRoot',
            setup () {
                provideDefaults({ global: { variant: 'outlined' } })
                return () => h(Middle)
            }
        })

        mount(Root)
        expect(resolvedColor).toBe('danger')
        // scoped=true → parent global variant is NOT visible under Middle
        expect(resolvedVariant).toBeUndefined()
    })
})

// ---------------------------------------------------------------------------
// provideDefaults — deep merge (default behaviour)
// ---------------------------------------------------------------------------

describe('provideDefaults — deep merge', () => {
    it('child provider merges with parent provider — both keys visible', () => {
        let resolvedColor: unknown
        let resolvedVariant: unknown

        const GrandChild = defineComponent({
            name: 'OrigamBtn',
            props: ['color', 'variant'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn')
                resolvedColor = resolved.color
                resolvedVariant = resolved.variant
                return () => h('div')
            }
        })

        const Middle = defineComponent({
            name: 'OrigamMiddle',
            setup () {
                // Adds variant; deep-merges with parent's color
                provideDefaults({ 'origam-btn': { variant: 'tonal' } })
                return () => h(GrandChild)
            }
        })

        const Root = defineComponent({
            name: 'OrigamRoot',
            setup () {
                provideDefaults({ 'origam-btn': { color: 'primary' } })
                return () => h(Middle)
            }
        })

        mount(Root)
        expect(resolvedColor).toBe('primary')
        expect(resolvedVariant).toBe('tonal')
    })
})

// ---------------------------------------------------------------------------
// useDefaults — variant preset tier (ADR-005)
//
// Resolution order under test, strongest first:
//   1. call-site prop   2. theme default (component/global)
//   3. variant preset   4. withDefaults() fallback
//
// A minimal preset table stands in for a real component's
// `{COMPONENT}_VARIANT_PRESETS` const — the mechanism doesn't care about the
// shape beyond "variant value → partial prop bag".
// ---------------------------------------------------------------------------

const TEST_VARIANT_PRESETS = {
    outlined: { bgColor: 'preset-bg', border: 'preset-border' },
    tonal: { bgColor: 'preset-tonal-bg' }
}

describe('useDefaults — variant preset tier', () => {
    it('preset value applies when the prop is not passed and no theme default exists', () => {
        let resolvedBgColor: unknown

        const Child = defineComponent({
            name: 'OrigamKbd',
            props: ['variant', 'bgColor', 'border'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-kbd', TEST_VARIANT_PRESETS)
                resolvedBgColor = resolved.bgColor
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentPresetApplies',
            setup () {
                provideDefaults({})
                // `variant` IS passed explicitly (tier 1) — `bgColor` is not.
                return () => h(Child, { variant: 'outlined' })
            }
        })

        mount(Parent)
        expect(resolvedBgColor).toBe('preset-bg')
    })

    it('an explicit call-site prop beats the preset — the ADR-005 headline case', () => {
        // <origam-kbd variant="outlined" bg-color="primary"> must paint primary.
        let resolvedBgColor: unknown

        const Child = defineComponent({
            name: 'OrigamKbd',
            props: ['variant', 'bgColor', 'border'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-kbd', TEST_VARIANT_PRESETS)
                resolvedBgColor = resolved.bgColor
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentPresetLoses',
            setup () {
                provideDefaults({})
                // Both `variant` AND `bgColor` are passed explicitly.
                return () => h(Child, { variant: 'outlined', bgColor: 'primary' })
            }
        })

        mount(Parent)
        expect(resolvedBgColor).toBe('primary')
    })

    it('a theme default on a DIFFERENT prop than variant beats the preset (Q2)', () => {
        // Theme sets `origam-kbd: { bgColor: 'primary' }` (no `variant` entry).
        // Consumer writes `<origam-kbd variant="outlined">` — the preset must
        // NOT override the theme's bgColor default.
        let resolvedBgColor: unknown

        const Child = defineComponent({
            name: 'OrigamKbd',
            props: ['variant', 'bgColor', 'border'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-kbd', TEST_VARIANT_PRESETS)
                resolvedBgColor = resolved.bgColor
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentThemeBeatsPreset',
            setup () {
                provideDefaults({ 'origam-kbd': { bgColor: 'primary' } })
                return () => h(Child, { variant: 'outlined' })
            }
        })

        mount(Parent)
        expect(resolvedBgColor).toBe('primary')
    })

    it('preset is inert for a variant value with no matching entry', () => {
        let resolvedBgColor: unknown

        const Child = defineComponent({
            name: 'OrigamKbd',
            props: ['variant', 'bgColor'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-kbd', TEST_VARIANT_PRESETS)
                resolvedBgColor = resolved.bgColor
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentUnknownVariant',
            setup () {
                provideDefaults({})
                return () => h(Child, { variant: 'not-in-the-table' })
            }
        })

        mount(Parent)
        expect(resolvedBgColor).toBeUndefined()
    })

    it('a theme-authored `variants` override (D4) wins over the DS-shipped preset', () => {
        let resolvedBgColor: unknown

        const Child = defineComponent({
            name: 'OrigamKbd',
            props: ['variant', 'bgColor'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-kbd', TEST_VARIANT_PRESETS)
                resolvedBgColor = resolved.bgColor
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentThemeVariantOverride',
            setup () {
                provideDefaults({
                    variants: { 'origam-kbd': { outlined: { bgColor: 'brand-override-bg' } } }
                })
                return () => h(Child, { variant: 'outlined' })
            }
        })

        mount(Parent)
        expect(resolvedBgColor).toBe('brand-override-bg')
    })

    // ── ADR-005 Q2 + Q3, "the sharpest edge" ──────────────────────────────
    //
    // Q3 lets a preset carry a `hover` / `active` STATE object, which the
    // component renders as an INLINE style (no utility class exists for a
    // state in progress — CLAUDE.md § Classes-first, rule 4). Q2 makes the
    // preset the WEAKEST tier. The concern: does an inline style produced
    // BY a preset ever survive alongside / beat a value the consumer wrote
    // explicitly?
    //
    // It cannot, structurally: `useDefaults` resolves ONE winning value PER
    // PROP before any composable (useColor, useBorder, useStateEffect, …)
    // ever reads it — there is no second declaration for the preset's value
    // to "outrank". This test proves it directly on a state-shaped prop
    // (`active`, the exact shape `IStateEffectConfig` uses), standing in for
    // Kbd (which has no interactive state of its own — a static key label
    // has no hover/active surface to test on; the model is verified at the
    // infrastructure level it will actually run through for Btn/Field).
    it('a preset-sourced STATE value never survives an explicit consumer declaration', () => {
        const STATE_VARIANT_PRESETS = {
            outlined: { active: { bgColor: 'preset-active-bg' } }
        }

        let resolvedActive: unknown

        const Child = defineComponent({
            name: 'OrigamBtn',
            props: ['variant', 'active'],
            setup (props) {
                const resolved = useDefaults(props, 'origam-btn', STATE_VARIANT_PRESETS)
                resolvedActive = resolved.active
                return () => h('div')
            }
        })

        const Parent = defineComponent({
            name: 'OrigamParentStateEdge',
            setup () {
                provideDefaults({})
                // Consumer explicitly sets `active` — preset's `active` must
                // not leak through, in whole OR in part.
                return () => h(Child, { variant: 'outlined', active: { bgColor: 'consumer-active-bg' } })
            }
        })

        mount(Parent)
        expect(resolvedActive).toEqual({ bgColor: 'consumer-active-bg' })
    })
})
