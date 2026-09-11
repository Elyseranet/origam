import {
    capitalize,
    ComponentInternalInstance,
    ComponentPublicInstance,
    computed,
    ComputedGetter,
    Fragment,
    getCurrentScope,
    InjectionKey,
    MaybeRef,
    nextTick,
    onMounted,
    onScopeDispose,
    reactive,
    shallowRef,
    ToRefs,
    toRefs,
    unref,
    VNode,
    VNodeChild,
    watchEffect
} from 'vue'
import { IN_BROWSER, ON_REGEX } from '../../consts'

import { FOCUS_LOCATION } from '../../enums'

import {
    TClientPosition,
    TFn,
    TFocusLocation,
    TNotAUnion,
    TSelectItemKey,
    TTemplateRef,
    TWrapInArrayResult
} from '../../types'
import { getLifeCycleTarget } from "../../utils"

/**
 * Convert to unit.
 *
 * @param str  …
 * @param unit …
 * @returns …
 */
export function convertToUnit (str: number, unit?: string): string
export function convertToUnit (str: string | number | null | undefined, unit?: string): string | undefined
export function convertToUnit (str: string | number | null | undefined, unit = 'px'): string | undefined {
    if (str == null || str === '') {
        return undefined
    } else if (isNaN(+str)) {
        return String(str)
    } else if (!isFinite(+str)) {
        return undefined
    } else {
        return `${Number(str)}${unit}`
    }
}

/**
 * Ref element.
 *
 * @param obj …
 * @returns …
 */
export function refElement (obj?: ComponentPublicInstance<any> | HTMLElement): HTMLElement | undefined {
    if (obj && '$el' in obj) {
        const el = obj.$el as HTMLElement

        if (el?.nodeType === Node.TEXT_NODE) {
            // Multi-root component, use the first element
            return el.nextElementSibling as HTMLElement
        }

        return el
    }

    return obj as HTMLElement
}

/**
 * To kebab case.
 *
 * @param str …
 */
export function toKebabCase (str = '') {
    if (toKebabCase.cache.has(str)) return toKebabCase.cache.get(str)!
    const kebab = str
        .replace(/[^a-z]/gi, '-')
        .replace(/\B([A-Z])/g, '-$1')
        .toLowerCase()
    toKebabCase.cache.set(str, kebab)
    return kebab
}

toKebabCase.cache = new Map<string, string>()

/**
 * Find children with provide.
 *
 * @param key   …
 * @param vnode …
 * @returns …
 */
export function findChildrenWithProvide (
    key: InjectionKey<any> | symbol,
    vnode?: VNodeChild
): Array<ComponentInternalInstance> {
    if (!vnode || typeof vnode !== 'object') return []

    if (Array.isArray(vnode)) {
        return vnode.map(child => findChildrenWithProvide(key, child)).flat(1)
    } else if (Array.isArray(vnode.children)) {
        return vnode.children.map(child => findChildrenWithProvide(key, child)).flat(1)
    } else if (vnode.component) {
        const componentProvides = (vnode.component as { provides?: Record<string | symbol, unknown> }).provides ?? {}
        if (Object.getOwnPropertySymbols(componentProvides).includes(key as symbol)) {
            return [vnode.component]
        } else if (vnode.component.subTree) {
            return findChildrenWithProvide(key, vnode.component.subTree).flat(1)
        }
    }

    return []
}

/**
 * Destruct computed.
 *
 * @param getter …
 * @returns …
 */
export function destructComputed<T extends object> (getter: ComputedGetter<T & TNotAUnion<T>>): ToRefs<T>
export function destructComputed<T extends object> (getter: ComputedGetter<T>) {
    const refs = reactive<Record<string, unknown>>({}) as T
    const base = computed(getter)
    watchEffect(() => {
        for (const key in base.value) {
            refs[key] = base.value[key]
        }
    }, {flush: 'sync'})
    return toRefs(refs)
}

/**
 * Pad end.
 *
 * @param str    …
 * @param length …
 * @param char   …
 */
export function padEnd (str: string, length: number, char = '0') {
    return str + char.repeat(Math.max(0, length - str.length))
}

/**
 * Pad start.
 *
 * @param str    …
 * @param length …
 * @param char   …
 */
