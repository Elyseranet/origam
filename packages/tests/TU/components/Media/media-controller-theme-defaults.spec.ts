// Regression coverage for issue #429 (OPEN) — `<OrigamMediaController>`'s
// `loopMode` / `shuffle` theme defaults were lost at mount:
//
//     const internalLoopMode = ref<TAudioLoopMode>(props.loopMode ?? 'none')
//     const internalShuffle  = ref<boolean>(props.shuffle ?? false)
//
// Both are EAGER reads in the body of `setup()`. Vue runs `setup()` BEFORE
// the `beforeCreate` hook where the ADR-005 theme-props resolver patches
// `instance.props` (root CLAUDE.md, "How theme.components props actually
// resolve"), so a theme setting a default for either prop is captured too
// late — `props.loopMode`/`props.shuffle` still read `undefined` at the
// point these refs are seeded, and nothing re-reads them afterwards (the
// `watch()` right below each only fires on a LATER change, never the
// initial value).
//
// The established, tested fix for exactly this shape (root CLAUDE.md cites
// `useSelectLink`/`useValidation`/`useVirtual`, and `useVModel` itself) is a
// LAZY seed — `useVModel`'s own internal ref starts `UNSEEDED` and the seed
// is read on first ACCESS (at render, comfortably after `beforeCreate`),
// not at `useVModel()` call time. Reusing that composable here (rather than
// hand-rolling a second lazy-ref pattern) is the "réutiliser avant
// d'écrire" call.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamMediaController from '@origam/components/Media/OrigamMediaController.vue'
import { createOrigam } from '@origam/origam'

import type { IOrigamTheme } from '@origam/interfaces'
import type { IVideoPlayerMethods, IVideoPlayerState } from '@origam/interfaces'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach((el) => el.remove())
})

const buildState = (): IVideoPlayerState => ({
    playing: ref(false),
    paused: ref(true),
    currentTime: ref(0),
    duration: ref(100),
    buffered: ref(0),
    volume: ref(1),
    muted: ref(false),
    fullscreen: ref(false),
    pip: ref(false),
    ready: ref(true),
    loading: ref(false),
    error: ref(null),
    playbackRate: ref(1),
    remoteAvailable: ref(false),
    remoteState: ref('disconnected')
})

const buildMethods = (): IVideoPlayerMethods => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    toggleFullscreen: vi.fn().mockResolvedValue(undefined),
    togglePip: vi.fn().mockResolvedValue(undefined),
    load: vi.fn(),
    skipBackward: vi.fn(),
    skipForward: vi.fn(),
    setPlaybackRate: vi.fn(),
    requestRemotePlayback: vi.fn().mockResolvedValue(undefined)
})

const THEME: IOrigamTheme = {
    name: 'media-controller-defaults-theme',
    mode: 'light',
    components: {
        'origam-media-controller': { loopMode: 'all', shuffle: true }
    },
    vars: {}
}

const stubs = {
    OrigamIcon: { template: '<i aria-hidden="true" />' },
    OrigamBtn: {
        props: ['icon', 'active', 'ariaLabel'],
        template: '<button type="button" :aria-label="ariaLabel" :aria-pressed="active" v-bind="$attrs" />'
    },
    OrigamMenu: { template: '<div><slot name="activator" :props="{}" /></div>' },
    OrigamMediaVolumeControl: { template: '<div v-bind="$attrs" />' },
    OrigamMediaScrubber: { template: '<div v-bind="$attrs" />' }
}

function mountThemedController () {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('media-controller-defaults-theme', 'light')

    return mount(OrigamMediaController, {
        attachTo: document.body,
        global: {
            plugins: [origam],
            stubs
        },
        props: {
            state: buildState(),
            methods: buildMethods(),
            showLoop: true,
            showShuffle: true
        }
    })
}

describe('OrigamMediaController — theme.components["origam-media-controller"] loopMode/shuffle defaults (#429)', () => {
    it('a theme default for loopMode is NOT lost at mount', () => {
        const wrapper = mountThemedController()
        const loopBtn = wrapper.find('[data-cy="origam-media-controller-loop"]')

        // Theme sets loopMode: 'all' → the loop button should render
        // "Loop playlist" / aria-pressed=true, not the 'none' default.
        expect(loopBtn.attributes('aria-label')).toBe('Loop playlist')
        expect(loopBtn.attributes('aria-pressed')).toBe('true')
    })

    it('a theme default for shuffle is NOT lost at mount', () => {
        const wrapper = mountThemedController()
        const shuffleBtn = wrapper.find('[data-cy="origam-media-controller-shuffle"]')

        // Theme sets shuffle: true → aria-pressed should start true.
        expect(shuffleBtn.attributes('aria-pressed')).toBe('true')
    })
})
