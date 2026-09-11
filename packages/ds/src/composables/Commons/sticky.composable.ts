import type { ISticky } from "../../interfaces"
import { convertToUnit } from '../../utils'

import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type { CSSProperties } from 'vue'

/*********************************************************
 * useSticky
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
