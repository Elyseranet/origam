import { Ref, unref } from 'vue'

/**
 * Resolve unref.
 *
 * @param r …
 */
export function resolveUnref (r: Ref | (() => unknown)) {
    return typeof r === 'function' ? r() : unref(r)
}

/**
 * Unref element.
 *
 * @param elRef …
 */
export function unrefElement (elRef: Ref) {
    const plain = resolveUnref(elRef)

    return plain?.$el ?? plain
}
