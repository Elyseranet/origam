import type { ComputedRef, CSSProperties, Ref } from 'vue'
import { computed, inject, onActivated, onBeforeUnmount, onDeactivated, provide, shallowRef } from 'vue'
import { ORIGAM_LAYOUT_ITEM_KEY, ORIGAM_LAYOUT_KEY } from '../../consts'
import type { TDirectionBoth } from '../../types'
import { getCurrentInstance, getUid } from '../../utils'

/*********************************************************
 * useLayoutItem
 *
 * @description
 * Registers a component (BottomNav, AppBar, Drawer…) as an item of the
 * nearest `ORIGAM_LAYOUT_KEY` layout provided by `useCreateLayout`.
 * Falls back to inert styles when no layout provider is present so the
 * component still renders standalone (stories, modal previews, tests).
 * Independent from `useLayout` / `useCreateLayout` at the call level
 * (no direct function dependency) — the three only share the
 * `ORIGAM_LAYOUT_KEY` provide/inject contract.
 ********************************************************/
export function useLayoutItem (options: {
    id: string | undefined
    order: Ref<number>
    position: Ref<TDirectionBoth>
    layoutSize: Ref<number | string>
    elementSize: Ref<number | string | undefined>
    active: Ref<boolean> | ComputedRef<boolean>
    disableTransitions?: Ref<boolean>
    absolute: Ref<boolean | undefined>
}) {
    const layout = inject(ORIGAM_LAYOUT_KEY)

    // No layout provider in the tree: fall back to inert styles so the
    // component (BottomNav, AppBar, …) still renders standalone — useful
    // in stories, modal previews, or tests that don't bother wrapping
    // the component in an OrigamLayout. Throwing here used to crash the
    // entire sandbox.
    if (!layout) {
        return {
            layoutItemStyles: computed<CSSProperties>(() => ({})),
            layoutRect: shallowRef(undefined),
            layoutItemScrimStyles: computed<CSSProperties>(() => ({})),
            layoutId: 'origam-layout-orphan'
        }
    }

    const id = options.id ?? `layout-item-${getUid()}`

    const vm = getCurrentInstance('useLayoutItem')

    provide(ORIGAM_LAYOUT_ITEM_KEY, shallowRef({id}))

    const isKeptAlive = shallowRef(false)
    onDeactivated(() => {
        isKeptAlive.value = true
    })
    onActivated(() => {
        isKeptAlive.value = false
    })

    const {
        layoutItemStyles,
        layoutItemScrimStyles
    } = layout.register(vm, {
        ...options,
        active: computed(() => isKeptAlive.value ? false : options.active.value),
        id
    })

    onBeforeUnmount(() => {
        layout.unregister(id)
    })

    return {
        layoutItemStyles,
        layoutRect: layout.layoutRect,
        layoutItemScrimStyles,
        layoutId: layout.layoutId
    }
}
