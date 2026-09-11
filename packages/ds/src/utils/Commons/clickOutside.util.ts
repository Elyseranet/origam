import type { IClickOutsideDirectiveBinding } from '../../interfaces'

import { attachedRoot } from '../../utils'

function defaultConditional (): boolean {
    return true
}

/**
 * Check event.
 *
 * @param e       …
 * @param el      …
 * @param binding …
 * @returns …
 */
export function checkEvent (e: MouseEvent, el: HTMLElement, binding: IClickOutsideDirectiveBinding): boolean {
    // The include element callbacks below can be expensive
    // so we should avoid calling them when we're not active.
    // Explicitly check for false to allow fallback compatibility
    // with non-toggleable components
    if (!e || checkIsActive(e, binding) === false) return false

    // If we're clicking inside the shadowroot, then the app root doesn't get the same
    // level of introspection as to _what_ we're clicking. We want to check to see if
    // our target is the shadowroot parent container, and if it is, ignore.
    const root = attachedRoot(el)
    if (
        typeof ShadowRoot !== 'undefined' &&
        root instanceof ShadowRoot &&
        root.host === e.target
    ) return false

    // Check if additional elements were passed to be included in check
    // (click must be outside all included elements, if any)
    const elements = (typeof binding.value === 'object' && binding.value.include) ? binding.value.include() : []
    // Add the root element for the component this directive was defined on
    elements.push(el)

    // Check if it's a click outside our elements, and then if our callback returns true.
    // Non-toggleable components should take action in their callback and return falsy.
    // Toggleable can return true if it wants to deactivate.
    // Note that, because we're in the capture phase, this callback will occur before
    // the bubbling click event on any outside elements.
    return !elements.some(el => el?.contains(e.target as Node))
}

/**
 * Check is active.
 *
 * @param e       …
 * @param binding …
 * @returns …
 */
export function checkIsActive (e: MouseEvent, binding: IClickOutsideDirectiveBinding): boolean | void {
    const isActive = (typeof binding.value === 'object' && binding.value.closeConditional) || defaultConditional

    return isActive(e)
}

/**
 * Directive.
 *
 * @param e       …
 * @param el      …
 * @param binding …
 */
export function directive (e: MouseEvent, el: HTMLElement, binding: IClickOutsideDirectiveBinding) {
    const handler = typeof binding.value === 'function' ? binding.value : binding.value.handler

    if (el._clickOutside?.lastMousedownWasOutside && checkEvent(e, el, binding)) {
        setTimeout(() => {
            if (checkIsActive(e, binding) && handler) {
                handler(e)
            }
        }, 0)
    }
}

/**
 * Handle shadow.
 *
 * @param el       …
 * @param callback …
 */
export function handleShadow (el: HTMLElement, callback: (root: Document | ShadowRoot) => void): void {
    const root = attachedRoot(el)

    callback(document)

    if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
        callback(root)
    }
}
