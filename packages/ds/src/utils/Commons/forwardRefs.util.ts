import { ComponentPublicInstance, Ref, UnwrapRef } from 'vue'
import { FORWARD_REFS } from '../../consts'

import type { TOmitPrefix, TOmitProps, TUnionToIntersection } from '../../types'

/**
 * Forward refs.
 *
 * @param target …
 * @param refs   …
 * @returns …
 */
export function forwardRefs<T extends Record<string, unknown>, U extends Ref<HTMLElement | Omit<ComponentPublicInstance, '$emit' | '$slots'> | undefined>[]> (
    target: T,
    ...refs: U
): T & TUnionToIntersection<{ [K in keyof U]: TOmitPrefix<TOmitProps<NonNullable<UnwrapRef<U[K]>>>, '$'> }[number]> {
    (target as any)[FORWARD_REFS] = refs

    return new Proxy(target, {
        get (target, key) {
            if (Reflect.has(target, key)) {
                return Reflect.get(target, key)
            }

            // Skip internal properties
            if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return

            for (const ref of refs) {
                if (ref.value && Reflect.has(ref.value, key)) {
                    const val = Reflect.get(ref.value, key)
                    return typeof val === 'function'
                        ? val.bind(ref.value)
                        : val
                }
            }
        },
        has (target, key) {
            if (Reflect.has(target, key)) {
                return true
            }

            // Skip internal properties
            if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return false

            for (const ref of refs) {
                if (ref.value && Reflect.has(ref.value, key)) {
                    return true
                }
            }
            return false
        },
        set (target, key, value) {
            if (Reflect.has(target, key)) {
                return Reflect.set(target, key, value)
            }

            // Skip internal properties
            if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return false

            for (const ref of refs) {
                if (ref.value && Reflect.has(ref.value, key)) {
                    return Reflect.set(ref.value, key, value)
                }
            }

            return false
        },
        getOwnPropertyDescriptor (target, key) {
            const descriptor = Reflect.getOwnPropertyDescriptor(target, key)
            if (descriptor) return descriptor

            // Skip internal properties
            if (typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')) return

            // Check each ref's own properties
            for (const ref of refs) {
                if (!ref.value) continue
                const descriptor = getDescriptor(ref.value, key) ?? ('_' in ref.value ? getDescriptor((ref.value as unknown as { _?: { setupState?: unknown } })._?.setupState, key) : undefined)
                if (descriptor) return descriptor
            }

            // Recursive search up each ref's prototype
            for (const ref of refs) {
                const childRefs = ref.value && (ref.value as any)[FORWARD_REFS]
                if (!childRefs) continue
                const queue = childRefs.slice()
                while (queue.length) {
                    const ref = queue.shift()
                    const descriptor = getDescriptor(ref.value, key)
                    if (descriptor) return descriptor
                    const childRefs = ref.value?.[FORWARD_REFS]
                    if (childRefs) queue.push(...childRefs)
                }
            }

            return undefined
        }
    }) as any
}

/**
 * Get descriptor.
 *
 * @param obj …
 * @param key …
 */
export function getDescriptor (obj: any, key: PropertyKey) {
    let currentObj = obj

    while (currentObj) {
        const descriptor = Reflect.getOwnPropertyDescriptor(currentObj, key)
        if (descriptor) return descriptor
        currentObj = Object.getPrototypeOf(currentObj)
    }

    return undefined
}
