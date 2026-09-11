import { ref, shallowRef, watch } from 'vue'
import type { IUseAudioProps } from '../../interfaces'

/*********************************************************
 * useAudio
 ********************************************************/
export function useAudio (props: IUseAudioProps) {
    const analyser = ref<AnalyserNode | null>(null)
    const audioArray = shallowRef<Uint8Array<ArrayBuffer> | null>(null)
    const audioRef = ref()
    const wasPlayed = ref(false)
    const isPlaying = ref(false)

    const getSongData = () => {
        if (isPlaying.value && audioArray.value) {
            analyser.value?.getByteFrequencyData(audioArray.value)

            requestAnimationFrame(getSongData)
        }
    }
    const onPlay = () => {
        if (!wasPlayed.value) {
            onAudio()
            wasPlayed.value = true
        }
        isPlaying.value = true
        audioRef.value.play()
        getSongData()
    }
    const onStop = () => {
        isPlaying.value = false
        audioRef.value.pause()
    }
    const onAudio = () => {
        const context = new AudioContext()
        const src = context.createMediaElementSource(audioRef.value)
        const analyserNode = context.createAnalyser()

        src.connect(analyserNode)
        analyserNode.connect(context.destination)
        analyserNode.fftSize = 256

        audioArray.value = new Uint8Array(analyserNode.frequencyBinCount)
        analyser.value = analyserNode
    }

    watch(() => props.audio, () => {
        wasPlayed.value = false
        isPlaying.value = false
    })
    watch(() => props.playAudio, (play) => {
        if (play) {
            onPlay()
        } else {
            onStop()
        }
    })

    return {audioData: audioArray, analyser, audioRef, wasPlayed, isPlaying, onPlay, onStop}
}
