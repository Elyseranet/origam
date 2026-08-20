// Unit tests for <OrigamDefaultsProvider> (issue #438).
//
// `provideDefaults()` (defaults.composable.ts) wraps its resolution in a
// `computed()` so descendants re-resolve whenever a reactive dependency
// changes. `OrigamDefaultsProvider.vue` wraps `defaults` in its own
// `computed(() => props.defaults ?? {})` before forwarding it — but until
// the #438 fix, `scoped` / `reset` / `root` / `disabled` were forwarded as
// the RAW prop values read once in `setup()`:
//
//     provideDefaults(computed(() => props.defaults ?? {}), {
//         scoped:   props.scoped,   // read once, frozen forever
//         reset:    props.reset,
//         root:     props.root,
//         disabled: props.disabled
//     })
//
// Because `provideDefaults`'s internal computed only re-runs when something
// it actually READS during evaluation changes, and a frozen boolean is never
// read reactively, a `:scoped="someRef"` / `:disabled="someRef"` binding had
// zero effect after mount — only the value at mount time was ever honoured.
//
// The "reactive …" describe blocks below reproduce that exact defect (two
// nested providers, a boolean toggled on the OUTER host after mount, several
// `nextTick()` flushes) and FAIL on the pre-fix component. The "mount-time
// cascade" blocks pin five scenarios that already worked before the fix —
// a regression there means the fix broke something that used to be correct.

import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamDefaultsProvider from '@origam/components/DefaultsProvider/OrigamDefaultsProvider.vue'
import { useDefaults } from '@origam/composables/Commons/defaults.composable'

// ---------------------------------------------------------------------------
// Shared probe leaf — resolves `color` against the closest provider and
// renders it as text so assertions read the DOM, not internals.
// ---------------------------------------------------------------------------

const Leaf = defineComponent({
    name: 'OrigamLeafProbe',
    props: {
        color: { type: String, default: 'leaf-default' }
    },
    setup (props) {
        const resolved = useDefaults(props, 'origam-leaf')
        return () => h('div', { class: 'leaf' }, String(resolved.color))
    }
})

// A handful of `nextTick()` flushes — matches the repro described in the
// ticket (four ticks were needed to prove the descendant never updated).
async function flush (times = 4) {
    for (let i = 0; i < times; i++) await nextTick()
}

// ---------------------------------------------------------------------------
// Reactive `scoped` (regression #438)
// ---------------------------------------------------------------------------

describe('OrigamDefaultsProvider — reactive scoped (#438)', () => {
    it('honours a scoped prop change made AFTER mount, not just the value at mount time', async () => {
        const Host = defineComponent({
            name: 'OrigamScopedHost',
            props: {
                scoped: { type: Boolean, default: false }
            },
            setup (props) {
                return () => h(
                    OrigamDefaultsProvider,
                    { defaults: { global: { color: 'parent-color' } } },
                    {
                        default: () => h(
                            OrigamDefaultsProvider,
                            { scoped: props.scoped, defaults: {} },
                            { default: () => h(Leaf) }
                        )
                    }
                )
            }
        })

        const wrapper = mount(Host, { props: { scoped: false } })
        await flush()
        // scoped=false at mount → child provider merges parent's global default.
        expect(wrapper.find('.leaf').text()).toBe('parent-color')

        await wrapper.setProps({ scoped: true })
        await flush()
        // scoped=true set AFTER mount → child must stop inheriting the
        // parent's global default; leaf falls back to its own default.
        expect(wrapper.find('.leaf').text()).toBe('leaf-default')
    })
})

// ---------------------------------------------------------------------------
// Reactive `disabled` (regression #438)
// ---------------------------------------------------------------------------

describe('OrigamDefaultsProvider — reactive disabled (#438)', () => {
    it('honours a disabled prop change made AFTER mount', async () => {
        const Host = defineComponent({
            name: 'OrigamDisabledHost',
            props: {
                disabled: { type: Boolean, default: false }
            },
            setup (props) {
                return () => h(
                    OrigamDefaultsProvider,
                    { defaults: { global: { color: 'parent-color' } } },
                    {
                        default: () => h(
                            OrigamDefaultsProvider,
                            { disabled: props.disabled, defaults: { global: { color: 'child-color' } } },
                            { default: () => h(Leaf) }
                        )
                    }
                )
            }
        })

        const wrapper = mount(Host, { props: { disabled: false } })
        await flush()
        // disabled=false at mount → child provider's own default wins.
        expect(wrapper.find('.leaf').text()).toBe('child-color')

        await wrapper.setProps({ disabled: true })
        await flush()
        // disabled=true set AFTER mount → child provider must pass the
        // parent's map through unchanged; leaf sees the parent's default.
        expect(wrapper.find('.leaf').text()).toBe('parent-color')
    })
})

// ---------------------------------------------------------------------------
// Mount-time cascade — five scenarios that already worked before the fix.
// A regression here means the fix broke a previously-correct behaviour.
// ---------------------------------------------------------------------------

describe('OrigamDefaultsProvider — mount-time cascade (baseline, must not regress)', () => {
    it('1. basic cascade: a single provider hands its global default down to a leaf', () => {
        const wrapper = mount(OrigamDefaultsProvider, {
            props: { defaults: { global: { color: 'primary' } } },
            slots: { default: () => h(Leaf) }
        })

        expect(wrapper.find('.leaf').text()).toBe('primary')
    })

    it('2. an explicit prop passed by the consumer beats the provider default', () => {
        const wrapper = mount(OrigamDefaultsProvider, {
            props: { defaults: { global: { color: 'primary' } } },
            slots: { default: () => h(Leaf, { color: 'explicit' }) }
        })

        expect(wrapper.find('.leaf').text()).toBe('explicit')
    })

    it('3. disabled on a nested provider passes the parent map through unchanged', () => {
        const Host = defineComponent({
            name: 'OrigamDisabledBaselineHost',
            setup () {
                return () => h(
                    OrigamDefaultsProvider,
                    { defaults: { global: { color: 'parent-color' } } },
                    {
                        default: () => h(
                            OrigamDefaultsProvider,
                            { disabled: true, defaults: { global: { color: 'ignored-color' } } },
                            { default: () => h(Leaf) }
                        )
                    }
                )
            }
        })

        const wrapper = mount(Host)
        expect(wrapper.find('.leaf').text()).toBe('parent-color')
    })

    it('4. scoped does not merge with the parent provider', () => {
        const Host = defineComponent({
            name: 'OrigamScopedBaselineHost',
            setup () {
                return () => h(
                    OrigamDefaultsProvider,
                    { defaults: { global: { color: 'parent-color' } } },
                    {
                        default: () => h(
                            OrigamDefaultsProvider,
                            { scoped: true, defaults: {} },
                            { default: () => h(Leaf) }
                        )
                    }
                )
            }
        })

        const wrapper = mount(Host)
        // No parent inheritance → leaf falls back to its own default.
        expect(wrapper.find('.leaf').text()).toBe('leaf-default')
    })

    it('5. no provider at all — leaf falls back to its own default value', () => {
        const wrapper = mount(Leaf)

        expect(wrapper.find('.leaf').text()).toBe('leaf-default')
    })
})
