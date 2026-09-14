// Unit tests for <OrigamLoader> — issue #444.
//
// Two independent defects, both verdict = cabler:
//
// 1. `loadingText` was declared on ILoaderProps, documented ("Provide
//    loadingText if the surrounding context needs an extra hint for screen
//    readers"), and read NOWHERE in the component — the aria-label was a
//    hardcoded 'Loading' literal. Fixed to default to the SAME
//    'origam.loading' key already used by OrigamProgress(Circular/Linear)/
//    OrigamSkeleton/OrigamSwitch/OrigamAudio/OrigamVideo for the identical
//    aria-label role, translated via `useLocale()`.
// 2. `fullscreen` had a complete, correctly-named SCSS block
//    (`&--fullscreen`, 5 tokens) with NO prop, NO mechanism anywhere to
//    reach it. Added `ILoaderComponentProps.fullscreen` (component-local,
//    NOT on the transverse `ILoaderProps` — see the interface file comment).
//
// `<OrigamLoader>` sits UNCONDITIONALLY in `<OrigamBtn>`'s render tree
// (`origam-btn__loader`, no `v-if`) — several existing OrigamBtn TU specs
// mount it WITHOUT `createOrigam()` (border-axis / directional-props
// spot-checks), always with `loading` falsy. Calling `useLocale()` (strict)
// unconditionally in setup() would have broken every one of those on mount.
// Fixed by requesting the non-throwing `useLocale(false)` and falling back
// to the raw key — verified below with `loading: false`, matching the real
// Btn scenario.
//
// ⚠️ `loading: true` WITHOUT the plugin still throws, and is NOT something
// this fix addresses: the default `#loader` slot renders `<origam-progress>`
// → `OrigamProgressCircular`, which has its OWN unconditional (strict)
// `useLocale()` call, pre-existing and unrelated to OrigamLoader's own
// aria-label. Verified empirically below — flagged, not silently patched
// over, since fixing it is out of #444's scope (it would touch a component
// six other families depend on).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamLoader from '@origam/components/Loader/OrigamLoader.vue'
import { createOrigam } from '@origam/origam'

function mountLoader (props: Record<string, unknown> = {}, withPlugin = true) {
    return mount(OrigamLoader, {
        props: { loading: true, ...props } as never,
        global: withPlugin ? { plugins: [createOrigam()] } : {}
    })
}

describe('OrigamLoader — loadingText / aria-label (issue #444)', () => {
    it('defaults the aria-label to the translated "origam.loading" key', () => {
        const wrapper = mountLoader()
        expect(wrapper.attributes('aria-label')).toBe('Loading...')
    })

    it('translates a custom loadingText key', () => {
        const wrapper = mountLoader({ loadingText: 'origam.data_iterator.loading_text' })
        expect(wrapper.attributes('aria-label')).toBe('Loading items...')
    })

    it('sets no aria-label when not loading', () => {
        const wrapper = mountLoader({ loading: false })
        expect(wrapper.attributes('aria-label')).toBeUndefined()
    })

    it('resolves the French translation under the fr locale', () => {
        const origam = createOrigam({ locale: { locale: 'fr' } } as never)
        const wrapper = mount(OrigamLoader, {
            props: { loading: true } as never,
            global: { plugins: [origam] }
        })
        expect(wrapper.attributes('aria-label')).toBe('Chargement...')
    })

    it('does NOT throw when mounted without the createOrigam() plugin while not loading (the real OrigamBtn spot-check scenario)', () => {
        expect(() => mountLoader({ loading: false }, false)).not.toThrow()
    })

    it('still throws when loading=true without the plugin — pre-existing OrigamProgressCircular requirement, out of #444 scope', () => {
        expect(() => mountLoader({ loading: true }, false)).toThrow('[Origam] Could not find injected locale instance')
    })
})

describe('OrigamLoader — fullscreen prop (issue #444)', () => {
    it('adds no fullscreen modifier class by default', () => {
        const wrapper = mountLoader()
        expect(wrapper.classes()).not.toContain('origam-loader--fullscreen')
    })

    it('adds origam-loader--fullscreen when fullscreen is true', () => {
        const wrapper = mountLoader({ fullscreen: true })
        expect(wrapper.classes()).toContain('origam-loader--fullscreen')
    })
})
