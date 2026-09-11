// ADR-005 — the global theme-props-resolver hook.
//
// `useDefaults()` was OPT-IN: 178 of 217 components never called it, so a
// theme's `components: { 'origam-xxx': {...} }` was a silent no-op for them.
// The 39 that DID call it were themselves broken for any prop their
// TEMPLATE reads by its bare name (`useDefaults()` returns a NEW object;
// the compiled template reads `instance.props`, never that new object).
//
// `installThemePropsResolver()` (called once by `createOrigam()`) fixes both
// by resolving INSIDE `instance.props` itself, via a global `app.mixin`
// `beforeCreate` hook — see `theme-props-resolver.composable.ts` for the
// full mechanism writeup. These specs exercise that mechanism directly,
// against small stand-in components that deliberately do NOT call
// `useDefaults()` — the whole point is that they don't need to.

import { afterEach, describe, expect, it } from 'vitest'
import { computed, createSSRApp, defineComponent, h, nextTick, watch } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'

import { activeDefaultsFor, createOrigam } from '@origam/origam'
import { installThemePropsResolver, themedPropKeysUnion } from '@origam/composables/Commons/theme-props-resolver.composable'
import OrigamRadio from '@origam/components/Radio/OrigamRadio.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import OrigamThemeProvider from '@origam/components/ThemeProvider/OrigamThemeProvider.vue'
import type { IOrigamTheme } from '@origam/interfaces'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

// Deliberately does NOT call useDefaults() — this is exactly a member of the
// "178 of 217" family the ADR is about.
const FakeCard = defineComponent({
    name: 'FakeCard',
    props: {
        color: { type: String, default: 'neutral' },
        rounded: { type: String, default: 'none' }
    },
    setup (props) {
        return () => h('span', { class: `color-${props.color} rounded-${props.rounded}` }, props.color)
    }
})

describe('themedPropKeysUnion — pure collapse of registered themes\' component maps', () => {
    it('unions prop keys per component name across multiple themes', () => {
        const union = themedPropKeysUnion([
            { 'fake-card': { color: 'primary' } },
            { 'fake-card': { rounded: 'lg' }, global: { density: 'compact' } }
        ])
        expect(union.get('fake-card')).toEqual(new Set(['color', 'rounded']))
        expect(union.get('global')).toEqual(new Set(['density']))
    })

    it('returns an empty map for no themes / themes with no components block', () => {
        expect(themedPropKeysUnion([]).size).toBe(0)
    })
})

describe('installThemePropsResolver — a component that NEVER calls useDefaults() honours a theme (the 178/217 gain)', () => {
    it('resolves an un-passed prop from theme.components with the component completely unmodified', () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-card': { color: 'primary' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('primary')
    })

    it('an explicitly passed prop always wins over the theme default', () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-card': { color: 'primary' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeCard, { props: { color: 'success' }, global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('success')
    })

    it('a prop with no theme entry falls back to the component\'s own withDefaults() value, untouched', () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-card': { color: 'primary' } }, // rounded not themed
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').classes()).toContain('rounded-none')
    })
})

describe('installThemePropsResolver — manifestation 1: an explicitly bound `undefined` falls through to the theme', () => {
    it('a key present in vnode.props with value undefined does NOT count as "passed"', () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-card': { color: 'primary' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const Wrapper = defineComponent({
            setup () {
                // `:color="undefined"` — the ordinary `:x="state.x"` consumer
                // pattern when `state.x` happens to be empty.
                return () => h(FakeCard, { color: undefined })
            }
        })

        const wrapper = mount(Wrapper, { global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('primary')
    })
})

