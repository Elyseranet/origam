// Unit tests for <OrigamChipGroup> — emit contract.
//
// ⚠️ PRODUCT BUG FOUND BY THIS FILE, since REPAIRED — see the block at the
// bottom. A plain `<origam-chip>` inside an `<origam-chip-group>` never
// toggled on click, so the group never emitted `update:modelValue`. The
// selection machinery itself was sound: driving `toggle` from the chip's slot
// props, or adding `link` to the chip, both emitted correctly. The defect was
// confined to OrigamChip's `isClickable` guard, plus a second one right behind
// it — the group's `selectedClass` never reached the chip's root element.

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
// The chip's OWN click handler — REPAIRED
// ---------------------------------------------------------------------------
// OrigamChip.vue used to gate its click handler behind:
//
//     !props.disabled && props.link && (!!group || props.link || link.isClickable.value)
//
// `props.link &&` short-circuited the whole expression, so the `!!group`
// disjunct that is plainly meant to make a grouped chip clickable was dead
// code, and a chip inside a chip-group was inert unless it ALSO carried
// `link`. Now:
//
//     !props.disabled && (!!group || props.link || link.isClickable.value)
//
// the same shape `OrigamListItem.isClickable` already used.

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

    // REPAIRED — was `it.fails` while `props.link &&` gated the whole guard.
    it('clicking a plain chip in a group emits update:modelValue', async () => {
        const wrapper = mountGroup('', PLAIN_MARKUP)
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBe('a')
    })

    // The same repair seen from the DOM. Two distinct defects had to be fixed
    // for this one: the `isClickable` guard above, AND the fact that OrigamChip
    // exposed the group's `selectedClass` to its default slot only, never
    // applying it on its own root the way OrigamBtn / OrigamItem / OrigamTab do.
    it('clicking a plain chip in a group marks it selected', async () => {
        const wrapper = mountGroup('', PLAIN_MARKUP)
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        expect(wrapper.findAll('.origam-chip')[0].classes()).toContain('origam-chip--selected')
    })

    // The click emit and the selection are two separate channels; assert both
    // fire exactly once, so a future regression that re-breaks one of them (or
    // makes the click double-toggle) is caught rather than silently absorbed.
    it('the click emit and the selection both fire exactly once', async () => {
        const wrapper = mountGroup('', PLAIN_MARKUP)
        const firstChip = wrapper.findAllComponents(OrigamChip)[0]
        await wrapper.findAll('.origam-chip')[0].trigger('click')

        expect(firstChip.emitted('click')).toHaveLength(1)
        expect(modelUpdates(wrapper)).toHaveLength(1)
        expect(modelUpdates(wrapper)[0][0]).toBe('a')
    })

    // The chip must NOT become clickable just by existing: outside a group,
    // with no `link`, no `href`/`to` and no bound click listener, the guard
    // still says no. This is what stops the fix from over-shooting into
    // "every chip is a button".
    it('a plain chip outside a group is still not clickable', () => {
        const Host = defineComponent({
            components: { OrigamChip },
            template: '<origam-chip text="A"/>'
        })
        const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })

        expect(wrapper.find('.origam-chip').classes()).not.toContain('origam-chip--link')
    })
})
