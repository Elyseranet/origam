// #1398 (lot 3) — pins OrigamSelect's keyboard handling (`handleKeydown`) and
// `handleSelect` as observed from the outside (emitted v-model, input a11y
// state, rendered chips). Recorded on the UNREFACTORED code, then re-run after
// splitting those handlers to lower their cognitive complexity (S3776).
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import { createOrigam } from '@origam/origam'

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

const ITEMS = [ 'Apple', 'Banana', 'Cherry', 'Date' ]
const wrappers: Array<VueWrapper> = []

afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount())
})

const setup = async (props: Record<string, unknown>) => {
    const wrapper = mount(OrigamSelect, {
        props: { items: ITEMS, ...props } as never,
        attachTo: document.body,
        global: { plugins: [ createOrigam() ] }
    })
    wrappers.push(wrapper)
    await nextTick()

    return wrapper
}

const norm = (s: string) => s.replace(/\d{3,}/g, 'N')

/** One observable record: a11y state of the input, last emitted model, chips. */
const observe = (wrapper: VueWrapper) => {
    const input = wrapper.find('input')
    const emitted = wrapper.emitted('update:modelValue') ?? []

    return {
        expanded: input.attributes('aria-expanded'),
        active: norm(input.attributes('aria-activedescendant') ?? ''),
        value: (input.element as HTMLInputElement).value,
        lastModel: JSON.stringify(emitted.at(-1)),
        emits: emitted.length,
        chips: norm(wrapper.findAll('.origam-select__selection').map((c) => c.attributes('class')).join('|'))
    }
}

const press = async (wrapper: VueWrapper, key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
    wrapper.find('input').element.dispatchEvent(event)
    await nextTick()
    await nextTick()

    return { key, prevented: event.defaultPrevented, ...observe(wrapper) }
}

const run = async (wrapper: VueWrapper, keys: Array<string | [ string, KeyboardEventInit ]>) => {
    const trace = []

    for (const k of keys) {
        const [ key, init ] = typeof k === 'string' ? [ k, {} ] : k
        trace.push(await press(wrapper, key, init))
    }

    return trace
}

describe('OrigamSelect keyboard characterization (#1398 lot 3)', () => {
    it('plain select: open, navigate, wrap, Home/End, select with Enter, Escape', async () => {
        const w = await setup({})
        expect(await run(w, [
            'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp',
            'End', 'Home', 'ArrowDown', 'Enter', 'Escape', ' ', 'Tab'
        ])).toMatchSnapshot()
    })

    it('plain select: type-ahead lookup + modifiers + readonly + multiple', async () => {
        const w = await setup({})
        expect(await run(w, [ 'c', 'a', [ 'd', { ctrlKey: true } ], [ 'b', { metaKey: true } ], 'F1', 'b' ])).toMatchSnapshot()

        const ro = await setup({ readonly: true })
        expect(await run(ro, [ 'ArrowDown', 'Enter', 'c' ])).toMatchSnapshot()

        const multi = await setup({ multiple: true })
        expect(await run(multi, [ 'b', 'ArrowDown', 'ArrowDown', 'Enter', 'ArrowDown', 'Enter', 'Enter' ])).toMatchSnapshot()
    })

    it('autocomplete single: Backspace / Delete deselect, Enter / Tab with highlight-first', async () => {
        const w = await setup({ autocomplete: true, modelValue: 'Banana' })
        expect(await run(w, [ 'Backspace', 'ArrowDown', 'Enter', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight' ])).toMatchSnapshot()

        const w2 = await setup({ autocomplete: true })
        const input = w2.find('input')
        await input.setValue('ch')
        expect(await run(w2, [ 'ArrowDown', 'Enter', 'Escape', 'Backspace' ])).toMatchSnapshot()
    })

    it('autocomplete multiple: selection index navigation, Backspace on chips', async () => {
        const w = await setup({ autocomplete: true, multiple: true, modelValue: [ 'Apple', 'Banana', 'Cherry' ] })
        expect(await run(w, [
            'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowRight',
            'Backspace', 'Backspace', 'ArrowLeft', 'Delete', 'ArrowRight', 'Backspace', 'Home', 'End', 'Enter'
        ])).toMatchSnapshot()

        const w2 = await setup({ autocomplete: true, multiple: true, clearOnSelect: true })
        await w2.find('input').setValue('a')
        expect(await run(w2, [ 'ArrowDown', 'Enter', 'ArrowDown', 'Enter', 'ArrowLeft', 'Backspace', 'Escape' ])).toMatchSnapshot()
    })
})
