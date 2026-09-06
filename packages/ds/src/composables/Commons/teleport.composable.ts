import { IN_BROWSER } from '../../consts/Commons/commons.const'
import { consoleWarn } from '../../utils/Commons/console.util'

import { computed, Ref } from 'vue'

/*********************************************************
 * useTeleport
 *
 * @description
 * Resout `target` (`true` = pas de teleport ; `false` = `document.body` ;
 * une chaine = selecteur CSS ; un `Element` direct) en conteneur reel a
 * `<teleport :to="teleportTarget">`. Cree paresseusement UN conteneur
 * `.origam-overlay-container` par cible parente et le REUTILISE si un
 * autre composant a deja teleporte dans la meme cible — pas un
 * conteneur par instance.
 *
 * @description
 * Un selecteur qui ne matche rien produit un `console.warn` et
 * `teleportTarget` reste `undefined` — le composant appelant retombe
 * alors sur son rendu non-teleporte plutot que de crasher. En SSR
 * (`!IN_BROWSER`), toujours `undefined`, sans avertissement.
 ********************************************************/
export function useTeleport (target: Ref<boolean | string | Element>) {
    const teleportTarget = computed(() => {
        const _target = target.value

        if (_target === true || !IN_BROWSER) return undefined

        const targetElement =
            _target === false ? document.body
                : typeof _target === 'string' ? document.querySelector(_target)
                    : _target

        if (targetElement == null) {
            consoleWarn(`Unable to locate target ${_target}`)

            return undefined
        }

        let container = targetElement.querySelector(':scope > .origam-overlay-container')

        if (!container) {
            container = document.createElement('div')
            container.className = 'origam-overlay-container'
            targetElement.appendChild(container)
        }

        return container
    })

    return {teleportTarget}
}
