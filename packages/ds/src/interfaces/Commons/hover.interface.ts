import type { DirectiveBinding } from 'vue'

import type { IHoverState } from '../../interfaces'

/**
 * The `hover` prop accepts three shapes:
 *
 *   • `undefined` / `false` → `isHover` reflects the actual mouseenter/leave
 *     state of the element (no override). Default behaviour.
 *
 *   • `true` → `isHover` is FORCED to `true` regardless of pointer events.
 *     Useful for stories, screenshot tests, or parent-controlled states.
 *     No visual override — the state-aware styles in `useStateEffect`
 *     fall back to the resting tokens.
 *
 *   • `IHoverState` (object) → `isHover` stays reactive to mouseenter/leave
 *     (unless `enabled: true` is set inside the object, which forces it on
 *     like the bare `true` case). The object's keys (`color`, `bgColor`,
 *     `border`, `rounded`, `elevation`, `padding`, `margin`, `gap`) override
 *     the resting props ONLY while the state is engaged. See
 *     `IStateEffectConfig` for the full key set.
 */
export interface IHoverProps {
    hover?: boolean | IHoverState
}

/**
 * Object config accepted by the `v-hover` directive.
 *
 *   • `class`      — class toggled on the element while hovered
 *                    (defaults to `{componentName}--hover` when omitted).
 *   • `mouseenter` — handler called on pointer/touch enter.
 *   • `mouseleave` — handler called on pointer/touch leave.
 *
 * Both handlers receive the hovered element and the originating event.
 */
export interface IHoverDirectiveConfig {
    class?: string
    mouseenter?: (el: HTMLElement, e: Event) => void
    mouseleave?: (el: HTMLElement, e: Event) => void
}

export interface IHoverDirectiveBinding extends Omit<DirectiveBinding, 'modifiers' | 'value'> {
    value?: boolean | IHoverDirectiveConfig
    modifiers: {
        callback: () => void,
        stop?: boolean
    }
}

export interface IHoverOptions {
    class: string
}

export interface IHoverHtmlElement extends HTMLElement {
    _hover?: IHoverHtmlElementHover
}

export interface IHoverHtmlElementHover {
    enabled?: boolean
    class?: string
    touched?: boolean
    isTouch?: boolean
    mouseenter?: (el: HTMLElement, e: Event) => void
    mouseleave?: (el: HTMLElement, e: Event) => void
}

/** Emit signature for components that propagate their hover state. */
export interface IHoverEmits {
    (e: 'update:hover', value: boolean): void
}
