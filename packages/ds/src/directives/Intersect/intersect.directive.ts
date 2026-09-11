import { SUPPORTS_INTERSECTION } from '../../consts'
import type { IIntersectDirectiveBinding, IIntersectHtmlElement } from '../../interfaces'
import { unmountIntersect } from '../../utils'

export const Intersect = {
    mounted (el: IIntersectHtmlElement, binding: IIntersectDirectiveBinding) {
        if (!SUPPORTS_INTERSECTION) return

        const modifiers = binding.modifiers || {}
        const value = binding.value
        const {handler, options = {threshold: 0.1}} = typeof value === 'object'
            ? value
            : {handler: value, options: {threshold: 0.1}}

        const observer = new IntersectionObserver((
            entries: Array<IntersectionObserverEntry> = [],
            observer: IntersectionObserver
        ) => {
            const _observe = el._observe?.[binding.instance!.$.uid]
            if (!_observe) return // Just in case, should never fire

            const isIntersecting = entries.some(entry => entry.isIntersecting)

            // If is not quiet or has already been
            // initted, invoke the user callback
            if (
                handler && (
                    !modifiers.quiet ||
                    _observe.init
                ) && (
                    !modifiers.once ||
                    isIntersecting ||
                    _observe.init
                )
            ) {
                handler(isIntersecting, entries, observer)
            }

            if (isIntersecting && modifiers.once) unmountIntersect(el, binding)
            else _observe.init = true
        }, options)

        el._observe = Object(el._observe)
        el._observe![binding.instance!.$.uid] = {init: false, observer}

        observer.observe(el)
    },
    unmounted (el: HTMLElement, binding: IIntersectDirectiveBinding) {
        unmountIntersect(el, binding)
    }
}

export default Intersect
