import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { SUPPORTS_INTERSECTION } from '../../consts/Commons/commons.const'

/*********************************************************
 * useIntersectionObserver
 *
 * @description
 * Expose `intersectionRef` (a poser en template ref sur l'element a
 * observer) et `isIntersecting` — un `IntersectionObserver` est cree une
 * fois, re-attache automatiquement quand `intersectionRef` change
 * d'element (desobserve l'ancien, observe le nouveau), et deconnecte a
 * `onBeforeUnmount`.
 *
 * @description
 * Si `SUPPORTS_INTERSECTION` est faux (navigateur sans l'API, ou SSR),
 * AUCUN observer n'est cree — `isIntersecting` reste fige a `false` et
 * `callback` n'est jamais appele, silencieusement. Aucun fallback
 * polyfill.
 ********************************************************/
export function useIntersectionObserver (callback?: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    const intersectionRef = ref<HTMLElement>()
    const isIntersecting = shallowRef(false)

    if (SUPPORTS_INTERSECTION) {
        const observer = new IntersectionObserver((entries: Array<IntersectionObserverEntry>) => {
            callback?.(entries, observer)

            isIntersecting.value = !!entries.find(entry => entry.isIntersecting)
        }, options)

        onBeforeUnmount(() => {
            observer.disconnect()
        })

        watch(intersectionRef, (newValue, oldValue) => {
            if (oldValue) {
                observer.unobserve(oldValue)
                isIntersecting.value = false
            }

            if (newValue) observer.observe(newValue)
        }, {
            flush: 'post'
        })
    }

    return {intersectionRef, isIntersecting}
}
