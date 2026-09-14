import type { ISticky } from '../../interfaces/Commons/sticky.interface'
import { convertToUnit } from '../../utils/Commons/commons.util'

import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type { CSSProperties } from 'vue'

/*********************************************************
 * useSticky
 *
 * @description
 * Cale `rootEl` en `sticky` manuel (via un listener `scroll` passif,
 * pas la propriete CSS `position: sticky`) contre le layout ambiant
 * (`layoutItemStyles.value.top`) : `isStuck` bascule entre `false`,
 * `true`, `'top'` ou `'bottom'` selon la direction de scroll et la
 * hauteur de l'element vs la fenetre, et `stickyStyles` traduit cet etat
 * en declarations `top`/`bottom` inline.
 *
 * @description
 * `onScroll` compense le decalage fige par un overlay qui bloque le
 * defilement, en lisant la custom property `--origam-body-scroll-y` que
 * `useScroll` pose sur chaque parent defilant.
 *
 * @description
 * ⛔ Cette lecture visait `--v-body-scroll-y` jusqu'a #556 — prefixe `--v-`,
 * la grammaire d'un autre design system, vestige de portage. Ce nom n'etant
 * declare nulle part, `bodyScroll` valait TOUJOURS `0` et la branche de
 * compensation etait morte. Corrige le 2026-09-06 ; le test
 * `TU/composables/position-sticky-556-557.spec.ts` verrouille l'accord entre
 * le nom pose et le nom lu.
 ********************************************************/
export function useSticky ({rootEl, isSticky, layoutItemStyles}: ISticky) {
    const isStuck = shallowRef<boolean | 'top' | 'bottom'>(false)
    const stuckPosition = shallowRef(0)

    const stickyStyles = computed<Array<CSSProperties | undefined>>(() => {
        const side = typeof isStuck.value === 'boolean' ? 'top' : isStuck.value
        return [
            isSticky.value ? {top: 'auto', bottom: 'auto', height: undefined} : undefined,
            isStuck.value
                ? {[side]: convertToUnit(stuckPosition.value)} as CSSProperties
                : {top: layoutItemStyles.value.top as CSSProperties['top']}
        ]
    })

    onMounted(() => {
        watch(isSticky, (val) => {
            if (val) {
                window.addEventListener('scroll', onScroll, {passive: true})
            } else {
                window.removeEventListener('scroll', onScroll)
            }
        }, {immediate: true})
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScroll)
    })

    let lastScrollTop = 0

    function onScroll () {
        const direction = lastScrollTop > window.scrollY ? 'up' : 'down'
        const rect = rootEl.value!.getBoundingClientRect()
        const layoutTop = parseFloat(layoutItemStyles.value.top as string ?? 0)
        const top = window.scrollY - Math.max(0, stuckPosition.value - layoutTop)
        const bottom =
            rect.height +
            Math.max(stuckPosition.value, layoutTop) -
            window.scrollY -
            window.innerHeight
        /*********************************************************
         * bodyScroll
         *
         * @description
         * Decalage de defilement FIGE par un overlay qui bloque le scroll.
         * `useScroll` le pose sur chaque parent defilant sous la forme
         * `-el.scrollTop`, donc une valeur NEGATIVE, et le restaure au
         * demontage.
         *
         * @description
         * ⛔ Cette ligne lisait `--v-body-scroll-y` — prefixe `--v-`, la
         * grammaire d'un AUTRE design system, vestige de portage. Ce nom
         * n'est declare nulle part dans le depot : `getPropertyValue` rendait
         * la chaine vide, `parseFloat('')` un `NaN`, et le `|| 0` le
         * convertissait en zero. `bodyScroll` valait donc TOUJOURS 0, et la
         * branche `else if` plus bas etait morte. Le nom correct,
         * `--origam-body-scroll-y`, est bien pose par
         * `utils/Commons/scroll.util.ts`. Issue #556.
         ********************************************************/
        const bodyScroll = parseFloat(getComputedStyle(rootEl.value!).getPropertyValue('--origam-body-scroll-y')) || 0

        if (rect.height < window.innerHeight - layoutTop) {
            isStuck.value = 'top'
            stuckPosition.value = layoutTop
        } else if (
            (direction === 'up' && isStuck.value === 'bottom') ||
            (direction === 'down' && isStuck.value === 'top')
        ) {
            stuckPosition.value = window.scrollY + rect.top - bodyScroll
            isStuck.value = true
        } else if (direction === 'down' && bottom <= 0) {
            stuckPosition.value = 0
            isStuck.value = 'bottom'
        } else if (direction === 'up' && top <= 0) {
            if (!bodyScroll) {
                stuckPosition.value = rect.top + top
                isStuck.value = 'top'
            } else if (isStuck.value !== 'top') {
                stuckPosition.value = -top + bodyScroll + layoutTop
                isStuck.value = 'top'
            }
        }

        lastScrollTop = window.scrollY
    }

    return {isStuck, stickyStyles}
}
