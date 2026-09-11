// Unit tests for `useVideoPlayer` — covers the headless state machine
// (play/pause/ended/timeupdate, buffered, volume, muted, fullscreen,
// PIP) on top of a stubbed `HTMLVideoElement`. The native fullscreen
// and PIP API surfaces are exercised through Vitest mocks; we don't
// try to test the real CSS / DOM behaviour here (the e2e spec does).

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { shouldSuppressAutoplay, useVideoPlayer } from '@origam/composables/Video/video-player.composable'

/**
 * Helper component — runs `useVideoPlayer` inside a real Vue setup
 * scope so onMounted / onBeforeUnmount fire. The component renders a
 * `<video>` tag whose ref is bound through the composable. We wrap the
 * `<video>` in a `<div>` host so `wrapper.element` always points at a
 * regular container (jsdom returns the rendered root as
 * `wrapper.element`, which would be the `<video>` itself if it were
 * the root).
 */
function createHost (options: Parameters<typeof useVideoPlayer>[0] = {}) {
    let captured: ReturnType<typeof useVideoPlayer> | null = null
    const Host = defineComponent({
        setup () {
            captured = useVideoPlayer(options)
            return () => h('div', [h('video', { ref: captured!.videoRef })])
        }
    })
    const wrapper = mount(Host)
    return { wrapper, getApi: () => captured! }
}

function getVideo (wrapper: ReturnType<typeof mount>): HTMLVideoElement {
    const el = wrapper.element as HTMLElement
    const video = el.tagName === 'VIDEO' ? el : el.querySelector('video')
    if (!video) throw new Error('no <video> element found in host')
    return video as HTMLVideoElement
}

/**
 * Patch the HTMLMediaElement prototype with a minimal stub so the
 * jsdom-rendered `<video>` exposes `play()`, `pause()`, `load()` and
 * the `currentTime` / `duration` / `volume` / `muted` properties.
 */
function patchVideoPrototype (overrides: Partial<HTMLMediaElement> = {}) {
    const proto = HTMLMediaElement.prototype as unknown as Record<string, any>
    const original = {
        play: proto.play,
        pause: proto.pause,
        load: proto.load
    }
    proto.play = vi.fn().mockResolvedValue(undefined)
    proto.pause = vi.fn()
    proto.load = vi.fn()
    Object.entries(overrides).forEach(([key, value]) => {
        Object.defineProperty(proto, key, { configurable: true, value })
    })
    return () => {
        proto.play = original.play
        proto.pause = original.pause
        proto.load = original.load
    }
}

