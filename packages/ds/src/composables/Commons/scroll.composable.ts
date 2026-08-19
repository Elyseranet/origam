import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { IScrollArguments, IScrollProps } from '../../interfaces/Commons/scroll.interface'
import { clamp } from '../../utils/Commons/commons.util'
import { consoleWarn } from '../../utils/Commons/console.util'

/*********************************************************
 * useScroll
 *
 * @description
 * Tracks scroll position / direction / threshold ratio for a target
 * element (or window), driving app-bar shrink-on-scroll and similar
 * scroll-reactive behaviours.
 * Independent from `useScrollStrategies` / `useScrolling` — no shared
 * state or call dependency.
 ********************************************************/
export function useScroll (
    props: IScrollProps,
    args: IScrollArguments = {}
) {
    const {canScroll} = args
    let previousScroll = 0
    const target = ref<Element | Window | null>(null)
    const currentScroll = shallowRef(0)
    const savedScroll = shallowRef(0)
    const currentThreshold = shallowRef(0)
    const isScrollActive = shallowRef(false)
    const isScrollingUp = shallowRef(false)

    const scrollThreshold = computed(() => {
        return Number(props.scrollThreshold ?? 0)
    })
    const scrollRatio = computed(() => {
        return clamp(((scrollThreshold.value - currentScroll.value) / scrollThreshold.value) || 0)
    })

    const onScroll = () => {
        const targetEl = target.value

        if (!targetEl || (canScroll && !canScroll.value)) return

        previousScroll = currentScroll.value
        currentScroll.value = ('window' in targetEl) ? targetEl.scrollY : targetEl.scrollTop

        isScrollingUp.value = currentScroll.value < previousScroll
        currentThreshold.value = Math.abs(currentScroll.value - scrollThreshold.value)
    }

    watch(isScrollingUp, () => {
        savedScroll.value = savedScroll.value || currentScroll.value
    })

    watch(isScrollActive, () => {
        savedScroll.value = 0
    })

    onMounted(() => {
        watch(() => props.scrollTarget, scrollTarget => {
            const newTarget = scrollTarget ? document.querySelector(scrollTarget) : window

            if (!newTarget) {
                consoleWarn(`Unable to locate element with identifier ${scrollTarget}`)
                return
            }

            if (newTarget === target.value) return

            target.value?.removeEventListener('scroll', onScroll)
            target.value = newTarget
            target.value.addEventListener('scroll', onScroll, {passive: true})
        }, {immediate: true})
    })

    onBeforeUnmount(() => {
        target.value?.removeEventListener('scroll', onScroll)
    })

    if (canScroll) {
        watch(canScroll, onScroll, {immediate: true})
    }

    return {
        scrollThreshold,
        currentScroll,
        currentThreshold,
        isScrollActive,
        scrollRatio,
        isScrollingUp,
        savedScroll
    }
}
