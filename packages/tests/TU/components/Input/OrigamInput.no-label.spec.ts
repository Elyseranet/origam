// `label` on <OrigamInput> — verdict: RETIREE (not wired, not warned).
//
// `label` reached `<OrigamInput>` through `IInputProps extends …
// IValidationProps` and painted nothing. The two other options were tried
// and MEASURED wrong before this one was chosen:
//
// * cabler (render a `<label>` on the wrapper) — every consumer that
//   forwards `label` already renders its own. Mounted with
//   `label="PROBE_LABEL"`, one tick after mount: Checkbox 1, Switch 1,
//   TextField 2 (static + floating), RatingField 1, SliderField 1,
//   RadioGroup 1, `<OrigamInput>` alone 0. Painting one here gives all six
//   a duplicate.
// * avertir (`useUnsupportedProp`) — the warning fired on
//   `<OrigamCheckbox label>`, `<OrigamTextField label>` and
//   `<OrigamSwitch label>`, i.e. on CORRECT calls, because each of those
//   forwards its own props into `<origam-input>` via `filterProps`, which
//   carries exactly the keys `<OrigamInput>` declares. Verified with a
//   `console.warn` spy: 1 warning each, in isolation.
//
// Dropping the declaration is what stops that forwarding at the source —
// `filterProps` picks from `Object.keys(<OrigamInput>.props)`, so a prop
// the wrapper does not declare is never handed to it. `label` now lives
// only on the interfaces whose components render one: `IFieldProps`,
// `ISelectionControlProps`, `ISliderFieldProps`, and (added with this
// change, since the mixin was its only source) `IRatingFieldProps`.
//
// Mutation-checked: putting `label?: string` back on `IValidationProps`
// turns the first test red.

import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamCheckbox from '@origam/components/Checkbox/OrigamCheckbox.vue'
import OrigamCheckboxGroup from '@origam/components/Checkbox/OrigamCheckboxGroup.vue'
import OrigamRadioGroup from '@origam/components/Radio/OrigamRadioGroup.vue'
import OrigamRatingField from '@origam/components/RatingField/OrigamRatingField.vue'
import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import OrigamSwitch from '@origam/components/Switch/OrigamSwitch.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import { createOrigam } from '@origam/origam'

const PROBE = 'PROBE_LABEL'

function mountWithLabel (component: unknown) {
    return mount(component as never, {
        props: { label: PROBE } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamInput — `label` is not part of its prop surface', () => {
    it('does not declare a `label` prop', () => {
        const declared = (OrigamInput as unknown as { props: Record<string, unknown> }).props

        expect(Object.keys(declared)).not.toContain('label')
    })

    it('renders no <label> of its own', async () => {
        const wrapper = mountWithLabel(OrigamInput)
        await nextTick()
        await nextTick()

        expect(wrapper.findAll('label')).toHaveLength(0)
    })
})

describe('the components that DO own a label still render exactly one', () => {
    // The regression net for the removal. Each of these forwards its props
    // into `<origam-input>`; none of them may lose — or duplicate — the
    // `<label>` its own interface is responsible for.
    const cases: Array<[string, unknown, number]> = [
        ['Checkbox', OrigamCheckbox, 1],
        ['Switch', OrigamSwitch, 1],
        // static + floating label, both carrying the same text
        ['TextField', OrigamTextField, 2],
        ['SliderField', OrigamSliderField, 1]
        // ⚠️ RadioGroup / CheckboxGroup left this table with #814 — see the
        // dedicated case below. Same reason as RatingField: the element moved,
        // the responsibility did not.
    ]

    for (const [name, component, expected] of cases) {
        it(`${name} renders ${expected} <label> carrying the text`, async () => {
            const wrapper = mountWithLabel(component)
            await nextTick()
            await nextTick()

            const labels = wrapper.findAll('label').filter((l) => l.text().includes(PROBE))

            expect(labels).toHaveLength(expected)
        })
    }

    it('RatingField keeps its own label after the interface move', async () => {
        // `IRatingFieldProps` gained an explicit `label?: string` with this
        // change — `IInputProps → IValidationProps` was its only source.
        //
        // ⚠️ #810 moved the ELEMENT, not the responsibility. RatingField no
        // longer renders a `<label>`: a rating is a group of controls, so the
        // text now names a `role="radiogroup"` through `aria-labelledby`
        // instead of carrying a `for` that pointed at an id no element held
        // (measured in Chromium — the `for` resolved to `null`). What this
        // test is the regression net FOR — "the `label` prop still paints,
        // exactly once, and is not swallowed by the forwarding chain" — is
        // unchanged, so it is asserted here on the element that now carries it.
        const wrapper = mountWithLabel(OrigamRatingField)
        await nextTick()
        await nextTick()

        expect(wrapper.findAll('label').filter((l) => l.text().includes(PROBE))).toHaveLength(0)

        const painted = wrapper.findAll('.origam-label').filter((l) => l.text().includes(PROBE))

        expect(painted).toHaveLength(1)
        expect(painted[0].element.tagName).toBe('SPAN')

        // …and the text is not merely rendered, it NAMES the group.
        const labelledBy = wrapper.attributes('aria-labelledby')

        expect(labelledBy).toBeTruthy()
        expect(wrapper.find(`#${labelledBy}`).text()).toContain(PROBE)
    })

    // ⚠️ #814 applied the #810 treatment to the two selection groups, for the
    // same measured reason: their `<origam-label>` rendered a `<label>` with
    // NO `for` and wrapping no control — a relation that labelled nothing.
    // Worse, it carried the SAME id as the `<div role="group">`, so the id was
    // duplicated, and once the `#label` slot was overridden the group's
    // `aria-labelledby` resolved to the group itself (measured:
    // `AUTO-REFERENCE : true`).
    //
    // What this table was the regression net FOR — "the `label` prop still
    // paints, exactly once, and is not swallowed by the forwarding chain" — is
    // unchanged, so it is asserted here on the element that now carries it.
    // Each individual radio / checkbox keeps its OWN `<label for>`, which is
    // why the counts below are per-group, not zero overall.
    for (const [name, component] of [['RadioGroup', OrigamRadioGroup], ['CheckboxGroup', OrigamCheckboxGroup]] as const) {
        it(`${name} names its group instead of rendering a dangling <label>`, async () => {
            const wrapper = mountWithLabel(component)
            await nextTick()
            await nextTick()

            // Plus aucun `<label>` ne porte le texte du GROUPE.
            expect(wrapper.findAll('label').filter((l) => l.text().includes(PROBE))).toHaveLength(0)

            const painted = wrapper.findAll('.origam-label').filter((l) => l.text().includes(PROBE))

            expect(painted).toHaveLength(1)
            expect(painted[0].element.tagName).toBe('SPAN')

            // …et le texte NOMME le groupe, via un wrapper dedie.
            const group = wrapper.find('[role="group"]')
            const labelledBy = group.attributes('aria-labelledby')

            expect(labelledBy).toBeTruthy()
            expect(wrapper.find(`#${labelledBy}`).text()).toContain(PROBE)
        })
    }
})
