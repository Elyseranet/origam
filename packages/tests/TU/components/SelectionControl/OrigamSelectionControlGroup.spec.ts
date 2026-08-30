// Unit tests for <OrigamSelectionControlGroup> — emit contract.
//
// ⚠️ TWO PRODUCT BUGS FOUND BY THIS FILE, both since REPAIRED.
// `update:modelValue` had no assertion anywhere before this spec, and the
// reason that matters is visible below: the group DID emit the event while
// broken — it just emitted the WRONG payload. A test asserting only
// `expect(emitted).toBeTruthy()` would have passed on a component that could
// not select anything.
//
// 1. ASYMMETRIC `model` computed in <OrigamSelectionControl> — the getter read
//    the GROUP's model, the setter rebuilt the array from the CONTROL's own
//    (always empty inside a group), so each checkbox discarded every earlier
//    selection. Fixed by giving both accessors one shared source.
//
// 2. The `provideDefaults` cascade never reached the child's TEMPLATE (same
//    family as ADR-005). The group forwards its props through
//    <origam-defaults-provider>, and <OrigamSelectionControl> picks them up
//    with `const props = useDefaults(_props)` — which returns a NEW object
//    only the SCRIPT sees. Props read bare in the template (`:type="type"`,
//    `disabled`, `name`) never arrived: `child.props('type')` stayed
//    `undefined` and the rendered <input> carried no `type` attribute at all.
//
//    Fixed in the theme-props-resolver rather than here. That hook already
//    resolved this exact cascade — it reads the injected defaults map, which
//    is what `provideDefaults` writes — but only installed its accessor for
//    keys a REGISTERED THEME named. So `density` (themed for
//    `origam-selection-control`) arrived while its neighbours silently did
//    not. Honouring both key sources repairs the whole class; see
//    `theme-props-resolver.composable.ts`, section "The `provideDefaults`
//    cascade — same defect, same repair".

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

    // REPAIRED — was `it.fails` while the setter rebuilt the array from the
    // control's own model. This was DATA LOSS, not a cosmetic defect: every
    // selection but the last one silently disappeared from the payload.
    it('accumulates both values when both boxes are checked', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        await wrapper.findAll('input')[1].setValue(true)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a', 'b'])
    })

    // The intermediate emit must be right too, not just the final one — a
    // setter that only APPENDED correctly on the last write would still be
    // wrong for a consumer reading every event.
    it('emits the full accumulated selection at each step', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a'])

        await wrapper.findAll('input')[1].setValue(true)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a', 'b'])
    })

    // Unchecking suffered from the same wrong source: the `filter` ran over an
    // empty array, so it could never actually remove anything. With two boxes
    // checked, unchecking the first must leave the second selected.
    it('unchecking one of two boxes keeps the other selected', async () => {
        const wrapper = mountGroup(GROUP, CHILD)
        await wrapper.findAll('input')[0].setValue(true)
        await wrapper.findAll('input')[1].setValue(true)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a', 'b'])

        await wrapper.findAll('input')[0].setValue(false)
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
// REPAIRED — props set on the GROUP now reach the children's TEMPLATE
// ---------------------------------------------------------------------------
// This is the documented API of the component: the group exposes `type`,
// `disabled` and `name` and cascades them via slotDefaults. All five specs
// below were `it.fails` until the theme-props-resolver was taught to honour
// the provideDefaults cascade, not just what a registered theme names.

describe('OrigamSelectionControlGroup — type cascaded from the group', () => {
    it('type="checkbox" on the group renders checkbox inputs', () => {
        const wrapper = mountGroup('type="checkbox" multiple', '')
        expect(wrapper.findAll('input').map(i => i.attributes('type'))).toEqual(['checkbox', 'checkbox'])
    })

    it('type="checkbox" on the group emits the checked value', async () => {
        const wrapper = mountGroup('type="checkbox" multiple', '')
        await wrapper.findAll('input')[0].setValue(true)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a'])
    })

    it('type="radio" on the group emits the selected value', async () => {
        const wrapper = mountGroup('type="radio"', '')
        await wrapper.findAll('input')[0].setValue(true)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBe('a')
    })

    // The prop must land on the INSTANCE, not merely produce the right DOM by
    // some other route — that distinction is what the original defect turned
    // on (`child.props('type')` was `undefined` while the emit still fired).
    it('the cascaded type reaches the child instance and carries a real payload', async () => {
        const wrapper = mountGroup('type="checkbox" multiple', '')

        expect(wrapper.find('input').attributes('type')).toBe('checkbox')
        expect(wrapper.findComponent(OrigamSelectionControl).props('type')).toBe('checkbox')

        await wrapper.findAll('input')[0].setValue(true)

        expect(modelUpdates(wrapper)).toHaveLength(1)
        expect(modelUpdates(wrapper)[0][0]).toEqual(['a'])
    })

    // The a11y consequence of the same defect: the control used to be PAINTED
    // as disabled while the underlying input stayed enabled and announced
    // itself enabled. Paint and semantics must now agree.
    it('disabled on the group paints AND disables the child, consistently', () => {
        const wrapper = mountGroup('type="checkbox" disabled', '')
        const child = wrapper.findComponent(OrigamSelectionControl)

        expect(child.classes()).toContain('origam-selection-control--disabled')
        expect(child.props('disabled')).toBe(true)
        expect(wrapper.find('input').attributes('aria-disabled')).toBe('true')
        expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('disabled on the group disables the child input', () => {
        const wrapper = mountGroup('type="checkbox" disabled', '')
        expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    // `name` is what makes native radios mutually exclusive in a browser.
    it('name on the group reaches the child inputs', () => {
        const wrapper = mountGroup('name="choice"', 'type="radio"')
        expect(wrapper.findAll('input').map(i => i.attributes('name'))).toEqual(['choice', 'choice'])
    })

    // A child's own value must still beat the group's cascade — the cascade is
    // a DEFAULT, not an override. Easy to break when widening interception.
    it('a value set on the child still wins over the group cascade', () => {
        const wrapper = mountGroup('type="checkbox"', 'type="radio"')
        expect(wrapper.findAll('input').map(i => i.attributes('type'))).toEqual(['radio', 'radio'])
    })

    it('density (script-consumed) DOES cascade from the group', () => {
        const wrapper = mountGroup('density="compact"', 'type="checkbox"')
        expect(wrapper.findComponent(OrigamSelectionControl).classes())
            .toContain('origam-selection-control--density-compact')
    })
})

// ---------------------------------------------------------------------------
// #396 — PERTE DE DONNEES: auto-detected `multiple` (no explicit prop), the
// DOCUMENTED default path (`OrigamSelectionControl.md`: "multiple — when left
// unset, multiple mode is auto-detected from whether the current modelValue
// is an array"). Every test above forces `multiple` explicitly on the group,
// which side-steps the actual defect entirely.
//
// Root cause: `multiple` is typed `boolean` on `ISelectionControlProps`.
// Vue's own runtime resolves an ABSENT prop whose declared type includes
// Boolean to the concrete value `false` (never `undefined`) whenever no
// `default` is declared for it — so `isMultiple`'s guard
// (`props.multiple == null`) could never see the "nobody set it" case: it
// was always comparing `false == null`, which is `false`. Auto-detect from
// the array-shaped model was therefore DEAD CODE for as long as this
// component has existed with this guard. Fixed by declaring an explicit
// `multiple: undefined` default (disables Vue's boolean-cast) AND reading
// the GROUP-aware `currentModel()` instead of the control's own (never
// bound) local `modelValue` for the auto-detect check.
// ---------------------------------------------------------------------------

describe('OrigamSelectionControlGroup — #396 multiple auto-detected from an array v-model (no explicit `multiple` prop anywhere)', () => {
    function mountBoundGroup (initial: any[] = []) {
        const Host = defineComponent({
            components: { OrigamSelectionControlGroup, OrigamSelectionControl },
            template: `<origam-selection-control-group v-model="selected">
                <origam-selection-control value="a" type="checkbox" label="A"/>
                <origam-selection-control value="b" type="checkbox" label="B"/>
            </origam-selection-control-group>`,
            data () {
                return { selected: initial }
            }
        })

        return mount(Host, { global: { plugins: [createOrigam()] } })
    }

    it('accumulates ["a","b"] instead of overwriting to a bare scalar', async () => {
        const wrapper = mountBoundGroup([])
        const inputs = wrapper.findAll('input')

        await inputs[0].setValue(true)
        expect((wrapper.vm as any).selected).toEqual(['a'])

        await inputs[1].setValue(true)
        expect((wrapper.vm as any).selected).toEqual(['a', 'b'])
    })

    it('unchecking one of two still leaves an array behind, not a scalar', async () => {
        const wrapper = mountBoundGroup([])
        const inputs = wrapper.findAll('input')

        await inputs[0].setValue(true)
        await inputs[1].setValue(true)
        expect((wrapper.vm as any).selected).toEqual(['a', 'b'])

        await inputs[0].setValue(false)
        expect((wrapper.vm as any).selected).toEqual(['b'])
    })
})
