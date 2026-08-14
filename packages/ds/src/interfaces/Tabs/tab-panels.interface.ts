import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDirectionProps,
    IGroupProps,
    IGroupProvide,
    ITagProps
} from '../../interfaces'

import type { ComputedRef, Ref } from 'vue'

/**
 * Props for `<OrigamTabPanels>` — the content area that mirrors the
 * tablist selection. Uses its own `useGroup` registration (keyed on
 * `ORIGAM_TAB_PANELS_KEY`) so the two siblings can be rendered as
 * peers under any parent without sharing the tablist's ARIA role
 * (`role="tablist"` vs `role` -less for the panels container).
 *
 *  - `transition`   transition name passed to `<OrigamTransition>`.
 *                   Default is `'fade'`. Pass `false` to disable.
 *  - `swipeable`    enables horizontal touch swipe between panels
 *                   (delegated to `vTouch`). Off by default.
 */
export interface ITabPanelsProps extends ICommonsComponentProps, ITagProps, IDirectionProps, IGroupProps {
    tag?: string
    transition?: string | false
    swipeable?: boolean
}

/**
 * Context exposed by `<OrigamTabPanels>` to descendant panels —
 * lets `<OrigamTabPanel>` read transition + reverse direction
 * without re-declaring the same props at every level.
 */
export interface ITabPanelsProvide {
    transition: ComputedRef<string | false>
    isReversed: Ref<boolean>
}

/** Emits fired by `<OrigamTabPanels>` — v-model mirrors the parent tablist. */
export interface ITabPanelsEmits extends ICommonsComponentEmits {}

/** Scope forwarded to the `default` slot — the raw `useGroup()`
 *  selection API, forwarded as-is (its `selected` field stays a `Ref`,
 *  mirroring `ITabsSlotProps` / `IItemGroupSlots`). `items` is
 *  unwrapped from the `ComputedRef` returned by `useGroup` into the
 *  plain array. */
export interface ITabPanelsSlotProps extends Pick<IGroupProvide, 'isSelected' | 'select' | 'next' | 'prev' | 'selected'> {
    items: IGroupProvide['items']['value']
}

/** Slot signatures for `<OrigamTabPanels>`. */
export interface ITabPanelsSlots {
    default?: (data: ITabPanelsSlotProps) => any
}