export function padStart (str: string, length: number, char = '0') {
    return char.repeat(Math.max(0, length - str.length)) + str
}

/**
 * Clamp.
 *
 * @param value …
 * @param min   …
 * @param max   …
 */
export function clamp (value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value))
}

/**
 * Int.
 *
 * @param value …
 * @param radix …
 * @returns …
 */
export function int (value: string | number, radix: number = 10): number {
    return parseInt(value, radix)
}

/**
 * Get decimals.
 *
 * @param value …
 */
export function getDecimals (value: number) {
    const trimmedStr = value.toString().trim()
    return trimmedStr.includes('.')
        ? (trimmedStr.length - trimmedStr.indexOf('.') - 1)
        : 0
}

/**
 * Round to.
 *
 * @param value  …
 * @param places …
 */
export function roundTo (value: number, places = 0) {
    return Math.round(value * 10 ** places) / 10 ** places
}

/**
 * Chunk.
 *
 * @param str  …
 * @param size …
 */
export function chunk (str: string, size = 1) {
    const chunked: Array<string> = []
    let index = 0
    while (index < str.length) {
        chunked.push(str.slice(index, index + size))
        index += size
    }
    return chunked
}

/**
 * Has.
 *
 * @param obj …
 * @param key …
 * @returns …
 */
export function has<T extends string> (obj: object, key: Array<T>): obj is Record<T, unknown> {
    return key.every(k => Object.prototype.hasOwnProperty.call(obj, k))
}

/**
 * Oops.
 *
 * @returns …
 */
export function oops (): never {
    throw new Error()
}

/**
 * Noop.
 */
export function noop () {
}

/**
 * Debounce.
 *
 * @param fn …
 */
export function debounce (fn: (...args: any[]) => void, delay: MaybeRef<number>) {
    let timeoutId = 0 as any
    const wrap = (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), unref(delay))
    }
    wrap.clear = () => {
        clearTimeout(timeoutId)
    }
    wrap.immediate = fn
    return wrap
}

/**
 * Deep equal.
 *
 * @param a …
 * @param b …
 * @returns …
 */
export function deepEqual (a: any, b: any): boolean {
    if (a === b) return true

    if (
        a instanceof Date &&
        b instanceof Date &&
        a.getTime() !== b.getTime()
    ) {
        // If the values are Date, compare them as timestamps
        return false
    }

    if (a !== Object(a) || b !== Object(b)) {
        // If the values aren't objects, they were already checked for equality
        return false
    }

    const props = Object.keys(a)

    if (props.length !== Object.keys(b).length) {
        // Different number of props, don't bother to check
        return false
    }

    return props.every(p => deepEqual(a[p], b[p]))
}

/**
 * Get property from item.
 *
 * @param item     …
 * @param property …
 * @param fallback …
 * @returns …
 */
export function getPropertyFromItem (item: any, property: TSelectItemKey, fallback?: any): any {
    if (property === true) return item === undefined ? fallback : item

    if (property == null || typeof property === 'boolean') return fallback

    if (item !== Object(item)) {
        if (typeof property !== 'function') return fallback

        const value = property(item, fallback)

        return typeof value === 'undefined' ? fallback : value
    }

    if (typeof property === 'string') return getObjectValueByPath(item, property, fallback)

    if (Array.isArray(property)) return getNestedValue(item, property, fallback)

    if (typeof property !== 'function') return fallback

    const value = property(item, fallback)

    return typeof value === 'undefined' ? fallback : value
}

/**
 * Get object value by path.
 *
 * @param obj      …
 * @param path     …
 * @param fallback …
 * @returns …
 */
export function getObjectValueByPath (obj: any, path?: string | null, fallback?: any): any {
    if (obj == null || !path || typeof path !== 'string') return fallback
    if (obj[path] !== undefined) return obj[path]

    path = path.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
    path = path.replace(/^\./, '') // strip a leading dot

    return getNestedValue(obj, path.split('.'), fallback)
}

/**
 * Get nested value.
 *
 * @param obj      …
 * @param path     …
 * @param fallback …
 * @returns …
 */
