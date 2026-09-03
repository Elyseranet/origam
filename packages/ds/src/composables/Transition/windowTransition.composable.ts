import type { Component } from 'vue'
import { computed, inject, nextTick, shallowRef, Transition, TransitionGroup } from 'vue'
import { ORIGAM_WINDOW_KEY } from '../../consts/Window/window.const'
import type { ITransitionProps } from '../../interfaces/Transition/transition.interface'
import { convertToUnit } from '../../utils/Commons/commons.util'
import { useTransition } from './transition.composable'

/*********************************************************
 * useWindowTransition
 *
 * @description
 * Height-tracking transition wiring for a windowed container (e.g. a
 * multi-step form / carousel) — measures and freezes the container
 * height across the transition so intermediate steps don't jump.
 * Delegates the disabled/name resolution to `useTransition` rather
 * than duplicating it. `useCssTransition` is the CSS-only sibling of
 * this hook and lives in its own file.
 ********************************************************/
export function useWindowTransition (props: ITransitionProps) {

    const {name, isDisabled} = useTransition(props)

    const tag = computed<Component>(() => props.group ? TransitionGroup : Transition)

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
        const bind: { [key: string]: unknown } = {
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
