// Unit tests for <OrigamStepperItem> — the child of <OrigamStepper>
//
// Context: OrigamStepper.spec.ts stubs OrigamStepperItem entirely, so none
// of THIS component's own logic is exercised anywhere. Two computeds carry
// real, recently-touched risk:
//
//  - `isClickable` — the component's own inline comment documents a real
//    pre-fix bug: Vue 3 auto-coerces an unprovided Boolean prop to `false`
//    (never `undefined`), so a naive `props.clickable !== undefined` check
//    always won and the item never consulted the injected stepper context.
//    The fixed logic is `props.clickable === true ? true : stepper?.clickable`.
//    This file locks that precedence down directly (no e2e round-trip).
//  - `resolvedStatus` — derives from STEPPER_ITEM_STATUS (PENDING / ACTIVE /
//    DONE / ERROR), itself compared against the injected modelValue / the
//    item's own index. A member swap in that enum is invisible to
//    TypeScript and would only be caught by asserting the real rendered
//    class / icon, which is what this file does.
//
// Strategy: mount OrigamStepperItem standalone (no injected context) for the
// "no stepper" fallback paths, and inside a minimal provider component that
// supplies ORIGAM_STEPPER_KEY with real refs for the inject-priority paths.

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'

import OrigamStepperItem from '@origam/components/Stepper/OrigamStepperItem.vue'
import { ORIGAM_STEPPER_KEY } from '@origam/consts'
import type { IStepperProvide } from '@origam/interfaces'
import { createOrigam } from '@origam/origam'

const mountItem = (props: Record<string, any> = {}) =>
    mount(OrigamStepperItem, {
        props: { index: 0, ...props },
        global: { plugins: [createOrigam()] }
    })

const mountItemWithStepper = (
    provideValue: Partial<IStepperProvide>,
    itemProps: Record<string, any> = {}
) => {
    const modelValue = provideValue.modelValue ?? ref(0)
    const clickable = provideValue.clickable ?? computed(() => false)
    const orientation = provideValue.orientation ?? computed(() => 'horizontal' as const)
    const color = provideValue.color ?? computed(() => undefined)

    const Wrapper = defineComponent({
        setup() {
            return () => h(OrigamStepperItem, { index: 0, ...itemProps })
        }
    })

    const wrapper = mount(Wrapper, {
        global: {
            plugins: [createOrigam()],
            provide: {
                [ORIGAM_STEPPER_KEY as unknown as string]: { modelValue, orientation, clickable, color }
            }
        }
    })

    return { wrapper, modelValue, clickable }
}

