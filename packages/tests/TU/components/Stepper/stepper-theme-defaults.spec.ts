// Regression coverage for #470 — `props.modelValue` was read eagerly to
// seed `internalModel` at the top of `setup()` (`ref(props.modelValue ?? 0)`),
// BEFORE the ADR-005 theme-props resolver patches `instance.props` in
// `beforeCreate` (which runs AFTER `setup()`). A theme naming
// `'origam-stepper': { modelValue: 2 }` therefore had zero effect: the
// stepper always started at step 0 (or whatever was passed as an explicit
// prop), never at the themed value.
//
// The later `watch(() => props.modelValue, ...)` correctly handles REACTIVE
// changes to the prop after mount — it's only the INITIAL seed that missed
// the themed value, because the ref had already been created with a plain
// snapshot by the time the resolver runs.

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamStepper from '@origam/components/Stepper/OrigamStepper.vue'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const SAMPLE_ITEMS = [
    { title: 'Step 1' },
    { title: 'Step 2' },
    { title: 'Step 3' }
]

const THEME: IOrigamTheme = {
    name: 'stepper-defaults-theme',
    mode: 'light',
    components: {
        'origam-stepper': { modelValue: 2 }
    },
    vars: {}
}

const mountThemedStepper = (props: Record<string, unknown> = {}) => {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('stepper-defaults-theme', 'light')

    return mount(OrigamStepper, {
        global: { plugins: [origam] },
        props: { items: SAMPLE_ITEMS, ...props }
    })
}

describe('OrigamStepper — theme.components["origam-stepper"] resolution (#470)', () => {
    it('seeds the initial active step from the themed modelValue when the consumer passes none', () => {
        const wrapper = mountThemedStepper()

        // Connector at position 2 is "done" only if internalModel (seeded from
        // the theme) actually reached 2 — index-1=1 < modelValue=2.
        const connector = wrapper.findAll('.origam-stepper__connector')[1]
        expect(connector.classes()).toContain('origam-stepper__connector--done')
        wrapper.unmount()
    })

    it('an explicit modelValue prop on the consumer still wins over the theme default', () => {
        const wrapper = mountThemedStepper({ modelValue: 0 })

        const connector = wrapper.findAll('.origam-stepper__connector')[1]
        expect(connector.classes()).not.toContain('origam-stepper__connector--done')
        wrapper.unmount()
    })
})
