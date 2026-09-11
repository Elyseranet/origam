import { computed, effectScope, EffectScope, inject, nextTick, onScopeDispose, ref, Ref, watch, watchEffect } from 'vue'
import { useDelay } from '../../composables'

import { IN_BROWSER, ORIGAM_MENU_KEY } from '../../consts'

import type { IActivatorProps } from '../../interfaces'

import { activator, getCurrentInstance, getTargetActivator, matchesSelector, refElement } from '../../utils'

/*********************************************************
 * useActivator
 ********************************************************/
export function useActivator (props: IActivatorProps, {isActive, isTop}: {
    isActive: Ref<boolean>,
    isTop: Ref<boolean>
}) {
    const vm = getCurrentInstance('useActivator')
    const activatorEl = ref<HTMLElement>()

    let isHovered = false
    let isFocused = false
    let firstEnter = true

    const openOnFocus = computed(() => {
        return props.openOnFocus || (props.openOnFocus == null && props.openOnHover)
    })
    const openOnClick = computed(() => {
        return props.openOnClick || (props.openOnClick == null && !props.openOnHover && !openOnFocus.value)
    })
    const openOnContextMenu = computed(() => {
        return props.openOnContextMenu || (props.openOnContextMenu == null && !props.openOnHover && !openOnClick.value && !openOnFocus.value)
    })

    const delayCallback = (value: boolean) => {
        if (
            value === (
                (props.openOnHover && isHovered) ||
                (openOnFocus.value && isFocused)
            ) && !(props.openOnHover && isActive.value && !isTop.value)
        ) {
            if (isActive.value !== value) {
                firstEnter = true
            }
            isActive.value = value
        }
    }

    const {runOpenDelay, runCloseDelay} = useDelay(props, delayCallback)

    // EVENTS

    const cursorTarget = ref<[x: number, y: number]>()

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation()

        activatorEl.value = (e.currentTarget || e.target) as HTMLElement

        if (!isActive.value) {
            cursorTarget.value = [e.clientX, e.clientY]
        }

        isActive.value = !isActive.value
    }
    const handleContextMenu = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()

        activatorEl.value = (e.currentTarget || e.target) as HTMLElement

        cursorTarget.value = [e.clientX, e.clientY]

        isActive.value = !isActive.value
    }
    const handleMouseEnter = (e: MouseEvent) => {
        if (e.sourceCapabilities?.firesTouchEvents) return

        isHovered = true
        activatorEl.value = (e.currentTarget || e.target) as HTMLElement
        runOpenDelay()
    }
    const handleMouseLeave = () => {
        isHovered = false
        runCloseDelay()
    }
    const handleFocus = (e: FocusEvent) => {
        if (matchesSelector(e.target as HTMLElement, ':focus-visible') === false) return

        isFocused = true
        e.stopPropagation()
        activatorEl.value = (e.currentTarget || e.target) as HTMLElement

        runOpenDelay()
    }
    const handleBlur = (e: FocusEvent) => {
        isFocused = false
        e.stopPropagation()

        runCloseDelay()
    }

    const availableEvents = {
        onContextmenu: handleContextMenu,
        onClick: handleClick,
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur
    }

    const activatorEvents = computed(() => {
        const events: Partial<typeof availableEvents> = {}

        if (openOnClick.value) {
            events.onClick = availableEvents.onClick
        }
        if (openOnContextMenu.value) {
            events.onContextmenu = availableEvents.onContextmenu
        }
        if (props.openOnHover) {
            events.onMouseenter = availableEvents.onMouseenter
            events.onMouseleave = availableEvents.onMouseleave
        }
        if (openOnFocus.value) {
            events.onFocus = availableEvents.onFocus
            events.onBlur = availableEvents.onBlur
        }

        return events
    })
    const contentEvents = computed(() => {
        const events: Record<string, EventListener> = {}

        if (props.openOnHover) {
            events.onMouseenter = () => {
                isHovered = true
                runOpenDelay()
            }
            events.onMouseleave = () => {
                isHovered = false
                runCloseDelay()
            }
        }

        if (openOnFocus.value) {
            events.onFocusin = () => {
                isFocused = true
                runOpenDelay()
            }
            events.onFocusout = () => {
                isFocused = false
                runCloseDelay()
            }
        }

        if (props.closeOnContentClick) {
            const menu = inject(ORIGAM_MENU_KEY, null)
            events.onClick = () => {
                isActive.value = false
                menu?.closeParents()
            }
        }

        return events
    })
    const scrimEvents = computed(() => {
        const events: Record<string, EventListener> = {}

        if (props.openOnHover) {
            events.onMouseenter = () => {
                if (firstEnter) {
                    isHovered = true
                    firstEnter = false
                    runOpenDelay()
                }
            }
            events.onMouseleave = () => {
                isHovered = false
                runCloseDelay()
            }
        }

        return events
    })

    watch(isTop, (val) => {
        if (val && (
            (props.openOnHover && !isHovered && (!openOnFocus.value || !isFocused)) ||
            (openOnFocus.value && !isFocused && (!props.openOnHover || !isHovered))
        )) {
            isActive.value = false
        }
    })
    watch(isActive, (val) => {
        if (!val) {
            setTimeout(() => {
                cursorTarget.value = undefined
            })
        }
    }, {flush: 'post'})

    // ACTIVATOR TARGET

    const activatorRef = ref<HTMLElement>()

    watchEffect(() => {
        if (!activatorRef.value) return

        nextTick(() => {
            activatorEl.value = refElement(activatorRef.value)
        })
    })

    const targetRef = ref<HTMLElement>()
    const target = computed(() => {
        if (props.target === 'cursor' && cursorTarget.value) return cursorTarget.value
        if (targetRef.value) return refElement(targetRef.value)
        return getTargetActivator(props.target, vm) || activatorEl.value
    })
    const targetEl = computed(() => {
        return Array.isArray(target.value)
            ? undefined
            : target.value
    })

    // SCOPE

    let scope: EffectScope

    watch(() => !!props.activator, val => {
        if (val && IN_BROWSER) {
            scope = effectScope()
            scope.run(() => {
                activator(props, vm, {activatorEl, activatorEvents})
            })
        } else if (scope) {
            scope.stop()
        }
    }, {flush: 'post', immediate: true})

    onScopeDispose(() => {
        scope?.stop()
    })

    return {activatorEl, activatorRef, target, targetEl, targetRef, activatorEvents, contentEvents, scrimEvents}
}
