import { ref, shallowRef, watch } from 'vue'
import { AUDIO_ANALYSER_FFT_SIZE } from '../../consts/Audio/audio.const'
import { tryOnScopeDispose } from '../../utils/Commons/commons.util'
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

    /*********************************************************
     * Boucle rAF bornee a la duree de vie du scope (#753)
     *
     * @description
     * `getSongData` se RE-PROGRAMME lui-meme tant qu'`isPlaying` est
     * vrai. Rien ne remettait `isPlaying` a `false` au demontage et
     * aucun `cancelAnimationFrame` n'existait : la boucle survivait donc
     * a son proprietaire et continuait de tourner indefiniment sur un
     * environnement detruit — la famille de #706, ou un run Vitest
     * entier echoue sans un seul test rouge.
     *
     * @description
     * Une boucle auto-reprogrammee ne s'ANNULE pas, elle s'ARRETE :
     * annuler la frame armee ne sert a rien si le tour suivant en
     * reprogramme une. Le drapeau `disposed`, teste EN TETE du corps,
     * est ce qui coupe la re-programmation ; `cancelAnimationFrame`
     * s'occupe du tour deja en vol au moment du demontage. Il faut les
     * deux.
     ********************************************************/
    let frame = -1
    let disposed = false

    const getSongData = () => {
        if (disposed) return

        if (isPlaying.value && audioArray.value) {
            analyser.value?.getByteFrequencyData(audioArray.value)

            frame = requestAnimationFrame(getSongData)
        } else {
            frame = -1
        }
    }

    tryOnScopeDispose(() => {
        disposed = true

        if (frame !== -1) {
            cancelAnimationFrame(frame)
            frame = -1
        }
    })
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