describe('installThemePropsResolver — live theme swap updates the prop with no computed() (#275 requirement)', () => {
    it('reassigning _defaultsRef.value (theme switch) flips the resolved value reactively', async () => {
        const themeA: IOrigamTheme = { name: 'a', components: { 'fake-card': { color: 'primary' } }, vars: {} }
        const themeB: IOrigamTheme = { name: 'b', components: { 'fake-card': { color: 'danger' } }, vars: {} }
        const origam = createOrigam({ themes: [themeA, themeB] })
        origam._defaultsRef.value = origam._activeDefaultsFor('a', undefined)

        const wrapper = mount(FakeCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('primary')

        origam._defaultsRef.value = origam._activeDefaultsFor('b', undefined)
        await nextTick()
        expect(wrapper.find('span').text()).toBe('danger')
    })
})

describe('installThemePropsResolver — known weakness closed: interception scoped to the UNION of every REGISTERED theme', () => {
    it('a prop named only by a theme that is NOT active at mount still updates once it becomes active', async () => {
        // Theme A (active at mount) themes ONLY `color`. Theme B (registered,
        // but inactive at mount) is the FIRST to theme `rounded`. If
        // interception were scoped to the theme active AT MOUNT, `rounded`
        // would never be intercepted and would stay stuck on the component's
        // own default forever, even after swapping to B — the exact gap
        // ADR-005 documents (`rounded` stayed `'none'` after the swap).
        const themeA: IOrigamTheme = { name: 'a', components: { 'fake-card': { color: 'primary' } }, vars: {} }
        const themeB: IOrigamTheme = { name: 'b', components: { 'fake-card': { color: 'danger', rounded: 'lg' } }, vars: {} }
        const origam = createOrigam({ themes: [themeA, themeB] })
        origam._defaultsRef.value = origam._activeDefaultsFor('a', undefined)

        const wrapper = mount(FakeCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').classes()).toContain('color-primary')
        expect(wrapper.find('span').classes()).toContain('rounded-none')

        origam._defaultsRef.value = origam._activeDefaultsFor('b', undefined)
        await nextTick()

        expect(wrapper.find('span').classes()).toContain('color-danger')
        expect(wrapper.find('span').classes()).toContain('rounded-lg')
    })
})

describe('installThemePropsResolver — survives parent re-renders (updateProps does not clobber the getter)', () => {
    it('toggling an explicit binding on/off across several re-renders never throws and always resolves correctly', async () => {
        const theme: IOrigamTheme = { name: 'brandx', components: { 'fake-card': { color: 'primary' } }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const Wrapper = defineComponent({
            props: { explicit: { type: String, default: undefined } },
            setup (props) {
                // A manual h() call with a shape-changing props object (the
                // key itself appears/disappears) forces Vue's "full props
                // update" path in updateProps — the exact path that writes
                // `props[key] = value` directly onto `instance.props` on
                // every parent re-render.
                return () => h(FakeCard, props.explicit ? { color: props.explicit } : {})
            }
        })

        const wrapper = mount(Wrapper, { global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('primary')

        expect(async () => {
            await wrapper.setProps({ explicit: 'success' })
        }).not.toThrow()
        await wrapper.setProps({ explicit: 'success' })
        expect(wrapper.find('span').text()).toBe('success')

        await wrapper.setProps({ explicit: undefined })
        expect(wrapper.find('span').text()).toBe('primary')

        await wrapper.setProps({ explicit: 'danger' })
        expect(wrapper.find('span').text()).toBe('danger')

        await wrapper.setProps({ explicit: undefined })
        expect(wrapper.find('span').text()).toBe('primary')
    })
})

describe('installThemePropsResolver — reaches a component rendered INSIDE another component\'s own template (Option A\'s blind spot)', () => {
    it('a theme resolves a prop on a component a PARENT COMPONENT renders from its own template, not the mount root', () => {
        // `<OrigamDefaultsProvider>` (Option A, rejected) can only see vnodes
        // created in ITS OWN render scope — never a vnode a CHILD component
        // produces from its own template. A global app.mixin has no such
        // limit. FakeInner is never written in THIS test's template/h() call
        // graph directly — only FakeOuter's OWN render function creates it.
        const FakeInner = defineComponent({
            name: 'FakeInner',
            props: { color: { type: String, default: 'neutral' } },
            setup (props) {
                return () => h('em', { class: `color-${props.color}` }, props.color)
            }
        })
        const FakeOuter = defineComponent({
            name: 'FakeOuter',
            setup () {
                return () => h('div', [h(FakeInner)])
            }
        })

        const theme: IOrigamTheme = { name: 'brandx', components: { 'fake-inner': { color: 'primary' } }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeOuter, { global: { plugins: [origam] } })
        expect(wrapper.find('em').text()).toBe('primary')
    })
})

describe('installThemePropsResolver — a theme naming a prop the component does not declare is skipped safely', () => {
    it('does not crash and does not leak into instance.attrs / the DOM', () => {
        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-card': { color: 'primary', thisPropDoesNotExist: 'oops' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        expect(() => mount(FakeCard, { global: { plugins: [origam] } })).not.toThrow()

        const wrapper = mount(FakeCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('primary')
        expect(wrapper.attributes('thispropdoesnotexist')).toBeUndefined()
        expect(wrapper.attributes('this-prop-does-not-exist')).toBeUndefined()
    })
})

describe('installThemePropsResolver — dev-only warning when a theme names an undeclared prop (#515)', () => {
    // #515: the `if (!(key in rawProps)) continue` guard at
    // theme-props-resolver.composable.ts is an INTERSECTION (theme ∩
    // component props), not a union — the CLAUDE.md ADR-005 section wrongly
    // described it as a union. This is exactly what let a test theme name
    // `activeBgColor` on `Radio` (#496) go unnoticed: `Radio`'s own `active`
    // prop takes an `IStateEffectConfig` OBJECT whose `bgColor` key lives
    // nested inside it, so a themed *top-level* `activeBgColor` key is not
    // one of `Radio`'s declared props and was silently skipped.
    //
    // `warnUnsupportedProp` (dedup by Set, gated on `import.meta.env?.DEV`)
    // is the SAME mechanism `color.util.ts` already ships for
    // `warnLegacyColor` / `warnDeprecatedProp` — reused here rather than a
    // second warn cache, per the project's anti-duplication rule.
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('warns when a theme names a prop the component does not declare', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const theme: IOrigamTheme = {
            name: 'brandx-warn-undeclared',
            components: { 'fake-card': { color: 'primary', undeclaredSentinel515A: 'oops' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx-warn-undeclared', undefined)

        mount(FakeCard, { global: { plugins: [origam] } })

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('fake-card'))
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('undeclaredSentinel515A'))
        warn.mockRestore()
    })

    it('does not warn when every themed key is a prop the component actually declares', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const theme: IOrigamTheme = {
            name: 'brandx-warn-declared',
            components: { 'fake-card': { color: 'primary', rounded: 'lg' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx-warn-declared', undefined)

        mount(FakeCard, { global: { plugins: [origam] } })

        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('warns only once for the same (component, prop) couple, across several mounts', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const theme: IOrigamTheme = {
            name: 'brandx-warn-dedup',
            components: { 'fake-card': { color: 'primary', undeclaredSentinel515B: 'oops' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx-warn-dedup', undefined)

        mount(FakeCard, { global: { plugins: [origam] } })
        mount(FakeCard, { global: { plugins: [origam] } })
        mount(FakeCard, { global: { plugins: [origam] } })

        const matching = warn.mock.calls.filter(call => String(call[0]).includes('undeclaredSentinel515B'))
        expect(matching).toHaveLength(1)
        warn.mockRestore()
    })

    it('does not warn in production builds', () => {
        vi.stubEnv('DEV', false)
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const theme: IOrigamTheme = {
            name: 'brandx-warn-prod',
            components: { 'fake-card': { color: 'primary', undeclaredSentinel515C: 'oops' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx-warn-prod', undefined)

        mount(FakeCard, { global: { plugins: [origam] } })

        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('#496 concrete case: a theme naming activeBgColor on Radio (a prop Radio does not declare at top level) now warns', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const theme: IOrigamTheme = {
            name: 'brandx-496-repro',
            components: { 'origam-radio': { activeBgColor: '#ff0000' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx-496-repro', undefined)

        mount(OrigamRadio, { global: { plugins: [origam] } })

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('origam-radio'))
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('activeBgColor'))
        warn.mockRestore()
    })
})

describe('installThemePropsResolver — Function-typed props', () => {
    it('a theme can supply a function as a prop default, and it is callable', () => {
        const FakeAction = defineComponent({
            name: 'FakeAction',
            props: {
                onAction: { type: Function, default: undefined }
            },
            setup (props) {
                // The read MUST happen inside the render function (or a
                // computed), not synchronously in the setup() body: our
                // hook patches `instance.props` in `beforeCreate`, which
                // fires AFTER `setup()` has already run — same timing any
                // real component's `<script setup>` body has relative to
                // its own template/render.
                return () => {
                    const result = typeof props.onAction === 'function' ? props.onAction() : 'no-fn'
                    return h('span', {}, String(result))
                }
            }
        })

        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-action': { onAction: () => 'called-from-theme' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeAction, { global: { plugins: [origam] } })
        expect(wrapper.find('span').text()).toBe('called-from-theme')
    })
})

describe('installThemePropsResolver — a nested <OrigamThemeProvider scoped> overrides its subtree only', () => {
    const themeA: IOrigamTheme = { name: 'a', components: { 'fake-card': { color: 'primary' } }, vars: {} }
    const themeB: IOrigamTheme = { name: 'b', components: { 'fake-card': { color: 'danger' } }, vars: {} }

    const Tree = defineComponent({
        props: { theme: { type: String, default: 'auto' } },
        setup (props) {
            return () => h('div', [
                h(FakeCard, { class: 'root-card' }),
                h(OrigamThemeProvider, { theme: props.theme }, {
                    default: () => h(FakeCard, { class: 'scoped-card' })
                })
            ])
        }
    })

    it('the scoped subtree resolves against the named brand; the root stays on the active brand', () => {
        const origam = createOrigam({ themes: [themeA, themeB] })
        origam._defaultsRef.value = origam._activeDefaultsFor('a', undefined)

        const wrapper = mount(Tree, { props: { theme: 'b' }, global: { plugins: [origam] } })

        expect(wrapper.find('.root-card').text()).toBe('primary')
        expect(wrapper.find('.scoped-card').text()).toBe('danger')
    })
})

describe('installThemePropsResolver — coexists with an existing useDefaults() caller', () => {
    it('a component that DOES call useDefaults() for one prop and relies on this hook for another both resolve correctly', async () => {
        const { useDefaults } = await import('@origam/composables/Commons/defaults.composable')

        const FakeBtnBoth = defineComponent({
            name: 'FakeBtnBoth',
            props: {
                color: { type: String, default: 'neutral' }, // read via useDefaults() in script
                rounded: { type: String, default: 'none' } // read via bare template-style access, relies on this hook
            },
            setup (rawProps) {
                const resolved = useDefaults(rawProps, 'fake-btn-both')
                // Simulates the "template reads the raw prop" divergence:
                // `rawProps.rounded` is the SAME object our hook patches,
                // `resolved.color` goes through useDefaults()'s own map.
                return () => h('span', { class: `color-${resolved.color} rounded-${rawProps.rounded}` })
            }
        })

        const theme: IOrigamTheme = {
            name: 'brandx',
            components: { 'fake-btn-both': { color: 'primary', rounded: 'lg' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeBtnBoth, { global: { plugins: [origam] } })
        expect(wrapper.find('span').classes()).toContain('color-primary')
        expect(wrapper.find('span').classes()).toContain('rounded-lg')
    })
})

describe('installThemePropsResolver — mixin installation', () => {
    // ⚠️ CONTRACT CHANGE, deliberate. This used to assert the opposite —
    // "an empty union never calls app.mixin() at all" — as a zero-cost
    // early out.
    //
    // That early-out was sound only while a REGISTERED THEME was the single
    // writer of the defaults map. It no longer is: the hook now also resolves
    // the `provideDefaults` cascade, which group components fill at RUNTIME
    // from their own props. An empty union therefore no longer implies there
    // is nothing to intercept, and skipping the mixin on that basis would
    // reinstate the very defect being repaired for any app whose theme
    // happens to name nothing.
    //
    // What is NOT lost: the PER-INSTANCE early out. An instance named by
    // neither a theme nor an ancestor provider still bails after two Map
    // lookups and two property lookups — pinned by the next spec.
    it('installs the mixin even for an empty union (the provideDefaults cascade needs it)', () => {
        let mixinCalls = 0
        const app = { mixin: () => { mixinCalls++ } }

        installThemePropsResolver(app as any, new Map())

        expect(mixinCalls).toBe(1)
    })

    it('a non-empty union DOES call app.mixin() exactly once', () => {
        let mixinCalls = 0
        const app = { mixin: () => { mixinCalls++ } }

        installThemePropsResolver(app as any, new Map([['fake-card', new Set(['color'])]]))

        expect(mixinCalls).toBe(1)
    })

    // The per-instance early out is what actually keeps the catalogue cheap.
    // A component no theme and no provider names must come out of
    // `beforeCreate` with its props slots UNTOUCHED — i.e. still plain data
    // properties, not accessors.
    it('leaves an un-named component\'s prop slots untouched (per-instance early out)', () => {
        const origam = createOrigam({ themes: [{ name: 'empty', components: {}, vars: {} }] })

        const Probe = defineComponent({
            name: 'UnnamedProbe',
            props: { color: { type: String, default: 'neutral' } },
            setup (props) {
                const instance = (globalThis as any).__probeInstance = props
                return () => h('span', instance.color)
            }
        })

        const wrapper = mount(Probe, { global: { plugins: [origam] } })
        const descriptor = Object.getOwnPropertyDescriptor(
            (wrapper.vm as any).$ ? (wrapper.vm as any).$.props : {},
            'color'
        )

        expect(descriptor?.get).toBeUndefined()
        expect(wrapper.text()).toBe('neutral')
    })
})

describe('installThemePropsResolver — SSR (renderToString)', () => {
    it('resolves a themed prop server-side with no window/document dependency', async () => {
        const theme: IOrigamTheme = {
            name: 'ssr-theme',
            components: { 'fake-card': { color: 'primary' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('ssr-theme', undefined)

        const app = createSSRApp(FakeCard)
        app.use(origam)

        const html = await renderToString(app)
        expect(html).toContain('color-primary')
        expect(html).toContain('>primary<')
    })

    it('an explicit prop still wins server-side', async () => {
        const theme: IOrigamTheme = {
            name: 'ssr-theme',
            components: { 'fake-card': { color: 'primary' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('ssr-theme', undefined)

        const app = createSSRApp(FakeCard, { color: 'success' })
        app.use(origam)

        const html = await renderToString(app)
        expect(html).toContain('color-success')
    })
})

describe('installThemePropsResolver — pinned Vue internal (structural check)', () => {
    it('the patched prop is a configurable accessor with BOTH a getter and a setter', () => {
        // If a future Vue upgrade changes `instance.props` shape such that
        // `Object.defineProperty` no longer sticks, OR `updateProps` no
        // longer assigns via a plain `props[key] = value` (which needs the
        // setter to not throw under strict mode), this is the first place
        // that should fail loudly. See the long comment in
        // `theme-props-resolver.composable.ts` for what to do if it does.
        const theme: IOrigamTheme = { name: 'brandx', components: { 'fake-card': { color: 'primary' } }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)

        const wrapper = mount(FakeCard, { global: { plugins: [origam] } })
        const instance = (wrapper.vm.$ as unknown as { props: Record<string, unknown> })
        const descriptor = Object.getOwnPropertyDescriptor(instance.props, 'color')

        expect(descriptor).toBeDefined()
        expect(typeof descriptor?.get).toBe('function')
        expect(typeof descriptor?.set).toBe('function')
        expect(descriptor?.configurable).toBe(true)

        // The setter must not throw when written to directly (mirrors what
        // `updateProps`/`setFullProps` does on every parent re-render).
        expect(() => { instance.props.color = 'whatever-vue-would-resolve' }).not.toThrow()
    })
})

describe('activeDefaultsFor + themedPropKeysUnion — sanity: the union is built from the FULL install list, not the active one', () => {
    it('matches the shape createOrigam actually passes at install time', () => {
        const themes: IOrigamTheme[] = [
            { name: 'a', components: { 'fake-card': { color: 'primary' } }, vars: {} },
            { name: 'b', components: { 'fake-card': { rounded: 'lg' } }, vars: {} }
        ]
        const union = themedPropKeysUnion(themes.map(t => t.components!).filter(Boolean))
        expect(union.get('fake-card')).toEqual(new Set(['color', 'rounded']))
        // Confirms `activeDefaultsFor` (the ACTIVE-only collapse) and
        // `themedPropKeysUnion` (the ALL-registered union) are deliberately
        // different in scope — this is not an oversight.
        expect(activeDefaultsFor(themes, 'a', undefined)).toEqual({ 'fake-card': { color: 'primary' } })
    })
})

// ────────────────────────────────────────────────────────────────────────────
// Regression guard — the MEMOISED read channels (#52)
// ────────────────────────────────────────────────────────────────────────────
//
// Every spec above reads the themed prop DIRECTLY inside `render()`, via
// `FakeCard`. That is the ONE channel that survived the bug this block guards
// against — which is why 4365 green unit tests never saw it: a parent's patch
// force-re-runs the child's render, so a direct `__props.x` read always looks
// fresh even when nothing in the reactivity graph was invalidated.
//
// The patched prop slot on `instance.props` REPLACES Vue's own reactive slot.
// If its getter offers no tracked dependency, a `computed()` built on the prop
// stays stale for the lifetime of the instance and a `watch()` on it never
// fires once. Keep at least one assertion on EACH channel here.

// The watch log is module-scoped, NOT rendered into the DOM. Asserting it
// through a rendered attribute would be unsound: the prop write happens inside
// the child's own update job, so a `pre`-flush watcher callback can land AFTER
// the render that would have displayed it — and pushing to a plain array
// triggers no further render. That reads as "the watcher never fired" when it
// did. Observe the watcher directly.
const watchLog: string[] = []

const MemoCard = defineComponent({
    name: 'FakeCard',
    props: { color: { type: String, default: 'neutral' } },
    setup (props) {
        const memoised = computed(() => `memo-${props.color}`)
        watch(() => props.color, (v) => { watchLog.push(v) })
        return () => h('span', {
            'data-direct': `direct-${props.color}`,
            'data-memo': memoised.value
        })
    }
})

describe('a themed prop stays reactive through MEMOISED readers, not just direct render reads', () => {
    // Shape-changing props object → Vue's "full props update" path, the one
    // that writes `props[key] = value` straight onto `instance.props`.
    const Parent = defineComponent({
        props: { explicit: { type: String, default: undefined } },
        setup (props) {
            return () => h(MemoCard, props.explicit ? { color: props.explicit } : {})
        }
    })

    function themedOrigam (name = 'brandx', color = 'primary') {
        const theme: IOrigamTheme = { name, components: { 'fake-card': { color } }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor(name, undefined)
        return origam
    }

    it('a computed() on the prop re-evaluates when the parent starts passing a value', async () => {
        const wrapper = mount(Parent, { global: { plugins: [themedOrigam()] } })
        expect(wrapper.find('span').attributes('data-memo')).toBe('memo-primary')

        await wrapper.setProps({ explicit: 'success' })
        // Before #52's fix, `data-direct` correctly read 'direct-success'
        // while `data-memo` stayed 'memo-primary' forever — the exact split
        // that kept the bug invisible to every spec above.
        expect(wrapper.find('span').attributes('data-direct')).toBe('direct-success')
        expect(wrapper.find('span').attributes('data-memo')).toBe('memo-success')

        await wrapper.setProps({ explicit: undefined })
        expect(wrapper.find('span').attributes('data-memo')).toBe('memo-primary')
    })

    // WAS `it.fails` — repaired by snapshotting the passed value instead of
    // reading `instance.vnode.props` live in the getter. Promoted to a normal
    // `it`, exactly as the previous marking intended.
    //
    // Why this channel died while the `computed()` above survived — the two
    // subscribe DIFFERENT deps:
    //   - the `computed()` is lazy, first evaluated during `render()`, i.e.
    //     AFTER `beforeCreate` patched the slot, so it subscribes the getter's
    //     own `fallbackValue` shallowRef;
    //   - a `watch(() => props.color, …)` created in `setup()` runs its getter
    //     EAGERLY, before the patch exists, so it only ever holds the
    //     `shallowReactive` proxy's per-key dep.
    // And that per-key dep was never triggered: `MutableReactiveHandler.set`
    // reads `oldValue = target[key]` THROUGH the getter and gates `trigger()`
    // on `hasChanged(assigned, oldValue)`. Since `instance.vnode` is swapped
    // BEFORE `updateProps` runs, a LIVE `vnode.props` read already returned the
    // parent's new value at compare time — `hasChanged` false, no trigger, ever.
    //
    // Real-world casualty this repairs: OrigamMasonry.vue:179
    // `watch(() => props.gap, …)`, and `origam-masonry.gap` is a themed couple.
    it('a watch() on the prop actually fires', async () => {
        watchLog.length = 0
        const wrapper = mount(Parent, { global: { plugins: [themedOrigam()] } })
        expect(watchLog).toEqual([])

        await wrapper.setProps({ explicit: 'success' })
        await nextTick()
        expect(watchLog).toEqual(['success'])

        await wrapper.setProps({ explicit: undefined })
        await nextTick()
        expect(watchLog).toEqual(['success', 'primary'])
    })

    // KNOWN GAP, deliberately still open — a `watch()` created in `setup()` is
    // woken by a value arriving from the PARENT (the test above) but NOT by a
    // pure THEME SWAP with no parent update at all. Measured, not assumed.
    //
    // Why: such a watcher runs its getter eagerly, before `beforeCreate` patches
    // the slot, so it only ever holds the proxy's per-key dep — never the
    // getter's own `defaults` dep. The parent path works because Vue's own
    // `props[key] = …` write triggers that key dep; a theme swap performs no
    // such write, and there is no public API to trigger a reactive object's key.
    // A `computed()` is unaffected (control assertion in the test below).
    //
    // Deliberately NOT closed, on measured grounds: both shipped theme objects
    // (light and dark) carry BYTE-IDENTICAL `components` blocks, so no theme the
    // DS ships can change a prop value on a swap. It can only bite a consumer
    // registering several BRAND themes whose `components` blocks differ, and it
    // reaches exactly two call sites in the whole catalogue (OrigamMasonry.gap,
    // OrigamTextareaField.density). The candidate fix — a per-instance
    // `watch(defaults, …)` force-triggering each patched key by assigning a
    // sentinel through the proxy — was built and verified to close it at no
    // measurable time cost, but it adds a SECOND undocumented-Vue-internals
    // dependency to a file that already carries an upgrade warning. That
    // trade-off is the user's call, not a silent one.
    //
    // `it.fails` so this cannot go dormant: the day someone closes the gap this
    // turns RED and forces them to promote it.
    it.fails('a theme swap alone wakes a setup-created watch — KNOWN GAP, NOT REPAIRED', async () => {
        const swapLog: string[] = []
        const SwapCard = defineComponent({
            name: 'FakeCard',
            props: { color: { type: String, default: 'neutral' } },
            setup (props) {
                watch(() => props.color, v => { swapLog.push(v) })
                return () => h('span', { 'data-c': props.color })
            }
        })
        const themes: IOrigamTheme[] = [
            { name: 'a', components: { 'fake-card': { color: 'primary' } }, vars: {} },
            { name: 'b', components: { 'fake-card': { color: 'danger' } }, vars: {} }
        ]
        const origam = createOrigam({ themes })
        origam._defaultsRef.value = origam._activeDefaultsFor('a', undefined)

        const wrapper = mount(SwapCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').attributes('data-c')).toBe('primary')

        origam._defaultsRef.value = origam._activeDefaultsFor('b', undefined)
        await nextTick()
        await nextTick()
        // The RENDER does see the swap — only the standalone watcher does not.
        expect(wrapper.find('span').attributes('data-c')).toBe('danger')
        expect(swapLog).toEqual(['danger'])
    })

    it('a theme swap still invalidates memoised readers (the branch that always worked)', async () => {
        const themes: IOrigamTheme[] = [
            { name: 'a', components: { 'fake-card': { color: 'primary' } }, vars: {} },
            { name: 'b', components: { 'fake-card': { color: 'danger' } }, vars: {} }
        ]
        const origam = createOrigam({ themes })
        origam._defaultsRef.value = origam._activeDefaultsFor('a', undefined)

        const wrapper = mount(MemoCard, { global: { plugins: [origam] } })
        expect(wrapper.find('span').attributes('data-memo')).toBe('memo-primary')

        origam._defaultsRef.value = origam._activeDefaultsFor('b', undefined)
        await nextTick()
        expect(wrapper.find('span').attributes('data-memo')).toBe('memo-danger')
    })
})

// ────────────────────────────────────────────────────────────────────────────
// Regression guard — real components, STABILISED state after mount (#52)
// ────────────────────────────────────────────────────────────────────────────
//
// `OrigamRadio` / `OrigamTextField` render `<origam-input>` as their root and
// forward their own RESOLVED props to it through
// `inputProps = origamInputRef.value?.filterProps(props, …)`. That template ref
// is only populated AFTER mount, so the inner input first resolves its own
// theme entry (`origam-input.density = 'default'`) and only then receives the
// outer one (`origam-radio` / `origam-text-field` = 'compact').
//
// ⛔ ASSERT THE STABILISED STATE, NEVER t0. At t0 the inner entry legitimately
// wins — that transient is expected and is tracked separately (#54). Asserting
// t0 here would pin the bug instead of the contract.
describe('an outer component\'s theme entry reaches the inner root it forwards to', () => {
    async function densityAfterSettle (Component: object): Promise<string> {
        const Host = defineComponent({ render: () => h(Component) })
        const wrapper = mount(Host, { global: { plugins: [createOrigam({})] } })
        for (let i = 0; i < 6; i++) await nextTick()
        const root = wrapper.element as HTMLElement
        const inner = root.matches?.('.origam-input') ? root : root.querySelector('.origam-input')
        const classes = inner ? [...inner.classList].filter(c => c.includes('--density-')) : []
        wrapper.unmount()
        return classes.join(' ')
    }

    it('origam-radio.density wins over origam-input.density once forwarding lands', async () => {
        expect(await densityAfterSettle(OrigamRadio)).toBe('origam-input--density-compact')
    })

    it('origam-text-field.density wins over origam-input.density once forwarding lands', async () => {
        expect(await densityAfterSettle(OrigamTextField)).toBe('origam-input--density-compact')
    })
})
