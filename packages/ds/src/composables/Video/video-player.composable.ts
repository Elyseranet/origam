import {
    onBeforeUnmount,
    onMounted,
    ref,
    type Ref
} from 'vue'

import { shouldSuppressAutoplay as shouldSuppressAutoplayBase, useMediaPlayer } from '../Media/use-media-player.composable'

import type {
    IUseVideoPlayerOptions,
    IVideoPlayerMethods,
    IVideoPlayerState
} from '../../interfaces'

/**
 * Inline default kept for the SFC `withDefaults` host — see CLAUDE.md
 * "withDefaults inline literals only" rule. The constant is exported
 * so consumers can reference the canonical default in docs/tests
 * without re-typing the literal.
 */

/**
 * Headless video player composable. Composes the media-shared
 * `useMediaPlayer` base and layers on the video-only state
 * (`fullscreen`, `pip`) + methods (`enterFullscreen`,
 * `exitFullscreen`, `toggleFullscreen`, `requestPip`, `exitPip`,
 * `togglePip`) + native event bindings
 * (`enterpictureinpicture` / `leavepictureinpicture` /
 * document-level `fullscreenchange`).
 *
 * The composable does NOT mount the `<video>` element — consumers pass
 * a ref (or accept the one the composable creates) and bind it on the
 * `<video>` tag themselves. This keeps the headless / styled split
 * clean: `<OrigamVideo>` is just a default skin on top of this state.
 *
 * @example
 * ```ts
 * const videoRef = ref<HTMLVideoElement | null>(null)
 * const { state, methods } = useVideoPlayer({ videoRef, autoplay: false })
 *
 * // template:
 * // <video ref="videoRef" src="…" />
 * ```
 */
export function useVideoPlayer (options: IUseVideoPlayerOptions = {}): {
    videoRef: Ref<HTMLVideoElement | null>
    state: IVideoPlayerState
    methods: IVideoPlayerMethods
} {
    const videoRef: Ref<HTMLVideoElement | null> = options.videoRef ?? ref(null)

    // The base composable types its ref against the common ancestor
    // (HTMLMediaElement). We hand it the video-typed ref directly —
    // structural compatibility lets it bind the listeners that apply
    // to BOTH element kinds without losing video-specific typing on
    // the public return.
    const {
        state: baseState,
        methods: baseMethods
    } = useMediaPlayer({
        autoplay: options.autoplay,
        muted: options.muted,
        loop: options.loop,
        preload: options.preload,
        mediaRef: videoRef as unknown as Ref<HTMLMediaElement | null>
    })

    const fullscreen: Ref<boolean> = ref(false)
    const pip: Ref<boolean> = ref(false)

    /*********************************************************
     * Video-specific imperative methods. The base composable owns
     * play/pause/seek/volume/mute/load/skip/rate/remote. Fullscreen
     * and PIP are exclusively video concerns — `HTMLAudioElement`
     * exposes neither API surface.
     ********************************************************/
    const enterFullscreen = async (): Promise<void> => {
        const el = videoRef.value
        if (!el || typeof document === 'undefined') return
        try {
            if (typeof el.requestFullscreen === 'function') {
                await el.requestFullscreen()
            } else {
                // iOS Safari only exposes `webkitEnterFullscreen` on the
                // `<video>` element itself — the standard
                // `requestFullscreen` Promise either rejects or no-ops.
                const legacy = el as unknown as { webkitEnterFullscreen?: () => void }
                legacy.webkitEnterFullscreen?.()
            }
        } catch (err) {
            baseState.error.value = err instanceof Error ? err : new Error(String(err))
        }
    }

    const exitFullscreen = async (): Promise<void> => {
        if (typeof document === 'undefined') return
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
            }
        } catch (err) {
            baseState.error.value = err instanceof Error ? err : new Error(String(err))
        }
    }

    const toggleFullscreen = async (): Promise<void> => {
        if (typeof document === 'undefined') return
        if (document.fullscreenElement) await exitFullscreen()
        else await enterFullscreen()
    }

    const requestPip = async (): Promise<void> => {
        const el = videoRef.value
        if (!el || typeof document === 'undefined') return
        try {
            const req = (el as unknown as { requestPictureInPicture?: () => Promise<PictureInPictureWindow> }).requestPictureInPicture
            if (typeof req === 'function') {
                await req.call(el)
            }
        } catch (err) {
            baseState.error.value = err instanceof Error ? err : new Error(String(err))
        }
    }

    const exitPip = async (): Promise<void> => {
        if (typeof document === 'undefined') return
        try {
            const doc = document as unknown as { pictureInPictureElement?: Element | null, exitPictureInPicture?: () => Promise<void> }
            if (doc.pictureInPictureElement && typeof doc.exitPictureInPicture === 'function') {
                await doc.exitPictureInPicture()
            }
        } catch (err) {
            baseState.error.value = err instanceof Error ? err : new Error(String(err))
        }
    }

    const togglePip = async (): Promise<void> => {
        if (typeof document === 'undefined') return
        const doc = document as unknown as { pictureInPictureElement?: Element | null }
        if (doc.pictureInPictureElement) await exitPip()
        else await requestPip()
    }

    /*********************************************************
     * Video-specific event listeners. The base composable already
     * binds the audio-and-video common listeners; here we only add
     * the picture-in-picture pair on the element and the
     * document-level fullscreen listener.
     ********************************************************/
    const onEnterPip = () => { pip.value = true }
    const onLeavePip = () => { pip.value = false }
    const onFullscreenChange = () => {
        fullscreen.value = Boolean(document.fullscreenElement)
    }

    onMounted(() => {
        const el = videoRef.value
        if (el) {
            el.addEventListener('enterpictureinpicture', onEnterPip as EventListener)
            el.addEventListener('leavepictureinpicture', onLeavePip as EventListener)
        }
        if (typeof document !== 'undefined') {
            document.addEventListener('fullscreenchange', onFullscreenChange)
        }
    })

    onBeforeUnmount(() => {
        const el = videoRef.value
        if (el) {
            el.removeEventListener('enterpictureinpicture', onEnterPip as EventListener)
            el.removeEventListener('leavepictureinpicture', onLeavePip as EventListener)
        }
        if (typeof document !== 'undefined') {
            document.removeEventListener('fullscreenchange', onFullscreenChange)
        }
    })

    return {
        videoRef,
        state: {
            ...baseState,
            fullscreen,
            pip
        },
        methods: {
            ...baseMethods,
            enterFullscreen,
            exitFullscreen,
            toggleFullscreen,
            requestPip,
            exitPip,
            togglePip
        }
    }
}

/**
 * Reduced-motion check exported for the host component — kept here
 * so the single source of truth for "should autoplay run?" stays in
 * the composable, even when the decision is made by the SFC at
 * attribute resolution time (i.e. before the composable's onMounted
 * has fired). Re-exported from the media-shared base.
 */
export function shouldSuppressAutoplay (): boolean {
    return shouldSuppressAutoplayBase()
}

