import { computed, useSlots } from 'vue'
import type { IAdjacentInnerProps } from '../../interfaces/Commons/adjacent.interface'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useAdjacentInner
 *
 * @description
 * Resolves the prependInner/appendInner/clear media + slot presence
 * and click emits for a component's INNER adjacent zone (e.g. a
 * text-field's clear button, sitting inside the input's border rather
 * than outside it). `useAdjacent` is the sibling hook for the OUTER
 * zone — independent, no shared state.
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
