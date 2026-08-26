// Unit tests for <OrigamItemGroup> / <OrigamItem> — emit contract.
//
// Why this file exists
// -------------------
// `update:modelValue` is the raison d'être of every group component, and
// until now NOTHING asserted it — not e2e, not unit. A declared-but-never-
// exercised emit is the same failure mode that let <OrigamSelectionControl>
// ship an <input> with no `type` attribute (see ADR-005): the contract is
// typed and documented, but no test ever provokes it.
//
// These specs therefore drive the REAL interaction (a click on an element
// wired to the group's `toggle` slot prop) and assert BOTH that the emit
// fires AND the exact payload. Asserting only "an emit fired" is worthless
// here: OrigamSelectionControlGroup does emit `update:modelValue` while
// broken — it just emits the WRONG payload (`[]` instead of `['a']`).
//
// Payload shape (from useGroup + useVModel):
// - single mode   → the raw value of the selected item     ('a')
// - multiple mode → an array of the selected item values   (['a', 'b'])

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamItemGroup from '@origam/components/ItemGroup/OrigamItemGroup.vue'
import OrigamItemGroupItem from '@origam/components/ItemGroup/OrigamItemGroupItem.vue'
import { createOrigam } from '@origam/origam'

const ITEM_MARKUP = `
    <origam-item value="a" v-slot="{ toggle, isSelected }">
        <button class="item-a" :data-selected="isSelected" @click="toggle">A</button>
    </origam-item>
    <origam-item value="b" v-slot="{ toggle, isSelected }">
        <button class="item-b" :data-selected="isSelected" @click="toggle">B</button>
    </origam-item>
    <origam-item value="c" v-slot="{ toggle, isSelected }">
        <button class="item-c" :data-selected="isSelected" @click="toggle">C</button>
    </origam-item>
`

function mountGroup (groupAttrs = '', itemMarkup: string = ITEM_MARKUP) {
    const Host = defineComponent({
        components: { OrigamItemGroup, OrigamItem: OrigamItemGroupItem },
        template: `<origam-item-group ${groupAttrs}>${itemMarkup}</origam-item-group>`
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

function modelUpdates (wrapper: VueWrapper): unknown[][] {
    return (wrapper.findComponent(OrigamItemGroup).emitted('update:modelValue') ?? []) as unknown[][]
}

// ---------------------------------------------------------------------------
// update:modelValue — single selection
// ---------------------------------------------------------------------------

describe('OrigamItemGroup — update:modelValue (single selection)', () => {
    it('does not emit before any interaction', () => {
        const wrapper = mountGroup()
        expect(modelUpdates(wrapper)).toHaveLength(0)
    })

    it('emits once with the clicked item value', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-b').trigger('click')

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('b')
    })

    it('emits the NEW value when selection moves to another item', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-a').trigger('click')
        await wrapper.find('button.item-c').trigger('click')

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['a', 'c'])
    })

    it('emits undefined when the selected item is toggled off', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-a').trigger('click')
        await wrapper.find('button.item-a').trigger('click')

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(2)
        expect(updates[0][0]).toBe('a')
        expect(updates[1][0]).toBeUndefined()
    })

    it('reflects the selection in the DOM alongside the emit', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-b').trigger('click')

        expect(wrapper.find('button.item-b').attributes('data-selected')).toBe('true')
        expect(wrapper.find('button.item-a').attributes('data-selected')).toBe('false')
    })
})

// ---------------------------------------------------------------------------
// update:modelValue — multiple selection
// ---------------------------------------------------------------------------

describe('OrigamItemGroup — update:modelValue (multiple)', () => {
    it('accumulates selected values into an array', async () => {
        const wrapper = mountGroup('multiple')
        await wrapper.find('button.item-a').trigger('click')
        await wrapper.find('button.item-c').trigger('click')

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual([['a'], ['a', 'c']])
    })

    it('removes a value from the array when the item is toggled off', async () => {
        const wrapper = mountGroup('multiple')
        await wrapper.find('button.item-a').trigger('click')
        await wrapper.find('button.item-b').trigger('click')
        await wrapper.find('button.item-a').trigger('click')

        const last = modelUpdates(wrapper).at(-1)
        expect(last?.[0]).toEqual(['b'])
    })
})

