// Unit tests for issue #427 — Icon family accessibility:
//
// 1. OrigamLigatureIcon announced its ligature name ("home", "settings", …)
//    to screen readers — no aria-hidden, no role, and it is UNREACHABLE via
//    OrigamIcon's dispatcher (verified separately: grep of useIcon.ts /
//    DEFAULT_SETS finds no reference), so it must defend itself.
// 2. OrigamClassIcon / OrigamComponentIcon were only protected via
//    OrigamIcon's fallthrough `aria-hidden` — used directly (both are
//    exported on the public barrel) a decorative glyph was fully exposed.
// 3. OrigamIcon's button mode (`@click` + no aria-label) set `role="button"`
//    with no accessible name — "No ARIA is better than bad ARIA". A
//    dev-time console.warn now surfaces the gap instead of staying silent.
//
// All four leaves + the dispatcher share one contract via
// `useIconAccessibility()`.
//
// Issue #653 explored (then reverted) a typed `clickable` prop — zero
// components in the repo ever used it. It ALSO measured that the
// pre-existing `role="button"` on `@click` was itself a defect: the icon
// family sets no `tabindex` and no keydown handler anywhere, so the role
// announced a control a keyboard user could never reach or activate
// (WCAG 2.1.1). `role="button"` was REMOVED as a result — the tests below
// that used to assert `role === 'button'` now assert its ABSENCE, which is
// the regression guard against reintroducing it. The dev-time warning
// stays and now redirects to `origam-btn`, the real fix.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamIcon from '@origam/components/Icon/OrigamIcon.vue'
import OrigamClassIcon from '@origam/components/Icon/OrigamClassIcon.vue'
import OrigamComponentIcon from '@origam/components/Icon/OrigamComponentIcon.vue'
import OrigamLigatureIcon from '@origam/components/Icon/OrigamLigatureIcon.vue'
import { createOrigam } from '@origam/origam'

describe('OrigamLigatureIcon — accessibility (issue #427 / #653)', () => {
    it('is aria-hidden by default (no click handler) — the ligature name is never announced', () => {
        const wrapper = mount(OrigamLigatureIcon, { props: { icon: 'home' } })
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(wrapper.text()).toBe('home')
    })

    it('a click handler never adds role="button" (#653 — no tabindex/keydown to back it)', () => {
        const wrapper = mount(OrigamLigatureIcon, {
            props: { icon: 'home', onClick: () => {} } as never
        })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('warns in dev when clickable with no accessible name, redirecting to origam-btn', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OrigamLigatureIcon, { props: { icon: 'home', onClick: () => {} } as never })
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('origam-btn'))
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

describe('OrigamClassIcon — accessibility (issue #427 / #653, direct-usage gap)', () => {
    it('is aria-hidden by default when used directly (bypassing the OrigamIcon dispatcher)', () => {
        const wrapper = mount(OrigamClassIcon, { props: { icon: 'mdi-home' } })
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('a click handler never adds role="button" when used directly (#653)', () => {
        const wrapper = mount(OrigamClassIcon, {
            props: { icon: 'mdi-home', onClick: () => {} } as never
        })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBeUndefined()
    })
})

describe('OrigamComponentIcon — accessibility (issue #427 / #653, direct-usage gap)', () => {
    it('is aria-hidden by default, protecting the consumer-supplied inner component too', () => {
        const wrapper = mount(OrigamComponentIcon, {})
        expect(wrapper.attributes('aria-hidden')).toBe('true')
        expect(wrapper.attributes('role')).toBeUndefined()
    })

    it('a click handler never adds role="button" when used directly (#653)', () => {
        const wrapper = mount(OrigamComponentIcon, { props: { onClick: () => {} } as never })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBeUndefined()
    })
})

describe('OrigamIcon — button-mode role removal + accessible-name warning (issue #427 / #653)', () => {
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

    it('clickable with no accessible name: role is NEVER set (#653), aria-hidden=false, and it warns pointing at origam-btn', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountIcon({ icon: 'mdi-close', onClick: () => {} })
        expect(wrapper.attributes('aria-hidden')).toBe('false')
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('origam-btn'))
        warn.mockRestore()
    })

    it('clickable WITH aria-label: still no role, the label itself still reaches the DOM, no warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountIcon({ icon: 'mdi-close', onClick: () => {}, 'aria-label': 'Close' })
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(wrapper.attributes('aria-label')).toBe('Close')
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('clickable WITH aria-labelledby: no warning either', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountIcon({ icon: 'mdi-close', onClick: () => {}, 'aria-labelledby': 'external-label' })
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })
})