// ---------------------------------------------------------------------------
// isClickable — prop vs inject precedence
// ---------------------------------------------------------------------------
describe('OrigamStepperItem — isClickable resolution', () => {
    it('renders a <div> (not clickable) when standalone with no clickable prop and no stepper context', () => {
        const wrapper = mountItem()
        expect(wrapper.element.tagName.toLowerCase()).toBe('div')
        wrapper.unmount()
    })

    it('renders a <button> when clickable=true is passed explicitly (no stepper context)', () => {
        const wrapper = mountItem({ clickable: true })
        expect(wrapper.element.tagName.toLowerCase()).toBe('button')
        wrapper.unmount()
    })

    it('renders a <button> when the item has NO own clickable prop but the injected stepper.clickable is true (regression: Vue coerces unset Boolean prop to false, not undefined)', () => {
        const { wrapper } = mountItemWithStepper({ clickable: computed(() => true) })
        expect(wrapper.find('.origam-stepper-item').element.tagName.toLowerCase()).toBe('button')
        wrapper.unmount()
    })

    it('renders a <div> when the injected stepper.clickable is false and the item has no own clickable prop', () => {
        const { wrapper } = mountItemWithStepper({ clickable: computed(() => false) })
        expect(wrapper.find('.origam-stepper-item').element.tagName.toLowerCase()).toBe('div')
        wrapper.unmount()
    })

    it('item clickable=true OVERRIDES an injected stepper.clickable=false', () => {
        const { wrapper } = mountItemWithStepper({ clickable: computed(() => false) }, { clickable: true })
        expect(wrapper.find('.origam-stepper-item').element.tagName.toLowerCase()).toBe('button')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// handleClick — emits + drives stepper.modelValue when clickable
// ---------------------------------------------------------------------------
describe('OrigamStepperItem — click behaviour', () => {
    it('does not emit "click" when not clickable', async () => {
        const wrapper = mountItem({ index: 2 })
        await wrapper.trigger('click')
        expect(wrapper.emitted('click')).toBeFalsy()
        wrapper.unmount()
    })

    it('emits "click" with its own index when clickable=true', async () => {
        const wrapper = mountItem({ index: 2, clickable: true })
        await wrapper.trigger('click')
        expect(wrapper.emitted('click')).toBeTruthy()
        expect(wrapper.emitted('click')![0]).toEqual([2])
        wrapper.unmount()
    })

    it('clicking a clickable item (via injected stepper.clickable) sets stepper.modelValue to its own index', async () => {
        const { wrapper, modelValue } = mountItemWithStepper(
            { modelValue: ref(0), clickable: computed(() => true) },
            { index: 3 }
        )
        await wrapper.find('.origam-stepper-item').trigger('click')
        expect(modelValue.value).toBe(3)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// resolvedStatus — explicit prop wins over the computed-from-modelValue path
// ---------------------------------------------------------------------------
describe('OrigamStepperItem — resolvedStatus precedence', () => {
    it('an explicit status prop wins even when index/modelValue would compute a different status', () => {
        const { wrapper } = mountItemWithStepper({ modelValue: ref(5) }, { index: 0, status: 'error' })
        expect(wrapper.find('.origam-stepper-item').classes()).toContain('origam-stepper-item--error')
        wrapper.unmount()
    })

    it('index < stepper.modelValue resolves to "done" when no explicit status is set', () => {
        const { wrapper } = mountItemWithStepper({ modelValue: ref(2) }, { index: 0 })
        expect(wrapper.find('.origam-stepper-item').classes()).toContain('origam-stepper-item--done')
        wrapper.unmount()
    })

    it('index === stepper.modelValue resolves to "active"', () => {
        const { wrapper } = mountItemWithStepper({ modelValue: ref(1) }, { index: 1 })
        expect(wrapper.find('.origam-stepper-item').classes()).toContain('origam-stepper-item--active')
        wrapper.unmount()
    })

    it('index > stepper.modelValue resolves to "pending"', () => {
        const { wrapper } = mountItemWithStepper({ modelValue: ref(0) }, { index: 1 })
        expect(wrapper.find('.origam-stepper-item').classes()).toContain('origam-stepper-item--pending')
        wrapper.unmount()
    })

    it('standalone (no stepper), no status, index=0 defaults to "active" (modelValue falls back to 0)', () => {
        const wrapper = mountItem({ index: 0 })
        expect(wrapper.classes()).toContain('origam-stepper-item--active')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Indicator content — DONE shows a check icon, ERROR an exclamation icon,
// otherwise the 1-based step number (index + 1)
// ---------------------------------------------------------------------------
describe('OrigamStepperItem — indicator content', () => {
    it('shows the 1-based step number when status is pending', () => {
        const wrapper = mountItem({ index: 2, status: 'pending' })
        expect(wrapper.find('.origam-stepper-item__indicator').text()).toBe('3')
        wrapper.unmount()
    })

    it('shows an origam-icon (not the step number) when status is done', () => {
        const wrapper = mountItem({ index: 2, status: 'done' })
        const indicator = wrapper.find('.origam-stepper-item__indicator')
        expect(indicator.find('.origam-icon').exists()).toBe(true)
        expect(indicator.text()).not.toBe('3')
        wrapper.unmount()
    })

    it('shows an origam-icon (not the step number) when status is error', () => {
        const wrapper = mountItem({ index: 2, status: 'error' })
        const indicator = wrapper.find('.origam-stepper-item__indicator')
        expect(indicator.find('.origam-icon').exists()).toBe(true)
        expect(indicator.text()).not.toBe('3')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// aria-current — only set to "step" on the active item
// ---------------------------------------------------------------------------
describe('OrigamStepperItem — aria-current', () => {
    it('sets aria-current="step" only when resolvedStatus is active', () => {
        const wrapper = mountItem({ index: 0, status: 'active' })
        expect(wrapper.attributes('aria-current')).toBe('step')
        wrapper.unmount()
    })

    it('does not set aria-current for a done item', () => {
        const wrapper = mountItem({ index: 0, status: 'done' })
        expect(wrapper.attributes('aria-current')).toBeUndefined()
        wrapper.unmount()
    })
})
