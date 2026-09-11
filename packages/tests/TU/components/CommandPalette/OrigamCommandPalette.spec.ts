// Unit tests for <OrigamCommandPalette> — typography props surface (ITypographyProps).
//
// OrigamCommandPalette renders its content inside <teleport to="body">:
//   - Mount with `attachTo: document.body` so the teleport target exists.
//   - Read inline styles via `document.querySelector()` — wrapper.find() does
//     not cross teleport boundaries.
//   - `hotkey: null` prevents the global keyboard listener from attaching.
//   - `modelValue: true` makes `v-if="isActive"` render both surfaces.
//   - GROUP_COMMANDS carries a `group` field so `groupedResults` produces
//     buckets with labels → `v-if="group.label"` renders `.origam-command-palette__group-title`.
//
// Only `fontSize` has a real visual effect on either surface:
//   __input       → reads --origam-command-palette__input---font-size
//   __group-title → reads --origam-command-palette__group-title---font-size
// Other ITypographyProps (fontWeight, letterSpacing, …) emit their vars but the
// SCSS has no matching rule on these surfaces — they are not exercised here.

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

// Commands with groups so __group-title renders (v-if="group.label").
const GROUP_COMMANDS: ReadonlyArray<ICommand> = [
    { id: 'nav', label: 'Go home', group: 'Navigation', perform: () => undefined },
    { id: 'act', label: 'Create item', group: 'Actions', perform: () => undefined }
]

function mountPalette (props: Record<string, unknown> = {}) {
    return mount(OrigamCommandPalette, {
        props: {
            modelValue: true,
            commands: GROUP_COMMANDS,
            hotkey: null,
            ...props
        } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

// Read inline style of .origam-command-palette__input via document.querySelector
// (teleport content is not in the wrapper's DOM subtree).
function inputStyle (props: Record<string, unknown> = {}): string {
    const wrapper = mountPalette(props)
    const style = document.querySelector('.origam-command-palette__input')?.getAttribute('style') || ''
    wrapper.unmount()
    return style
}

// Read inline style of .origam-command-palette__group-title.
function groupTitleStyle (props: Record<string, unknown> = {}): string {
    const wrapper = mountPalette(props)
    const style = document.querySelector('.origam-command-palette__group-title')?.getAttribute('style') || ''
    wrapper.unmount()
    return style
}

// ---------------------------------------------------------------------------
// Surfaces exist
// ---------------------------------------------------------------------------
describe('OrigamCommandPalette — surfaces are present', () => {
    it('renders the __input surface when open', () => {
        const wrapper = mountPalette()
        expect(document.querySelector('.origam-command-palette__input')).not.toBeNull()
        wrapper.unmount()
    })

    it('renders the __group-title surface when open with grouped commands', () => {
        const wrapper = mountPalette()
        expect(document.querySelector('.origam-command-palette__group-title')).not.toBeNull()
        wrapper.unmount()
    })

    it('emits no typography override on __input when no typo prop is set', () => {
        expect(inputStyle()).not.toContain('--origam-command-palette__input---')
    })

    it('emits no typography override on __group-title when no typo prop is set', () => {
        expect(groupTitleStyle()).not.toContain('--origam-command-palette__group-title---')
    })
})

// ---------------------------------------------------------------------------
// __input — fontSize
// ---------------------------------------------------------------------------
describe('OrigamCommandPalette — __input fontSize', () => {
    it('fontSize="xl" sets --origam-command-palette__input---font-size to the xl token', () => {
        expect(inputStyle({ fontSize: 'xl' })).toContain(
            '--origam-command-palette__input---font-size: var(--origam-font__size---xl)'
        )
    })

    it('fontSize="sm" sets --origam-command-palette__input---font-size to the sm token', () => {
        expect(inputStyle({ fontSize: 'sm' })).toContain(
            '--origam-command-palette__input---font-size: var(--origam-font__size---sm)'
        )
    })

    it('emits no font-size override on __input when fontSize is unset', () => {
        expect(inputStyle()).not.toContain('---font-size:')
    })
})

// ---------------------------------------------------------------------------
// __group-title — fontSize
// ---------------------------------------------------------------------------
describe('OrigamCommandPalette — __group-title fontSize', () => {
    it('fontSize="xl" sets --origam-command-palette__group-title---font-size to the xl token', () => {
        expect(groupTitleStyle({ fontSize: 'xl' })).toContain(
            '--origam-command-palette__group-title---font-size: var(--origam-font__size---xl)'
        )
    })

    it('fontSize="sm" sets --origam-command-palette__group-title---font-size to the sm token', () => {
        expect(groupTitleStyle({ fontSize: 'sm' })).toContain(
            '--origam-command-palette__group-title---font-size: var(--origam-font__size---sm)'
        )
    })

    it('emits no font-size override on __group-title when fontSize is unset', () => {
        expect(groupTitleStyle()).not.toContain('---font-size:')
    })
})
