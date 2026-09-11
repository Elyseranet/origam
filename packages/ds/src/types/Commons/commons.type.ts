import { ComponentPublicInstance } from 'vue'
import { CLIENT_POSITION, FOCUS_LOCATION } from '../../enums'
import { IOrigamPluginOptionsObject } from "../../interfaces"

export type TNotAUnion<T> = [T] extends [infer U] ? _TNotAUnion<U, U> : never
export type _TNotAUnion<T, U> = U extends any ? [T] extends [U] ? unknown : never : never

export type TEventProp<T extends Array<any> = Array<any>, F = (...args: T) => void> = F

export type TInnerVal<T> = T extends Array<any> ? Readonly<T> : T

export type TSelectItemKey<T = Record<string, any>> =
    | boolean | null | undefined // Ignored
    | string // Lookup by key, can use dot notation for nested objects
    | Readonly<Array<(string | number)>> // Nested lookup by key, each array item is a key in the next level
    | ((item: T, fallback?: any) => any)

export type TMaybePick<
    T extends object,
    U extends Extract<keyof T, string>
> = Record<string, unknown> extends T ? Partial<Pick<T, U>> : Pick<T, U>

export type TFocusLocation = `${FOCUS_LOCATION}` | number

export type TTemplateRef = {
    (target: Element | ComponentPublicInstance | null): void
    value: HTMLElement | ComponentPublicInstance | null | undefined
    readonly el: HTMLElement | undefined
}

export type TClientPosition = `${CLIENT_POSITION}`

export type TIfAny<T, Y, N> = 0 extends (1 & T) ? Y : N

export type TWrapInArrayResult<T> = T extends Readonly<Array<any>>
    ? TIfAny<T, Array<T>, T>
    : Array<NonNullable<T>>

export type TValueOf<T> = T[keyof T];

/**
 * Void function
 */
export type TFn = () => void

export type TOrigamPluginOptionsImport =
    | boolean
    | IOrigamPluginOptionsObject
