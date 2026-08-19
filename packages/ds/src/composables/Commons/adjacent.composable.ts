import type { ComputedRef, Ref } from 'vue'
import { computed, useSlots } from 'vue'
import type { IAdjacentProps } from '../../interfaces'
import { getCurrentInstance } from '../../utils'

/*********************************************************
 * useAdjacent
 *
 * @description
 * Resolves the prepend/append media + slot presence and click emits
 * for a component's OUTER adjacent zone (prepend/append icon or
 * avatar). `useAdjacentInner` is the sibling hook for the INNER zone
 * (prependInner/appendInner/clear) — independent, no shared state.
 ********************************************************/
export function useAdjacent (props: IAdjacentProps, prependIcon?: Ref | ComputedRef, appendIcon?: Ref | ComputedRef) {
    const vm = getCurrentInstance('OrigamAdjacent')

    const slots = useSlots()

    // The icon Refs are optional — when omitted, fall back to the
    // matching prop. Pre-fix every consumer was forced to pass either a
    // toRef(props,'prependIcon') OR a derived computed (e.g. status-aware
    // icon swap), and forgetting one (as `<OrigamConfirmWrapper>` did)
    // crashed at render with "Cannot read properties of undefined
    // (reading 'value')". Resolving here keeps the simple
    // `useAdjacent(props)` form valid.
    const hasPrependMedia = computed(() => {
        const icon = prependIcon ? prependIcon.value : props.prependIcon
        return !!(props.prependAvatar || icon)
    })
    const hasPrepend = computed(() => {
        return !!slots.prepend || hasPrependMedia.value
    })
    const hasAppendMedia = computed(() => {
        const icon = appendIcon ? appendIcon.value : props.appendIcon
        return !!(props.appendAvatar || icon)
    })
    const hasAppend = computed(() => {
        return !!slots.append || hasAppendMedia.value
    })

    const onClickPrepend = (e: Event) => {
        vm.emit('click:prepend', e)
    }
    const onClickAppend = (e: Event) => {
        vm.emit('click:append', e)
    }

    return {
        hasPrependMedia,
        hasPrepend,
        hasAppendMedia,
        hasAppend,
        onClickPrepend,
        onClickAppend
    }
}
