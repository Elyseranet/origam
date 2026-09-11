import type { EffectScope, WatchSource } from 'vue'
import { effectScope, onScopeDispose, watch } from 'vue'

/*********************************************************
 * useToggleScope
 *
 * @description
 * Execute `fn` dans un `EffectScope` dedie tant que `source` (un booleen
 * reactif) est vrai, et arrete ce scope (`scope.stop()` — donc tous les
 * effets/watchers crees a l'interieur de `fn`) des que `source` repasse a
 * faux. Utile pour n'activer des effets reactifs QUE pendant une periode
 * conditionnelle, sans les laisser tourner en arriere-plan.
 *
 * @description
 * Si `fn` declare un parametre (`fn.length > 0`), elle recoit une
 * fonction `reset` qui arrete le scope courant ET en redemarre un
 * nouveau immediatement — a appeler depuis l'interieur de `fn` pour
 * relancer ses propres effets sans attendre un cycle `source` false→true.
 ********************************************************/
export function useToggleScope (source: WatchSource<boolean>, fn: (reset: () => void) => void) {
    let scope: EffectScope | undefined

    const start = () => {
        scope = effectScope()
        scope.run(() => fn.length
            ? fn(() => {
                scope?.stop()
                start()
            })
            : (fn as () => void)()
        )
    }

    watch(source, active => {
        if (active && !scope) {
            start()
        } else if (!active) {
            scope?.stop()
            scope = undefined
        }
    }, {immediate: true})

    onScopeDispose(() => {
        scope?.stop()
    })
}
