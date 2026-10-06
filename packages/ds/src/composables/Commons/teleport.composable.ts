import { IN_BROWSER } from '../../consts/Commons/commons.const'
import { consoleWarn } from '../../utils/Commons/console.util'

import { computed, onMounted, Ref, shallowRef } from 'vue'

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
 *
 * @description
 * ⛔ `mountTick` — #attach-harmonisation. Un selecteur `string` ciblant un
 * NOEUD FRERE cree dans la MEME passe de rendu (ex: un conteneur local que
 * le consommateur monte lui-meme juste avant le composant qui teleporte)
 * peut ne pas encore etre connecte a `document` au moment ou ce `computed`
 * s'evalue pour la PREMIERE fois — mesure concrete sous Histoire (dont
 * `OrigamApp`/`OrigamLayout` englobent chaque story dans un `<Suspense>` :
 * l'arbre entier, y compris les freres, n'est commit dans le vrai DOM
 * qu'une fois la resolution async terminee). `document.querySelector` n'est
 * PAS une dependance reactive : si le premier appel echoue, le `computed`
 * reste bloque sur `undefined` pour toujours, meme apres que la cible soit
 * reellement montee — rien ne le marque sale. `mountTick`, incremente dans
 * `onMounted` (donc apres que Vue ait commit tout l'arbre, Suspense inclus),
 * force UNE re-evaluation apres le montage. Idempotent pour tout le reste :
 * `document.body` existe déjà avant même le montage de Vue, et un selecteur
 * ciblant un noeud deja present au premier rendu retrouve exactement le
 * meme resultat au second passage (le conteneur `.origam-overlay-container`
 * est retrouve par `:scope >` plutot que recree).
 ********************************************************/
export function useTeleport (target: Ref<boolean | string | Element>) {
    const mountTick = shallowRef(0)

    onMounted(() => {
        mountTick.value++
    })

    const teleportTarget = computed(() => {
        // Lu uniquement pour forcer une re-evaluation post-montage — voir
        // le commentaire de tete. La valeur elle-meme n'est jamais utilisee.
        void mountTick.value

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
