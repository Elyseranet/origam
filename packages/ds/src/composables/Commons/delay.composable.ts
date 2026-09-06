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
