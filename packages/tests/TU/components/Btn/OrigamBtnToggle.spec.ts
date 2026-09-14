// Unit tests for <OrigamBtnToggle> — emit contract.
//
// `update:modelValue` is the component's entire purpose and had no assertion
// anywhere (neither e2e nor unit) before this file. The toggle wraps
// <OrigamBtnGroup> and drives selection through `useGroup`, so the emit
// travels: <origam-btn> click → useGroupItem.toggle → useGroup.select →
// useVModel.set → vm.emit('update:modelValue').
//
// Every assertion checks the PAYLOAD, not merely that something was emitted:
// a group component that emits the wrong value is indistinguishable from a
// working one if you only assert `toBeTruthy()`.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamBtnToggle from '@origam/components/Btn/OrigamBtnToggle.vue'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import { createOrigam } from '@origam/origam'

const BTN_MARKUP = `
    <origam-btn value="left" text="Left"/>
    <origam-btn value="center" text="Center"/>
    <origam-btn value="right" text="Right"/>
`

function mountToggle (attrs = '', markup: string = BTN_MARKUP) {
    const Host = defineComponent({
        components: { OrigamBtnToggle, OrigamBtn },
        template: `<origam-btn-toggle ${attrs}>${markup}</origam-btn-toggle>`
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

function modelUpdates (wrapper: VueWrapper): unknown[][] {
    return (wrapper.findComponent(OrigamBtnToggle).emitted('update:modelValue') ?? []) as unknown[][]
}

function clickBtn (wrapper: VueWrapper, index: number) {
    return wrapper.findAll('button.origam-btn')[index].trigger('click')
}

// ---------------------------------------------------------------------------
// update:modelValue — single selection
// ---------------------------------------------------------------------------

describe('OrigamBtnToggle — update:modelValue (single selection)', () => {
    it('renders one button per child', () => {
        expect(mountToggle().findAll('button.origam-btn')).toHaveLength(3)
    })

    it('does not emit before any click', () => {
        expect(modelUpdates(mountToggle())).toHaveLength(0)
    })

    it('emits the clicked button value', async () => {
        const wrapper = mountToggle()
        await clickBtn(wrapper, 1)

        const updates = modelUpdates(wrapper)
        expect(updates).toHaveLength(1)
        expect(updates[0][0]).toBe('center')
    })

    it('emits the new value when the selection moves', async () => {
        const wrapper = mountToggle()
        await clickBtn(wrapper, 0)
        await clickBtn(wrapper, 2)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual(['left', 'right'])
    })

    it('emits undefined when the active button is toggled off', async () => {
        const wrapper = mountToggle()
        await clickBtn(wrapper, 0)
        await clickBtn(wrapper, 0)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toBeUndefined()
    })

    it('marks the selected button active in the DOM', async () => {
        const wrapper = mountToggle()
        await clickBtn(wrapper, 1)

        expect(wrapper.findAll('button.origam-btn')[1].classes()).toContain('origam-btn--active')
        expect(wrapper.findAll('button.origam-btn')[0].classes()).not.toContain('origam-btn--active')
    })

    // `activeClass` must follow the SAME group-selection-aware `isActive` as
    // `origam-btn--active` above, not useStateFlag's own narrower `isOn` (which
    // only reflects the raw `active` prop — never `group.isSelected`). None of
    // these buttons set an `active` prop; only the group's selection drives it.
    it('applies a per-button activeClass only to the selected button (group-selection driven, no `active` prop set)', async () => {
        const wrapper = mountToggle('', `
            <origam-btn value="left" text="Left" active-class="btn-is-selected"/>
            <origam-btn value="center" text="Center" active-class="btn-is-selected"/>
            <origam-btn value="right" text="Right" active-class="btn-is-selected"/>
        `)
        await clickBtn(wrapper, 1)

        const buttons = wrapper.findAll('button.origam-btn')
        expect(buttons[1].classes()).toContain('btn-is-selected')
        expect(buttons[0].classes()).not.toContain('btn-is-selected')
        expect(buttons[2].classes()).not.toContain('btn-is-selected')
    })
})

// ---------------------------------------------------------------------------
// update:modelValue — multiple
// ---------------------------------------------------------------------------

describe('OrigamBtnToggle — update:modelValue (multiple)', () => {
    it('emits an array that accumulates the selected values', async () => {
        const wrapper = mountToggle('multiple')
        await clickBtn(wrapper, 0)
        await clickBtn(wrapper, 2)

        expect(modelUpdates(wrapper).map(args => args[0])).toEqual([['left'], ['left', 'right']])
    })

    it('drops a value from the array when its button is toggled off', async () => {
        const wrapper = mountToggle('multiple')
        await clickBtn(wrapper, 0)
        await clickBtn(wrapper, 1)
        await clickBtn(wrapper, 0)

        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['center'])
    })
})

// ---------------------------------------------------------------------------
// Guards that must SUPPRESS the emit
// ---------------------------------------------------------------------------

describe('OrigamBtnToggle — mandatory', () => {
    it('emits the forced initial selection on mount', () => {
        expect(modelUpdates(mountToggle('mandatory')).at(-1)?.[0]).toBe('left')
    })

    it('does NOT emit when deselecting the only selected button', async () => {
        const wrapper = mountToggle('mandatory')
        const before = modelUpdates(wrapper).length

        await clickBtn(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(before)
    })
})

describe('OrigamBtnToggle — max', () => {
    it('stops emitting once max selections are reached', async () => {
        const wrapper = mountToggle('multiple :max="2"')
        await clickBtn(wrapper, 0)
        await clickBtn(wrapper, 1)

        const before = modelUpdates(wrapper).length
        await clickBtn(wrapper, 2)

        expect(modelUpdates(wrapper)).toHaveLength(before)
        expect(modelUpdates(wrapper).at(-1)?.[0]).toEqual(['left', 'center'])
    })
})

describe('OrigamBtnToggle — disabled', () => {
    it('does not emit when the whole toggle is disabled', async () => {
        const wrapper = mountToggle('disabled')
        await clickBtn(wrapper, 0)

        expect(modelUpdates(wrapper)).toHaveLength(0)
    })
})
