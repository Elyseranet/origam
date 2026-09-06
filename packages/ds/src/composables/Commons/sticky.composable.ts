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
 * ⛔ `onScroll` lit `getComputedStyle(rootEl).getPropertyValue('--v-body-scroll-y')`
 * — un nom de variable prefixe `--v-`, pas `--origam-`. Aucune regle CSS
 * de ce depot ne declare cette custom property : `bodyScroll` vaut donc
 * TOUJOURS `0` (`parseFloat(NaN) || 0`) en l'etat actuel du code, sauf si
 * un consommateur externe la pose lui-meme sur `rootEl`.
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
        const bodyScroll = parseFloat(getComputedStyle(rootEl.value!).getPropertyValue('--v-body-scroll-y')) || 0

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