export function getNestedValue (obj: any, path: Array<(string | number)>, fallback?: any): any {
    const last = path.length - 1

    if (last < 0) return obj === undefined ? fallback : obj

    for (let i = 0; i < last; i++) {
        if (obj == null) {
            return fallback
        }
        obj = obj[path[i]]
    }

    if (obj == null) return fallback

    return obj[path[last]] === undefined ? fallback : obj[path[last]]
}

/**
 * Keys.
 *
 * @param o …
 */
export function keys<O extends Record<string, unknown>> (o: O) {
    return Object.keys(o) as (keyof O)[]
}

/**
 * Omit.
 *
 * @param obj     …
 * @param exclude …
 * @returns …
 */
export function omit<
    T extends object,
    U extends Extract<keyof T, string>
> (obj: T, exclude: Array<U>): Omit<T, U> {
    const clone = {...obj}

    exclude.forEach(prop => delete clone[prop])

    return clone
}

/**
 * Omit undefined.
 *
 * @description
 * Strips every own key whose value is `undefined` (a key that is merely
 * *present but unset* is NOT the same as an *absent* key for `mergeDeep` —
 * `for...in` still enumerates it, so `mergeDeep(theme, {border: undefined})`
 * silently overwrites a theme default with `undefined`). Components that
 * build a `slotDefaults` map to forward down via `<OrigamDefaultsProvider>`
 * (e.g. `OrigamAvatarGroup`, `OrigamBtnGroup`) must run their per-component
 * defaults object through this before handing it to the provider, so an
 * unset prop is simply absent rather than an explicit `undefined` that
 * clobbers an ancestor/theme default.
 *
 * @param obj …
 * @returns …
 */
export function omitUndefined<T extends object> (obj: T): Partial<T> {
    const out = {} as Partial<T>

    for (const key in obj) {
        if (obj[key] !== undefined) {
            out[key] = obj[key]
        }
    }

    return out
}

/**
 * Only.
 *
 * @param obj     …
 * @param include …
 * @returns …
 */
export function only<
    T extends object,
    U extends Extract<keyof T, string>
> (obj: T, include: Array<U>): Pick<T, U> {
    const clone = {} as Pick<T, U>

    include.forEach(prop => clone[prop] = obj[prop])

    return clone
}

/**
 * Pick.
 *
 * @param obj   …
 * @param paths …
 * @returns …
 */
export function pick<
    T extends object,
    U extends Extract<keyof T, string>
> (obj: T, paths: Array<U>): Pick<T, U> {
    const found = {} as Pick<T, U>

    const keys = new Set(Object.keys(obj))
    for (const path of paths) {
        if (keys.has(path)) {
            found[path] = obj[path]
        }
    }

    return found
}

/**
 * Pick with rest.
 *
 * @param obj     …
 * @param paths   …
 * @param exclude …
 * @returns …
 */
export function pickWithRest<
    T extends object,
    U extends Extract<keyof T, string>,
    E extends Extract<keyof T, string>
> (obj: T, paths: Array<(U | RegExp)>, exclude?: Array<E>): [yes: Partial<T>, no: Partial<T>] {
    const found = Object.create(null)
    const rest = Object.create(null)

    for (const key in obj) {
        if (
            paths.some(path => path instanceof RegExp
                ? path.test(key)
                : path === key
            ) && !exclude?.some(path => path === key)
        ) {
            found[key] = obj[key]
        } else {
            rest[key] = obj[key]
        }
    }

    return [found, rest]
}

/**
 * Focus child.
 *
 * @param el       …
 * @param location …
 */
export function focusChild (el: Element, location?: TFocusLocation) {
    const focusable = focusableChildren(el)

    if (!location) {
        if (el === document.activeElement || !el.contains(document.activeElement)) {
            focusable[0]?.focus()
        }
    } else if (location === FOCUS_LOCATION.FIRST) {
        focusable[0]?.focus()
    } else if (location === FOCUS_LOCATION.LAST) {
        focusable.at(-1)?.focus()
    } else if (typeof location === 'number') {
        focusable[location]?.focus()
    } else {
        const _el = getNextElement(focusable, location)
        if (_el) _el.focus()
        else focusChild(el, location === FOCUS_LOCATION.NEXT ? FOCUS_LOCATION.FIRST : FOCUS_LOCATION.LAST)
    }
}

/**
 * Focusable children.
 *
 * @param el               …
 * @param filterByTabIndex …
 */
