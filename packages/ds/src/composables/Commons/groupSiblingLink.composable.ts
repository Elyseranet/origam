import type { ComponentInternalInstance, InjectionKey, Ref } from 'vue'
import { onMounted, shallowRef } from 'vue'
import type { IGroupProvide } from '../../interfaces/Commons/group.interface'
import { findChildrenWithProvide } from '../../utils/Commons/commons.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useGroupSiblingLink
 *
 * @description
 * Vue's `provide` / `inject` only crosses the ANCESTOR chain — two
 * components declared as SIBLINGS under a common parent (e.g. the
 * documented `<OrigamTabs>` / `<OrigamTabPanels>` usage, #441) can
 * never `inject()` each other directly: the sibling never appears in
 * either one's ancestor chain, so the lookup always resolves to
 * `null`, no matter how the injection key is built.
 *
 * This composable finds the matching sibling's `useGroup` state by
 * walking the shared parent's RENDERED subtree instead — the same
 * `findChildrenWithProvide` trick `useGroup.register` already uses to
 * order same-group children. Multiple same-parent pairs are matched
 * by DOCUMENT ORDER: the n-th component providing `ownKey` pairs with
 * the n-th component providing `siblingKey`.
 *
 * Resolved lazily in `onMounted`, not read eagerly during `setup()`:
 * mount order follows document order, so when e.g. `<OrigamTabs>`'s
 * own `setup()` runs, a LATER-declared `<OrigamTabPanels>` sibling
 * does not exist yet — an eager read would always see nothing, which
 * is the exact #441 bug. `onMounted` callbacks are queued and only
 * flushed once the whole initial tree (both siblings) has mounted, so
 * by the time this runs the sibling is guaranteed to have registered.
 * The returned `Ref` starts at `null` and updates once resolved —
 * callers must read it inside a `computed` (or other reactive spot)
 * for the update to reach the template, never destructure `.value`
 * during their own `setup()` body.
 ********************************************************/
export function useGroupSiblingLink (
    ownKey: InjectionKey<IGroupProvide>,
    siblingKey: InjectionKey<IGroupProvide>
): Ref<IGroupProvide | null> {
    const vm = getCurrentInstance('useGroupSiblingLink')
    const sibling = shallowRef<IGroupProvide | null>(null)

    onMounted(() => {
        const parentSubTree = vm.parent?.subTree

        if (!parentSubTree) return

        const ownProviders = findChildrenWithProvide(ownKey, parentSubTree)
        const siblingProviders = findChildrenWithProvide(siblingKey, parentSubTree)

        const ownIndex = ownProviders.indexOf(vm as ComponentInternalInstance)

        if (ownIndex === -1) return

        const match = siblingProviders[ownIndex]
        const matchProvides = (match as { provides?: Record<string | symbol, unknown> } | undefined)?.provides

        sibling.value = (matchProvides?.[siblingKey as unknown as symbol] as IGroupProvide | undefined) ?? null
    })

    return sibling
}
