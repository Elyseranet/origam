import { IN_BROWSER } from '../../consts/Commons/commons.const'
import { consoleWarn } from '../../utils/Commons/console.util'

import { computed, Ref } from 'vue'

import { useHydration } from './hydration.composable'

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
 * ⛔ `useHydration()` — #attach-harmonisation. Un selecteur `string` ciblant
 * un NOEUD FRERE cree dans la MEME passe de rendu (ex: un conteneur local
 * que le consommateur monte lui-meme juste avant le composant qui teleporte)
 * peut ne pas encore etre connecte a `document` au moment ou ce `computed`
 * s'evalue pour la PREMIERE fois — mesure concrete sous Histoire (dont
 * `OrigamApp`/`OrigamLayout` englobent chaque story dans un `<Suspense>` :
 * l'arbre entier, y compris les freres, n'est commit dans le vrai DOM
 * qu'une fois la resolution async terminee). `document.querySelector` n'est
 * PAS une dependance reactive : si le premier appel echoue, le `computed`
 * reste bloque sur `undefined` pour toujours, meme apres que la cible soit
 * reellement montee — rien ne le marque sale.
 *
 * @description
 * ⛔ UN COMPTEUR LOCAL (`mountTick`, essaye d'abord) CASSE LE SSR MARKETING.
 * Mesure, CI (#1043) : 4 e2e marketing (Nuxt, SSR) en echec sur « sans
 * erreur JS console » / « pas d'erreur d'hydratation ». Cause reelle,
 * independante de `mountTick` : la toute PREMIERE evaluation du computed
 * divergeait DEJA entre serveur et client. Cote serveur, `!IN_BROWSER` est
 * toujours vrai (pas de `window` en SSR) -> `undefined` (teleport
 * desactive, rendu en place). Cote client, `IN_BROWSER` est vrai DES LE
 * DEPART, y compris pendant la passe d'HYDRATATION (avant tout
 * `onMounted`) -> la cible (souvent `document.body`, qui existe toujours)
 * se resout avec SUCCES sur ce tout premier rendu -> teleport deja ACTIF.
 * Vue compare les deux rendus pendant l'hydratation : desactive vs actif,
 * d'ou le decalage. `mountTick` n'ajoutait qu'une DEUXIEME evaluation
 * post-montage — elle n'a jamais ete la cause du decalage, qui existait
 * deja sur la premiere.
 *
 * @description
 * Le fix : `isHydrated.value` (vrai gate, pas une simple lecture de
 * dependance) force EXACTEMENT le meme `undefined` cote client QUE cote
 * serveur tant que l'hydratation n'est pas terminee — `useHydration()`
 * (deja utilise par `OrigamOverlay.vue`) seede `isHydrated` a `false` sur
 * les DEUX rendus compares (serveur ET premiere passe client) quand l'app
 * est reellement en SSR (`ssr` vrai), et ne bascule a `true` que dans un
 * `onMounted` — donc APRES que l'hydratation ait deja conclu. Reutilise,
 * ne redeclare pas.
 *
 * @description
 * ⚠️ Dans une app 100% client (pas de SSR — Histoire, Tauri…),
 * `useHydration()` renvoie `isHydrated=true` DES LE DEPART (son
 * optimisation deliberee : « pas de delai artificiel » — voir son propre
 * commentaire de tete) : le gate ci-dessous ne retarde donc RIEN la ou il
 * n'y a aucune hydratation a proteger. Consequence mesuree : une cible
 * FRERE montee dans la MEME passe de rendu que le consommateur (ex: un
 * conteneur local qu'une story Histoire monte juste avant le composant
 * teleportant, sous un `<Suspense>` qui ne commit l'arbre qu'une fois
 * resolu) peut encore echouer sur cette toute premiere resolution, pour la
 * meme raison qu'avant : `document.querySelector` n'est pas reactif. Ce
 * n'est PAS le defaut que ce correctif vise — c'est un defaut DIFFERENT,
 * propre a la construction du test (une cible fraiche ne preexiste jamais
 * en usage reel), traite cote story plutot qu'en reintroduisant un
 * compteur local ici (voir les stories CommandPalette / SnackbarGroup /
 * Drawer, variante « Prop - attach »).
 ********************************************************/
export function useTeleport (target: Ref<boolean | string | Element>) {
    const isHydrated = useHydration()

    const teleportTarget = computed(() => {
        const _target = target.value

        if (_target === true || !IN_BROWSER) return undefined

        if (!isHydrated.value) return undefined

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
