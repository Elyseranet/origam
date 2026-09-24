import type { IDelayProps } from '../../interfaces/Commons/delay.interface'
import { defer } from '../../utils/Commons/commons.util'

/*********************************************************
 * useDelay
 *
 * @description
 * Temporise l'ouverture/fermeture d'un composant flottant selon
 * `props.openDelay` / `props.closeDelay` (via `defer`), et invoque `cb`
 * avec `true`/`false` une fois le delai ecoule. `useActivator` s'en sert
 * pour decider QUAND declencher son propre changement d'etat — ce
 * composable ne connait rien du hover/focus/click qui l'appelle.
 *
 * @description
 * Chaque appel a `runOpenDelay`/`runCloseDelay` ANNULE le delai en cours
 * (`cancelRef.current()`) avant d'en programmer un nouveau — un
 * enter/leave rapide (survol qui repasse) ne declenche donc jamais les
 * deux callbacks empiles, seul le dernier delai programme aboutit.
 *
 * @description
 * ⛔ `0` et « absent » ne se comportent PAS pareil, parce que `defer` teste
 * `timeout === 0` : avec `openDelay: 0`, `cb` est appele SYNCHRONEMENT
 * pendant `runOpenDelay()` et le « canceller » rendu est un no-op — donc
 * `clearDelay()` ne peut plus rien annuler. Avec la prop ABSENTE,
 * `Number(undefined)` vaut `NaN`, le test `=== 0` echoue et on passe par
 * `setTimeout(cb, NaN)`, que le navigateur traite comme 0 ms : le callback
 * part au tick suivant, et reste annulable. Mesure : delai 0 → callback vu
 * avant le retour de `runOpenDelay()` ; delai absent → rien a 0 ms, vu
 * apres 1 ms.
 *
 * @description
 * Aucun nettoyage automatique n'est enregistre : un delai arme juste avant
 * le demontage n'est pas annule par ce composable. `useActivator`, son seul
 * consommateur, ne l'annule pas non plus a la destruction du scope.
 ********************************************************/
export function useDelay (props: IDelayProps, cb?: (value: boolean) => void) {
    const cancelRef: { current: (() => void) } = { current: () => {} }

    const runDelay = (isOpening: boolean) => {
        cancelRef.current()

        const delay = Number(isOpening ? props.openDelay : props.closeDelay)

        return new Promise(resolve => {
            cancelRef.current = defer(delay, () => {
                cb?.(isOpening)
                resolve(isOpening)
            })
        })
    }

    const runOpenDelay = () => {
        return runDelay(true)
    }

    const runCloseDelay = () => {
        return runDelay(false)
    }

    const clearDelay = () => {
        cancelRef.current()
    }

    return {
        clearDelay,
        runOpenDelay,
        runCloseDelay
    }
}
