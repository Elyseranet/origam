import type { IUseLink } from '../../interfaces/Commons/link.interface'

import { nextTick, onMounted, watch } from 'vue'

/*********************************************************
 *  DEFERRED TO onMounted — NOT AN OPTIMISATION
 *
 *  @description
 *  `{immediate: true}` reads `link.isActive.value` synchronously the
 *  instant this watch is created, and its callback (also run
 *  synchronously by `immediate`) reads `link.isLink.value` right after.
 *  Both are `computed()`s built on `props.href` / `props.to`. Creating
 *  this watch in `setup()` — the call site used to be `useSelectLink(link,
 *  group?.select)` at the top level of `OrigamBtn`'s `setup()` — forces
 *  their FIRST evaluation before Vue's `beforeCreate` hook runs, which is
 *  where the ADR-005 theme resolver patches `instance.props`. A `computed`
 *  caches whatever its first evaluation saw and only invalidates on a
 *  tracked dependency change; the resolver's `Object.defineProperty` patch
 *  is not one on a static single mount (no parent re-render), so `isLink`
 *  stayed cached at `false` forever — `link.tag` (which every Btn render
 *  reads for its `:is`) never switched to `'a'` even when a theme named
 *  `href`. Wrapping the watch in `onMounted` delays its first read to
 *  after the component's first render, which is already past
 *  `beforeCreate` — the template's own `:is="link.tag.value"` read gets
 *  there first and seeds the correct, themed value.
 ********************************************************/

/*********************************************************
 * useSelectLink
 *
 * @description
 * Relie un lien de navigation (`link`, la valeur retournee par `useLink`)
 * a un groupe selectionnable (`select`, ex. `useGroupItem`) : quand le
 * lien devient actif (route courante correspond a `link.isActive`) ET que
 * `link.isLink` est vrai, appelle `select(true)` au `nextTick` — utilise
 * par `OrigamBtn` pour se marquer selectionne quand il agit comme lien de
 * navigation actif dans un `OrigamBtnGroup`.
 *
 * @description
 * Le `watch` est deliberement enveloppe dans `onMounted` — voir la
 * banniere juste au-dessus ("DEFERRED TO onMounted — NOT AN
 * OPTIMISATION") : cree en plein `setup()`, son evaluation `immediate`
 * lirait `link.isLink`/`link.isActive` AVANT que le resolveur de props
 * ADR-005 ait patché `instance.props`, figeant `isLink` a `false` pour
 * toujours.
 ********************************************************/
export function useSelectLink (link: IUseLink, select?: (value: boolean, e?: Event) => void) {
    onMounted(() => {
        watch(() => link.isActive?.value, isActive => {
            if (link.isLink.value && isActive && select) {
                nextTick(() => {
                    select(true)
                })
            }
        }, {
            immediate: true
        })
    })
}
