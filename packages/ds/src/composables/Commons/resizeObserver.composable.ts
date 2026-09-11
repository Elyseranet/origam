import { IN_BROWSER } from '../../consts'

import type { IResizeState } from '../../interfaces'

import { refElement } from '../../utils'
import { onBeforeUnmount, readonly, ref, watch } from 'vue'

/*********************************************************
 * useResizeObserver
 ********************************************************/
export function useResizeObserver (callback?: ResizeObserverCallback, box: 'content' | 'border' = 'content'): IResizeState {
    const contentRect = ref<DOMRectReadOnly>()
    const resizeRef = ref<HTMLElement | null>()

    if (IN_BROWSER) {
        const observer = new ResizeObserver((entries: Array<ResizeObserverEntry>) => {
            callback?.(entries, observer)

            if (!entries.length) return

            if (box === 'content') {
                contentRect.value = entries[0].contentRect
            } else {
                contentRect.value = entries[0].target.getBoundingClientRect()
            }
        })

        onBeforeUnmount(() => {
            observer.disconnect()
        })

        watch(resizeRef, (newValue, oldValue) => {
            if (oldValue) {
                observer.unobserve(refElement(oldValue) as Element)
                contentRect.value = undefined
            }

            if (newValue) observer.observe(refElement(newValue) as Element)
        }, {
            flush: 'post'
        })
    }

    return {
        resizeRef,
        contentRect: readonly(contentRect)
    }
}
