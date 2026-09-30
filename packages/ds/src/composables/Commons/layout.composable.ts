import { inject } from 'vue'
import { ORIGAM_LAYOUT_KEY } from '../../consts/Commons/layout.const'

/*********************************************************
 * useLayoutMain
 *
 * @description
 * ⛔ RENOMME depuis `useLayout`, qui ECRASAIT le composable natif de Nuxt.
 * Nuxt expose `useLayout` en auto-import (`#app/composables/layout`) ; le nôtre
 * portant le même nom, c'est LE NOTRE QUI GAGNAIT et celui du framework qui
 * était ignoré. Relevé sur le serveur de dev de l'utilisateur :
 *   WARN [NUXT_B6002] useLayout is already auto-imported by Nuxt as a built-in,
 *        and overriding it will likely cause issues.
 *   WARN Duplicated imports "useLayout", the one from "#app/composables/layout"
 *        has been ignored
 * Ce n'était pas cosmétique : notre version LEVE une exception sans provider
 * Origam, donc tout code Nuxt attendant `useLayout` plantait au lieu de recevoir
 * le composable du framework. Le nom `useLayoutMain` dit ce qu'il fait — il
 * expose la zone MAIN — et s'aligne sur `useLayoutItem`.
 *
 * @description
 * Reads the nearest `ORIGAM_LAYOUT_KEY` injection provided by
 * `useCreateLayout` and exposes its main-area rect/styles.
 * Throws when no layout provider is found in the tree — unlike
 * `useLayoutItem`, a bare consumer of the main area has no sensible
 * standalone fallback.
 * Independent from `useLayoutItem` / `useCreateLayout` at the call
 * level (no direct function dependency) — the three only share the
 * `ORIGAM_LAYOUT_KEY` provide/inject contract.
 ********************************************************/
export function useLayoutMain () {
    const layout = inject(ORIGAM_LAYOUT_KEY)

    if (!layout) {
        throw new Error('[Origam] Could not find injected layout')
    }

    return {
        getLayoutItem: layout.getLayoutItem,
        mainRect: layout.mainRect,
        mainStyles: layout.mainStyles,
        mainId: layout.layoutId
    }
}
