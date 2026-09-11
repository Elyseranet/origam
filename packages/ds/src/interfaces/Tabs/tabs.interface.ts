import type {
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IDirectionProps,
    IGroupProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TTabVariant } from '../../types'

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
