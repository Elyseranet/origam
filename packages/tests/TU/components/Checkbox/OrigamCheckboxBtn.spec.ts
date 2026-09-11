// Unit tests for <OrigamCheckboxBtn> — group accumulation contract (#396).
//
// The reported reproduction used exactly this markup:
//
//   <origam-selection-control-group v-model="selected">
//       <origam-checkbox-btn value="a" label="A" />
//       <origam-checkbox-btn value="b" label="B" />
//   </origam-selection-control-group>
//
// `selected` never became an array — every click overwrote it with a bare
// scalar. Root cause (two layers, both fixed together):
//
// 1. `OrigamSelectionControl`'s own `multiple` auto-detect guard compared
//    `props.multiple == null`, but an unset Boolean-typed prop resolves to
//    the concrete value `false` under Vue's own boolean-cast rule — never
//    `null`/`undefined`. The guard could never see "nobody set it".
// 2. `OrigamCheckboxBtn` forwarded ITS OWN (also boolean-cast) `multiple`
//    prop down to `<origam-selection-control>` unconditionally, via
//    `v-bind="controlProps"` — an EXPLICIT `false`, which wins over any
//    default and over the enclosing group's own cascade.
//
// Both are fixed: `OrigamSelectionControl` declares `multiple: undefined`
// (disables the cast) and reads the group-aware `currentModel()` for the
// auto-detect; `OrigamCheckboxBtn` only forwards `multiple` when its own
// consumer actually passed it (mirrors the `usePassedProps` guard already
// used by `OrigamSelectionControlGroup`, `OrigamBtnGroup`, etc. for the same
// class of defect, #263).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'

import OrigamSelectionControlGroup from '@origam/components/SelectionControl/OrigamSelectionControlGroup.vue'
import OrigamCheckboxBtn from '@origam/components/Checkbox/OrigamCheckboxBtn.vue'
import { createOrigam } from '@origam/origam'

// `OrigamCheckboxBtn` forwards its resolved props to `<origam-selection-control>`
// through the template-ref pattern documented in `props.composable.ts`
// ("the template-ref forwarding pattern, and its one-tick delta"): the FIRST
// render binds nothing (the ref is still unset), and the forwarded value
// (`value`, `multiple`, …) only lands from the SECOND render, flushed on a
// microtask. That is invisible to a real user (a click always happens many
// frames after mount) but NOT to a test that clicks synchronously right
// after `mount()`. Every test below awaits one `nextTick()` before the first
// interaction so it measures the same steady state a user would.
async function mountGroupedCheckboxes (initial: any[] = [], groupAttrs = '') {
    const Host = defineComponent({
        components: { OrigamSelectionControlGroup, OrigamCheckboxBtn },
        template: `<origam-selection-control-group v-model="selected" ${groupAttrs}>
            <origam-checkbox-btn value="a" label="A"/>
            <origam-checkbox-btn value="b" label="B"/>
        </origam-selection-control-group>`,
        data () {
            return { selected: initial }
        }
    })

    const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })
    await nextTick()
    return wrapper
}

describe('OrigamCheckboxBtn — #396 accumulates in a group, no explicit `multiple` anywhere', () => {
    it('checking both boxes yields ["a","b"], not a bare scalar', async () => {
        const wrapper = await mountGroupedCheckboxes([])
        const inputs = wrapper.findAll('input')

        await inputs[0].setValue(true)
        expect((wrapper.vm as any).selected).toEqual(['a'])

        await inputs[1].setValue(true)
        expect((wrapper.vm as any).selected).toEqual(['a', 'b'])
    })

    it('unchecking the first of two keeps the second, as an array', async () => {
        const wrapper = await mountGroupedCheckboxes([])
        const inputs = wrapper.findAll('input')

        await inputs[0].setValue(true)
        await inputs[1].setValue(true)
        await inputs[0].setValue(false)

        expect((wrapper.vm as any).selected).toEqual(['b'])
    })

    it('with `multiple` explicitly forced on the group, the true value is the actual `value` prop, not the boolean', async () => {
        const wrapper = await mountGroupedCheckboxes([], 'multiple')
        const inputs = wrapper.findAll('input')

        await inputs[0].setValue(true)
        expect((wrapper.vm as any).selected).toEqual(['a'])
    })

    it('an explicit `multiple=false` on a checkbox-btn is still honoured (not silently overridden by auto-detect)', async () => {
        const Host = defineComponent({
            components: { OrigamCheckboxBtn },
            template: `<origam-checkbox-btn v-model="picked" :multiple="false" value="a" label="A"/>`,
            data () {
                return { picked: [] as any[] }
            }
        })
        const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })
        await nextTick()

        await wrapper.find('input').setValue(true)

        // multiple=false forces scalar mode even though the seeded model was
        // an array — the explicit value must still win over auto-detect.
        expect((wrapper.vm as any).picked).toBe('a')
    })
})
