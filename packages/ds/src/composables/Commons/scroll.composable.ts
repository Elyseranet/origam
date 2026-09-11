import { IN_BROWSER, SCROLL_STRATEGIES } from '../../consts'

import type { IScrollArguments, IScrollProps, IScrollStrategyData, IScrollStrategyProps } from '../../interfaces'
import type { TOrigamList, TOrigamTextField } from '../../types'

import { clamp, consoleWarn } from '../../utils'

import {
    computed,
    effectScope,
    EffectScope,
    nextTick,
    onBeforeUnmount,
    onMounted,
    onScopeDispose,
    Ref,
    ref,
    shallowRef,
    watch,
    watchEffect
} from 'vue'

/*********************************************************
 * useScroll
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

/*********************************************************
 * useScrollStrategies
 ********************************************************/
export function useScrollStrategies (
    props: IScrollStrategyProps,
    data: IScrollStrategyData
) {
    if (!IN_BROWSER) return

    let scope: EffectScope | undefined
    watchEffect(async () => {
        if (scope) {
            scope.stop()
        }

        if (!(data.isActive.value && props.scrollStrategy)) return

        scope = effectScope()
        await nextTick()

        if (!scope.active) return

        if (typeof props.scrollStrategy === 'function') {
            props.scrollStrategy(data, props, scope)
        } else {
            SCROLL_STRATEGIES[props.scrollStrategy]?.(data, props, scope)
        }
    })

    onScopeDispose(() => {
        scope?.stop()
    })
}

/*********************************************************
 * useScrolling
 ********************************************************/
export function useScrolling (listRef: Ref<TOrigamList | undefined>, textFieldRef: Ref<TOrigamTextField | undefined>) {
    const isScrolling = shallowRef(false)
    let scrollTimeout: number

    const onListScroll = () => {
        cancelAnimationFrame(scrollTimeout)
        isScrolling.value = true
        scrollTimeout = requestAnimationFrame(() => {
            scrollTimeout = requestAnimationFrame(() => {
                isScrolling.value = false
            })
        })
    }
    const finishScrolling = async () => {
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise<void>(resolve => {
            if (isScrolling.value) {
                const stop = watch(isScrolling, () => {
                    stop()
                    resolve()
                })
            } else resolve()
        })
    }
    const onListKeydown = async (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            textFieldRef.value?.focus()
        }

        if (!['PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return
        const el: HTMLElement = listRef.value?.$el
        if (!el) return

        if (e.key === 'Home' || e.key === 'End') {
            el.scrollTo({
                top: e.key === 'Home' ? 0 : el.scrollHeight,
                behavior: 'smooth'
            })
        }

        await finishScrolling()

        const children = el.querySelectorAll(':scope > :not(.origam-virtual-scroll__spacer)')

        if (e.key === 'PageDown' || e.key === 'Home') {
            const top = el.getBoundingClientRect().top
            for (const child of children) {
                if (child.getBoundingClientRect().top >= top) {
                    (child as HTMLElement).focus()
                    break
                }
            }
        } else {
            const bottom = el.getBoundingClientRect().bottom
            for (const child of [...children].reverse()) {
                if (child.getBoundingClientRect().bottom <= bottom) {
                    (child as HTMLElement).focus()
                    break
                }
            }
        }
    }

    return {onListScroll, onListKeydown}
}
