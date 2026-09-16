/*
 * Accessible name of an ARIA command — #747 / #653 / #660
 *
 * Three tickets, one root cause: the DS put an ARIA claim on an element it
 * had no name for. This file pins the contract that replaces it.
 *
 * ## Why unit tests alongside the axe sweep
 *
 * `packages/tests/e2e/adjacent-command-name-a11y.spec.ts` measures the same
 * family with axe-core in a real Chromium. It is the authority on "does a
 * violation still fire", but it is structurally BLIND to two of the three
 * tickets:
 *
 * - **#660** — an `aria-hidden` glyph makes no ARIA claim at all, so there is
 *   no rule for axe to break. The defect is an absence, and only a DOM
 *   assertion can see it.
 * - **#653 (OrigamBtn)** — the fix is a DEVELOPER-facing `console.warn`, not
 *   a DOM change: an unnamed `<button>` legitimately keeps failing
 *   `button-name`, because the consumer's markup is what is wrong.
 *
 * Only jsdom ATTRIBUTE assertions are made here — never `getComputedStyle`
 * on a `var()`-driven property (see CLAUDE.md #398).
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamCardHeader from '@origam/components/Card/OrigamCardHeader.vue'
import OrigamAlert from '@origam/components/Alert/OrigamAlert.vue'
import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamSvgIcon from '@origam/components/Icon/OrigamSvgIcon.vue'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
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

const mountWith = (component: any, props: Record<string, unknown>) =>
    mount(component, { props: props as never, global: { plugins: [createOrigam()] } })

// ---------------------------------------------------------------------------
// #747 — outer adjacent zone
// ---------------------------------------------------------------------------

describe('#747 — an unnamed adjacent zone is never promoted to role="button"', () => {
    it('OrigamCardHeader: click:prepend WITHOUT a label → no role, no tab stop', () => {
        const wrapper = mountWith(OrigamCardHeader, {
            title: 'Header',
            prependIcon: 'mdi-account',
            'onClick:prepend': () => {}
        })
        const zone = wrapper.find('.origam-card-header__prepend')

        expect(zone.exists()).toBe(true)
        expect(zone.attributes('role')).toBeUndefined()
        expect(zone.attributes('tabindex')).toBeUndefined()
        expect(zone.attributes('aria-label')).toBeUndefined()
    })

    it('OrigamCardHeader: click:prepend WITH a label → role + tab stop + name', () => {
        const wrapper = mountWith(OrigamCardHeader, {
            title: 'Header',
            prependIcon: 'mdi-account',
            prependAriaLabel: 'Open details',
            'onClick:prepend': () => {}
        })
        const zone = wrapper.find('.origam-card-header__prepend')

        expect(zone.attributes('role')).toBe('button')
        expect(zone.attributes('tabindex')).toBe('0')
        expect(zone.attributes('aria-label')).toBe('Open details')
    })

    it('the mouse click path survives the unnamed case — the emit still fires', async () => {
        const wrapper = mountWith(OrigamCardHeader, {
            title: 'Header',
            prependIcon: 'mdi-account',
            'onClick:prepend': () => {}
        })
        await wrapper.find('.origam-card-header__prepend').trigger('click')

        expect(wrapper.emitted('click:prepend')).toBeTruthy()
    })

    it('OrigamCardHeader: the append zone obeys the same rule', () => {
        const unnamed = mountWith(OrigamCardHeader, {
            title: 'Header',
            appendIcon: 'mdi-close',
            'onClick:append': () => {}
        })
        expect(unnamed.find('.origam-card-header__append').attributes('role')).toBeUndefined()

        const named = mountWith(OrigamCardHeader, {
            title: 'Header',
            appendIcon: 'mdi-close',
            appendAriaLabel: 'Show options',
            'onClick:append': () => {}
        })
        expect(named.find('.origam-card-header__append').attributes('role')).toBe('button')
    })

    it('a label resolves through the locale adapter — an i18n KEY becomes its message', () => {
        const wrapper = mountWith(OrigamAlert, {
            text: 'hello',
            prependIcon: 'mdi-information',
            prependAriaLabel: 'origam.close',
            'onClick:prepend': () => {}
        })

        // `origam.close` → "Close" in the bundled `en` messages; a literal
        // string would come back verbatim. Both forms are supported, exactly
        // like the existing `closeLabel` contract.
        expect(wrapper.find('.origam-alert__prepend').attributes('aria-label')).toBe('Close')
    })

    it('a label that is NOT a key is passed through verbatim', () => {
        const wrapper = mountWith(OrigamAlert, {
            text: 'hello',
            prependIcon: 'mdi-information',
            prependAriaLabel: 'Open the account panel',
            'onClick:prepend': () => {}
        })

        expect(wrapper.find('.origam-alert__prepend').attributes('aria-label')).toBe('Open the account panel')
    })
})

// ---------------------------------------------------------------------------
// #747 — inner adjacent zone
// ---------------------------------------------------------------------------

describe('#747 — the inner zone obeys the same rule', () => {
    it('OrigamField: click:prependInner WITHOUT a label → no role, no tab stop', () => {
        const wrapper = mountWith(OrigamField, {
            prependInnerIcon: 'mdi-magnify',
            'onClick:prependInner': () => {}
        })
        const zone = wrapper.find('.origam-field__prepend-inner')

        expect(zone.exists()).toBe(true)
        expect(zone.attributes('role')).toBeUndefined()
        expect(zone.attributes('tabindex')).toBeUndefined()
    })

    it('OrigamField: click:appendInner WITH a label → role + tab stop + name', () => {
        const wrapper = mountWith(OrigamField, {
            appendInnerIcon: 'mdi-eye',
            appendInnerAriaLabel: 'Reveal the password',
            'onClick:appendInner': () => {}
        })
        const zone = wrapper.find('.origam-field__append-inner')

        expect(zone.attributes('role')).toBe('button')
        expect(zone.attributes('tabindex')).toBe('0')
        expect(zone.attributes('aria-label')).toBe('Reveal the password')
    })
})

// ---------------------------------------------------------------------------
// #660 — OrigamSvgIcon joins the icon-family accessibility contract
// ---------------------------------------------------------------------------

describe('#660 — OrigamSvgIcon no longer hardcodes aria-hidden="true"', () => {
    const SVG_PATH = 'M12 2L2 7l10 5 10-5-10-5z'

    it('decorative (no listener) → the glyph stays hidden, as before', () => {
        const wrapper = mountWith(OrigamSvgIcon, { icon: SVG_PATH })

        expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
    })

    it('a @click listener un-hides the glyph — the pre-fix defect was that it never could', () => {
        const wrapper = mountWith(OrigamSvgIcon, { icon: SVG_PATH, onClick: () => {} })

        expect(wrapper.find('svg').attributes('aria-hidden')).toBe('false')
    })

    it('matches the four sibling leaves rather than reintroducing role="button"', () => {
        const wrapper = mountWith(OrigamSvgIcon, { icon: SVG_PATH, onClick: () => {} })

        // #653 removed `role="button"` from the icon family on purpose: the
        // leaves set no tabindex and no keydown handler, so the role
        // announced a control nobody could reach. SvgIcon must not bring it
        // back through the back door.
        expect(wrapper.find('svg').attributes('role')).toBeUndefined()
        expect(wrapper.attributes('role')).toBeUndefined()
    })
})

// ---------------------------------------------------------------------------
// #653 — OrigamBtn icon-only mode
// ---------------------------------------------------------------------------

describe('#653 — OrigamBtn warns when icon-only mode has no accessible name', () => {
    let warn: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        warn.mockRestore()
    })

    const warnings = () =>
        warn.mock.calls
            .map((c) => String(c[0]))
            .filter((m) => m.includes('renders a control with no accessible name'))

    it('icon-only WITHOUT a name → one dev warning naming the fix', () => {
        mountWith(OrigamBtn, { icon: 'mdi-close' })

        expect(warnings().length).toBeGreaterThan(0)
        expect(warnings()[0]).toContain('aria-label')
    })

    it('the <button> is still rendered — the role is NOT withdrawn', () => {
        const wrapper = mountWith(OrigamBtn, { icon: 'mdi-close' })

        // Unlike an adjacent zone, a native control cannot be demoted: the
        // element IS a button. Removing it would break the feature instead
        // of fixing the name.
        expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('icon-only WITH aria-label → silent', () => {
        mountWith(OrigamBtn, { icon: 'mdi-close', 'aria-label': 'Close the dialog' })

        expect(warnings()).toEqual([])
    })

    it('a button with visible text is not icon-only → silent', () => {
        mountWith(OrigamBtn, { icon: 'mdi-content-save', text: 'Save' })

        expect(warnings()).toEqual([])
    })
})
