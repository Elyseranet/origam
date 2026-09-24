import { ComponentPublicInstance, computed, inject } from "vue"
import { useRtl } from './rtl.composable'
import { ORIGAM_GO_TO_KEY } from '../../consts/Commons/goTo.const'

import type { IGoToInstance, IGoToOptions } from '../../interfaces/Commons/goTo.interface'
import type { ILocaleInstance, IRtlInstance } from '../../interfaces/Commons/locale.interface'

import { mergeDeep, tryOnScopeDispose } from '../../utils/Commons/commons.util'
import { genDefaults, scrollTo } from '../../utils/Commons/goTo.util'

/*********************************************************
 * createGoTo
 *
 * @description
 * Fabrique installee par `createOrigam()` : fusionne les `options` de
 * scroll fournies par l'app hote avec les defauts (`genDefaults()`) et
 * capture le sens RTL courant (`locale.isRtl`) dans l'instance injectee
 * — c'est cette instance que `useGoTo()` recupere via
 * `ORIGAM_GO_TO_KEY`.
 ********************************************************/
export function createGoTo (
    options: IGoToOptions | undefined,
    locale: ILocaleInstance & IRtlInstance
): IGoToInstance {
    return {
        rtl: locale.isRtl,
        options: mergeDeep(genDefaults(), options as unknown as Record<string, unknown>) as unknown as IGoToOptions
    }
}

/*********************************************************
 * useGoTo
 *
 * @description
 * Retourne une fonction `go(target, options)` qui scrolle vers un
 * composant, un element, un selecteur ou une position (`scrollTo` util),
 * verticalement par defaut. `go.horizontal(...)` est la meme fonction en
 * mode scroll horizontal — meme signature, meme fusion d'options.
 *
 * @description
 * Le sens RTL effectif recalcule `goToInstance.rtl.value || isRtl.value`
 * plutot que de ne lire que l'instance injectee au niveau app : un
 * `<OrigamThemeProvider>` local peut inverser le RTL pour un sous-arbre
 * sans que l'instance globale de `createGoTo()` le sache.
 ********************************************************/
export function useGoTo (_options: Partial<IGoToOptions> = {}) {
    const goToInstance = inject(ORIGAM_GO_TO_KEY)

    const {isRtl} = useRtl()

    if (!goToInstance) throw new Error('[Origam] Could not find injected goto instance')

    const goTo = {
        ...goToInstance,
        rtl: computed(() => goToInstance.rtl.value || isRtl.value)
    }

    /*********************************************************
     * Proprietaire de la boucle de scroll (#753)
     *
     * @description
     * `scrollTo` anime par une boucle rAF auto-reprogrammee que rien
     * n'arretait. Le scope qui a appele `useGoTo()` est le seul
     * proprietaire identifiable : `go()` est le plus souvent declenchee
     * depuis un gestionnaire d'evenement, ou aucun scope actif n'existe
     * plus pour s'enregistrer. On ouvre donc le controleur ICI, a
     * l'appel du composable, et `tryOnScopeDispose` (qui no-op hors
     * scope) l'abandonne au demontage.
     ********************************************************/
    const controller = new AbortController()

    tryOnScopeDispose(() => controller.abort())

    async function go (
        target: ComponentPublicInstance | HTMLElement | string | number,
        options?: Partial<IGoToOptions>
    ) {
        return scrollTo(target, mergeDeep(_options, options), false, goTo, controller.signal)
    }

    go.horizontal = async (
        target: ComponentPublicInstance | HTMLElement | string | number,
        options?: Partial<IGoToOptions>
    ) => {
        return scrollTo(target, mergeDeep(_options, options), true, goTo, controller.signal)
    }

    return go
}
