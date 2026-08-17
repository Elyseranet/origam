// Unit tests for <OrigamSelectionControlGroup> — emit contract.
//
// ⚠️ PRODUCT BUG FOUND BY THIS FILE. `update:modelValue` had no assertion
// anywhere before this spec, and the reason that matters is visible below:
// the group DOES emit the event while broken — it just emits the WRONG
// payload. A test asserting only `expect(emitted).toBeTruthy()` would have
// passed on a component that cannot select anything.
//
// Root cause (same family as ADR-005, on a path the ADR's resolver does not
// cover). The group cascades its own props to children through
// <origam-defaults-provider> → `provideDefaults`, and <OrigamSelectionControl>
// picks them up with `const props = useDefaults(_props)`. `useDefaults`
// returns a NEW object that only the SCRIPT sees:
//
//   - props consumed in the SCRIPT (density, multiple, …) → propagate ✅
//   - props read BARE in the TEMPLATE (`:type="type"`, `disabled`, `name`)
//     → never propagate ❌ — `child.props('type')` stays `undefined` and the
//     rendered <input> carries no `type` attribute at all.
//
// The theme-props-resolver installed by createOrigam() patches only the prop
// slots a REGISTERED THEME names; it does not intercept the DefaultsProvider
// cascade, so this path is still broken.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamSelectionControlGroup from '@origam/components/SelectionControl/OrigamSelectionControlGroup.vue'
import OrigamSelectionControl from '@origam/components/SelectionControl/OrigamSelectionControl.vue'
import { createOrigam } from '@origam/origam'

function mountGroup (groupAttrs: string, childAttrs: string, values = ['a', 'b']) {
    const children = values
        .map(v => `<origam-selection-control value="${v}" ${childAttrs}/>`)
        .join('')

    const Host = defineComponent({
        components: { OrigamSelectionControlGroup, OrigamSelectionControl },
        template: `<origam-selection-control-group ${groupAttrs}>${children}</origam-selection-control-group>`
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

function modelUpdates (wrapper: VueWrapper): unknown[][] {
    return (wrapper.findComponent(OrigamSelectionControlGroup).emitted('update:modelValue') ?? []) as unknown[][]
}

// ---------------------------------------------------------------------------
// update:modelValue — the working configuration (type on each child)
// ---------------------------------------------------------------------------

describe('OrigamSelectionControlGroup — update:modelValue (checkbox, multiple)', () => {
    const GROUP = 'multiple'
    const CHILD = 'type="checkbox"'

    it('does not emit before any interaction', () => {
        expect(modelUpdates(mountGroup(GROUP, CHILD))).toHaveLength(0)
    })

    it('emits an array containing the checked value', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toEqual(['a'])
    })

    // KNOWN DEFECT — multi-select accumulation loses every earlier value.
    //
    // <OrigamSelectionControl>'s `model` computed is asymmetric: the GETTER
    // reads the group's model when inside a group…
    //
    //     get() { const val = group ? group.modelValue.value : modelValue.value }
    //
    // …but the SETTER always builds the new array from the CONTROL's OWN
    // model before writing it to the group:
    //
    //     newVal = val ? [ ...wrapInArray(modelValue.value), currentValue ]
    //                  : wrapInArray(modelValue.value).filter(…)
    //     if (group) { group.modelValue.value = newVal }
    //
    // Each checkbox therefore starts from its own (empty) model, so checking a
    // second box REPLACES the first instead of appending to it. This is
    // independent of the `type` cascade defect below — it reproduces with
    // `type="checkbox"` correctly set on each child.
    it.fails('BUG: accumulates both values when both boxes are checked', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        await wrapper.findAll('input')[1].setValue(true)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a', 'b'])
    })

    // Pins the current data-losing behaviour.
    it('currently: checking a second box discards the first selection', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a'])

        await wrapper.findAll('input')[1].setValue(true)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['b'])
    })

    // Single-box check → uncheck. Unambiguous because only one control is
    // ever selected, so the accumulation defect above cannot interfere.
    it('emits an empty array when the only checked box is unchecked', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a'])

        await wrapper.findAll('input')[0].setValue(false)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual([])
    })
})

