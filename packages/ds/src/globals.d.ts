import 'vue/jsx'

// Types
import type { Events } from 'vue'
import type { TouchStoredHandlers } from './directives/touch'

declare global {
    interface HTMLCollection {
        [Symbol.iterator] (): IterableIterator<Element>
    }

    interface Element {
        _clickOutside?: Record<number, {
            onClick: EventListener
            onMousedown: EventListener
        } | undefined> & { lastMousedownWasOutside: boolean }
        _onResize?: Record<number, {
            handler: () => void
            options: AddEventListenerOptions
        } | undefined>
        _ripple?: {
            enabled?: boolean
            centered?: boolean
            class?: string
            circle?: boolean
            touched?: boolean
            isTouch?: boolean
            showTimer?: number
            showTimerCommit?: (() => void) | null
        }
        _observe?: Record<number, {
            init: boolean
            observer: IntersectionObserver
        } | undefined>
        _mutate?: Record<number, {
            observer: MutationObserver
        } | undefined>
        _onScroll?: Record<number, {
            handler: EventListenerOrEventListenerObject
            options: AddEventListenerOptions
            target?: EventTarget
        } | undefined>
        _touchHandlers?: {
            [_uid: number]: TouchStoredHandlers
        }
        _transitionInitialStyles?: {
            position: string
            top: string
            left: string
            width: string
            height: string
        }

        getElementsByClassName (classNames: string): NodeListOf<HTMLElement>
    }

    interface WheelEvent {
        path?: Array<EventTarget>
    }

    interface UIEvent {
        initUIEvent (
            typeArg: string,
            canBubbleArg: boolean,
            cancelableArg: boolean,
            viewArg: Window,
            detailArg: number
        ): void
    }

    interface MouseEvent {
        sourceCapabilities?: { firesTouchEvents: boolean }
    }

    interface ColorSelectionOptions {
        signal?: AbortSignal
    }

    interface ColorSelectionResult {
        sRGBHex: string
    }

    interface EyeDropper {
        open: (options?: ColorSelectionOptions) => Promise<ColorSelectionResult>
    }

    interface EyeDropperConstructor {
        new (): EyeDropper
    }

    interface Window {
        EyeDropper: EyeDropperConstructor
    }

    function parseInt (s: string | number, radix?: number): number

    function parseFloat (string: string | number): number

    export const __ORIGAM_VERSION__: string
    export const __REQUIRED_VUE__: string
    export const __VUE_OPTIONS_API__: boolean | undefined
}

declare module '@vue/runtime-core' {
    export interface ComponentCustomProperties {
        _: ComponentInternalInstance
    }

    export interface ComponentInternalInstance {
        provides: Record<string, unknown>
        setupState: any
    }

    export interface FunctionalComponent {
        aliasName?: string
    }


    export interface ComponentOptionsBase<_Props, _RawBindings, _D, _C extends ComputedOptions, _M extends MethodOptions, _Mixin extends ComponentOptionsMixin, _Extends extends ComponentOptionsMixin, _E extends EmitsOptions, _EE extends string = string, _Defaults = Record<string, never>> {
        aliasName?: string
    }

    export interface App {
        $nuxt?: { hook: (name: string, fn: () => void) => void }
    }

    export interface VNode {
        ctx: ComponentInternalInstance | null
    }
}

declare module '@vue/runtime-dom' {
    type UnionToIntersection<U> =
        (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

    type Combine<T extends string> = T | {
        [K in T]: {
            [L in Exclude<T, K>]: `${K}${Exclude<T, K>}` | `${K}${L}${Exclude<T, K | L>}`
        }[Exclude<T, K>]
    }[T]

    type Modifiers = Combine<'Passive' | 'Capture' | 'Once'>

    type ModifiedEvents = UnionToIntersection<{
        [K in keyof Events]: { [L in `${K}${Modifiers}`]: Events[K] }
    }[keyof Events]>

    type EventHandlers<E> = {
        [K in keyof E]?: E[K] extends (...args: any[]) => any ? E[K] : (payload: E[K]) => void
    }

    export interface HTMLAttributes extends EventHandlers<ModifiedEvents> {
        onScrollend?: (e: Event) => void
    }

    type CustomProperties = {
        [k in `--${string}`]: any
    }

    export interface CSSProperties extends CustomProperties {
    }
}

declare module 'expect' {
    interface Matchers<R> {
        /** console.warn */
        toHaveBeenTipped (): R

        /** console.error */
        toHaveBeenWarned (): R
    }
}
