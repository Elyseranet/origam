// issue #443 — <OrigamDatePickerHeader> root `@click` was keyboard-unreachable.
// <OrigamDatePicker> always wires `@click="handleHeaderClick"` on the header
// (see OrigamDatePicker.spec.ts, #410): clicking it while NOT in month view
// switches back to month view. No tabindex/role/keydown existed at all, so a
// keyboard user tabbing through the picker could never trigger it — the
// header was a dead stop for them regardless of view mode.
//
// `isClickable` mirrors `useAdjacent.isPrependClickable` / `useLink.isClickable`:
// it reflects whether a `click` LISTENER is attached (always true here, since
// OrigamDatePicker always binds one), not whether clicking would currently be
// a no-op (that branch lives inside `handleHeaderClick` itself, same axis a
// plain `<button>` distinguishes via `disabled`, not via tabindex).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePicker from '@origam/components/DatePicker/OrigamDatePicker.vue'
import { createOrigam } from '@origam/origam'

function mountPicker (props: Record<string, unknown> = {}) {
    return mount(OrigamDatePicker, {
        props: { modelValue: '2024-06-15', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamDatePickerHeader — root keyboard activation (issue #443)', () => {
    it('carries role="button" + tabindex="0"', () => {
        const wrapper = mountPicker()
        const header = wrapper.find('.origam-date-picker-header')
        expect(header.attributes('role')).toBe('button')
        expect(header.attributes('tabindex')).toBe('0')
    })

    it('viewMode="months" + Enter → switches view back to month (real navigation)', async () => {
        const wrapper = mountPicker({ viewMode: 'months' })
        const header = wrapper.find('.origam-date-picker-header')

        await header.trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('update:viewMode')?.at(-1)).toEqual(['month'])
    })

    it('viewMode="years" + Space → switches view back to month', async () => {
        const wrapper = mountPicker({ viewMode: 'years' })
        const header = wrapper.find('.origam-date-picker-header')

        await header.trigger('keydown', { key: ' ' })

        expect(wrapper.emitted('update:viewMode')?.at(-1)).toEqual(['month'])
    })

    it('viewMode="month" (already there) + Enter → no update:viewMode emitted (legitimate no-op)', async () => {
        const wrapper = mountPicker({ viewMode: 'month' })
        const header = wrapper.find('.origam-date-picker-header')

        await header.trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('update:viewMode')).toBeFalsy()
    })

    it('unrelated key (Tab) → no navigation', async () => {
        const wrapper = mountPicker({ viewMode: 'months' })
        const header = wrapper.find('.origam-date-picker-header')

        await header.trigger('keydown', { key: 'Tab' })

        expect(wrapper.emitted('update:viewMode')).toBeFalsy()
    })
})
