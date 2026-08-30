import { computed, useSlots } from 'vue'
import type { IAdjacentInnerProps } from '../../interfaces/Commons/adjacent.interface'
import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
import { hasEvent } from '../../utils/Commons/commons.util'
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
 *
 * @description
 * ⛔ issue #443 — same gap as `useAdjacent`: `click:prependInner` /
 * `click:appendInner` only ever fired from a literal DOM click inside
 * the zone, never from a keyboard activation of an ancestor. See the
 * long comment on `useAdjacent` for the full reasoning; mirrored here
 * for the inner zone. `isClearClickable` stays permanently true when
 * `hasClear` is — the clear zone only renders (`v-show="dirty"`) when
 * there is something to clear, so it is unconditionally actionable
 * whenever visible, unlike prependInner/appendInner whose
 * actionability depends on whether the consumer wired a listener.
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

    // See `useAdjacent.isPrependClickable` — same #397-shaped gap:
    // `defineEmits<IAdjacentInnerEmits>()` declares these, so `$attrs`
    // alone misses a listener the parent DID attach; `vm.vnode.props`
    // (raw, pre-split) still has it.
    const isPrependInnerClickable = computed(() => {
        return hasEvent(vm.attrs, 'click:prependInner') || hasEvent(vm.vnode.props ?? {}, 'click:prependInner')
    })
    const isAppendInnerClickable = computed(() => {
        return hasEvent(vm.attrs, 'click:appendInner') || hasEvent(vm.vnode.props ?? {}, 'click:appendInner')
    })

    const onKeydownPrependInner = (e: KeyboardEvent) => {
        if (!isPrependInnerClickable.value) return
        if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

        e.preventDefault()
        onClickPrependInner(e)
    }
    const onKeydownAppendInner = (e: KeyboardEvent) => {
        if (!isAppendInnerClickable.value) return
        if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

        e.preventDefault()
        onClickAppendInner(e)
    }

    return {
        hasPrependInnerMedia,
        hasPrependInner,
        hasAppendInnerMedia,
        hasAppendInner,
        hasClear,
        isPrependInnerClickable,
        isAppendInnerClickable,
        onClickPrependInner,
        onClickAppendInner,
        onKeydownPrependInner,
        onKeydownAppendInner,
        clickClear
    }
}
