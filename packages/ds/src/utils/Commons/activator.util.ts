import { ComponentInternalInstance, ComponentPublicInstance, mergeProps, nextTick, onScopeDispose, watch } from 'vue'
import { useActivator } from '../../composables'
import type { IActivatorProps } from '../../interfaces'
import { bindProps, unbindProps } from '../../utils'

/**
 * Activator.
 *
 * @param props   …
 * @param vm      …
 * @param options …
 */
export function activator (
    props: IActivatorProps,
    vm: ComponentInternalInstance,
    {activatorEl, activatorEvents}: Pick<ReturnType<typeof useActivator>, 'activatorEl' | 'activatorEvents'>
) {
    watch(() => props.activator, (val, oldVal) => {
        if (oldVal && val !== oldVal) {
            const activator = getActivator(oldVal)

            if (activator) {
                unbindActivatorProps(activator)
            }
        }
        if (val) {
            nextTick(() => bindActivatorProps())
        }
    }, {immediate: true})

    watch(() => props.activatorProps, () => {
        bindActivatorProps()
    })

    onScopeDispose(() => {
        unbindActivatorProps()
    })

    const bindActivatorProps = (el = getActivator(), _props = props.activatorProps) => {
        if (!el) return
        if (!_props) return

        bindProps(el, mergeProps(activatorEvents.value, _props))
    }

    const unbindActivatorProps = (el = getActivator(), _props = props.activatorProps) => {
        if (!el) return
        if (!_props) return

        unbindProps(el, mergeProps(activatorEvents.value, _props))
    }

    const getActivator = (selector = props.activator): HTMLElement | undefined => {
        const activator = getTargetActivator(selector, vm)

        // The activator should only be a valid element (Ignore comments and text nodes)
        activatorEl.value = activator && !Array.isArray(activator) && activator.nodeType === Node.ELEMENT_NODE ? activator : undefined

        return activatorEl.value
    }
}

/**
 * Get target activator.
 *
 * @param selector …
 * @param vm       …
 * @returns …
 */
export function getTargetActivator<T extends 'parent' | string | Element | ComponentPublicInstance | [x: number, y: number] | undefined> (
    selector: T,
    vm: ComponentInternalInstance
): HTMLElement | undefined | [x: number, y: number] {
    if (!selector) return undefined

    if (selector === 'parent') {
        let el = vm?.proxy?.$el?.parentNode
        while (el?.hasAttribute('data-no-activator')) {
            el = el.parentNode
        }
        return el as HTMLElement
    }

    if (selector === 'cursor') {
        return document.querySelector('body') as HTMLElement
    }

    if (typeof selector === 'string') {
        // Selector
        return document.querySelector(selector) as HTMLElement
    }

    if ('$el' in selector) {
        // Component (ref)
        return selector.$el as HTMLElement
    }

    // HTMLElement | Element | [x, y]
    if (Array.isArray(selector)) {
        return selector as [x: number, y: number]
    }

    return selector as HTMLElement
}
