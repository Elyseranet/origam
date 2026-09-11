import type { IIntersectDirectiveBinding, IIntersectHtmlElement } from '../../interfaces'

/**
 * Unmount intersect.
 *
 * @param el      …
 * @param binding …
 */
export function unmountIntersect (el: IIntersectHtmlElement, binding: IIntersectDirectiveBinding) {
    const observe = el._observe?.[binding.instance!.$.uid]
    if (!observe) return

    observe.observer.unobserve(el)
    delete el._observe![binding.instance!.$.uid]
}
