// issue #404 — <OrigamCommandPalette>'s dialog had NO accessible name.
//
// It bound `aria-labelledby="inputId"`, pointing at the `<input>`. Measured
// with a real Playwright `ariaSnapshot()` against Chromium (see the issue):
// the rendered a11y tree showed `dialog:` with no name at all, because a
// `placeholder` does not reliably promote to the accessible name of an
// element that merely REFERENCES the input via `aria-labelledby` — it only
// names the input itself. Fixed by giving the dialog its own `aria-label`
// (origam.command_palette.aria_label) instead.
//
// Renders inside <teleport to="body"> — mount with attachTo: document.body
// and query via document.querySelector (teleport content is outside the
// wrapper's own DOM subtree), same pattern as OrigamCommandPalette.spec.ts.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ICommand } from '@origam/interfaces'

import OrigamCommandPalette from '@origam/components/CommandPalette/OrigamCommandPalette.vue'
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

const COMMANDS: ReadonlyArray<ICommand> = [
    { id: 'nav', label: 'Go home', perform: () => undefined }
]

function mountPalette (props: Record<string, unknown> = {}) {
    return mount(OrigamCommandPalette, {
        props: {
            modelValue: true,
            commands: COMMANDS,
            hotkey: null,
            ...props
        } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamCommandPalette — dialog accessible name (issue #404)', () => {
    it('the dialog carries a non-empty aria-label', () => {
        const wrapper = mountPalette()
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).not.toBeNull()
        expect(dialog?.getAttribute('aria-label')).toBeTruthy()
        wrapper.unmount()
    })

    it('does NOT rely on aria-labelledby pointing at the input (the broken mechanism)', () => {
        const wrapper = mountPalette()
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog?.getAttribute('aria-labelledby')).toBeNull()
        wrapper.unmount()
    })

    it('the input itself keeps its own placeholder-derived name (untouched)', () => {
        const wrapper = mountPalette({ placeholder: 'Search commands…' })
        const input = document.querySelector('.origam-command-palette__input')
        expect(input?.getAttribute('placeholder')).toBe('Search commands…')
        wrapper.unmount()
    })
})
