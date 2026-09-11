// issue #443 — OrigamField had 4 keyboard-unreachable click sites:
// root (legitimate — see below), prependInner, the clear button, appendInner.
//
// - Clear button: was a bare `<div @mousedown>` wrapping an `aria-hidden`
//   icon whose own `@keydown`/`@focus`/`@blur` could never fire (OrigamIcon
//   never sets `tabindex`). It is unconditionally actionable whenever
//   rendered (`v-show="dirty"` already gates visibility to "there IS
//   something to clear") — now a real `<button type="button">`.
// - prependInner / appendInner: `click:prependInner` / `click:appendInner`
//   are a real public event API (used by OrigamPasswordField's show/hide
//   toggle, among others). They become a real tab stop ONLY when the
//   consumer actually attaches a listener — mirrors `useIconAccessibility`'s
//   `isClickable` contract, so a purely decorative icon stays exactly as
//   inert as before.
// - Root `@click="handleClick"` is NOT in scope here: it only conditionally
//   calls `e.preventDefault()` to keep focus on the real `<input>` when a
//   click lands elsewhere in the field chrome — it performs no distinct
//   action of its own and the input remains independently focusable/
//   operable via Tab, so it needs no separate keyboard path.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamField from '@origam/components/Field/OrigamField.vue'
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

function mountField (props: Record<string, unknown> = {}, listeners: Record<string, unknown> = {}) {
    return mount(OrigamField, {
        props: { label: 'Email', clearable: true, ...props, ...listeners } as never,
        slots: {
            default: '<input class="origam-field__input"/>'
        },
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamField — clear button (issue #443)', () => {
    it('renders a real <button type="button">, not a <div>', () => {
        const wrapper = mountField()
        const clearable = wrapper.find('.origam-field__clearable')
        expect(clearable.element.tagName).toBe('BUTTON')
        expect(clearable.attributes('type')).toBe('button')
    })

    it('carries a non-empty accessible name (aria-label)', () => {
        const wrapper = mountField()
        const clearable = wrapper.find('.origam-field__clearable')
        expect(clearable.attributes('aria-label')).toBeTruthy()
        expect(clearable.attributes('aria-label')).toContain('Email')
    })

    it('is reachable by Tab — no explicit tabindex needed, native <button> is a tab stop', () => {
        const wrapper = mountField()
        const clearable = wrapper.find('.origam-field__clearable')
        // A native <button> is keyboard-focusable without an explicit tabindex —
        // asserting the ABSENCE of a disabling tabindex is the correct check here.
        expect(clearable.attributes('tabindex')).not.toBe('-1')
    })

    it('mousedown emits click:clear — trigger stays mousedown (not click) to preserve the pre-existing no-blur behaviour', async () => {
        const wrapper = mountField()
        await wrapper.find('.origam-field__clearable').trigger('mousedown')
        expect(wrapper.emitted('click:clear')).toBeTruthy()
    })

    it('Enter keydown ALSO emits click:clear — the keyboard path', async () => {
        const wrapper = mountField()
        await wrapper.find('.origam-field__clearable').trigger('keydown', { key: 'Enter' })
        expect(wrapper.emitted('click:clear')).toBeTruthy()
    })

    it('Space keydown ALSO emits click:clear', async () => {
        const wrapper = mountField()
        await wrapper.find('.origam-field__clearable').trigger('keydown', { key: ' ' })
        expect(wrapper.emitted('click:clear')).toBeTruthy()
    })

    it('unrelated keydown (Tab) does not emit click:clear', async () => {
        const wrapper = mountField()
        await wrapper.find('.origam-field__clearable').trigger('keydown', { key: 'Tab' })
        expect(wrapper.emitted('click:clear')).toBeFalsy()
    })
})

describe('OrigamField — prependInner / appendInner keyboard activation (issue #443)', () => {
    it('no click:prependInner listener attached → zone stays inert (no role, no tabindex)', () => {
        const wrapper = mountField({ prependInnerIcon: 'mdi-magnify' })
        const zone = wrapper.find('.origam-field__prepend-inner')
        expect(zone.attributes('role')).toBeUndefined()
        expect(zone.attributes('tabindex')).toBeUndefined()
    })

    it('@click:prependInner attached → zone becomes role="button" + tabindex="0"', () => {
        const wrapper = mountField({ prependInnerIcon: 'mdi-magnify' }, { 'onClick:prependInner': () => {} })
        const zone = wrapper.find('.origam-field__prepend-inner')
        expect(zone.attributes('role')).toBe('button')
        expect(zone.attributes('tabindex')).toBe('0')
    })

    it('@click:prependInner attached + Enter keydown → emits click:prependInner', async () => {
        const wrapper = mountField({ prependInnerIcon: 'mdi-magnify' }, { 'onClick:prependInner': () => {} })
        await wrapper.find('.origam-field__prepend-inner').trigger('keydown', { key: 'Enter' })
        expect(wrapper.emitted('click:prependInner')).toBeTruthy()
    })

    it('@click:appendInner attached + Space keydown → emits click:appendInner', async () => {
        const wrapper = mountField({ appendInnerIcon: 'mdi-eye' }, { 'onClick:appendInner': () => {} })
        await wrapper.find('.origam-field__append-inner').trigger('keydown', { key: ' ' })
        expect(wrapper.emitted('click:appendInner')).toBeTruthy()
    })

    it('@click:appendInner attached + unrelated key (Tab) → does not emit', async () => {
        const wrapper = mountField({ appendInnerIcon: 'mdi-eye' }, { 'onClick:appendInner': () => {} })
        await wrapper.find('.origam-field__append-inner').trigger('keydown', { key: 'Tab' })
        expect(wrapper.emitted('click:appendInner')).toBeFalsy()
    })
})
