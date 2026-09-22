// ⛔ #360 (v3.0.0 harvest) — a BARE `createOrigam()` no longer prefixes the
// install list with the DS's own `origamTheme` baseline. This is a
// functional/runtime question (does a themed prop default actually resolve
// onto a rendered component's `instance.props`?), not a type or "grep the
// source" question — see CLAUDE.md "Don't claim it's fixed" (verify runtime
// behaviour) and the ADR-005 write-up in `theme-props-resolver.composable.ts`
// for why a static read of `origam.ts` cannot answer this: the resolver is a
// global `app.mixin` that patches `instance.props` at `beforeCreate`, so only
// mounting a real component proves whether it ran.
//
// A/B against the parent commit (pre-#360): `createOrigam()` (or
// `createOrigam({})`) used to unconditionally install `origamTheme`, whose
// `components['origam-avatar']` sets `rounded: 'full'` — a value
// `OrigamAvatar` does NOT hardcode itself (`withDefaults` only sets `tag` /
// `size`, see `OrigamAvatar.vue`). On the parent commit this spec's first
// test therefore FAILS (the class IS present); on this commit it passes.
// Reproduced by hand before landing this file.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamAvatar from '@origam/components/Avatar/OrigamAvatar.vue'
import { createOrigam } from '@origam/origam'
import { origamTheme } from '@origam/themes'

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

describe('createOrigam() bare — no theme installed (#360)', () => {
    it('a bare createOrigam() does NOT resolve origamTheme\'s "origam-avatar" rounded default', () => {
        const wrapper = mount(OrigamAvatar, {
            props: { text: 'AP' },
            global: { plugins: [createOrigam()] }
        })

        // No rounded prop passed, no theme installed → useRounded emits no
        // utility class at all (see rounded.composable.ts: `if (!rounded ...)
        // return classes`).
        expect(wrapper.classes()).not.toContain('origam--rounded-full')
    })

    it('createOrigam({ themes: origamTheme }) DOES resolve it — proves the harness can actuate the prop', () => {
        const wrapper = mount(OrigamAvatar, {
            props: { text: 'AP' },
            global: { plugins: [createOrigam({ themes: origamTheme })] }
        })

        expect(wrapper.classes()).toContain('origam--rounded-full')
    })

    it('createOrigam({}) (explicit empty options) behaves identically to the bare call', () => {
        const wrapper = mount(OrigamAvatar, {
            props: { text: 'AP' },
            global: { plugins: [createOrigam({})] }
        })

        expect(wrapper.classes()).not.toContain('origam--rounded-full')
    })

    it('the installed-themes summary stays empty either way — the baseline is nameless, not a brand', () => {
        const bare = createOrigam()
        expect(bare.themes).toEqual([])

        const withBaseline = createOrigam({ themes: origamTheme })
        expect(withBaseline.themes).toEqual([])
    })
})
