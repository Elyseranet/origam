/*
 * #706 — OrigamMediaController must not keep working after unmount.
 *
 * The cross-origin download path fires a `fetch` whose `.catch()` calls
 * `window.open`, and whose success path arms a 30s `setTimeout` to revoke
 * the blob URL. Nothing used to cancel either. In CI the rejection landed
 * AFTER vitest tore the jsdom environment down — `window` no longer
 * existed — and the run died on an unhandled
 * `ReferenceError: window is not defined` with zero red tests
 * (PR #704 and PR #715, both on a PR whose only change was a CSV file).
 *
 * These tests drive `handleDownloadClick` through the component's setup
 * state rather than through the cog menu markup. The DOM path is already
 * covered by OrigamMediaController.spec.ts, and the CI stack traces
 * (`OrigamMediaController.vue:636`) prove it reaches this handler; what
 * is under test here is the lifecycle contract, not the menu.
 */
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import OrigamMediaController from '@origam/components/Media/OrigamMediaController.vue'

import { ORIGAM_LOCALE_KEY } from '@origam/consts'

const CROSS_ORIGIN_URL = 'https://example.com/foo.mp4'

const stubLocale = (): any => ({
    t: (key: string) => key,
    n: (n: number) => String(n),
    current: { value: 'en' },
    fallback: { value: 'en' },
    messages: { value: {} },
    provide: () => stubLocale(),
    rtl: { value: false },
    isRtl: { value: false }
})

const noop = () => {}

const buildState = () => ({
    playing: ref(false),
    muted: ref(false),
    volume: ref(1),
    currentTime: ref(0),
    duration: ref(100),
    buffered: ref(0),
    playbackRate: ref(1),
    fullscreen: ref(false),
    pictureInPicture: ref(false),
    casting: ref(false),
    captionsEnabled: ref(false)
})

const buildMethods = () => ({
    togglePlay: noop,
    toggleMute: noop,
    setVolume: noop,
    seek: noop,
    setPlaybackRate: noop,
    toggleFullscreen: noop,
    togglePictureInPicture: noop,
    toggleCaptions: noop,
    toggleCast: noop,
    skipForward: noop,
    skipBackward: noop
})

const mountController = (): VueWrapper => mount(OrigamMediaController, {
    global: {
        provide: { [ORIGAM_LOCALE_KEY as unknown as symbol]: stubLocale() },
        stubs: {
            OrigamIcon: true,
            OrigamBtn: true,
            OrigamMenu: true,
            OrigamMediaVolumeControl: true,
            OrigamMediaScrubber: true
        }
    },
    props: {
        state: buildState() as never,
        methods: buildMethods() as never,
        downloadable: true,
        downloadUrl: CROSS_ORIGIN_URL
    }
})

const clickDownload = (wrapper: VueWrapper): void => {
    const setupState = (wrapper.vm.$ as unknown as {
        setupState: Record<string, unknown>
    }).setupState
    const handler = setupState.handleDownloadClick as (e: MouseEvent) => void

    expect(typeof handler).toBe('function')

    handler(new MouseEvent('click', { cancelable: true }))
}

/* Let the promise chain advance without leaving real time on the clock. */
const flushPromises = async (): Promise<void> => {
    for (let i = 0; i < 5; i++) await Promise.resolve()
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('OrigamMediaController — download teardown (#706)', () => {
    it('does not call window.open when the fetch rejects after unmount', async () => {
        let rejectFetch: (reason: Error) => void = () => {}

        vi.stubGlobal('fetch', () => new Promise((_resolve, reject) => {
            rejectFetch = reject
        }))

        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

        const wrapper = mountController()
        clickDownload(wrapper)

        // The component goes away while the request is still in flight.
        wrapper.unmount()

        rejectFetch(new Error('CORS denied'))
        await flushPromises()

        expect(openSpy).not.toHaveBeenCalled()
    })

    it('still calls window.open when the fetch rejects while mounted', async () => {
        // Negative control: the fix must not kill the feature itself.
        let rejectFetch: (reason: Error) => void = () => {}

        vi.stubGlobal('fetch', () => new Promise((_resolve, reject) => {
            rejectFetch = reject
        }))

        const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

        const wrapper = mountController()
        clickDownload(wrapper)

        rejectFetch(new Error('CORS denied'))
        await flushPromises()

        expect(openSpy).toHaveBeenCalledWith(CROSS_ORIGIN_URL, '_blank', 'noopener,noreferrer')

        wrapper.unmount()
    })

    it('revokes the blob URL and cancels the deferred revoke timer on unmount', async () => {
        const BLOB_URL = 'blob:origam-706-test'

        vi.stubGlobal('fetch', () => Promise.resolve({
            ok: true,
            blob: () => Promise.resolve(new Blob(['x']))
        }))

        const createSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(BLOB_URL)
        const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

        const wrapper = mountController()
        clickDownload(wrapper)
        await flushPromises()

        // The success path ran and armed the 30s revoke timer.
        expect(createSpy).toHaveBeenCalledOnce()
        expect(revokeSpy).not.toHaveBeenCalled()

        wrapper.unmount()

        // Unmount must revoke now rather than leave a 30s window.setTimeout
        // pointing at a dead component.
        expect(revokeSpy).toHaveBeenCalledWith(BLOB_URL)
    })

    it('does not throw when the rejection lands after `window` is gone', async () => {
        // Reproduces the CI condition itself: vitest's environment teardown
        // removes `window` from the global scope, and only THEN does the
        // pending rejection settle. Pre-fix this raised
        // `ReferenceError: window is not defined` from the `.catch()`.
        let rejectFetch: (reason: Error) => void = () => {}

        vi.stubGlobal('fetch', () => new Promise((_resolve, reject) => {
            rejectFetch = reject
        }))

        const wrapper = mountController()
        clickDownload(wrapper)
        wrapper.unmount()

        const rejections: unknown[] = []
        const onUnhandled = (reason: unknown) => rejections.push(reason)
        process.on('unhandledRejection', onUnhandled)

        const realWindow = globalThis.window

        try {
            // @ts-expect-error — standing in for vitest's env teardown
            delete globalThis.window

            rejectFetch(new Error('CORS denied'))
            await flushPromises()
            // unhandledRejection is emitted on a macrotask boundary
            await new Promise((resolve) => setTimeout(resolve, 0))
        } finally {
            globalThis.window = realWindow
            process.off('unhandledRejection', onUnhandled)
        }

        expect(rejections).toEqual([])
    })
})
