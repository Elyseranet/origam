// Regression for #380 — OrigamBadge's aria-label always announced the
// generic "Badge" label, never the actual content, because
// `t(label, content)` passed `content` as a POSITIONAL interpolation
// argument to a template ("Badge") that has no `{0}` placeholder.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import OrigamBadge from '@origam/components/Badge/OrigamBadge.vue'
import { createOrigam } from '@origam/origam'

function mountBadge (props: Record<string, unknown> = {}, origamOptions: Record<string, unknown> = {}) {
    return mount(OrigamBadge, {
        props: { modelValue: true, ...props } as never,
        global: {
            plugins: [createOrigam(origamOptions as never)],
            stubs: {
                OrigamTransition: { template: '<slot />' },
                OrigamFade: { template: '<slot />' }
            }
        }
    })
}

describe('OrigamBadge — aria-label reflects content (#380)', () => {
    it('announces the numeric content, not the generic "Badge" label', () => {
        const wrapper = mountBadge({ content: 3 })

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('3')
    })

    it('announces string content ("NEW"), not the generic "Badge" label', () => {
        const wrapper = mountBadge({ content: 'NEW' })

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('NEW')
    })

    it('re-announces a DIFFERENT value when content changes after mount', async () => {
        const wrapper = mountBadge({ content: 3 })
        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('3')

        await wrapper.setProps({ content: 4 })

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('4')
    })

    it('falls back to the translated generic label when there is no content (dot mode)', () => {
        const wrapper = mountBadge({ dot: true })

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('Badge')
    })

    it('falls back to the translated generic label in icon mode (icon has no text content)', () => {
        const wrapper = mountBadge({ icon: 'mdi-check' })

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('Badge')
    })

    it('a consumer-supplied label key still wins when explicitly set', () => {
        const wrapper = mountBadge({ dot: true, label: 'origam.badge' })

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('Badge')
    })

    // A second-locale check is mandatory here (cf. CLAUDE.md): under 'en', a
    // hardcoded English string is indistinguishable from its own translation
    // — an en-only test still passes WITH the bug. `origam.badge` happens to
    // render "Badge" in both en.json and fr.json (identical word in French),
    // so switching the active locale to 'fr' alone would prove nothing.
    // Injecting a distinctive fr override into `messages` instead proves the
    // fallback label genuinely flows through `t()` / the injected locale
    // instance, rather than being a literal baked into the component.
    it('the fallback label resolves through the injected FR messages, not a hardcoded string', () => {
        const wrapper = mountBadge(
            { dot: true },
            {
                locale: {
                    locale: 'fr',
                    messages: { fr: { origam: { badge: 'INSIGNE-FR' } } }
                }
            }
        )

        expect(wrapper.find('.origam-badge__badge').attributes('aria-label')).toBe('INSIGNE-FR')
    })
})
