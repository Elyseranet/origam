import type { ComponentInternalInstance } from 'vue'
import { getCurrentInstance as _getCurrentInstance } from 'vue'
import { toKebabCase } from '../../utils'

/**
 * Get life cycle target.
 *
 * @param target …
 */
export function getLifeCycleTarget (target?: any) {
    return target || _getCurrentInstance()
}

/**
 * Get current instance.
 *
 * @param name    …
 * @param message …
 */
export function getCurrentInstance (name: string, message?: string) {
    const vm = _getCurrentInstance()

    if (!vm) {
        throw new Error(`[Origam] ${name} ${message || 'must be called from inside a setup function'}`)
    }

    return vm
}

/**
 * Get current instance name.
 *
 * @param name …
 */
export function getCurrentInstanceName (name = 'composable') {
    const vm = getCurrentInstance(name).type

    return toKebabCase((vm as unknown as { aliasName?: string })?.aliasName ?? vm?.name ?? vm?.__name)
}

let _uid = 0
let _map = new WeakMap<ComponentInternalInstance, number>()

/**
 * Get uid.
 */
export function getUid () {
    const vm = getCurrentInstance('getUid')

    if (_map.has(vm)) return _map.get(vm)!
    else {
        const uid = _uid++
        _map.set(vm, uid)
        return uid
    }
}

getUid.reset = () => {
    _uid = 0
    _map = new WeakMap()
}
