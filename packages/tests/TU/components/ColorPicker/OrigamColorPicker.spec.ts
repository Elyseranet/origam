// Unit tests for <OrigamColorPicker> — commit propagation + canvas keyboard.
//
// Context: an e2e spec sat disabled for months claiming OrigamColorPicker
// "never emits" and that canvas selection was "not automatable in headless".
// Both were false — measured in chromium against a live Histoire: a canvas
// click, an RGBA number input, and the hue slider all commit fine, and the
// field receives the value. What these specs pin is (a) that the commit path
// really does reach `update:modelValue`, so the false claim cannot be made
// again without a red test, and (b) the ONE real defect found: the canvas
// announces itself as a keyboard control (`role="application"`, `tabindex=0`,
// live `aria-valuetext`) but ignored arrow keys whenever no colour was set
// yet — the exact state an empty field opens in, which is why the earlier
// probe concluded "arrows ignored entirely".

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamColorPicker from '@origam/components/ColorPicker/OrigamColorPicker.vue'
import OrigamColorPickerCanvas from '@origam/components/ColorPicker/OrigamColorPickerCanvas.vue'
import { COLOR_PICKER_MODES } from '@origam/consts'
import { KEYBOARD_VALUES } from '@origam/enums'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

class IntersectionObserverMock {
    observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn(); takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

class ResizeObserverMock {
    observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn()
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

async function mountPicker (props: Record<string, unknown> = {}) {
    const origam = createOrigam({})
    const wrapper = mount(OrigamColorPicker, {
        props: props as never,
        attachTo: document.body,
        global: { plugins: [origam] }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamColorPicker — shared mode table', () => {
    // `consts/ColorPicker/color-picker.const.ts` used to pull the colour
    // converters from the `../../utils` BARREL. consts <-> utils is a cycle,
    // so when the graph was entered through a ColorPicker SFC (which imports
    // `composables` -> `utils` before `consts`), the barrel was still
    // mid-execution and every `to` / `from` was captured as `undefined`.
    // Effect under vitest: any picker holding a non-null colour threw
    // "mode.to is not a function" on render, which made the component
    // impossible to unit-test at all. Importing `color.util` directly fixes
    // it. This spec fails again if anyone restores the barrel import.
    it('resolves to/from for every mode when entered via the component', () => {
        for (const key of Object.keys(COLOR_PICKER_MODES)) {
            const mode = (COLOR_PICKER_MODES as Record<string, { to?: unknown, from?: unknown }>)[key]

            expect(typeof mode.to, `${key}.to`).toBe('function')
            expect(typeof mode.from, `${key}.from`).toBe('function')
        }
    })

    it('mounts with a non-null colour without throwing', async () => {
        const wrapper = await mountPicker({ modelValue: '#42a5f5' })

        expect(wrapper.find('.origam-color-picker').exists()).toBe(true)
        expect(wrapper.findAll('.origam-color-picker-edit__input').length).toBeGreaterThan(0)
    })
})

describe('OrigamColorPicker — commit propagation', () => {
    it('emits update:modelValue when the canvas commits a colour', async () => {
        const wrapper = await mountPicker({ modelValue: '#000000' })

        wrapper.findComponent(OrigamColorPickerCanvas).vm
            .$emit('update:colorHsv', { h: 0, s: 0.63, v: 0.95, a: 1 })
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')

        expect(emitted).toBeTruthy()
        expect(emitted?.[0]?.[0]).toBe('#F25A5A')
    })

    it('keeps the emitted notation of the incoming model (object in, object out)', async () => {
        const wrapper = await mountPicker({ modelValue: { r: 0, g: 0, b: 0 } })

        wrapper.findComponent(OrigamColorPickerCanvas).vm
            .$emit('update:colorHsv', { h: 0, s: 0.63, v: 0.95, a: 1 })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toMatchObject({
            r: expect.any(Number), g: expect.any(Number), b: expect.any(Number)
        })
    })
})

describe('OrigamColorPickerCanvas — keyboard', () => {
    const canvasOf = (wrapper: ReturnType<typeof mount>) =>
        wrapper.findComponent(OrigamColorPickerCanvas)

    it('commits a saturation change on ArrowRight when a colour is set', async () => {
        const wrapper = await mountPicker({ modelValue: '#808080' })

        await canvasOf(wrapper).trigger('keydown', { key: KEYBOARD_VALUES.RIGHT })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    // THE REAL DEFECT. `handleKeyDown` bailed on `if (!hsv) return`, so a
    // picker with no colour yet — an empty OrigamColorPickerField is exactly
    // that — swallowed every arrow key, while a MOUSE click on the very same
    // canvas committed a colour just fine. A control that advertises
    // `role="application"` + `tabindex="0"` + a live `aria-valuetext` must
    // answer the keyboard wherever it answers the mouse.
    it('commits from a null colour on ArrowRight (keyboard/mouse parity)', async () => {
        const wrapper = await mountPicker({ modelValue: null })

        expect(canvasOf(wrapper).props('colorHsv')).toBeNull()

        await canvasOf(wrapper).trigger('keydown', { key: KEYBOARD_VALUES.RIGHT })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('commits from a null colour on ArrowUp (value axis)', async () => {
        const wrapper = await mountPicker({ modelValue: null })

        await canvasOf(wrapper).trigger('keydown', { key: KEYBOARD_VALUES.UP })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('still ignores keys it does not handle, on a null colour', async () => {
        const wrapper = await mountPicker({ modelValue: null })

        await canvasOf(wrapper).trigger('keydown', { key: KEYBOARD_VALUES.ENTER })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('ignores arrow keys when disabled', async () => {
        const wrapper = await mountPicker({ modelValue: null, disabled: true })

        await canvasOf(wrapper).trigger('keydown', { key: KEYBOARD_VALUES.RIGHT })
        await nextTick()

        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    // #402 — the canvas stayed focusable and keyboard-blocked correctly when
    // disabled, but never announced the state: `aria-disabled` was always
    // `undefined`, on a `role="application"` element with no native
    // `disabled` attribute to fall back on for assistive tech.
    it('exposes aria-disabled reflecting the disabled prop (#402 — it was undefined in both states before)', async () => {
        const disabledWrapper = await mountPicker({ modelValue: null, disabled: true })
        expect(canvasOf(disabledWrapper).attributes('aria-disabled')).toBe('true')

        const enabledWrapper = await mountPicker({ modelValue: null, disabled: false })
        expect(canvasOf(enabledWrapper).attributes('aria-disabled')).toBe('false')
    })
})
