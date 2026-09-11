// Issue #363 — a prop read EAGERLY at `setup()` level escapes the theme.
//
// This spec pins the MECHANISM, not any single component. The ADR-005 theme
// resolver patches `instance.props` from a global mixin's `beforeCreate`.
// Vue runs `beforeCreate` AFTER `setup()` (`setupStatefulComponent` invokes
// `setup()`, then `finishComponentSetup` → `applyOptions` → the `beforeCreate`
// hooks). So a value captured during setup snapshots the PRE-theme value and
// never updates, with no warning.
//
// If a future Vue release reorders those two, the first test here flips to
// green-for-the-wrong-reason — so it asserts the ORDER explicitly rather than
// only asserting the consequence.

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import { useDefaults } from '@origam/composables/Commons/defaults.composable'
import type { IOrigamTheme } from '@origam/interfaces'

const THEME: IOrigamTheme = {
    name: 'probe',
    mode: 'light',
    components: { 'origam-probe': { label: 'from-theme' } },
    vars: {}
}

function origamWithTheme () {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('probe', 'light')
    return origam
}

describe('#363 — setup()-level prop reads and the theme resolver', () => {
    it('a global mixin beforeCreate runs AFTER setup() (the root cause)', () => {
        const order: string[] = []

        const Probe = defineComponent({
            name: 'OrigamProbe',
            props: { label: { type: String, default: 'own-default' } },
            setup () {
                order.push('setup')
                return () => h('span')
            }
        })

        // The mixin also runs on Vue Test Utils' own wrapper root, so record
        // the instance name and keep only the probe's own hooks.
        const app = {
            install (a: any) {
                a.mixin({
                    beforeCreate (this: any) {
                        if (this.$options.name === 'OrigamProbe') order.push('beforeCreate')
                    }
                })
            }
        }
        mount(Probe, { global: { plugins: [app] } })

        // The whole defect depends on this ordering. Assert it directly.
        expect(order).toEqual(['setup', 'beforeCreate'])
    })

    it('WITHOUT useDefaults, a value read eagerly in setup() misses the theme', () => {
        const Probe = defineComponent({
            name: 'OrigamProbe',
            props: { label: { type: String, default: 'own-default' } },
            setup (props) {
                // Eager capture — exactly what `useClipboard({ feedbackDuration:
                // props.feedbackDuration })` does in OrigamClipboard.
                const captured = props.label
                return () => h('span', captured)
            }
        })

        const wrapper = mount(Probe, { global: { plugins: [origamWithTheme()] } })
        expect(wrapper.text()).toBe('own-default')
        expect(wrapper.text()).not.toBe('from-theme')
    })

    it('WITH useDefaults, the same eager read sees the theme', () => {
        const Probe = defineComponent({
            name: 'OrigamProbe',
            props: { label: { type: String, default: 'own-default' } },
            setup (_props) {
                const props = useDefaults(_props, 'origam-probe')
                const captured = props.label
                return () => h('span', captured)
            }
        })

        const wrapper = mount(Probe, { global: { plugins: [origamWithTheme()] } })
        expect(wrapper.text()).toBe('from-theme')
    })

    it('an explicitly passed prop still beats the theme after wiring', () => {
        const Probe = defineComponent({
            name: 'OrigamProbe',
            props: { label: { type: String, default: 'own-default' } },
            setup (_props) {
                const props = useDefaults(_props, 'origam-probe')
                const captured = props.label
                return () => h('span', captured)
            }
        })

        const wrapper = mount(Probe, {
            props: { label: 'explicit' },
            global: { plugins: [origamWithTheme()] }
        })
        expect(wrapper.text()).toBe('explicit')
    })
})
