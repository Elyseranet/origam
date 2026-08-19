import { computed } from 'vue'
import type { ITransitionProps } from '../../interfaces'

/*********************************************************
 * useTransition
 *
 * @description
 * Base transition-name resolver: turns the `disabled` prop into an
 * empty transition name so the `<transition>` / `<transition-group>`
 * wrapper effectively no-ops without the consumer having to branch.
 * `useCssTransition` and `useWindowTransition` both delegate to this
 * hook rather than duplicating the disabled/name derivation.
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
