import { onScopeDispose, ref, watch } from 'vue'
import { useToggleScope } from './toggleScope.composable'
import { IN_BROWSER } from '../../consts/Commons/commons.const'
import { LOCATION_STRATEGIES } from '../../consts/Commons/location.const'
import type { ILocationStrategyData, ILocationStrategyProps } from '../../interfaces/Commons/location.interface'

/*********************************************************
 * useLocationStrategies
 *
 * @description
 * Runs a floating component's configured location strategy
 * (connected, static, custom function…), re-armed on window resize
 * and on strategy change, inside a disposable toggle scope.
 * Independent from `useLocation` — no shared state or call
 * dependency.
 *
 * @description
 * ⛔ `locationStrategy="static"` NE POSITIONNE RIEN. `staticLocationStrategy`
 * (utils/Commons/location.util.ts) a un corps reduit a `// TODO` : elle rend
 * `undefined`, donc `updateLocation` reste `undefined` et `contentStyles`
 * reste `{}`. Mesure, contenu et cible reels attaches au document :
 * `static` → `contentStyles = {}` / `updateLocation = undefined` ;
 * `connected` → `contentStyles` rempli (`top`, `left`, `transformOrigin`,
 * `maxHeight`…) / `updateLocation = function`. Seules la strategie
 * `connected` et une fonction personnalisee font quelque chose.
 *
 * @description
 * Cycle de vie : tout le cablage vit dans un `useToggleScope` arme sur
 * `data.isActive && props.locationStrategy`. L'ecouteur `resize` est pose a
 * l'entree du scope et retire par son `onScopeDispose` ; un changement de
 * `props.locationStrategy` appelle le `reset` du scope, qui le rejoue en
 * entier. Hors navigateur (`!IN_BROWSER`), aucun scope n'est cree du tout.
 ********************************************************/
export function useLocationStrategies (
    props: ILocationStrategyProps,
    data: ILocationStrategyData
) {
    const contentStyles = ref({})
    const updateLocation = ref<(e: Event) => void>()

    const handleResize = (e: Event) => {
        updateLocation.value?.(e)
    }

    if (IN_BROWSER) {
        useToggleScope(() => !!(data.isActive.value && props.locationStrategy), reset => {
            watch(() => props.locationStrategy, reset)
            onScopeDispose(() => {
                window.removeEventListener('resize', handleResize)
                updateLocation.value = undefined
            })

            window.addEventListener('resize', handleResize, {passive: true})

            if (props.locationStrategy) {
                if (typeof props.locationStrategy === 'function') {
                    updateLocation.value = props.locationStrategy(data, props, contentStyles)?.updateLocation
                } else {
                    updateLocation.value = LOCATION_STRATEGIES[props.locationStrategy](data, props, contentStyles)?.updateLocation
                }
            }
        })
    }

    return {
        contentStyles,
        updateLocation
    }
}
