// C5 coverage — both emits of the Window family were DECLARED and really
// fired, but neither had a single assertion on the component that declares
// them:
//
//   * `<OrigamWindow>` → `update:modelValue` — covered only indirectly, via
//     `useGroup`'s own composable spec.
//   * `<OrigamWindowItem>` → `group:selected` — covered only via
//     `group.composable.spec.ts` and `OrigamItemGroup.spec.ts`, i.e. on a
//     DIFFERENT component.
//
// A declared-but-unasserted emit is exactly the shape of defect that stays
// green after it breaks, so each assertion below reads the real payload,
// not just the fact that something was emitted.
//
// `h()` builds the slot children on purpose: a template STRING passed as a
// VTU slot is rendered as escaped text and mounts zero items.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { createOrigam } from '@origam/origam'

import OrigamWindow from '@origam/components/Window/OrigamWindow.vue'
import OrigamWindowItem from '@origam/components/Window/OrigamWindowItem.vue'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

// ⛔ The tick after mount() is load-bearing, not defensive. The items
// register with `useGroup` from their own setup, i.e. AFTER the parent's
// first render pass — so during that first pass `group.items` is still
// empty, `activeIndex` is -1, and BOTH arrows evaluate as reachable. A
// synchronous `wrapper.find('.origam-window__next')` therefore reads a DOM
// in which prev/next are effectively inverted, which reads exactly like a
// product defect and is not one. Measured on this component: before the
// tick `prevExists: true / nextExists: false` on slide 0; after it,
// `prevExists: false / nextExists: true`, which is correct.
async function mountWindow (props: Record<string, unknown> = {}, itemProps: Record<string, unknown> = {}) {
    const wrapper = mount(OrigamWindow, {
        props: { modelValue: 'a', ...props } as never,
        slots: {
            default: () => [
                h(OrigamWindowItem, { value: 'a', ...itemProps }, { default: () => 'slide A' }),
                h(OrigamWindowItem, { value: 'b' }, { default: () => 'slide B' }),
                h(OrigamWindowItem, { value: 'c' }, { default: () => 'slide C' })
            ]
        },
        global: { plugins: [createOrigam()] }
    })

    await nextTick()

    return wrapper
}

describe('OrigamWindow — update:modelValue (C5)', () => {
    it('mounts the three items (guards the escaped-slot-string trap)', async () => {
        expect((await mountWindow()).findAll('.origam-window-item')).toHaveLength(3)
    })

    it('renders next-only on the first slide and prev-only on the last (non-continuous)', async () => {
        const first = await mountWindow()
        expect(first.find('.origam-window__prev').exists()).toBe(false)
        expect(first.find('.origam-window__next').exists()).toBe(true)

        const last = await mountWindow({ modelValue: 'c' })
        expect(last.find('.origam-window__prev').exists()).toBe(true)
        expect(last.find('.origam-window__next').exists()).toBe(false)
    })

    it('emits update:modelValue with the NEXT item value when the next arrow is clicked', async () => {
        const wrapper = await mountWindow()

        await wrapper.find('.origam-window__next').trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['b'])
    })

    it('emits update:modelValue with the PREVIOUS item value when the prev arrow is clicked', async () => {
        const wrapper = await mountWindow({ modelValue: 'b' })

        await wrapper.find('.origam-window__prev').trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual(['a'])
    })

    it('walks the full sequence a -> b -> c across successive next clicks', async () => {
        const wrapper = await mountWindow()

        await wrapper.find('.origam-window__next').trigger('click')
        await nextTick()
        await wrapper.setProps({ modelValue: 'b' } as never)
        await nextTick()

        await wrapper.find('.origam-window__next').trigger('click')
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted!.map(args => args[0])).toEqual(['b', 'c'])
    })

    it('stays silent until an arrow is actually clicked', async () => {
        const wrapper = await mountWindow()

        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
})

describe('OrigamWindowItem — group:selected (C5)', () => {
    it('emits group:selected {value:true} on the item that becomes selected', async () => {
        const wrapper = await mountWindow()
        const items = wrapper.findAllComponents(OrigamWindowItem)

        await wrapper.setProps({ modelValue: 'b' } as never)
        await nextTick()

        const emitted = items[1].emitted('group:selected')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1]).toEqual([{ value: true }])
    })

    it('emits group:selected {value:false} on the item that becomes deselected', async () => {
        const wrapper = await mountWindow()
        const items = wrapper.findAllComponents(OrigamWindowItem)

        await wrapper.setProps({ modelValue: 'b' } as never)
        await nextTick()

        const emitted = items[0].emitted('group:selected')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1]).toEqual([{ value: false }])
    })

    it('leaves an untouched item silent', async () => {
        const wrapper = await mountWindow()
        const items = wrapper.findAllComponents(OrigamWindowItem)

        await wrapper.setProps({ modelValue: 'b' } as never)
        await nextTick()

        expect(items[2].emitted('group:selected')).toBeUndefined()
    })
})
