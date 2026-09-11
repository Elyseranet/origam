import { IN_BROWSER } from '../../consts'
import { consoleWarn } from '../../utils'

import { computed, Ref } from 'vue'

/*********************************************************
 * useTeleport
 ********************************************************/
export function useTeleport (target: Ref<boolean | string | Element>) {
    const teleportTarget = computed(() => {
        const _target = target.value

        if (_target === true || !IN_BROWSER) return undefined

        const targetElement =
            _target === false ? document.body
                : typeof _target === 'string' ? document.querySelector(_target)
                    : _target

        if (targetElement == null) {
            consoleWarn(`Unable to locate target ${_target}`)

            return undefined
        }

        let container = targetElement.querySelector(':scope > .origam-overlay-container')

        if (!container) {
            container = document.createElement('div')
            container.className = 'origam-overlay-container'
            targetElement.appendChild(container)
        }

        return container
    })

    return {teleportTarget}
}