describe('useVideoPlayer', () => {
    let restore: () => void
    beforeEach(() => {
        restore = patchVideoPrototype()
    })
    afterEach(() => {
        restore()
        vi.restoreAllMocks()
    })

    it('exposes the documented state surface initialised to safe defaults', async () => {
        const { getApi } = createHost()
        await nextTick()
        const { state } = getApi()
        expect(state.playing.value).toBe(false)
        expect(state.paused.value).toBe(true)
        expect(state.currentTime.value).toBe(0)
        expect(state.volume.value).toBeGreaterThanOrEqual(0)
        expect(state.muted.value).toBe(false)
        expect(state.fullscreen.value).toBe(false)
        expect(state.pip.value).toBe(false)
        expect(state.error.value).toBeNull()
    })

    it('flips `playing` / `paused` on the native play and pause events', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { state } = getApi()
        const video = getVideo(wrapper)

        video.dispatchEvent(new Event('play'))
        expect(state.playing.value).toBe(true)
        expect(state.paused.value).toBe(false)

        video.dispatchEvent(new Event('pause'))
        expect(state.playing.value).toBe(false)
        expect(state.paused.value).toBe(true)
    })

    it('updates `currentTime` on the timeupdate event', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { state } = getApi()
        const video = getVideo(wrapper)
        Object.defineProperty(video, 'currentTime', { configurable: true, value: 42 })

        video.dispatchEvent(new Event('timeupdate'))
        expect(state.currentTime.value).toBe(42)
    })

    it('updates `duration` and clears `loading` on loadedmetadata', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { state } = getApi()
        const video = getVideo(wrapper)
        Object.defineProperty(video, 'duration', { configurable: true, value: 123.45 })

        video.dispatchEvent(new Event('loadstart'))
        expect(state.loading.value).toBe(true)

        video.dispatchEvent(new Event('loadedmetadata'))
        expect(state.duration.value).toBe(123.45)
        expect(state.loading.value).toBe(false)
        expect(state.ready.value).toBe(true)
    })

    it('captures errors from the error event', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { state } = getApi()
        const video = getVideo(wrapper)

        video.dispatchEvent(new Event('error'))
        expect(state.error.value).not.toBeNull()
    })

    it('seek() clamps to [0, duration]', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { methods } = getApi()
        const video = getVideo(wrapper)
        Object.defineProperty(video, 'duration', { configurable: true, value: 60 })

        let writes = 0
        let last = 0
        Object.defineProperty(video, 'currentTime', {
            configurable: true,
            get () { return last },
            set (v: number) { writes++; last = v }
        })

        methods.seek(-5)
        expect(last).toBe(0)
        methods.seek(120)
        expect(last).toBe(60)
        methods.seek(30)
        expect(last).toBe(30)
        expect(writes).toBe(3)
    })

    it('setVolume() clamps to [0, 1] and unmutes when the new value is non-zero', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { methods } = getApi()
        const video = getVideo(wrapper)

        let vol = 0
        let mute = true
        Object.defineProperty(video, 'volume', {
            configurable: true,
            get () { return vol },
            set (v: number) { vol = v }
        })
        Object.defineProperty(video, 'muted', {
            configurable: true,
            get () { return mute },
            set (v: boolean) { mute = v }
        })

        methods.setVolume(1.5)
        expect(vol).toBe(1)
        expect(mute).toBe(false)

        methods.setVolume(-0.2)
        expect(vol).toBe(0)
    })

    it('toggleMute() flips the muted flag on the element', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { methods } = getApi()
        const video = getVideo(wrapper)

        let mute = false
        Object.defineProperty(video, 'muted', {
            configurable: true,
            get () { return mute },
            set (v: boolean) { mute = v }
        })

        methods.toggleMute()
        expect(mute).toBe(true)
        methods.toggleMute()
        expect(mute).toBe(false)
    })

    it('toggleFullscreen() calls requestFullscreen when none is active', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { methods } = getApi()
        const video = getVideo(wrapper)
        const request = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(video, 'requestFullscreen', { configurable: true, value: request })
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null })

        await methods.toggleFullscreen()
        expect(request).toHaveBeenCalledTimes(1)
    })

    it('toggleFullscreen() calls exitFullscreen when one is active', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { methods } = getApi()
        const video = getVideo(wrapper)
        const exit = vi.fn().mockResolvedValue(undefined)
        Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: video })
        Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit })

        await methods.toggleFullscreen()
        expect(exit).toHaveBeenCalledTimes(1)
    })

    it('togglePip() calls requestPictureInPicture when not in PIP', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { methods } = getApi()
        const video = getVideo(wrapper)
        const requestPip = vi.fn().mockResolvedValue({})
        Object.defineProperty(video, 'requestPictureInPicture', { configurable: true, value: requestPip })
        Object.defineProperty(document, 'pictureInPictureElement', { configurable: true, value: null })

        await methods.togglePip()
        expect(requestPip).toHaveBeenCalledTimes(1)
    })

    it('updates `pip` on enterpictureinpicture / leavepictureinpicture', async () => {
        const { wrapper, getApi } = createHost()
        await nextTick()
        const { state } = getApi()
        const video = getVideo(wrapper)

        video.dispatchEvent(new Event('enterpictureinpicture'))
        expect(state.pip.value).toBe(true)
        video.dispatchEvent(new Event('leavepictureinpicture'))
        expect(state.pip.value).toBe(false)
    })

    it('emits a console warning when autoplay is requested while prefers-reduced-motion is set', async () => {
        const matchMedia = vi.fn().mockReturnValue({ matches: true, media: '(prefers-reduced-motion: reduce)' })
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia })
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

        createHost({ autoplay: true })
        await nextTick()

        expect(warn).toHaveBeenCalled()
        expect(String(warn.mock.calls[0]?.[0] ?? '')).toContain('reduced motion')
    })

    it('shouldSuppressAutoplay() reports the prefers-reduced-motion outcome', () => {
        const matchMedia = vi.fn().mockReturnValue({ matches: true })
        Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia })
        expect(shouldSuppressAutoplay()).toBe(true)
    })

    it('accepts an externally-supplied videoRef so the consumer can drive the binding', async () => {
        const externalRef = ref<HTMLVideoElement | null>(null)
        let api: ReturnType<typeof useVideoPlayer> | null = null
        const Host = defineComponent({
            setup () {
                api = useVideoPlayer({ videoRef: externalRef })
                return () => h('div', [h('video', { ref: externalRef })])
            }
        })
        const wrapper = mount(Host)
        await nextTick()
        expect(api!.videoRef).toBe(externalRef)
        const video = getVideo(wrapper)
        expect(video).toBeTruthy()
    })
})
