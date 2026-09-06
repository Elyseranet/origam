import { nextTick, onScopeDispose, shallowRef } from 'vue'

import {
    SNACKBAR_COUNTDOWN_FALLBACK_INTERVAL_MS,
    SNACKBAR_COUNTDOWN_FALLBACK_TRANSITION_S,
    SNACKBAR_COUNTDOWN_MS_PER_SECOND
} from '../../consts/Snackbar/snackbar.const'

/*********************************************************
 * useCountdown
 ********************************************************/
/*********************************************************
 * useCountdown
 *
 * @description
 * Compte a rebours reactif : expose `time` (millisecondes restantes) plus
 * `start`, `clear` et `reset`. `start` accepte un element optionnel dont la
 * `transitionDuration` calculee fixe le PAS du compteur — cadencer le tic sur
 * la transition evite qu'un rendu tombe entre deux images.
 *
 * @description
 * ⛔ AUCUN composant du DS ne l'utilise, contrairement a ce que la doc
 * historique affirmait. `OrigamSnackbar` implemente son propre minuteur avec
 * `window.setTimeout` et n'appelle jamais ce composable — verifie par
 * recherche le 2026-09-06, zero consommateur hors de son propre fichier. Le
 * ticket #545 cite precisement cette phrase comme exemple de doc mensongere.
 *
 * @description
 * Il reste exporte pour les consommateurs externes. `onScopeDispose` annule
 * l'intervalle, donc l'utiliser dans un `setup()` ne demande aucun nettoyage
 * manuel.
 ********************************************************/
export function useCountdown (milliseconds: number) {
    const time = shallowRef(milliseconds)
    let timer = -1

    const clear = () => {
        clearInterval(timer)
    }

    const reset = () => {
        clear()

        nextTick(() => time.value = milliseconds)
    }

    const start = (el?: HTMLElement) => {
        const style = el ? getComputedStyle(el) : {transitionDuration: SNACKBAR_COUNTDOWN_FALLBACK_TRANSITION_S}
        const interval = parseFloat(style.transitionDuration) * SNACKBAR_COUNTDOWN_MS_PER_SECOND
            || SNACKBAR_COUNTDOWN_FALLBACK_INTERVAL_MS

        clear()

        if (time.value <= 0) return

        const startTime = performance.now()
        timer = window.setInterval(() => {
            const elapsed = performance.now() - startTime + interval
            time.value = Math.max(milliseconds - elapsed, 0)

            if (time.value <= 0) clear()
        }, interval)
    }

    onScopeDispose(clear)

    return {clear, time, start, reset}
}
