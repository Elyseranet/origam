import { ORIGAM_WINDOW_KEY } from '../../consts'
import type { ITransitionProps } from '../../interfaces'
import { convertToUnit } from '../../utils'

import { Component, computed, inject, nextTick, ShallowRef, shallowRef, Transition, TransitionGroup } from 'vue'

/*********************************************************
 * useTransition
 ********************************************************/
export function useTransition (props: ITransitionProps) {

    const isDisabled = computed(() => {
        return props.disabled
    })
    const transitionName = computed(() => {
        return isDisabled.value ? '' : props.name
    })

    return {name: transitionName, isDisabled}
}

/*********************************************************
 * useCssTransition
 ********************************************************/
export function useCssTransition (props: ITransitionProps) {

    const {name, isDisabled} = useTransition(props)

    const tag: ShallowRef<Component> = props.group ? shallowRef(TransitionGroup) : shallowRef(Transition)

    const handleBeforeEnter = (el: HTMLElement) => {
        if (props.origin) {
            el.style.transformOrigin = props.origin
        }
    }
    const handleLeave = (el: HTMLElement) => {
        if (props.leaveAbsolute) {
            const {offsetTop, offsetLeft, offsetWidth, offsetHeight} = el
            el._transitionInitialStyles = {
                position: el.style.position,
                top: el.style.top,
                left: el.style.left,
                width: el.style.width,
                height: el.style.height
            }
            el.style.position = 'absolute'
            el.style.top = `${offsetTop}px`
            el.style.left = `${offsetLeft}px`
            el.style.width = `${offsetWidth}px`
            el.style.height = `${offsetHeight}px`
        }

        if (props.hideOnLeave) {
            el.style.setProperty('display', 'none', 'important')
        }
    }
    const handleAfterLeave = (el: HTMLElement) => {
        if (props.leaveAbsolute && el?._transitionInitialStyles) {
            const {position, top, left, width, height} = el._transitionInitialStyles
            delete el._transitionInitialStyles
            el.style.position = position || ''
            el.style.top = top || ''
            el.style.left = left || ''
            el.style.width = width || ''
            el.style.height = height || ''
        }
    }

    const transitionProps = computed(() => {
        const bind: { [key: string]: any } = {
            css: !isDisabled.value
        }

        if (props.group) {
            bind.mode = props.mode
        }

        if (isDisabled.value) {
            bind.onBeforeEnter = handleBeforeEnter
            bind.onLeave = handleLeave
            bind.onAfterLeave = handleAfterLeave
        }

        return bind
    })

    return {tag, name, isDisabled, transitionProps}
}

/*********************************************************
 * useWindowTransition
 ********************************************************/
export function useWindowTransition (props: ITransitionProps) {

    const {name, isDisabled} = useTransition(props)

    const tag: ShallowRef<Component> = props.group ? shallowRef(TransitionGroup) : shallowRef(Transition)

    const window = inject(ORIGAM_WINDOW_KEY)

    const isTransitioning = shallowRef(false)

    const handleAfterTransition = () => {
        if (!isTransitioning.value || !window) {
            return
        }

        // Finalize transition state.
        isTransitioning.value = false
        if (window.transitionCount.value > 0) {
            window.transitionCount.value -= 1

            // Remove container height if we are out of transition.
            if (window.transitionCount.value === 0) {
                window.transitionHeight.value = undefined
            }
        }
    }

    const handleBeforeTransition = () => {
        if (isTransitioning.value || !window) {
            return
        }

        // Initialize transition state here.
        isTransitioning.value = true

        if (window.transitionCount.value === 0) {
            // Set initial height for height transition.
            window.transitionHeight.value = convertToUnit(window.rootRef.value?.clientHeight)
        }

        window.transitionCount.value += 1
    }

    const handleTransitionCancelled = () => {
        handleAfterTransition() // This should have the same path as normal transition end.
    }

    const handleEnterTransition = (el: Element) => {
        if (!isTransitioning.value) {
            return
        }

        nextTick(() => {
            // Do not set height if no transition or cancelled.
            if (!isTransitioning.value || !window) {
                return
            }

            // Set transition target height.
            window.transitionHeight.value = convertToUnit(el.clientHeight)
        })
    }

    const transitionProps = computed(() => {
        const bind: { [key: string]: any } = {
            css: !isDisabled.value
        }

        if (props.group) {
            bind.mode = props.mode
        }

        if (isDisabled.value) {
            bind.onBeforeEnter = handleBeforeTransition
            bind.onAfterEnter = handleAfterTransition
            bind.onEnterCancelled = handleTransitionCancelled
            bind.onBeforeLeave = handleBeforeTransition
            bind.onAfterLeave = handleAfterTransition
            bind.onLeaveCancelled = handleTransitionCancelled
            bind.onEnter = handleEnterTransition
        }

        return bind
    })

    return {tag, name, isDisabled, transitionProps}
}
