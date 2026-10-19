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

/**
 * Dev-only warning (#1205) when `v-intersect` is bound to an ARRAY.
 *
 * The `withDirectives` tuple `[{ handler, options }, null, ['once']]` is not a
 * valid binding VALUE: the directive reads `.handler` / `.options` off it, gets
 * `undefined`, never calls the handler and never reads the `once`. The correct
 * form is `v-intersect.once="{ handler, options }"`. Once per element tag,
 * gated on `import.meta.env.DEV` (same gate as `warnUnsupportedProp`).
 *
 * @param el    the element the directive is bound to
 * @param value the raw binding value
 */
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
