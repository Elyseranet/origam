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
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'

import { activeDefaultsFor, createOrigam } from '@origam/origam'
import { installThemePropsResolver, themedPropKeysUnion } from '@origam/composables/Commons/theme-props-resolver.composable'
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

describe('installThemePropsResolver — zero-cost early out', () => {
    it('an empty union (no theme names any prop) never calls app.mixin() at all', () => {
        // `createOrigam()` always prepends the baseline `origamTheme`, which
        // DOES populate an extensive `components` block (that's the whole
        // point of the baseline — every stock component gets sane defaults)
        // — so there is no way to observe a truly empty union through the
        // public `createOrigam()` API. Testing `installThemePropsResolver()`
        // directly with an empty map is the precise way to pin the
        // early-out this file's own doc comment promises.
        let mixinCalls = 0
        const app = { mixin: () => { mixinCalls++ } }

        installThemePropsResolver(app as any, new Map())

        expect(mixinCalls).toBe(0)
    })

    it('a non-empty union DOES call app.mixin() exactly once', () => {
        let mixinCalls = 0
        const app = { mixin: () => { mixinCalls++ } }

        installThemePropsResolver(app as any, new Map([['fake-card', new Set(['color'])]]))

        expect(mixinCalls).toBe(1)
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
