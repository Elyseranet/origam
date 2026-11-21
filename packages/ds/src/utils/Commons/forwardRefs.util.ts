import { ComponentPublicInstance, Ref, UnwrapRef } from 'vue'
import { FORWARD_REFS } from '../../consts/Commons/forwardRefs.const'

import type { TOmitPrefix, TOmitProps, TUnionToIntersection } from '../../types/Commons/forwardRefs.type'

/*********************************************************
 * isInternalKey
 *
 * @description
 * Keys the forwarding proxy never looks up on its refs (symbols, `$…`, `__…`).
 ********************************************************/
function isInternalKey (key: string | symbol): key is symbol {
    return typeof key === 'symbol' || key.startsWith('$') || key.startsWith('__')
}

/*********************************************************
 * findRefValueWith
 *
 * @description
 * The value of the first ref that exposes `key`.
 ********************************************************/
function findRefValueWith (refs: Ref[], key: string) {
    for (const ref of refs) {
        if (ref.value && Reflect.has(ref.value, key)) return ref.value
    }

    return undefined
}

/*********************************************************
 * findDescriptorInRefs
 *
 * @description
 * Own descriptor of `key` on the first ref that has one (component `setupState` included).
 ********************************************************/
function findDescriptorInRefs (refs: Ref[], key: string) {
    for (const ref of refs) {
        if (!ref.value) continue
        const descriptor = getDescriptor(ref.value, key) ?? ('_' in ref.value ? getDescriptor((ref.value as unknown as { _?: { setupState?: unknown } })._?.setupState, key) : undefined)
        if (descriptor) return descriptor
    }

    return undefined
}

/*********************************************************
 * findDescriptorInForwardedRefs
 *
 * @description
 * Breadth-first search of `key` in the refs forwarded by the refs' own `forwardRefs` proxies.
 ********************************************************/
function findDescriptorInForwardedRefs (refs: Ref[], key: string) {
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
            if (isInternalKey(key)) return

            const owner = findRefValueWith(refs, key)
            if (!owner) return

            const val = Reflect.get(owner, key)
            return typeof val === 'function'
                ? val.bind(owner)
                : val
        },
        has (target, key) {
            if (Reflect.has(target, key)) {
                return true
            }

            // Skip internal properties
            if (isInternalKey(key)) return false

            return findRefValueWith(refs, key) !== undefined
        },
        set (target, key, value) {
            if (Reflect.has(target, key)) {
                return Reflect.set(target, key, value)
            }

            // Skip internal properties
            if (isInternalKey(key)) return false

            const owner = findRefValueWith(refs, key)

            return owner ? Reflect.set(owner, key, value) : false
        },
        getOwnPropertyDescriptor (target, key) {
            const descriptor = Reflect.getOwnPropertyDescriptor(target, key)
            if (descriptor) return descriptor

            // Skip internal properties
            if (isInternalKey(key)) return

            return findDescriptorInRefs(refs, key) ?? findDescriptorInForwardedRefs(refs, key)
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