describe('OrigamSelectionControlGroup — update:modelValue (radio, single)', () => {
    const CHILD = 'type="radio"'

    it('emits the scalar value of the selected radio', async () => {
        const wrapper = mountGroup('', CHILD)
        await wrapper.findAll('input')[1].setValue(true)

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('b')
    })

    it('emits the new value when the selection moves', async () => {
        const wrapper = mountGroup('', CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        await wrapper.findAll('input')[1].setValue(true)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['a', 'b'])
    })

    it('renders real radio inputs when type is set on the child', () => {
        const wrapper = mountGroup('', CHILD)
        expect(wrapper.findAll('input').map(i => i.attributes('type'))).toEqual(['radio', 'radio'])
    })
})

// ---------------------------------------------------------------------------
// KNOWN DEFECT — `type` set on the GROUP never reaches the children
// ---------------------------------------------------------------------------
// This is the documented API of the component: the group exposes `type` and
// cascades it via slotDefaults. It does not work. `it.fails` keeps the defect
// visible in CI and turns RED once the propagation is repaired.

describe('OrigamSelectionControlGroup — type cascaded from the group', () => {
    it.fails('BUG: type="checkbox" on the group renders checkbox inputs', () => {
        const wrapper = mountGroup('type="checkbox" multiple', '')
        expect(wrapper.findAll('input').map(i => i.attributes('type'))).toEqual(['checkbox', 'checkbox'])
    })

    it.fails('BUG: type="checkbox" on the group emits the checked value', async () => {
        const wrapper = mountGroup('type="checkbox" multiple', '')
        await wrapper.findAll('input')[0].setValue(true)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a'])
    })

    it.fails('BUG: type="radio" on the group emits the selected value', async () => {
        const wrapper = mountGroup('type="radio"', '')
        await wrapper.findAll('input')[0].setValue(true)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBe('a')
    })

    // Pins the CURRENT broken behaviour so it cannot silently drift further.
    // Note the emit DOES fire — with a payload that carries no selection.
    it('currently: the input has no type attribute and the payload is empty', async () => {
        const wrapper = mountGroup('type="checkbox" multiple', '')

        expect(wrapper.find('input').attributes('type')).toBeUndefined()
        expect(wrapper.findComponent(OrigamSelectionControl).props('type')).toBeUndefined()

        await wrapper.findAll('input')[0].setValue(true)

        expect(modelUpdates(wrapper)).toHaveLength(1)
        expect(modelUpdates(wrapper)[0][0]).toEqual([])
    })

    // Same root cause, worse consequence: the control is painted as disabled
    // but the underlying input is not disabled and announces itself enabled.
    it('currently: disabled on the group paints the child but does not disable it', () => {
        const wrapper = mountGroup('type="checkbox" disabled', '')
        const child = wrapper.findComponent(OrigamSelectionControl)

        expect(child.classes()).toContain('origam-selection-control--disabled')
        expect(child.props('disabled')).toBe(false)
        expect(wrapper.find('input').attributes('aria-disabled')).toBe('false')
        expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    })

    it.fails('BUG: disabled on the group disables the child input', () => {
        const wrapper = mountGroup('type="checkbox" disabled', '')
        expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    // `name` is what makes native radios mutually exclusive in a browser.
    it.fails('BUG: name on the group reaches the child inputs', () => {
        const wrapper = mountGroup('name="choice"', 'type="radio"')
        expect(wrapper.findAll('input').map(i => i.attributes('name'))).toEqual(['choice', 'choice'])
    })

    // Proof the cascade itself is alive — a SCRIPT-consumed prop does arrive.
    // This isolates the defect to template-read props rather than to
    // provideDefaults being broken wholesale.
    it('density (script-consumed) DOES cascade from the group', () => {
        const wrapper = mountGroup('density="compact"', 'type="checkbox"')
        expect(wrapper.findComponent(OrigamSelectionControl).classes())
            .toContain('origam-selection-control--density-compact')
    })
})
