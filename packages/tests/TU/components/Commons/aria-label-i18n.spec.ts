// Regression test for issues #450, #451 and #462 — three components baked
// an English string into their accessible name, so a consumer got an
// English-only `aria-label` whatever the active locale.
//
//   OrigamProgress  `props.label ?? 'Loading'`
//   OrigamSkeleton  `aria-label="Loading"` hardcoded in the template x3,
//                   with NO prop to override it at all
//   OrigamQrCode    `` `QR code for ${props.value}` ``
//
// The reliable witness for an accessible name is the RENDERED ATTRIBUTE,
// not the template source: a `:aria-label` binding that resolves to
// `undefined` emits no attribute whatsoever, and reading the template can
// never show you that. Every assertion below therefore goes through
// `attributes('aria-label')` on the mounted DOM.
//
// The locale-switch cases are the ones that would have caught the original
// bug: before the fix they returned English under `fr` too.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamProgress from '@origam/components/Progress/OrigamProgress.vue'
import OrigamSkeleton from '@origam/components/Skeleton/OrigamSkeleton.vue'
import OrigamQrCode from '@origam/components/QrCode/OrigamQrCode.vue'
import { createOrigam } from '@origam/origam'

/** Mount with the DS installed, optionally under a non-default locale. */
function mountWith (component: any, props: Record<string, unknown>, locale?: string) {
    return mount(component, {
        props: props as never,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]}
    })
}

/**
 * Read the accessible name off the element that actually carries the ARIA
 * role, not off the wrapper root — Skeleton's `role="status"` sits on the
 * rendered placeholder, and Progress forwards to a sub-component.
 */
function ariaLabelOf (wrapper: ReturnType<typeof mount>, selector: string): string | undefined {
    const el = wrapper.find(selector)
    expect(el.exists()).toBe(true)

    return el.attributes('aria-label')
}

describe('accessible names resolve through the locale layer (#450, #451, #462)', () => {
    describe('OrigamProgress (#450)', () => {
        it('falls back to the shared origam.loading key, not a baked English string', () => {
            const wrapper = mountWith(OrigamProgress, {modelValue: 42, max: 100})

            expect(ariaLabelOf(wrapper, '[role="progressbar"]')).toBe('Loading...')
        })

        it('follows the active locale', () => {
            const wrapper = mountWith(OrigamProgress, {modelValue: 42, max: 100}, 'fr')

            expect(ariaLabelOf(wrapper, '[role="progressbar"]')).toBe('Chargement...')
        })

        it('resolves a consumer-supplied locale key', () => {
            const wrapper = mountWith(OrigamProgress, {modelValue: 42, label: 'origam.close'})

            expect(ariaLabelOf(wrapper, '[role="progressbar"]')).toBe('Close')
        })

        it('passes an unknown raw string through unchanged (back-compat)', () => {
            const wrapper = mountWith(OrigamProgress, {modelValue: 42, label: 'Uploading photo'})

            expect(ariaLabelOf(wrapper, '[role="progressbar"]')).toBe('Uploading photo')
        })
    })

    describe('OrigamSkeleton (#462)', () => {
        // The three literals lived on three different branches of a v-if
        // chain, so a fix applied to one variant would leave the other two
        // untouched. Each variant is asserted separately on purpose.
        it.each([
            ['rectangular'],
            ['card'],
            ['list-item']
        ])('variant %s exposes a translated accessible name', (variant) => {
            const wrapper = mountWith(OrigamSkeleton, {variant, loading: true})

            expect(ariaLabelOf(wrapper, '[role="status"]')).toBe('Loading...')
        })

        it.each([
            ['rectangular'],
            ['card'],
            ['list-item']
        ])('variant %s follows the active locale', (variant) => {
            const wrapper = mountWith(OrigamSkeleton, {variant, loading: true}, 'fr')

            expect(ariaLabelOf(wrapper, '[role="status"]')).toBe('Chargement...')
        })

        it('accepts a consumer override — the channel that did not exist before', () => {
            const wrapper = mountWith(OrigamSkeleton, {variant: 'text', loading: true, label: 'origam.close'})

            expect(ariaLabelOf(wrapper, '[role="status"]')).toBe('Close')
        })
    })

    describe('OrigamQrCode (#451)', () => {
        it('interpolates the encoded value into the localised fallback', () => {
            const wrapper = mountWith(OrigamQrCode, {value: 'https://example.com'})

            expect(ariaLabelOf(wrapper, '[role="img"]')).toBe('QR code for https://example.com')
        })

        it('follows the active locale, keeping the interpolated value', () => {
            const wrapper = mountWith(OrigamQrCode, {value: 'https://example.com'}, 'fr')

            expect(ariaLabelOf(wrapper, '[role="img"]')).toBe('QR code pour https://example.com')
        })

        it('still prefers an explicit ariaLabel over the fallback', () => {
            const wrapper = mountWith(OrigamQrCode, {value: 'x', ariaLabel: 'Scan to pay'})

            expect(ariaLabelOf(wrapper, '[role="img"]')).toBe('Scan to pay')
        })
    })

    it('no component in the trio emits a bare English "Loading" any more', () => {
        const labels = [
            ariaLabelOf(mountWith(OrigamProgress, {modelValue: 1}, 'fr'), '[role="progressbar"]'),
            ariaLabelOf(mountWith(OrigamSkeleton, {loading: true}, 'fr'), '[role="status"]')
        ]

        expect(labels).not.toContain('Loading')
        expect(labels.every(l => typeof l === 'string' && l.length > 0)).toBe(true)
    })
})
