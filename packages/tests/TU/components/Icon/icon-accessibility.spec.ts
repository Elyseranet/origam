// Unit tests for issue #427 — Icon family accessibility:
//
// 1. OrigamLigatureIcon announced its ligature name ("home", "settings", …)
//    to screen readers — no aria-hidden, no role, and it is UNREACHABLE via
//    OrigamIcon's dispatcher (verified separately: grep of useIcon.ts /
//    DEFAULT_SETS finds no reference), so it must defend itself.
// 2. OrigamClassIcon / OrigamComponentIcon were only protected via
//    OrigamIcon's fallthrough `aria-hidden` — used directly (both are
//    exported on the public barrel) a decorative glyph was fully exposed.
// 3. OrigamIcon's button mode (`@click` + no aria-label) sets `role="button"`
//    with no accessible name — "No ARIA is better than bad ARIA". A
//    dev-time console.warn now surfaces the gap instead of staying silent.
//
// All four leaves + the dispatcher share one contract via
// `useIconAccessibility()`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamIcon from '@origam/components/Icon/OrigamIcon.vue'
import OrigamClassIcon from '@origam/components/Icon/OrigamClassIcon.vue'
import OrigamComponentIcon from '@origam/components/Icon/OrigamComponentIcon.vue'
import OrigamLigatureIcon from '@origam/components/Icon/OrigamLigatureIcon.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamLigatureIcon — accessibility (issue #427)', () => {
    it('is aria-hidden by default (no click handler) — the ligature name is never announced', () => {
        const wrapper = mount(OrigamLigatureIcon, { props: { icon: 'home' } })
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(wrapper.text()).toBe('home')
    })

    it('flips to aria-hidden=false + role=button when a click handler is attached', () => {
        const wrapper = mount(OrigamLigatureIcon, {
            props: { icon: 'home', onClick: () => {} } as never
        })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBe('button')
    })

    it('warns in dev when clickable with no accessible name', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OrigamLigatureIcon, { props: { icon: 'home', onClick: () => {} } as never })
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'))
        warn.mockRestore()
    })

    it('does not warn when clickable AND an aria-label is provided', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OrigamLigatureIcon, {
            props: { icon: 'home', onClick: () => {}, 'aria-label': 'Go home' } as never
        })
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })
})

describe('OrigamClassIcon — accessibility (issue #427, direct-usage gap)', () => {
    it('is aria-hidden by default when used directly (bypassing the OrigamIcon dispatcher)', () => {
        const wrapper = mount(OrigamClassIcon, { props: { icon: 'mdi-home' } })
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('flips to aria-hidden=false + role=button when a click handler is attached directly', () => {
        const wrapper = mount(OrigamClassIcon, {
            props: { icon: 'mdi-home', onClick: () => {} } as never
        })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBe('button')
    })
})

describe('OrigamComponentIcon — accessibility (issue #427, direct-usage gap)', () => {
    it('is aria-hidden by default, protecting the consumer-supplied inner component too', () => {
        const wrapper = mount(OrigamComponentIcon, {})
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('flips to aria-hidden=false + role=button when a click handler is attached directly', () => {
        const wrapper = mount(OrigamComponentIcon, { props: { onClick: () => {} } as never })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBe('button')
    })
})

describe('OrigamIcon — button mode accessible-name warning (issue #427)', () => {
    function mountIcon (props: Record<string, unknown>) {
        const origam = createOrigam({})
        return mount(OrigamIcon, {
            props: props as never,
            global: { plugins: [origam] }
        })
    }

    it('decorative (no click): aria-hidden=true, no role, no warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountIcon({ icon: 'mdi-home' })
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('button mode with no accessible name: role=button is set, but warns (the exact defect #427 reports)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountIcon({ icon: 'mdi-close', onClick: () => {} })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBe('button')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'))
        warn.mockRestore()
    })

    it('button mode WITH aria-label: role=button is set, no warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountIcon({ icon: 'mdi-close', onClick: () => {}, 'aria-label': 'Close' })
        expect(wrapper.attributes('role')).toBe('button')
        expect(wrapper.attributes('aria-label')).toBe('Close')
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('button mode WITH aria-labelledby: no warning either', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountIcon({ icon: 'mdi-close', onClick: () => {}, 'aria-labelledby': 'external-label' })
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })
})