export function focusableChildren (el: Element, filterByTabIndex = true) {
    const targets = ['button', '[href]', 'input:not([type="hidden"])', 'select', 'textarea', '[tabindex]']
        .map(s => `${s}${filterByTabIndex ? ':not([tabindex="-1"])' : ''}:not([disabled])`)
        .join(', ')
    return [...el.querySelectorAll(targets)] as Array<HTMLElement>
}

/**
 * Get next element.
 *
 * @param elements  …
 * @param location  …
 * @param condition …
 */
export function getNextElement (elements: Array<HTMLElement>, location?: 'next' | 'prev', condition?: (el: HTMLElement) => boolean) {
    let _el
    let idx = elements.indexOf(document.activeElement as HTMLElement)
    const inc = location === FOCUS_LOCATION.NEXT ? 1 : -1
    do {
        idx += inc
        _el = elements[idx]
    } while ((!_el || _el.offsetParent == null || !(condition?.(_el) ?? true)) && idx < elements.length && idx >= 0)
    return _el
}

/**
 * Human readable file size.
 *
 * @param bytes …
 * @param base  …
 * @returns …
 */
export function humanReadableFileSize (bytes: number, base: 1000 | 1024 = 1000): string {
    if (bytes < base) {
        return `${bytes} B`
    }

    const prefix = base === 1024 ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G']
    let unit = -1
    while (Math.abs(bytes) >= base && unit < prefix.length - 1) {
        bytes /= base
        ++unit
    }
    return `${bytes.toFixed(1)} ${prefix[unit]}B`
}

/**
 * Has event.
 *
 * @param props …
 * @param name  …
 */
export function hasEvent (props: Record<string, any>, name: string) {
    name = 'on' + capitalize(name)
    return !!(props[name] || props[`${name}Once`] || props[`${name}Capture`] || props[`${name}OnceCapture`] || props[`${name}CaptureOnce`])
}

/**
 * Flatten fragments.
 *
 * @param nodes …
 * @returns …
 */
export function flattenFragments (nodes: Array<VNode>): Array<VNode> {
    return nodes?.map((node) => {
        if (node.type === Fragment) {
            return flattenFragments(node.children as Array<VNode>)
        } else {
            return node
        }
    }).flat()
}

/**
 * Is object.
 *
 * @param obj …
 * @returns …
 */
