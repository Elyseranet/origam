// Regression coverage for issue #661 (fixed on the sibling OrigamAudio,
// still open on OrigamVideo before this commit) — critere C4 (ADR-005).
//
// #673 fixed a computed-cache-poisoning regression on OrigamVideo by
// switching `useVideoPlayer({ autoplay: props.autoplay, muted: props.muted })`
// from `resolvedMuted.value` (a poisoned computed) to the RAW props values.
// That stopped the poisoning, but the raw values are STILL an eager read of
// `props.autoplay` / `props.muted` in the body of `setup()` — flagged by
// `packages/ds/scripts/guards/lib/setup-reads.mjs` as `Video [autoplay, muted]`
// — so a theme naming either prop on `origam-video` was silently ignored by
// `useVideoPlayer`'s OWN internal state and the reduced-motion suppression
// warning (the native `<video>` attributes themselves were already fine,
// being template bindings evaluated at render time).
//
// The fix mirrors `OrigamAudio.vue`'s identical, already-proven pattern:
// pass GETTERS (`() => props.autoplay`, `() => resolvedMuted.value`) instead
// of raw values. A getter has no cache to poison — `toValue()` re-invokes it
// fresh every time, deferred inside `useMediaPlayer`'s `bind()` (`onMounted`,
// i.e. after `beforeCreate`) — so it closes the ADR-005 gap without
// reproducing #673's regression.
//
// Mirrors packages/tests/TU/components/Audio/audio-theme-defaults.spec.ts
// (the "autoplay default" describe block) exactly.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamVideo from '@origam/components/Video/OrigamVideo.vue'
import { createOrigam } from '@origam/origam'
import { MEDIA_AUTOPLAY_SUPPRESSED_WARNING } from '@origam/consts'
import { ORIGAM_LOCALE_KEY } from '@origam/consts'

import type { IOrigamTheme } from '@origam/interfaces'

const stubLocale = (): any => ({
    t: (key: string, ...args: Array<unknown>) => {
        if (args.length === 0) return key
        return `${ key }|${ args.join(',') }`
    },
    n: (n: number) => String(n),
    current: { value: 'en' },
    fallback: { value: 'en' },
    messages: { value: {} },
    provide: () => stubLocale(),
    rtl: { value: false },
    isRtl: { value: false }
})

const localeInstance = stubLocale()

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach((el) => el.remove())
    vi.restoreAllMocks()
})

const AUTOPLAY_THEME: IOrigamTheme = {
    name: 'video-autoplay-theme',
    mode: 'light',
    components: {
        'origam-video': { autoplay: true }
    },
    vars: {}
}

function mountVideo (origam: ReturnType<typeof createOrigam>, props: Record<string, unknown> = {}) {
    return mount(OrigamVideo, {
        attachTo: document.body,
        global: {
            plugins: [origam],
            provide: {
                [ORIGAM_LOCALE_KEY as unknown as symbol]: localeInstance
            },
            stubs: {
                OrigamIcon: { template: '<i aria-hidden="true" />' }
            }
        },
        props: {
            src: 'https://example.com/video.mp4',
            ...props
        }
    })
}

describe('OrigamVideo — theme.components["origam-video"] autoplay default (#661)', () => {
    it('a theme default for autoplay IS seen by useMediaPlayer.bind() (reduced-motion suppression warning fires)', () => {
        // Same mechanism as OrigamAudio (#661): `useMediaPlayer`'s `bind()`
        // (onMounted, AFTER the ADR-005 resolver has patched
        // `instance.props.autoplay`) only warns when it sees a truthy
        // `autoplay` AND the user prefers reduced motion. Pre-fix,
        // `options.autoplay` was a snapshot of `props.autoplay` taken at
        // `setup()` time (before the resolver runs) — the component's own
        // default (`false`) — so the warning never fired even though the
        // THEME asked for `autoplay: true`.
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: true, media: query, addEventListener () {}, removeEventListener () {}
        }))
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const origam = createOrigam({ themes: [AUTOPLAY_THEME] })
        origam._defaultsRef.value = origam._activeDefaultsFor('video-autoplay-theme', 'light')

        mountVideo(origam)

        expect(warnSpy).toHaveBeenCalledWith(MEDIA_AUTOPLAY_SUPPRESSED_WARNING)
    })

    it('negative control — with NO theme default, the same reduced-motion setup does NOT warn (autoplay stays false)', () => {
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: true, media: query, addEventListener () {}, removeEventListener () {}
        }))
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const origam = createOrigam({})

        mountVideo(origam)

        expect(warnSpy).not.toHaveBeenCalledWith(MEDIA_AUTOPLAY_SUPPRESSED_WARNING)
    })
})
