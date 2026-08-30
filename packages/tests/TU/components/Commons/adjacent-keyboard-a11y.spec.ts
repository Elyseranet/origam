// issue #443 — keyboard reachability of click:prepend / click:append across
// every component consuming useAdjacent. The composable-level logic is
// covered exhaustively in adjacent.composable.spec.ts; this file proves the
// TEMPLATE wiring is actually applied consistently across representative
// consumers, plus the two constraints that make a blanket fix unsafe:
//
// 1. A <button>/<a> content model forbids ANY descendant with a `tabindex`
//    attribute specified (WHATWG). OrigamChip/OrigamListItem/
//    OrigamBreadcrumbItem render `<component :is="link.tag.value">`, which
//    becomes `<a>` when `href`/`to` is set — the prepend/append zone must
//    NOT get role/tabindex in that case, even if a click:prepend/append
//    listener is attached.
// 2. OrigamBtn / OrigamExpansionPanelHeader render an ALWAYS-native
//    <button> root — deliberately left untouched by this ticket (same
//    reason as #1, but unconditional). Asserted here as a negative
//    control so a future refactor doesn't accidentally "fix" them into
//    invalid markup.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { h, nextTick } from 'vue'

import OrigamAlert from '@origam/components/Alert/OrigamAlert.vue'
import OrigamChip from '@origam/components/Chip/OrigamChip.vue'
import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import OrigamExpansionPanels from '@origam/components/ExpansionPanel/OrigamExpansionPanels.vue'
import OrigamExpansionPanel from '@origam/components/ExpansionPanel/OrigamExpansionPanel.vue'
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

// ---------------------------------------------------------------------------
// Representative non-link consumer — OrigamAlert
// ---------------------------------------------------------------------------

describe('OrigamAlert — prepend/append keyboard activation (issue #443)', () => {
    it('no click:prepend listener → prepend stays inert', () => {
        const wrapper = mount(OrigamAlert, {
            props: { prependIcon: 'mdi-information', text: 'hello' } as never,
            global: { plugins: [createOrigam()] }
        })
        const zone = wrapper.find('.origam-alert__prepend')
        expect(zone.attributes('role')).toBeUndefined()
        expect(zone.attributes('tabindex')).toBeUndefined()
    })

    it('@click:prepend attached → role="button" + tabindex="0", Enter fires it', async () => {
        const wrapper = mount(OrigamAlert, {
            props: { prependIcon: 'mdi-information', text: 'hello', 'onClick:prepend': () => {} } as never,
            global: { plugins: [createOrigam()] }
        })
        const zone = wrapper.find('.origam-alert__prepend')
        expect(zone.attributes('role')).toBe('button')
        expect(zone.attributes('tabindex')).toBe('0')
        await zone.trigger('keydown', { key: 'Enter' })
        expect(wrapper.emitted('click:prepend')).toBeTruthy()
    })

    it('@click:append attached + Space → emits click:append', async () => {
        const wrapper = mount(OrigamAlert, {
            props: { appendIcon: 'mdi-close', text: 'hello', 'onClick:append': () => {} } as never,
            global: { plugins: [createOrigam()] }
        })
        const zone = wrapper.find('.origam-alert__append')
        await zone.trigger('keydown', { key: ' ' })
        expect(wrapper.emitted('click:append')).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// Link-gated consumer — OrigamChip
// ---------------------------------------------------------------------------

describe('OrigamChip — prepend/append keyboard activation is gated by link mode (issue #443)', () => {
    it('non-link chip + click:prepend listener → role="button" + tabindex="0"', () => {
        const wrapper = mount(OrigamChip, {
            props: { prependIcon: 'mdi-account', text: 'Chip', 'onClick:prepend': () => {} } as never,
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.element.tagName).not.toBe('A')
        const zone = wrapper.find('.origam-chip__prepend')
        expect(zone.attributes('role')).toBe('button')
        expect(zone.attributes('tabindex')).toBe('0')
    })

    it('LINK chip (href set) + click:prepend listener → NO tabindex on the nested zone (invalid inside <a>)', () => {
        const wrapper = mount(OrigamChip, {
            props: {
                prependIcon: 'mdi-account',
                text: 'Chip',
                href: 'https://example.com',
                'onClick:prepend': () => {}
            } as never,
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.element.tagName).toBe('A')
        const zone = wrapper.find('.origam-chip__prepend')
        expect(zone.attributes('role')).toBeUndefined()
        expect(zone.attributes('tabindex')).toBeUndefined()
    })
})

// ---------------------------------------------------------------------------
// Negative control — components whose root is ALWAYS a native <button>
// ---------------------------------------------------------------------------

describe('OrigamBtn / OrigamExpansionPanelHeader — prepend/append left untouched (always-native <button> root)', () => {
    it('OrigamBtn: root is a real <button>, prepend zone never gets a tabindex even with a listener', () => {
        const wrapper = mount(OrigamBtn, {
            props: { prependIcon: 'mdi-account', text: 'Go', 'onClick:prepend': () => {} } as never,
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.element.tagName).toBe('BUTTON')
        const zone = wrapper.find('.origam-btn__prepend')
        expect(zone.attributes('tabindex')).toBeUndefined()
    })

    it('OrigamExpansionPanelHeader: root defaults to tag="button", prepend zone never gets a tabindex', async () => {
        const wrapper = mount(OrigamExpansionPanels, {
            slots: {
                default: () => h(OrigamExpansionPanel, { title: 'Panel', prependIcon: 'mdi-account' })
            },
            attachTo: document.body,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        expect(wrapper.find('.origam-expansion-panel-header').element.tagName).toBe('BUTTON')
        const zone = wrapper.find('.origam-expansion-panel-header__prepend')
        expect(zone.attributes('tabindex')).toBeUndefined()
        wrapper.unmount()
    })
})
