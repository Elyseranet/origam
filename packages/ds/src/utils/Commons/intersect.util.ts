import type { IIntersectDirectiveBinding, IIntersectHtmlElement } from '../../interfaces/Commons/intersect.interface'

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

const _warnedIntersectTupleTags = new Set<string>()

/*********************************************************
 * warnIntersectTupleBinding
 *
 * @description
 * Dev-only warning (#1205, once per element tag) when `v-intersect` is bound
 * to an ARRAY. The `withDirectives` tuple `[{ handler, options }, null,
 * ['once']]` is not a valid binding VALUE: the directive reads `.handler` /
 * `.options` off it, gets `undefined`, never calls the handler and never
 * reads the `once`. The correct form is `v-intersect.once="{ handler,
 * options }"`. Gated on `import.meta.env.DEV`, like `warnUnsupportedProp`.
 ********************************************************/
export function warnIntersectTupleBinding (el: HTMLElement, value: unknown): void {
    if (!Array.isArray(value)) return
    if (typeof console === 'undefined') return
    if (!import.meta.env?.DEV) return

    const tag = el.tagName.toLowerCase()
    if (_warnedIntersectTupleTags.has(tag)) return
    _warnedIntersectTupleTags.add(tag)

    console.warn(
        `[origam] v-intersect on <${tag}> is bound to an array (the withDirectives tuple): ` +
        'the handler will never be called. Bind { handler, options } and use the modifier, e.g. v-intersect.once="{ handler, options }".'
    )
}
