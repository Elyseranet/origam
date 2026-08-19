import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type {
    IGroupProps,
    IGroupProvide
} from '../Commons/group.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TTabVariant } from '../../types/Tabs/tab.type'

/**
 * Props for `<OrigamTabs>` — a stateful tablist container.
 *
 * Mirrors `IBtnToggleProps` (re-uses `useGroup`) plus three tab-only
 * facets:
 *  - `variant`   visual treatment (`default`, `pills`, `underline`).
 *  - `fixed`     equal-width distribution of children (justify-evenly).
 *  - `centered`  centers the tablist within the container.
 *
 * `direction` is inherited from `IDirectionProps` and switches the
 * tablist from horizontal (default) to vertical column layout. ARIA
 * `aria-orientation` follows the same value.
 *
 * `mandatory` is forced to `true` by the component's `withDefaults`
 * — Material/WAI-ARIA conventions say a tablist always has exactly
 * one selected tab. Consumers can still pass `:mandatory="false"` to
 * opt-out (rare).
 */
export interface ITabsProps extends ICommonsComponentProps, ITagProps, IDirectionProps, IDensityProps, IRoundedProps, IColorProps, IBgColorProps, IGroupProps {
    tag?: string
    variant?: TTabVariant
    fixed?: boolean
    centered?: boolean
}

/** Emits fired by `<OrigamTabs>` — v-model on the active tab. */
export interface ITabsEmits extends ICommonsComponentEmits {}

/** Scope forwarded to the `default` slot — the raw `useGroup()`
 *  selection API, forwarded as-is (its `selected` field stays a `Ref`,
 *  mirroring `IItemGroupSlots`). `items` is unwrapped from the
 *  `ComputedRef` returned by `useGroup` into the plain array. */
export interface ITabsSlotProps extends Pick<IGroupProvide, 'isSelected' | 'select' | 'next' | 'prev' | 'selected'> {
    items: IGroupProvide['items']['value']
}

/** Slot signatures for `<OrigamTabs>`. */
export interface ITabsSlots {
    default?: (data: ITabsSlotProps) => any
}
