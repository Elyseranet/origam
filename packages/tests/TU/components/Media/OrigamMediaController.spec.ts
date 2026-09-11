// Unit tests for OrigamMediaController — the reusable controls shell
// extracted from <OrigamVideo>. Asserts the bridge between the
// reactive `state` / `methods` props and the rendered toolbar:
//   - play/pause button ARIA + click contract,
//   - time formatting from `state.currentTime` / `state.duration`,
//   - volume scrubber aria-valuenow (with muted-collapse rule),
//   - `inset` and `visible` modifier classes,
//   - config menu open/close + speed selection contract.
//
// OrigamBtn and OrigamMenu are stubbed so the spec does not need the
// OrigamDisplay injection that OrigamOverlay requires.

import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import OrigamMediaController from '@origam/components/Media/OrigamMediaController.vue'

import { ORIGAM_LOCALE_KEY } from '@origam/consts'

import type { IVideoPlayerMethods, IVideoPlayerState } from '@origam/interfaces'

// Inline label map keeps the spec hermetic — we don't load the full
// Origam i18n plugin in the unit-test environment.
const LABELS: Record<string, string> = {
    'origam.media.play': 'Play',
    'origam.media.pause': 'Pause',
    'origam.media.mute': 'Mute',
    'origam.media.unmute': 'Unmute',
    'origam.media.volume': 'Volume',
    'origam.media.seek': 'Seek',
    'origam.media.settings': 'Settings',
    'origam.media.playbackSpeed': 'Playback speed',
    'origam.media.normalSpeed': 'Normal',
    'origam.media.quality': 'Quality',
    'origam.media.download': 'Download',
    'origam.media.castToDevice': 'Cast to device',
    'origam.media.stopCasting': 'Stop casting'
}

const stubLocale = (): any => ({
    t: (key: string) => LABELS[key] ?? key,
    n: (n: number) => String(n),
    current: { value: 'en' },
    fallback: { value: 'en' },
    messages: { value: {} },
    provide: () => stubLocale(),
    rtl: { value: false },
    isRtl: { value: false }
})

const localeInstance = stubLocale()

type StateRefs = {
    [K in keyof IVideoPlayerState]: IVideoPlayerState[K]
}

interface IBuildStateOverrides {
    playing?: boolean
    paused?: boolean
    currentTime?: number
    duration?: number
    buffered?: number
    volume?: number
    muted?: boolean
    fullscreen?: boolean
    pip?: boolean
    ready?: boolean
    loading?: boolean
    error?: MediaError | Error | null
    playbackRate?: number
    remoteAvailable?: boolean
    remoteState?: 'disconnected' | 'connecting' | 'connected'
}

