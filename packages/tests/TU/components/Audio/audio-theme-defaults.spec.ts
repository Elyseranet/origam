// Regression coverage for issue #648 (OPEN) — `<OrigamAudio>`'s
// `loopMode` / `shuffle` theme defaults were lost at mount, same family as
// #429 (OrigamMediaController):
//
//     const initialLoopMode = props.loopMode && props.loopMode !== 'none'
//         ? props.loopMode
//         : (props.loop ? 'one' : 'none')
//     const internalLoopMode = ref<TAudioLoopMode>(initialLoopMode)   // eager
//     const internalShuffle  = ref<boolean>(props.shuffle ?? false)  // eager
//
// Both are EAGER reads in the body of `setup()`. Vue runs `setup()` BEFORE
// the `beforeCreate` hook where the ADR-005 theme-props resolver patches
// `instance.props` (root CLAUDE.md), so a theme setting a default for
// `loopMode` or `shuffle` on `origam-audio` is captured too late.
//
// Mirrors packages/tests/TU/components/Media/media-controller-theme-defaults.spec.ts.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { OrigamAudio } from '@origam/components'
import { createOrigam } from '@origam/origam'
import { MEDIA_AUTOPLAY_SUPPRESSED_WARNING } from '@origam/consts'

import type { IOrigamTheme } from '@origam/interfaces'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach((el) => el.remove())
    vi.restoreAllMocks()
})

const THEME: IOrigamTheme = {
    name: 'audio-defaults-theme',
    mode: 'light',
    components: {
        'origam-audio': { loopMode: 'all', shuffle: true }
    },
    vars: {}
}

function mountThemedAudio () {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('audio-defaults-theme', 'light')

    return mount(OrigamAudio, {
        attachTo: document.body,
        global: { plugins: [origam] },
        props: {
            playlist: [
                { src: 'a.mp3', title: 'A' },
                { src: 'b.mp3', title: 'B' }
            ]
        } as never
    })
}

describe('OrigamAudio — theme.components["origam-audio"] loopMode/shuffle defaults (#648)', () => {
    it('a theme default for loopMode is NOT lost at mount', () => {
        const wrapper = mountThemedAudio()
        const loopBtn = wrapper.find('[data-cy="origam-media-controller-loop"]')

        expect(loopBtn.exists()).toBe(true)
        expect(loopBtn.attributes('aria-pressed')).toBe('true')
    })

    it('a theme default for shuffle is NOT lost at mount', () => {
        const wrapper = mountThemedAudio()
        const shuffleBtn = wrapper.find('[data-cy="origam-media-controller-shuffle"]')

        expect(shuffleBtn.exists()).toBe(true)
        expect(shuffleBtn.attributes('aria-pressed')).toBe('true')
    })
})

// Regression coverage for issue #661 — the reconciliation pass on develop
// found 5 MORE props of `<OrigamAudio>` still read eagerly at `setup()`
// after #648 fixed loopMode/shuffle: `currentTrackIndex`, `autoplay`,
// `loop`, `preload`, `crossorigin`. `loop`/`preload` turned out to be dead
// pass-through into `useMediaPlayer` (grepped — the composable never reads
// `options.loop` / `options.preload`), so they carry no themeable behaviour
// to regression-test; `currentTrackIndex` and `autoplay` do.
const TRACK_INDEX_THEME: IOrigamTheme = {
    name: 'audio-track-index-theme',
    mode: 'light',
    components: {
        'origam-audio': { currentTrackIndex: 1 }
    },
    vars: {}
}

function mountTrackIndexThemedAudio () {
    const origam = createOrigam({ themes: [TRACK_INDEX_THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('audio-track-index-theme', 'light')

    return mount(OrigamAudio, {
        attachTo: document.body,
        global: { plugins: [origam] },
        props: {
            playlist: [
                { src: 'a.mp3', title: 'A' },
                { src: 'b.mp3', title: 'B' }
            ]
        } as never
    })
}

describe('OrigamAudio — theme.components["origam-audio"] currentTrackIndex default (#661)', () => {
    it('a theme default for currentTrackIndex is NOT lost at mount — track 1 (index 1) starts active, not track 0', () => {
        const wrapper = mountTrackIndexThemedAudio()

        const track0 = wrapper.find('[data-cy="origam-audio-playlist-item-0"]')
        const track1 = wrapper.find('[data-cy="origam-audio-playlist-item-1"]')

        expect(track1.classes()).toContain('origam-list-item--active')
        expect(track0.classes()).not.toContain('origam-list-item--active')
    })
})

const AUTOPLAY_THEME: IOrigamTheme = {
    name: 'audio-autoplay-theme',
    mode: 'light',
    components: {
        'origam-audio': { autoplay: true }
    },
    vars: {}
}

describe('OrigamAudio — theme.components["origam-audio"] autoplay default (#661)', () => {
    it('a theme default for autoplay IS seen by useMediaPlayer.bind() (reduced-motion suppression warning fires)', () => {
        // `useMediaPlayer`'s `bind()` (called from `onMounted`, i.e. AFTER
        // the ADR-005 resolver has patched `instance.props.autoplay`) only
        // warns when it sees a truthy `autoplay` AND the user prefers
        // reduced motion. Pre-#661, `options.autoplay` was a snapshot of
        // `props.autoplay` taken at `setup()` time (before the resolver
        // runs), which is the component's own default (`false`) — the
        // warning would never fire even though the THEME asked for
        // `autoplay: true`. Post-#661, `options.autoplay` is a getter
        // resolved lazily inside `bind()`, which sees the resolver's
        // patched value.
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: true, media: query, addEventListener () {}, removeEventListener () {}
        }))
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const origam = createOrigam({ themes: [AUTOPLAY_THEME] })
        origam._defaultsRef.value = origam._activeDefaultsFor('audio-autoplay-theme', 'light')

        mount(OrigamAudio, {
            attachTo: document.body,
            global: { plugins: [origam] },
            props: { src: 'a.mp3' } as never
        })

        expect(warnSpy).toHaveBeenCalledWith(MEDIA_AUTOPLAY_SUPPRESSED_WARNING)
    })

    it('negative control — with NO theme default, the same reduced-motion setup does NOT warn (autoplay stays false)', () => {
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: true, media: query, addEventListener () {}, removeEventListener () {}
        }))
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const origam = createOrigam({})

        mount(OrigamAudio, {
            attachTo: document.body,
            global: { plugins: [origam] },
            props: { src: 'a.mp3' } as never
        })

        expect(warnSpy).not.toHaveBeenCalledWith(MEDIA_AUTOPLAY_SUPPRESSED_WARNING)
    })
})