// ---------------------------------------------------------------------------
// mandatory / max — the guards that SUPPRESS the emit
// ---------------------------------------------------------------------------
// These matter as much as the happy path: `useGroup.select()` has early
// `return` branches that must not emit. A test that only checks "emit fires"
// would never notice these silently emitting anyway.

describe('OrigamItemGroup — mandatory', () => {
    it('emits the forced initial selection on mount', async () => {
        const wrapper = mountGroup('mandatory')
        expect(modelUpdates(wrapper).at(-1)?.[0]).toBe('a')
    })

    it('does NOT emit when deselecting the only selected item', async () => {
        const wrapper = mountGroup('mandatory')
        const before = modelUpdates(wrapper).length

        await wrapper.find('button.item-a').trigger('click')

        expect(modelUpdates(wrapper)).toHaveLength(before)
    })

    it('still emits when moving the selection to another item', async () => {
        const wrapper = mountGroup('mandatory')
        await wrapper.find('button.item-c').trigger('click')

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBe('c')
    })
})

describe('OrigamItemGroup — max', () => {
    it('does NOT emit once the max number of selections is reached', async () => {
        const wrapper = mountGroup('multiple :max="2"')
        await wrapper.find('button.item-a').trigger('click')
        await wrapper.find('button.item-b').trigger('click')

        const beforeOverflow = modelUpdates(wrapper).length
        await wrapper.find('button.item-c').trigger('click')

        expect(modelUpdates(wrapper)).toHaveLength(beforeOverflow)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['a', 'b'])
    })
})

// ---------------------------------------------------------------------------
// disabled
// ---------------------------------------------------------------------------

describe('OrigamItemGroup — disabled', () => {
    it('does not emit when a disabled item is clicked', async () => {
        const wrapper = mountGroup('', `
            <origam-item value="a" disabled v-slot="{ toggle }">
                <button class="item-a" @click="toggle">A</button>
            </origam-item>
        `)
        await wrapper.find('button.item-a').trigger('click')

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })

    it('does not emit when the whole GROUP is disabled', async () => {
        const wrapper = mountGroup('disabled')
        await wrapper.find('button.item-a').trigger('click')

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// next / prev — the exposed navigation API also drives the emit
// ---------------------------------------------------------------------------

describe('OrigamItemGroup — next / prev emit through the same channel', () => {
    it('next() emits the following item value', async () => {
        const wrapper = mountGroup()
        const group = wrapper.findComponent(OrigamItemGroup)

        ;(group.vm as unknown as { next: () => void }).next()
        await wrapper.vm.$nextTick()
        ;(group.vm as unknown as { next: () => void }).next()
        await wrapper.vm.$nextTick()

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['a', 'b'])
    })

    it('prev() wraps around to the last item', async () => {
        const wrapper = mountGroup()
        const group = wrapper.findComponent(OrigamItemGroup)

        ;(group.vm as unknown as { prev: () => void }).prev()
        await wrapper.vm.$nextTick()
        ;(group.vm as unknown as { prev: () => void }).prev()
        await wrapper.vm.$nextTick()

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['a', 'c'])
    })
})

// ---------------------------------------------------------------------------
// OrigamItem — group:selected
// ---------------------------------------------------------------------------
// `useGroupItem` fires `vm.emit('group:selected', { value })` on the ITEM.
// OrigamItem.vue declares NO `defineEmits` at all, so this event is entirely
// undeclared — it still reaches listeners (Vue's emit does not require a
// declaration) but it is absent from the component's public type surface.

describe('OrigamItem — group:selected', () => {
    it('emits group:selected with { value: true } when the item becomes selected', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-a').trigger('click')

        const emitted = wrapper.findAllComponents(OrigamItemGroupItem)[0].emitted('group:selected')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toEqual({ value: true })
    })

    it('emits group:selected with { value: false } when the item is deselected', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-a').trigger('click')
        await wrapper.find('button.item-b').trigger('click')

        const emitted = wrapper.findAllComponents(OrigamItemGroupItem)[0].emitted('group:selected')
        expect(emitted).toHaveLength(2)
        expect(emitted![1][0]).toEqual({ value: false })
    })

    it('does not emit group:selected for an untouched item', async () => {
        const wrapper = mountGroup()
        await wrapper.find('button.item-a').trigger('click')

        expect(wrapper.findAllComponents(OrigamItemGroupItem)[2].emitted('group:selected')).toBeUndefined()
    })
})
