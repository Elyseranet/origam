// Unit tests for <OrigamChipGroup> — emit contract.
//
// ⚠️ PRODUCT BUG FOUND BY THIS FILE — see the "known defect" block at the
// bottom. A plain `<origam-chip>` inside an `<origam-chip-group>` NEVER
// toggles on click, so the group never emits `update:modelValue`. The
// selection machinery itself is sound: driving `toggle` from the chip's slot
// props, or adding `link` to the chip, both emit correctly. The defect is
// confined to OrigamChip's `isClickable` guard.
//
// The specs below are therefore split in two:
//  - the paths that DO work, asserted on payload (regression net);
//  - the broken path, encoded with `it.fails` so it stays visible in CI and
//    turns RED the day someone fixes the component (forcing the flip to `it`).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamChipGroup from '@origam/components/Chip/OrigamChipGroup.vue'
import OrigamChip from '@origam/components/Chip/OrigamChip.vue'
import { createOrigam } from '@origam/origam'

// Chips whose default slot exposes the group's `toggle` — the documented
// slot-prop API. `@click.stop` is REQUIRED: without it the click bubbles to
// the chip root and would toggle a SECOND time the day OrigamChip's
// `isClickable` guard is repaired, silently turning every assertion below
// into a double-toggle. Keeping the propagation stopped isolates these specs
// to the group's own selection machinery.
const SLOT_MARKUP = `
    <origam-chip value="a">
        <template #default="{ toggle }"><button class="chip-a" @click.stop="toggle">A</button></template>
    </origam-chip>
    <origam-chip value="b">
        <template #default="{ toggle }"><button class="chip-b" @click.stop="toggle">B</button></template>
    </origam-chip>
    <origam-chip value="c">
        <template #default="{ toggle }"><button class="chip-c" @click.stop="toggle">C</button></template>
    </origam-chip>
`

function mountGroup (attrs = '', markup: string = SLOT_MARKUP) {
    const Host = defineComponent({
        components: { OrigamChipGroup, OrigamChip },
        template: `<origam-chip-group ${attrs}>${markup}</origam-chip-group>`
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

function modelUpdates (wrapper: VueWrapper): unknown[][] {
    return (wrapper.findComponent(OrigamChipGroup).emitted('update:modelValue') ?? []) as unknown[][]
}

// ---------------------------------------------------------------------------
// update:modelValue — single selection (driven via the `toggle` slot prop)
// ---------------------------------------------------------------------------

describe('OrigamChipGroup — update:modelValue (single selection)', () => {
    it('does not emit before any interaction', () => {
        expect(modelUpdates(mountGroup())).toHaveLength(0)
    })

    it('emits the toggled chip value', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.chip-b').trigger('click')

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('b')
    })

    it('emits the new value when the selection moves', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.chip-a').trigger('click')
        await wrapper.find('button.chip-c').trigger('click')

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['a', 'c'])
    })

    it('emits undefined when the selected chip is toggled off', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.chip-a').trigger('click')
        await wrapper.find('button.chip-a').trigger('click')

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBeUndefined()
    })
})

// ---------------------------------------------------------------------------
// update:modelValue — multiple
// ---------------------------------------------------------------------------

describe('OrigamChipGroup — update:modelValue (multiple)', () => {
    it('accumulates the selected chip values into an array', async () => {
        const wrapper = mountGroup('multiple')
        await wrapper.find('button.chip-a').trigger('click')
        await wrapper.find('button.chip-c').trigger('click')

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual([['a'], ['a', 'c']])
    })

    it('drops a value when its chip is toggled off', async () => {
        const wrapper = mountGroup('multiple')
        await wrapper.find('button.chip-a').trigger('click')
        await wrapper.find('button.chip-b').trigger('click')
        await wrapper.find('button.chip-a').trigger('click')

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['b'])
    })
})

// ---------------------------------------------------------------------------
// Guards that must SUPPRESS the emit
// ---------------------------------------------------------------------------

describe('OrigamChipGroup — mandatory', () => {
    it('emits the forced initial selection on mount', () => {
        expect(modelUpdates(mountGroup('mandatory')).at(-1)?.[0]).toBe('a')
    })

    it('does NOT emit when deselecting the only selected chip', async () => {
        const wrapper = mountGroup('mandatory')
        const before = modelUpdates(wrapper).length

        await wrapper.find('button.chip-a').trigger('click')

        expect(modelUpdates(wrapper)).toHaveLength(before)
    })
})

describe('OrigamChipGroup — max', () => {
    it('stops emitting once max selections is reached', async () => {
        const wrapper = mountGroup('multiple :max="2"')
        await wrapper.find('button.chip-a').trigger('click')
        await wrapper.find('button.chip-b').trigger('click')

        const before = modelUpdates(wrapper).length
        await wrapper.find('button.chip-c').trigger('click')

        expect(modelUpdates(wrapper)).toHaveLength(before)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a', 'b'])
    })
})

// ---------------------------------------------------------------------------
// The chip's OWN click handler
// ---------------------------------------------------------------------------
// OrigamChip.vue gates its click handler behind:
//
//     const isClickable = computed(() => {
//         return !props.disabled && props.link && (!!group || props.link || link.isClickable.value)
//     })
//
// `props.link &&` short-circuits the whole expression, so the `!!group`
// disjunct that is plainly meant to make a grouped chip clickable is dead
// code. Consequence: a chip inside a chip-group is inert unless it ALSO
// carries `link`.

describe('OrigamChipGroup — selection through the chip\'s own click handler', () => {
    const PLAIN_MARKUP = `
        <origam-chip value="a" text="A"/>
        <origam-chip value="b" text="B"/>
    `
    const LINK_MARKUP = `
        <origam-chip value="a" text="A" link/>
        <origam-chip value="b" text="B" link/>
    `

    it('works when the chip also carries `link` (the accidental workaround)', async () => {
        const wrapper = mountGroup('', LINK_MARKUP)
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('a')
    })

    // KNOWN DEFECT — this is the behaviour a consumer expects and does NOT get.
    // `it.fails` passes while the bug is present and turns RED once OrigamChip's
    // `isClickable` guard is fixed. Flip it to `it` at that point.
    it.fails('BUG: clicking a plain chip in a group emits update:modelValue', async () => {
        const wrapper = mountGroup('', PLAIN_MARKUP)
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBe('a')
    })

    // The same defect seen from the DOM: no chip ever gets the selected class.
    it.fails('BUG: clicking a plain chip in a group marks it selected', async () => {
        const wrapper = mountGroup('', PLAIN_MARKUP)
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        expect(wrapper.findAll('.origam-chip')[0].classes()).toContain('origam-chip--selected')
    })

    // Pins the CURRENT broken state so the bug cannot widen unnoticed: the
    // click is received (the `click` emit fires) but selection never happens.
    it('currently: the click IS received, only the selection is dropped', async () => {
        const wrapper = mountGroup('', PLAIN_MARKUP)
        const firstChip = wrapper.findAllComponents(OrigamChip)[0]
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        expect(firstChip.emitted('click')).toHaveLength(1)
        expect(modelUpdates(wrapper)).toHaveLength(0)
    })
})
