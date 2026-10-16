// Regression for #1152 — `<OrigamTextareaField>` called `useDragResizer`
// from inside a `watch` on `[verticalDragger, minHeight, maxHeight]`.
// A watch callback runs outside any component instance, so the composable's
// `onUnmounted` hook was rejected by Vue ("onUnmounted is called when there
// is no active component instance") and the window-listener cleanup it was
// meant to register never existed. Each change of a bound re-ran the
// callback and attached ONE MORE `mousedown` listener on the grip, each one
// carrying the bounds of the moment it was created.
//
// Observed first in the playground e2e (#1152): the warning's stack ran
// `useDragResizer (dragResizer.composable.ts:25) ← OrigamTextareaField.vue`
// inside `baseWatchOptions.call`.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OrigamTextareaField from '@origam/components/TextareaField/OrigamTextareaField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

const LIFECYCLE_OUTSIDE_SETUP = 'is called when there is no active component instance'

const captureWarnings = () => {
    const warnings: Array<string> = []
    vi.spyOn(console, 'warn').mockImplementation((...args: Array<unknown>) => {
        warnings.push(String(args[0]))
    })

    return warnings
}

describe('OrigamTextareaField — resize grip wiring (#1152)', () => {
    afterEach(() => vi.restoreAllMocks())

    it('mounting, then changing the bounds, never registers a lifecycle hook outside setup', async () => {
        const warnings = captureWarnings()

        const wrapper = mount(OrigamTextareaField, {
            props: { rows: 3 } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        expect(wrapper.find('.origam-textarea-field__grip').exists()).toBe(true)

        await wrapper.setProps({ rows: 6 } as never)
        await nextTick()
        await wrapper.setProps({ maxRows: 10 } as never)
        await nextTick()

        wrapper.unmount()

        expect(warnings.filter((w) => w.includes(LIFECYCLE_OUTSIDE_SETUP))).toEqual([])
    })

    it('the grip carries ONE mousedown listener, whatever the number of bound changes', async () => {
        const added: Array<string> = []
        const original = HTMLElement.prototype.addEventListener

        vi.spyOn(HTMLElement.prototype, 'addEventListener').mockImplementation(function (this: HTMLElement, type: string, ...rest: Array<unknown>) {
            if (type === 'mousedown' && this.classList.contains('origam-textarea-field__grip')) added.push(type)

            return original.call(this, type, ...(rest as [EventListenerOrEventListenerObject]))
        })

        const wrapper = mount(OrigamTextareaField, {
            props: { rows: 3 } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        await wrapper.setProps({ rows: 6 } as never)
        await nextTick()
        await wrapper.setProps({ rows: 8 } as never)
        await nextTick()

        wrapper.unmount()

        expect(added).toEqual(['mousedown'])
    })
})
