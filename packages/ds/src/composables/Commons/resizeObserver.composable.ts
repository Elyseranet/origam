import { IN_BROWSER } from '../../consts/Commons/commons.const'

import type { IResizeState } from '../../interfaces/Commons/resizeObserver.interface'

import { refElement } from '../../utils/Commons/commons.util'
import { onBeforeUnmount, readonly, ref, watch } from 'vue'

/*********************************************************
 * useResizeObserver
 *
 * @description
 * Expose `resizeRef` (template ref a poser sur l'element observe) et
 * `contentRect` (lecture seule) via un `ResizeObserver` re-attache
 * automatiquement quand `resizeRef` change d'element, meme pattern que
 * `useIntersectionObserver`. `box: 'border'` lit `getBoundingClientRect()`
 * de la cible plutot que l'`entries[0].contentRect` du callback natif.
 *
 * @description
 * Hors navigateur (`!IN_BROWSER`), aucun observer n'est cree —
 * `contentRect` reste `undefined` en permanence, silencieusement, meme
 * comportement de garde que `useIntersectionObserver`.
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
