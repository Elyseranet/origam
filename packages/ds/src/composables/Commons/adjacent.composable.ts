import type { ComputedRef, Ref } from 'vue'
import { computed, useSlots } from 'vue'
import type { IAdjacentProps } from '../../interfaces/Commons/adjacent.interface'
import { KEYBOARD_VALUES } from '../../enums/Commons/hotkey.enum'
import { hasEvent } from '../../utils/Commons/commons.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useAdjacent
 *
 * @description
 * Resolves the prepend/append media + slot presence and click emits
 * for a component's OUTER adjacent zone (prepend/append icon or
 * avatar). `useAdjacentInner` is the sibling hook for the INNER zone
 * (prependInner/appendInner/clear) — independent, no shared state.
 *
 * @description
 * ⛔ issue #443 — `click:prepend` / `click:append` are a real, public
 * event API (relayed by TextField/TextareaField/PasswordField/
 * FileField/NumberField/DataTable/Card…, with dedicated story
 * Variants) meant for a consumer to attach a DISTINCT action to the
 * adjacent zone. A DOM click landing on the prepend/append `<span>`/
 * `<div>` fires it; a keyboard "click" synthesized by the browser on
 * the component ROOT (Enter/Space on a real `<button>` ancestor)
 * never does — the synthetic event's `target` is the root, so it
 * never reaches a listener bound to the descendant. The event was
 * therefore 100% keyboard-unreachable regardless of what the
 * ancestor renders as.
 *
 * @description
 * `isPrependClickable` / `isAppendClickable` mirror the existing
 * `useIconAccessibility` contract (`isClickable = !!attrs.onClick`):
 * the zone becomes a real `role="button"` + tab stop ONLY when the
 * consumer actually attached a `click:prepend`/`click:append`
 * listener — a decorative icon with nobody listening stays exactly
 * as inert as before, no spurious tab stop.
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

    /*********************************************************
     * isPrependClickable / isAppendClickable
     *
     * @description
     * `hasEvent(vm.attrs, …)` ALONE is blind here: `defineEmits<IAdjacentEmits>()`
     * declares `click:prepend`/`click:append`, so Vue strips any matching
     * listener out of `$attrs` before this composable ever sees it (verified
     * empirically — see `useLink`'s `isClickable` / issue #397 for the same
     * defect on the plain `click` event, on OrigamChip/OrigamListItem
     * specifically because THEY declare `click` as an emit while OrigamCard
     * doesn't). `vm.vnode.props` is the raw, pre-split object the parent
     * template actually wrote and sees the listener regardless of the emit
     * declaration — checking both mirrors `useLink` exactly.
     ********************************************************/
    const isPrependClickable = computed(() => {
        return hasEvent(vm.attrs, 'click:prepend') || hasEvent(vm.vnode.props ?? {}, 'click:prepend')
    })
    const isAppendClickable = computed(() => {
        return hasEvent(vm.attrs, 'click:append') || hasEvent(vm.vnode.props ?? {}, 'click:append')
    })

    const onKeydownPrepend = (e: KeyboardEvent) => {
        if (!isPrependClickable.value) return
        if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

        e.preventDefault()
        onClickPrepend(e)
    }
    const onKeydownAppend = (e: KeyboardEvent) => {
        if (!isAppendClickable.value) return
        if (e.key !== KEYBOARD_VALUES.ENTER && e.key !== KEYBOARD_VALUES.EMPTY) return

        e.preventDefault()
        onClickAppend(e)
    }

    return {
        hasPrependMedia,
        hasPrepend,
        hasAppendMedia,
        hasAppend,
        isPrependClickable,
        isAppendClickable,
        onClickPrepend,
        onClickAppend,
        onKeydownPrepend,
        onKeydownAppend
    }
}
