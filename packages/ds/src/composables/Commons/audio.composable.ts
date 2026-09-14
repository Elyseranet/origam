import { ref, shallowRef, watch } from 'vue'
import { AUDIO_ANALYSER_FFT_SIZE } from '../../consts/Audio/audio.const'
import type { IUseAudioProps } from '../../interfaces/Commons/audio.interface'

/*********************************************************
 * useAudio
 *
 * @description
 * Pilote un `<audio>` via `props.playAudio` (play/pause) et expose des
 * donnees de frequence (`audioData`, via un `AnalyserNode` du Web Audio
 * API) rafraichies a chaque frame (`requestAnimationFrame`) tant que la
 * lecture est active — utile pour un rendu de visualiseur audio.
 *
 * @description
 * L'`AudioContext` et l'`AnalyserNode` ne sont crees qu'a la PREMIERE
 * lecture (`wasPlayed`), pas a l'appel du composable. Un changement de
 * `props.audio` reinitialise `wasPlayed` a `false`, donc une nouvelle
 * lecture recree un `AudioContext` complet plutot que de reutiliser
 * l'ancien.
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
        analyserNode.fftSize = AUDIO_ANALYSER_FFT_SIZE

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