export function isObject (obj: any): obj is object {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

/**
 * Merge deep.
 *
 * @param source  …
 * @param target  …
 * @param arrayFn …
 */
export function mergeDeep (
    source: Record<string, unknown> = {},
    target: Record<string, unknown> = {},
    arrayFn?: (a: Array<unknown>, b: Array<unknown>) => Array<unknown>
) {
    const out: Record<string, unknown> = {}

    for (const key in source) {
        out[key] = source[key]
    }

    for (const key in target) {
        const sourceProperty = source[key]
        const targetProperty = target[key]

        // Only continue deep merging if
        // both properties are objects
        if (
            isObject(sourceProperty) &&
            isObject(targetProperty)
        ) {
            out[key] = mergeDeep(sourceProperty as Record<string, unknown>, targetProperty as Record<string, unknown>, arrayFn)

            continue
        }

        if (Array.isArray(sourceProperty) && Array.isArray(targetProperty) && arrayFn) {
            out[key] = arrayFn(sourceProperty, targetProperty)

            continue
        }

        out[key] = targetProperty
    }

    return out
}

/**
 * Defer.
 *
 * @param timeout …
 * @param cb      …
 */
export function defer (timeout: number, cb: () => void) {
    if (!IN_BROWSER || timeout === 0) {
        cb()

        return () => {
        }
    }

    const timeoutId = window.setTimeout(cb, timeout)

    return () => window.clearTimeout(timeoutId)
}

/**
 * Matches selector.
 *
 * @param el       …
 * @param selector …
 * @returns …
 */
export function matchesSelector (el: Element | undefined, selector: string): boolean | null {
    const supportsSelector = IN_BROWSER &&
        typeof CSS !== 'undefined' &&
        typeof CSS.supports !== 'undefined' &&
        CSS.supports(`selector(${selector})`)

    if (!supportsSelector) return null

    try {
        return !!el && el.matches(selector)
    } catch {
        return null
    }
}

/**
 * Is on.
 *
 * @param key …
 */
export function isOn (key: string) {
    return ON_REGEX.test(key)
}

/**
 * Event name.
 *
 * @param propName …
 */
export function eventName (propName: string) {
    return propName[2].toLowerCase() + propName.slice(3)
}

/**
 * Wrap in array.
 *
 * @param v …
 * @returns …
 */
export function wrapInArray<T> (
    v: T | null | undefined
): TWrapInArrayResult<T> {
    if (v == null) {
        return [] as TWrapInArrayResult<T>
    }

    if (Array.isArray(v)) {
        return v as TWrapInArrayResult<T>
    }

    return [v] as TWrapInArrayResult<T>
}

/**
 * Template ref.
 */
export function templateRef () {
    const el = shallowRef<HTMLElement | ComponentPublicInstance | null>()
    const fn = (target: HTMLElement | ComponentPublicInstance | null) => {
        el.value = target
    }
    Object.defineProperty(fn, 'value', {
        enumerable: true,
        get: () => el.value,
        set: val => el.value = val
    })
    Object.defineProperty(fn, 'el', {
        enumerable: true,
        get: () => refElement(el.value)
    })

    return fn as TTemplateRef
}

/**
 * Get position.
 *
 * @param e        …
 * @param position …
 * @returns …
 */
export function getPosition (e: MouseEvent | TouchEvent, position: TClientPosition): number {
    if ('touches' in e && e.touches.length) return e.touches[0][position]

    else if ('changedTouches' in e && e.changedTouches.length) return e.changedTouches[0][position]

    else return (e as MouseEvent)[position]
}

/**
 * Add window listener.
 *
 * @param event                 …
 * @param listener              …
 * @param onUnmountedCleanupFns …
 */
export function addWindowListener (event: string, listener: EventListenerOrEventListenerObject, onUnmountedCleanupFns: any = []) {
    window.addEventListener(event, listener)

    const removeListener = () => window.removeEventListener(event, listener)

    onUnmountedCleanupFns.push(removeListener)

    return () => {
        removeListener()
        onUnmountedCleanupFns.splice(onUnmountedCleanupFns.indexOf(removeListener), 1)
    }
}

/**
 * Is empty.
 *
 * @param val …
 * @returns …
 */
export function isEmpty (val: any): boolean {
    return val === null || val === undefined || (typeof val === 'string' && val.trim() === '')
}

/**
 * Create range.
 *
 * @param length …
 * @param start  …
 * @returns …
 */
export function createRange (length: number, start = 0): number[] {
    return Array.from({length}, (_v, k) => start + k)
}

/**
 * Get event coordinates.
 *
 * @param e …
 */
export function getEventCoordinates (e: MouseEvent | TouchEvent) {
    if ('touches' in e) {
        return {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}
    }

    return {clientX: e.clientX, clientY: e.clientY}
}

/**
 * Call onMounted() if it's inside a component lifecycle, if not, just call the function
 *
 * @param fn
 * @param sync if set to false, it will run in the nextTick() of Vue
 * @param target
 */
export function tryOnMounted (fn: TFn, sync = true, target?: any) {
    const instance = getLifeCycleTarget(target)
    if (instance)
        onMounted(fn, target)
    else if (sync)
        fn()
    else
        nextTick(fn)
}

/**
 * Call onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing
 *
 * @param fn
 */
export function tryOnScopeDispose (fn: TFn) {
    if (getCurrentScope()) {
        onScopeDispose(fn)

        return true
    }
    return false
}

/**
 * Normalize.
 *
 * @param number          …
 * @param currentScaleMin …
 * @param currentScaleMax …
 * @param newScaleMin     …
 * @param newScaleMax     …
 */
export function normalize (
    number: number,
    currentScaleMin: number,
    currentScaleMax: number,
    newScaleMin = 0,
    newScaleMax = 1
) {
    // FIrst, normalize the value between 0 and 1.
    const standardNormalization = (number - currentScaleMin) / (currentScaleMax - currentScaleMin);

    // Next, transpose that value to our desired scale.
    return ((newScaleMax - newScaleMin) * standardNormalization + newScaleMin)
}