const buildState = (overrides: IBuildStateOverrides = {}): StateRefs => ({
    playing: ref(overrides.playing ?? false),
    paused: ref(overrides.paused ?? true),
    currentTime: ref(overrides.currentTime ?? 0),
    duration: ref(overrides.duration ?? 100),
    buffered: ref(overrides.buffered ?? 0),
    volume: ref(overrides.volume ?? 1),
    muted: ref(overrides.muted ?? false),
    fullscreen: ref(overrides.fullscreen ?? false),
    pip: ref(overrides.pip ?? false),
    ready: ref(overrides.ready ?? true),
    loading: ref(overrides.loading ?? false),
    error: ref(overrides.error ?? null),
    playbackRate: ref(overrides.playbackRate ?? 1),
    remoteAvailable: ref(overrides.remoteAvailable ?? false),
    remoteState: ref(overrides.remoteState ?? 'disconnected')
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

interface IMountOptions {
    state?: IBuildStateOverrides
    inset?: boolean
    visible?: boolean
    downloadable?: boolean
    downloadUrl?: string | null
    qualityOptions?: ReadonlyArray<{ quality: string, label: string }>
    currentQuality?: string | null
}

// OrigamMenu stub: renders the items tree as flat <button> elements so
// the spec can trigger clicks and assert `data-cy` presence without
// needing the real Menu (which depends on OrigamOverlay / useDisplay).
// Each item carries a `data-cy` derived from its `key` field:
//   speed-root  → ignored (it's the parent row)
//   speed-0.5   → [data-cy="origam-media-controller-config-rate-0.5"]
//   quality-720p→ [data-cy="origam-media-controller-config-quality-720p"]
//   download    → [data-cy="origam-media-controller-config-download"]
const OrigamMenuStub = {
    props: ['modelValue', 'items'],
    emits: ['update:modelValue', 'select'],
    template: `
        <div class="origam-menu-stub" :data-open="modelValue">
            <slot name="activator" :props="{}" />
            <template v-if="modelValue">
                <template v-for="item in flatItems" :key="item.key">
                    <button
                        type="button"
                        :data-cy="itemDataCy(item.key)"
                        @click="$emit('select', item)"
                    >{{ item.title }}</button>
                </template>
            </template>
        </div>
    `,
    computed: {
        flatItems (): Array<any> {
            const flat: Array<any> = []
            const walk = (items: Array<any>) => {
                for (const item of (items ?? [])) {
                    if (item.children && item.children.length) {
                        walk(item.children)
                    } else {
                        flat.push(item)
                    }
                }
            }
            walk((this as any).items ?? [])
            return flat
        }
    },
    methods: {
        itemDataCy (key: string): string {
            if (key.startsWith('speed-')) {
                const rate = key.replace('speed-', '')
                return `origam-media-controller-config-rate-${rate}`
            }
            if (key.startsWith('quality-')) {
                const q = key.replace('quality-', '')
                return `origam-media-controller-config-quality-${q}`
            }
            if (key === 'download') return 'origam-media-controller-config-download'
            return `origam-media-controller-config-${key}`
        }
    }
}

const mountController = (opts: IMountOptions = {}): {
    wrapper: VueWrapper
    methods: IVideoPlayerMethods
    state: StateRefs
} => {
    const state = buildState(opts.state)
    const methods = buildMethods()
    const wrapper = mount(OrigamMediaController, {
        attachTo: document.body,
        global: {
            provide: {
                [ORIGAM_LOCALE_KEY as unknown as symbol]: localeInstance
            },
            stubs: {
                OrigamIcon: { template: '<i aria-hidden="true" />' },
                // OrigamBtn renders as a <button>. data-cy is not a declared prop
                // so it stays in $attrs and is applied to the root via fallthrough.
                // v-bind="$attrs" forwards data-cy, onClick, and any other attrs
                // the controller passes — including the @click="onTogglePlay" handler.
                OrigamBtn: {
                    props: ['icon', 'active', 'ariaLabel'],
                    template: '<button type="button" :aria-label="ariaLabel" :aria-pressed="active" v-bind="$attrs" />'
                },
                OrigamMenu: OrigamMenuStub,
                // VolumeControl stub: the scrubber element carries aria-valuenow.
                // data-cy is not a prop → stays in $attrs → auto-falls-through to
                // the single root element, which also carries aria-valuenow.
                OrigamMediaVolumeControl: {
                    props: ['volume', 'muted', 'muteLabel', 'unmuteLabel', 'volumeLabel'],
                    emits: ['update:muted', 'update:volume'],
                    template: '<div role="slider" :aria-valuenow="muted ? 0 : volume" v-bind="$attrs" />'
                },
                OrigamMediaScrubber: {
                    props: ['modelValue', 'orientation', 'ariaLabel', 'ariaValueText', 'max', 'step', 'buffered'],
                    template: `
                        <div
                            role="slider"
                            :aria-valuenow="modelValue"
                            :aria-orientation="orientation"
                            :aria-label="ariaLabel"
                            :aria-valuetext="ariaValueText"
                        />
                    `
                }
            }
        },
        props: {
            state,
            methods,
            inset: opts.inset,
            visible: opts.visible,
            downloadable: opts.downloadable,
            downloadUrl: opts.downloadUrl,
            qualityOptions: opts.qualityOptions,
            currentQuality: opts.currentQuality
        }
    })
    return { wrapper, methods, state }
}

describe('OrigamMediaController — play / pause button', () => {
    it('renders the play button with the "play" aria-label when paused', () => {
        const { wrapper } = mountController({ state: { playing: false } })
        const btn = wrapper.find('[data-cy="origam-media-controller-play"]')
        expect(btn.exists()).toBe(true)
        expect(btn.attributes('aria-label')).toBe('Play')
    })

    it('flips the aria-label to "pause" when playing', () => {
        const { wrapper } = mountController({ state: { playing: true } })
        const btn = wrapper.find('[data-cy="origam-media-controller-play"]')
        expect(btn.attributes('aria-label')).toBe('Pause')
    })

    it('clicking the play button calls methods.play() when paused', async () => {
        const { wrapper, methods } = mountController({ state: { playing: false } })
        await wrapper.find('[data-cy="origam-media-controller-play"]').trigger('click')
        expect(methods.play).toHaveBeenCalledTimes(1)
        expect(methods.pause).not.toHaveBeenCalled()
    })

    it('clicking the play button calls methods.pause() when playing', async () => {
        const { wrapper, methods } = mountController({ state: { playing: true } })
        await wrapper.find('[data-cy="origam-media-controller-play"]').trigger('click')
        expect(methods.pause).toHaveBeenCalledTimes(1)
        expect(methods.play).not.toHaveBeenCalled()
    })
})

describe('OrigamMediaController — time display', () => {
    it('formats currentTime + duration as mm:ss for short medias', () => {
        const { wrapper } = mountController({ state: { currentTime: 65, duration: 130 } })
        const time = wrapper.find('[data-cy="origam-media-controller-time"]')
        expect(time.text()).toContain('01:05')
        expect(time.text()).toContain('02:10')
    })

    it('shows the em-dash placeholder while duration is NaN', () => {
        const { wrapper } = mountController({ state: { currentTime: 0, duration: NaN } })
        const time = wrapper.find('[data-cy="origam-media-controller-time"]')
        expect(time.text()).toContain('--:--')
    })

    it('formats h:mm:ss for medias longer than an hour', () => {
        const { wrapper } = mountController({ state: { currentTime: 3725, duration: 7200 } })
        const time = wrapper.find('[data-cy="origam-media-controller-time"]')
        expect(time.text()).toContain('1:02:05')
        expect(time.text()).toContain('2:00:00')
    })
})

describe('OrigamMediaController — volume scrubber', () => {
    it('aria-valuenow on the volume scrubber reflects state.volume.value', () => {
        const { wrapper } = mountController({ state: { volume: 0.6, muted: false } })
        const volumeHost = wrapper.find('[data-cy="origam-media-controller-volume"]')
        expect(volumeHost.attributes('aria-valuenow')).toBe('0.6')
    })

    it('reads 0 on aria-valuenow when muted is true (resolvedVolume collapse)', () => {
        const { wrapper } = mountController({ state: { volume: 0.7, muted: true } })
        const volumeHost = wrapper.find('[data-cy="origam-media-controller-volume"]')
        expect(volumeHost.attributes('aria-valuenow')).toBe('0')
    })
})

describe('OrigamMediaController — modifier classes', () => {
    it('adds the --inset modifier class when inset=true', () => {
        const { wrapper } = mountController({ inset: true })
        expect(wrapper.classes()).toContain('origam-media-controller--inset')
    })

    it('omits the --inset class when inset is left at its default', () => {
        const { wrapper } = mountController()
        expect(wrapper.classes()).not.toContain('origam-media-controller--inset')
    })

    it('adds the --visible class when visible=true and removes it when visible=false', async () => {
        const { wrapper } = mountController({ inset: true, visible: true })
        expect(wrapper.classes()).toContain('origam-media-controller--visible')

        await wrapper.setProps({ visible: false })
        expect(wrapper.classes()).not.toContain('origam-media-controller--visible')
    })
})

describe('OrigamMediaController — config menu', () => {
    it('exposes configMenuOpen=false by default', () => {
        const { wrapper } = mountController()
        // defineExpose unwraps refs through the exposed proxy.
        expect((wrapper.vm as any).configMenuOpen).toBe(false)
    })

    it('selecting a playback rate calls methods.setPlaybackRate AND closes the menu', async () => {
        const { wrapper, methods } = mountController()
        const exposed = wrapper.vm as any

        exposed.configMenuOpen = true
        await wrapper.vm.$nextTick()

        const rateBtn = wrapper.find('[data-cy="origam-media-controller-config-rate-1.5"]')
        expect(rateBtn.exists()).toBe(true)
        await rateBtn.trigger('click')

        expect(methods.setPlaybackRate).toHaveBeenCalledWith(1.5)
        expect(exposed.configMenuOpen).toBe(false)
    })
})

describe('OrigamMediaController — quality emits', () => {
    it('selecting a quality emits `quality-change` with the picked id', async () => {
        const { wrapper } = mountController({
            qualityOptions: [
                { quality: '480p', label: '480p' },
                { quality: '720p', label: '720p' }
            ],
            currentQuality: '480p'
        })
        const exposed = wrapper.vm as any
        exposed.configMenuOpen = true
        await wrapper.vm.$nextTick()

        const qualityBtn = wrapper.find('[data-cy="origam-media-controller-config-quality-720p"]')
        expect(qualityBtn.exists()).toBe(true)
        await qualityBtn.trigger('click')

        const emitted = wrapper.emitted('quality-change') as Array<Array<string>>
        expect(emitted).toBeTruthy()
        expect(emitted[0][0]).toBe('720p')
    })
})

describe('OrigamMediaController — download emit', () => {
    it('clicking the download row emits `download` when downloadable + downloadUrl are set', async () => {
        const { wrapper } = mountController({ downloadable: true, downloadUrl: 'https://example.com/foo.mp4' })
        const exposed = wrapper.vm as any
        exposed.configMenuOpen = true
        await wrapper.vm.$nextTick()

        const dl = wrapper.find('[data-cy="origam-media-controller-config-download"]')
        expect(dl.exists()).toBe(true)
        await dl.trigger('click')

        const emitted = wrapper.emitted('download') as Array<Array<unknown>>
        expect(emitted).toBeTruthy()
        expect(emitted.length).toBe(1)
    })

    it('does NOT render the download row when downloadUrl is null', async () => {
        const { wrapper } = mountController({ downloadable: true, downloadUrl: null })
        const exposed = wrapper.vm as any
        exposed.configMenuOpen = true
        await wrapper.vm.$nextTick()

        const dl = wrapper.find('[data-cy="origam-media-controller-config-download"]')
        expect(dl.exists()).toBe(false)
    })
})
