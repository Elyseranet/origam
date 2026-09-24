import { nextTick, onScopeDispose } from 'vue'
import type { NavigationGuardNext, Router } from 'vue-router'
import { IN_BROWSER } from '../../consts/Commons/commons.const'

// Module-scoped, shared across every `useBackButton` call site (there is
// only ever one physical back button / popstate listener per app) — NOT
// a per-hook-instance flag, so it stays a plain module `let`, not a ref.
let inTransition = false

/*********************************************************
 * useBackButton
 *
 * @description
 * Wires a `popstate` listener + router navigation guard so a consumer
 * (e.g. a Dialog / Sheet / Bottom-sheet) can intercept the native
 * back-button gesture and run its own close callback instead of
 * letting the browser navigate away.
 * Independent from `useRoute` / `useRouter` / `useLink` — does not
 * delegate to any of them.
 ********************************************************/
export function useBackButton (router: Router | undefined, cb: (next: NavigationGuardNext) => void) {
    let popped = false
    let removeBefore: (() => void) | undefined
    let removeAfter: (() => void) | undefined

    /*********************************************************
     * poppedReset — la macrotache de `onPopstate` (#779)
     *
     * @description
     * `onScopeDispose` existait deja ici, mais pour les listeners et les
     * gardes de route, jamais pour cette tache-la : son handle n'etait
     * capture nulle part. Site exactement du type qu'une heuristique PAR
     * FICHIER blanchit.
     *
     * @description
     * Rien d'observable ne change : la continuation remet a `false` un
     * `popped` local que plus personne ne lit une fois le listener
     * `popstate` retire — ce que le meme `onScopeDispose` fait deux
     * lignes plus bas.
     *
     * ⛔ Le `setTimeout` du garde `beforeEach`, lui, N'EST PAS annule —
     * voir le commentaire a son emplacement.
     ********************************************************/
    let poppedReset: ReturnType<typeof setTimeout> | undefined

    if (IN_BROWSER) {
        nextTick(() => {
            window.addEventListener('popstate', onPopstate)
            if (router) {
                removeBefore = router.beforeEach((_to, _from, next) => {
                    if (!inTransition) {
                        /*********************************************************
                         * ⛔ CETTE macrotache-ci reste NUE, et c'est voulu (#779)
                         *
                         * @description
                         * Elle ne differe pas un effet cosmetique : elle DOIT
                         * appeler `next()` (ou `cb(next)`), sans quoi la
                         * navigation vue-router reste suspendue pour toujours —
                         * le routeur attend ce rappel. L'annuler au demontage
                         * remplacerait une tache d'une macrotache par une
                         * navigation morte : strictement pire que la fuite.
                         *
                         * @description
                         * Le demontage retire deja le garde
                         * (`removeBefore?.()` plus bas), donc plus AUCUNE
                         * nouvelle tache n'est armee apres lui ; seule celle
                         * eventuellement en vol se termine, et elle doit se
                         * terminer.
                         *
                         * @description
                         * Meme forme que les rAF attendus de
                         * `useScrolling.finishScrolling` : un ordonnanceur dont
                         * la continuation est un CONTRAT, pas un effet
                         * differe.
                         ********************************************************/
                        setTimeout(() => {
                            if (popped) {
                                cb(next)
                            } else {
                                next()
                            }
                        })
                    } else {
                        if (popped) {
                            cb(next)
                        } else {
                            next()
                        }
                    }
                    inTransition = true
                })
                removeAfter = router.afterEach(() => {
                    inTransition = false
                })
            }
        })
        onScopeDispose(() => {
            window.removeEventListener('popstate', onPopstate)
            removeBefore?.()
            removeAfter?.()
            clearTimeout(poppedReset)
        })
    }

    const onPopstate = (e: PopStateEvent) => {
        if (e.state?.replaced) return

        popped = true
        poppedReset = setTimeout(() => (popped = false))
    }
}
