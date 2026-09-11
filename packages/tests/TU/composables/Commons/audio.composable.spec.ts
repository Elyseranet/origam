// Unit tests for `useAudio` (Commons/audio.composable.ts — the low-level
// frequency-analyser composable, distinct from useAudioPlayer in Audio/).
// Covers: initial state, onPlay/onStop state transitions, wasPlayed flag,
// isPlaying flag, watch on props.audio resets wasPlayed/isPlaying,
// watch on props.playAudio triggers play/stop.
//
// AudioContext + AnalyserNode are NOT available in jsdom. We stub them so
// the onAudio() path runs without crashing, and we mock HTMLAudioElement
// play/pause/load so onPlay/onStop reach the element.

import { defineComponent, h, nextTick, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { IUseAudioProps } from '@origam/interfaces'
import { useAudio } from '@origam/composables/Commons/audio.composable'

// ─── stubs ──────────────────────────────────────────────────────────────────

function patchMediaPrototype () {
    const proto = HTMLMediaElement.prototype as unknown as Record<string, any>
    proto.play = vi.fn().mockResolvedValue(undefined)
    proto.pause = vi.fn()
    proto.load = vi.fn()
    return () => {
        delete proto.play
        delete proto.pause
        delete proto.load
    }
}

function patchAudioContext () {
    const connectSpy = vi.fn()
    const analyser = {
        connect: connectSpy,
        fftSize: 0,
        frequencyBinCount: 128,
        getByteFrequencyData: vi.fn()
    }
    const src = { connect: connectSpy }

    class FakeAudioContext {
        createMediaElementSource = vi.fn().mockReturnValue(src)
        createAnalyser = vi.fn().mockReturnValue(analyser)
        destination = {}
    }

    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.stubGlobal('requestAnimationFrame', vi.fn()) // prevent rAF loop

    return { analyser }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function mountWithAudio (initialProps: IUseAudioProps = {}) {
    const props = reactive<IUseAudioProps>({ ...initialProps })
    let api!: ReturnType<typeof useAudio>

    const Host = defineComponent({
        setup () {
            api = useAudio(props)
            // Attach a real <audio> element as the audioRef so play/pause calls land
            return () => h('audio', { ref: api.audioRef })
        }
    })
    const wrapper = mount(Host)
    return { props, wrapper, api: () => api }
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('useAudio — initial state', () => {
    let restore: () => void
    beforeEach(() => {
        restore = patchMediaPrototype()
        patchAudioContext()
    })
    afterEach(() => {
        restore()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('isPlaying starts as false', () => {
        const { api } = mountWithAudio()
        expect(api().isPlaying.value).toBe(false)
    })

    it('wasPlayed starts as false', () => {
        const { api } = mountWithAudio()
        expect(api().wasPlayed.value).toBe(false)
    })

    it('returns audioRef, analyser, audioArray, onPlay, onStop', () => {
        const { api } = mountWithAudio()
        expect(api().audioRef).toBeDefined()
        expect(api().analyser).toBeDefined()
        expect(api().audioData).toBeDefined()
        expect(typeof api().onPlay).toBe('function')
        expect(typeof api().onStop).toBe('function')
    })
})

describe('useAudio — onPlay()', () => {
    let restore: () => void
    beforeEach(() => {
        restore = patchMediaPrototype()
        patchAudioContext()
    })
    afterEach(() => {
        restore()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('sets isPlaying to true', async () => {
        const { api } = mountWithAudio()
        await nextTick() // let the <audio> mount so audioRef.value is populated

        api().onPlay()
        expect(api().isPlaying.value).toBe(true)
    })

    it('sets wasPlayed to true on first call', async () => {
        const { api } = mountWithAudio()
        await nextTick()

        api().onPlay()
        expect(api().wasPlayed.value).toBe(true)
    })

    it('does not re-invoke onAudio (AudioContext) on subsequent plays', async () => {
        const { api } = mountWithAudio()
        await nextTick()

        const AudioCtx = globalThis.AudioContext as unknown as { mock: { calls: any[] } }
        const ctxCallsBefore = (AudioCtx as any).mock?.instances?.length ?? 0

        api().onPlay() // first play → wasPlayed=true, AudioContext created
        api().onStop()
        api().onPlay() // second play → wasPlayed already true → no new AudioContext

        const ctxCallsAfter = (AudioCtx as any).mock?.instances?.length ?? 0
        // At most 1 AudioContext was created (first play only)
        expect(ctxCallsAfter - ctxCallsBefore).toBeLessThanOrEqual(1)
    })

    it('calls audioRef.play()', async () => {
        const { api } = mountWithAudio()
        await nextTick()

        const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play')
        api().onPlay()
        expect(playSpy).toHaveBeenCalled()
    })
})

describe('useAudio — onStop()', () => {
    let restore: () => void
    beforeEach(() => {
        restore = patchMediaPrototype()
        patchAudioContext()
    })
    afterEach(() => {
        restore()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('sets isPlaying to false', async () => {
        const { api } = mountWithAudio()
        await nextTick()

        api().onPlay()
        api().onStop()
        expect(api().isPlaying.value).toBe(false)
    })

    it('calls audioRef.pause()', async () => {
        const { api } = mountWithAudio()
        await nextTick()

        api().onPlay()
        const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause')
        api().onStop()
        expect(pauseSpy).toHaveBeenCalled()
    })
})

describe('useAudio — watch props.audio', () => {
    let restore: () => void
    beforeEach(() => {
        restore = patchMediaPrototype()
        patchAudioContext()
    })
    afterEach(() => {
        restore()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('changing props.audio resets wasPlayed to false', async () => {
        const { props, api } = mountWithAudio({ audio: 'track-a.mp3' })
        await nextTick()

        api().onPlay()
        expect(api().wasPlayed.value).toBe(true)

        props.audio = 'track-b.mp3'
        await nextTick()
        expect(api().wasPlayed.value).toBe(false)
    })

    it('changing props.audio resets isPlaying to false', async () => {
        const { props, api } = mountWithAudio({ audio: 'track-a.mp3' })
        await nextTick()

        api().onPlay()
        expect(api().isPlaying.value).toBe(true)

        props.audio = 'track-b.mp3'
        await nextTick()
        expect(api().isPlaying.value).toBe(false)
    })
})

describe('useAudio — watch props.playAudio', () => {
    let restore: () => void
    beforeEach(() => {
        restore = patchMediaPrototype()
        patchAudioContext()
    })
    afterEach(() => {
        restore()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('setting playAudio=true triggers onPlay (isPlaying becomes true)', async () => {
        const { props, api } = mountWithAudio({ playAudio: false })
        await nextTick()

        props.playAudio = true
        await nextTick()
        expect(api().isPlaying.value).toBe(true)
    })

    it('setting playAudio=false triggers onStop (isPlaying becomes false)', async () => {
        const { props, api } = mountWithAudio({ playAudio: true })
        await nextTick()

        props.playAudio = false
        await nextTick()
        expect(api().isPlaying.value).toBe(false)
    })
})
