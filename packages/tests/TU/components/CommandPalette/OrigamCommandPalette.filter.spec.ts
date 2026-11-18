// Unit tests for the `filter` prop of <OrigamCommandPalette> (#1184).
//
// The palette teleports to <body>: read the DOM through `document.querySelector*`.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
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

// jsdom does not implement scrollIntoView (called by the palette on result change).
Element.prototype.scrollIntoView = vi.fn()

// Ranked "externally": none of the labels contains "docker" as a subsequence.
const HITS: ReadonlyArray<ICommand> = [
    { id: 'install', label: 'Install', group: 'Docs', perform: () => undefined },
    { id: 'config', label: 'Configuration', group: 'Guides', perform: () => undefined },
    { id: 'deploy', label: 'Deployment guide', group: 'Docs', perform: () => undefined }
]

let wrapper: VueWrapper | null = null

function mountPalette (props: Record<string, unknown> = {}) {
    wrapper = mount(OrigamCommandPalette, {
        props: { modelValue: true, commands: HITS, hotkey: null, ...props } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

    return wrapper
}

async function type (text: string) {
    const input = document.querySelector<HTMLInputElement>('input[role="combobox"]')!
    input.value = text
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    await nextTick()
}

const optionLabels = () => Array.from(document.querySelectorAll('.origam-command-palette__item-label')).map(el => el.textContent)

afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    document.body.innerHTML = ''
})

describe('OrigamCommandPalette — filter prop (#1184)', () => {
    it('declares filter with a default of true', () => {
        const w = mountPalette()
        expect((OrigamCommandPalette as any).props.filter).toBeDefined()
        expect(w.props('filter')).toBe(true)
    })

    it('filter=true (default): built-in fuzzy match drops a non-subsequence hit', async () => {
        mountPalette()
        await type('docker')
        expect(optionLabels()).toEqual([])
        expect(document.querySelector('.origam-command-palette__empty')).not.toBeNull()
    })

    it('filter=true: still re-sorts by score', async () => {
        mountPalette({
            commands: [
                { id: 'a', label: 'Reset password', perform: () => undefined },
                { id: 'b', label: 'Settings', perform: () => undefined }
            ]
        })
        await type('set')
        expect(optionLabels()).toEqual(['Settings', 'Reset password'])
    })

    it('filter=false: shows commands as given, even the non-subsequence "Install" for "docker"', async () => {
        mountPalette({ filter: false })
        await type('docker')
        expect(optionLabels()).toEqual(['Install', 'Configuration', 'Deployment guide'])
    })

    it('filter=false: keeps the given order (no re-sort by score)', async () => {
        mountPalette({
            filter: false,
            commands: [
                { id: 'a', label: 'Reset password', perform: () => undefined },
                { id: 'b', label: 'Settings', perform: () => undefined }
            ]
        })
        await type('set')
        expect(optionLabels()).toEqual(['Reset password', 'Settings'])
    })

    it('filter=false: flat list (no group headers) while a query is typed, grouped when empty', async () => {
        mountPalette({ filter: false })
        expect(document.querySelectorAll('.origam-command-palette__group-title').length).toBe(2)
        await type('docker')
        expect(document.querySelectorAll('.origam-command-palette__group-title').length).toBe(0)
    })

    it('filter=false: no highlight markup is produced', async () => {
        mountPalette({ filter: false })
        await type('docker')
        expect(document.querySelector('mark')).toBeNull()
    })

    it('filter=false: aria-activedescendant targets the first option, and ArrowDown moves it', async () => {
        mountPalette({ filter: false })
        await type('docker')
        const input = document.querySelector<HTMLInputElement>('input[role="combobox"]')!
        const first = document.querySelectorAll('[role="option"]')[0]
        expect(input.getAttribute('aria-activedescendant')).toBe(first.id)
        expect(input.getAttribute('aria-expanded')).toBe('true')
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
        await nextTick()
        const second = document.querySelectorAll('[role="option"]')[1]
        expect(input.getAttribute('aria-activedescendant')).toBe(second.id)
        expect(second.getAttribute('aria-selected')).toBe('true')
    })

    it('filter=false: an empty `commands` shows the empty state and does NOT fall back on the registry', async () => {
        mountPalette({ filter: false, commands: [] })
        await type('docker')
        expect(document.querySelectorAll('[role="option"]').length).toBe(0)
        expect(document.querySelector('.origam-command-palette__empty')).not.toBeNull()
    })

    it('filter=function: receives (commands, query) and its result and order are shown', async () => {
        const filter = vi.fn((cmds: ReadonlyArray<ICommand>, q: string) =>
            q ? [...cmds].reverse().filter(c => c.id !== 'config') : cmds)
        mountPalette({ filter })
        await type('docker')
        const last = filter.mock.calls[filter.mock.calls.length - 1]
        expect(last[0]).toEqual(HITS)
        expect(last[1]).toBe('docker')
        expect(optionLabels()).toEqual(['Deployment guide', 'Install'])
    })

    it('filter=function: re-runs when `commands` changes (async feed through @query)', async () => {
        const w = mountPalette({ filter: (cmds: ReadonlyArray<ICommand>) => cmds })
        await type('docker')
        await w.setProps({ commands: [HITS[2]] } as never)
        await nextTick()
        expect(optionLabels()).toEqual(['Deployment guide'])
    })
})
