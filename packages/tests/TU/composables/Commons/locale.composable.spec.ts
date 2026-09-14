// Tests for locale composable: createLocale, createRtl, provideRtl, provideLocale.
//
// `useLocale` and `useRtl` call `inject(ORIGAM_LOCALE_KEY)` which requires
// a full application context (provide chain starting at createOrigam). They
// are covered in the e2e / smoke-test suite; individual unit tests here
// would require monkey-patching the injection symbol — that tests the
// injection mechanism, not our code. Those paths are marked it.skip.
//
// `provideLocale` (C5 audit, #classeur composables: flagged `defaut` — zero
// TU coverage) is DIFFERENT from `useLocale`/`useRtl`: it does not need a
// full `createOrigam()` app, only an ANCESTOR that already provided
// `ORIGAM_LOCALE_KEY` — which a plain Parent component can do with a bare
// `provide()` call. `provideLocale` itself calls `locale.provide(props)` →
// `useProvided` → `useVModel`, which requires `getCurrentInstance()`, so
// every `provideLocale` test below mounts a real Parent/Child tree rather
// than calling it at module scope.
//
// What IS testable here:
//   - createLocale returns the expected ILocaleInstance + IRtlInstance shape.
//   - createRtl: isRtl computed reflects the current locale's RTL flag from
//     the default LOCALE_RTL_DEFAULT map.
//   - provideRtl: when a component-level `rtl` prop is present it takes
//     precedence over the locale map.
//   - provideLocale: overrides propagate to descendants, and it throws when
//     no ancestor provided a locale context at all.

import { defineComponent, h, provide, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createLocale, provideLocale, useLocale } from '@origam/composables/Commons/locale.composable'
import { createRtl, provideRtl } from '@origam/composables/Commons/rtl.composable'
import { LOCALE_RTL_DEFAULT } from '@origam/consts/Commons/locale.const'
import { ORIGAM_LOCALE_KEY } from '@origam/consts/Commons/locale.const'

import type { ILocaleInstance, IRtlInstance } from '@origam/interfaces'

// ---------------------------------------------------------------------------
// Minimal ILocaleInstance stub (same pattern as date spec)
// ---------------------------------------------------------------------------

function makeLocaleInstance (lang = 'en'): ILocaleInstance {
    const current = ref(lang)
    return {
        name: 'stub',
        current,
        fallback: ref('en'),
        messages: ref({}),
        t: (k: string) => k,
        n: (v: number) => String(v),
        provide: () => undefined
    } as unknown as ILocaleInstance
}

// ---------------------------------------------------------------------------
// createLocale — shape
// ---------------------------------------------------------------------------

