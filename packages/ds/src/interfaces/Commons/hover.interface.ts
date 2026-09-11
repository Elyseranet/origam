import type { DirectiveBinding } from 'vue'

import type { IStateEffectConfig } from './state-effect.interface'

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
 *   • `IStateEffectConfig` (object) → `isHover` stays reactive to
 *     mouseenter/leave (unless `enabled: true` is set inside the object,
 *     which forces it on like the bare `true` case). The object's keys
 *     (`color`, `bgColor`, `border`, `rounded`, `elevation`, `padding`,
 *     `margin`, `gap`) override the resting props ONLY while the state is
 *     engaged.
 *
 * `IHoverProps` shares the exact same shape as `IActiveProps` (both are
 * `{ [state]?: boolean | IStateEffectConfig, [state]Class?: string }`),
 * consumed by the unified `useStateFlag({ state: 'hover' })`. It is kept
 * as a plain `interface` (not a generic mapped-type alias) because
 * `@vue/compiler-sfc`'s macro resolver — used at actual component-compile
 * time by every `defineProps<T>()` — cannot resolve a mapped type through
 * an `interface … extends` clause (verified: it broke 164 spec files with
 * "Failed to resolve extends base type" even though `vue-tsc --noEmit`
 * accepted the mapped-type version fine). See `state-flag.type.ts`.
 */
export interface IHoverProps {
    hover?: boolean | IStateEffectConfig
    hoverClass?: string
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
