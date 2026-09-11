import { computed, ComputedRef, Ref, useSlots } from 'vue'
import type { IAdjacentInnerProps, IAdjacentProps } from '../../interfaces'

import { getCurrentInstance } from "../../utils"

/*********************************************************
 * useAdjacent
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

/*********************************************************
 * useAdjacentInner
 ********************************************************/
export function useAdjacentInner (props: IAdjacentInnerProps) {
    const vm = getCurrentInstance('OrigamAdjacentInner')

    const slots = useSlots()

    const hasPrependInnerMedia = computed(() => {
        return !!(props.prependInnerAvatar || props.prependInnerIcon)
    })
    const hasPrependInner = computed(() => {
        return slots.prependInner || hasPrependInnerMedia.value
    })
    const hasAppendInnerMedia = computed(() => {
        return !!(props.appendInnerAvatar || props.appendInnerIcon)
    })
    const hasAppendInner = computed(() => {
        return slots.appendInner || hasAppendInnerMedia.value
    })
    const hasClear = computed(() => {
        return props.clearable || slots.clear
    })

    const onClickPrependInner = (e: Event) => {
        vm.emit('click:prependInner', e)
    }
    const onClickAppendInner = (e: Event) => {
        vm.emit('click:appendInner', e)
    }
    const clickClear = (e: Event) => {
        vm.emit('click:clear', e)
    }

    return {
        hasPrependInnerMedia,
        hasPrependInner,
        hasAppendInnerMedia,
        hasAppendInner,
        hasClear,
        onClickPrependInner,
        onClickAppendInner,
        clickClear
    }
}