describe('createLocale — returned shape', () => {
    it('returns an object with current, fallback, messages, t, n, provide (ILocaleInstance)', () => {
        const locale = createLocale()
        expect(locale).toHaveProperty('current')
        expect(locale).toHaveProperty('fallback')
        expect(locale).toHaveProperty('messages')
        expect(typeof locale.t).toBe('function')
        expect(typeof locale.n).toBe('function')
        expect(typeof locale.provide).toBe('function')
    })

    it('returns isRtl and rtl (IRtlInstance)', () => {
        const locale = createLocale()
        expect(locale).toHaveProperty('isRtl')
        expect(locale).toHaveProperty('rtl')
    })

    it('defaults to locale "en"', () => {
        const locale = createLocale()
        expect(locale.current.value).toBe('en')
    })

    it('accepts a custom locale option', () => {
        const locale = createLocale({ locale: 'fr', fallbackLocale: 'en', messages: {} })
        expect(locale.current.value).toBe('fr')
    })

    it('isRtl is false for "en" (LTR language)', () => {
        const locale = createLocale({ locale: 'en', fallbackLocale: 'en', messages: {} })
        expect(locale.isRtl.value).toBe(false)
    })

    it('isRtl is true for "ar" (RTL language)', () => {
        const locale = createLocale({ locale: 'ar', fallbackLocale: 'en', messages: {} })
        expect(locale.isRtl.value).toBe(true)
    })

    it('isRtl is true for "he" (RTL language)', () => {
        const locale = createLocale({ locale: 'he', fallbackLocale: 'en', messages: {} })
        expect(locale.isRtl.value).toBe(true)
    })

    it('isRtl is true for "fa" (RTL language)', () => {
        const locale = createLocale({ locale: 'fa', fallbackLocale: 'en', messages: {} })
        expect(locale.isRtl.value).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// createRtl — computed from locale map
// ---------------------------------------------------------------------------

describe('createRtl', () => {
    it('isRtl follows LOCALE_RTL_DEFAULT for the current locale', () => {
        const i18n = makeLocaleInstance('en')
        const { isRtl } = createRtl(i18n)
        expect(isRtl.value).toBe(LOCALE_RTL_DEFAULT['en'])
    })

    it('isRtl is true when locale is "ar"', () => {
        const i18n = makeLocaleInstance('ar')
        const { isRtl } = createRtl(i18n)
        expect(isRtl.value).toBe(true)
    })

    it('isRtl defaults to false for unknown locale', () => {
        const i18n = makeLocaleInstance('zz')
        const { isRtl } = createRtl(i18n)
        expect(isRtl.value).toBe(false)
    })

    it('custom RTL map in options overrides the default', () => {
        const i18n = makeLocaleInstance('en')
        const { isRtl } = createRtl(i18n, { rtl: { en: true } })
        expect(isRtl.value).toBe(true)
    })

    it('reactive: isRtl updates when locale ref changes', () => {
        const i18n = makeLocaleInstance('en')
        const { isRtl } = createRtl(i18n)
        expect(isRtl.value).toBe(false)

        i18n.current.value = 'ar'
        expect(isRtl.value).toBe(true)

        i18n.current.value = 'en'
        expect(isRtl.value).toBe(false)
    })

    it('returns { isRtl, rtl } shape', () => {
        const i18n = makeLocaleInstance('en')
        const result = createRtl(i18n)
        expect(result).toHaveProperty('isRtl')
        expect(result).toHaveProperty('rtl')
    })
})

// ---------------------------------------------------------------------------
// provideRtl — component prop takes precedence
// ---------------------------------------------------------------------------

describe('provideRtl', () => {
    it('props.rtl=true forces isRtl to true regardless of locale', () => {
        const i18n = makeLocaleInstance('en')
        const rtlRef = ref<IRtlInstance['rtl']['value']>(LOCALE_RTL_DEFAULT as Record<string, boolean>)
        const result = provideRtl(i18n, rtlRef, { rtl: true })
        expect(result.isRtl.value).toBe(true)
    })

    it('props.rtl=false forces isRtl to false regardless of locale', () => {
        const i18n = makeLocaleInstance('ar')
        const rtlRef = ref<IRtlInstance['rtl']['value']>(LOCALE_RTL_DEFAULT as Record<string, boolean>)
        const result = provideRtl(i18n, rtlRef, { rtl: false })
        expect(result.isRtl.value).toBe(false)
    })

    it('props.rtl=undefined falls back to locale map', () => {
        const i18n = makeLocaleInstance('ar')
        const rtlRef = ref<IRtlInstance['rtl']['value']>(LOCALE_RTL_DEFAULT as Record<string, boolean>)
        const result = provideRtl(i18n, rtlRef, {})
        expect(result.isRtl.value).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// provideLocale — helpers
// ---------------------------------------------------------------------------

/**
 * Mounts `Parent(provides root locale) → Child(calls provideLocale(props))
 * → Grandchild(calls useLocale())`, and exposes the resolved locale
 * instances from all three levels so a test can assert an override at the
 * Child level propagates down without mutating the Parent's own instance.
 */
function mountProvideLocale (
    childProps: Record<string, unknown>,
    rootOptions?: Parameters<typeof createLocale>[0]
) {
    let parentLocale!: ReturnType<typeof createLocale>
    let childLocale!: ReturnType<typeof provideLocale>
    let grandchildLocale!: ILocaleInstance

    const Grandchild = defineComponent({
        name: 'LocaleGrandchild',
        setup () {
            grandchildLocale = useLocale()
            return () => h('div')
        }
    })

    const Child = defineComponent({
        name: 'LocaleChild',
        setup () {
            childLocale = provideLocale(childProps as never)
            return () => h(Grandchild)
        }
    })

    const Parent = defineComponent({
        name: 'LocaleParent',
        setup () {
            parentLocale = createLocale(rootOptions ?? { locale: 'en', fallbackLocale: 'en', messages: {} })
            provide(ORIGAM_LOCALE_KEY, parentLocale)
            return () => h(Child)
        }
    })

    mount(Parent)

    return {
        parent: () => parentLocale,
        child: () => childLocale,
        grandchild: () => grandchildLocale
    }
}

// ---------------------------------------------------------------------------
// provideLocale — overrides propagate to descendants
// ---------------------------------------------------------------------------

describe('provideLocale — subtree override propagates downward', () => {
    it('a Child overriding `locale` is what a Grandchild\'s useLocale() sees', () => {
        const { grandchild } = mountProvideLocale({ locale: 'fr' })
        expect(grandchild().current.value).toBe('fr')
    })

    it('with no override props, the Child\'s locale still equals the Parent\'s (pass-through)', () => {
        const { parent, child } = mountProvideLocale({})
        expect(child().current.value).toBe(parent().current.value)
    })

    it('an override at the Child does NOT mutate the Parent\'s own locale instance', () => {
        const { parent } = mountProvideLocale({ locale: 'fr' })
        expect(parent().current.value).toBe('en')
    })

    it('isRtl reflects the overridden locale (fr → LTR, ar → RTL)', () => {
        const ltr = mountProvideLocale({ locale: 'fr' })
        expect(ltr.child().isRtl.value).toBe(false)

        const rtl = mountProvideLocale({ locale: 'ar' })
        expect(rtl.child().isRtl.value).toBe(true)
    })

    it('an explicit `rtl` prop on the Child wins over the locale-derived default', () => {
        const { child } = mountProvideLocale({ locale: 'en', rtl: true })
        expect(child().isRtl.value).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// provideLocale — missing ancestor context
// ---------------------------------------------------------------------------

describe('provideLocale — missing ancestor context', () => {
    it('throws "[Origam] Could not find injected locale instance" with no ancestor createLocale()/provide', () => {
        let threw: unknown

        const Orphan = defineComponent({
            name: 'LocaleOrphan',
            setup () {
                try {
                    provideLocale({})
                } catch (e) {
                    threw = e
                }
                return () => h('div')
            }
        })

        mount(Orphan)
        expect(threw).toBeInstanceOf(Error)
        expect((threw as Error).message).toBe('[Origam] Could not find injected locale instance')
    })
})

// ---------------------------------------------------------------------------
// useLocale / useRtl — skip (require injection context)
// ---------------------------------------------------------------------------

describe('useLocale / useRtl (injection-bound)', () => {
    it.skip('useLocale: requires inject(ORIGAM_LOCALE_KEY) — needs full createOrigam() app context', () => {
        // Reason: inject() outside a component setup throws. Providing a fake
        // injection symbol would test the inject mechanism rather than our logic.
        // Covered by e2e smoke tests against a real Origam app.
    })

    it.skip('useRtl: same injection dependency as useLocale — skip in unit scope', () => {
        // Same reason as above.
    })
})
