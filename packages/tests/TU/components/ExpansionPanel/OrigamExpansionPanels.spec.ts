// Unit tests for <OrigamExpansionPanels> — emit contract.
//
// <OrigamExpansionPanel> already had unit coverage; the PLURAL container that
// owns the selection model had none, and `update:modelValue` — the event that
// tells a consumer which panel is open — was asserted nowhere.
//
// The emit path is: header <button> click → OrigamExpansionPanel's group item
// toggle → useGroup.select → useVModel.set → vm.emit('update:modelValue') on
// <OrigamExpansionPanels>.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'
import { createOrigam } from '@origam/origam'

const PANEL_MARKUP = `
    <origam-expansion-panel value="one" title="One"/>
    <origam-expansion-panel value="two" title="Two"/>
    <origam-expansion-panel value="three" title="Three"/>
`

function mountPanels (attrs = '', markup: string = PANEL_MARKUP) {
    const Host = defineComponent({
        components: { OrigamExpansionPanels, OrigamExpansionPanel },
        template: `<origam-expansion-panels ${attrs}>${markup}</origam-expansion-panels>`
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

function modelUpdates (wrapper: VueWrapper): unknown[][] {
    return (wrapper.findComponent(OrigamExpansionPanels).emitted('update:modelValue') ?? []) as unknown[][]
}

function clickHeader (wrapper: VueWrapper, index: number) {
    return wrapper.findAll('button.origam-expansion-panel-header')[index].trigger('click')
}

// ---------------------------------------------------------------------------
// update:modelValue — single (accordion-style default)
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — update:modelValue (single)', () => {
    it('renders one header button per panel', () => {
        expect(mountPanels().findAll('button.origam-expansion-panel-header')).toHaveLength(3)
    })

    it('does not emit before any header is clicked', () => {
        expect(modelUpdates(mountPanels())).toHaveLength(0)
    })

    it('emits the opened panel value', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 1)

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('two')
    })

    it('emits the new value when another panel is opened', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 2)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['one', 'three'])
    })

    it('emits undefined when the open panel is closed again', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBeUndefined()
    })

    it('marks the open panel active and sets aria-expanded alongside the emit', async () => {
        const wrapper = mountPanels()
        await clickHeader(wrapper, 1)

        const headers = wrapper.findAll('button.origam-expansion-panel-header')
        expect(headers[1].attributes('aria-expanded')).toBe('true')
        expect(headers[0].attributes('aria-expanded')).toBe('false')
        expect(wrapper.findAllComponents(OrigamExpansionPanel)[1].classes())
            .toContain('origam-expansion-panel--active')
    })
})

// ---------------------------------------------------------------------------
// update:modelValue — multiple
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — update:modelValue (multiple)', () => {
    it('accumulates open panels into an array', async () => {
        const wrapper = mountPanels('multiple')
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 2)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual([['one'], ['one', 'three']])
    })

    it('drops a value when its panel is closed', async () => {
        const wrapper = mountPanels('multiple')
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 1)
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['two'])
    })
})

// ---------------------------------------------------------------------------
// Guards that must SUPPRESS the emit
// ---------------------------------------------------------------------------

describe('OrigamExpansionPanels — mandatory', () => {
    it('emits the forced initial panel on mount', () => {
        expect(modelUpdates(mountPanels('mandatory')).at(-1)?.[0]).toBe('one')
    })

    it('does NOT emit when closing the only open panel', async () => {
        const wrapper = mountPanels('mandatory')
        const before = modelUpdates(wrapper).length

        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(before)
    })
})

describe('OrigamExpansionPanels — max', () => {
    it('stops emitting once max open panels is reached', async () => {
        const wrapper = mountPanels('multiple :max="2"')
        await clickHeader(wrapper, 0)
        await clickHeader(wrapper, 1)

        const before = modelUpdates(wrapper).length
        await clickHeader(wrapper, 2)

        expect(modelUpdates(wrapper)).toHaveLength(before)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['one', 'two'])
    })
})

describe('OrigamExpansionPanels — disabled', () => {
    it('does not emit when the whole group is disabled', async () => {
        const wrapper = mountPanels('disabled')
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })

    it('does not emit when the clicked panel itself is disabled', async () => {
        const wrapper = mountPanels('', `
            <origam-expansion-panel value="one" title="One" disabled/>
            <origam-expansion-panel value="two" title="Two"/>
        `)
        await clickHeader(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })
})
