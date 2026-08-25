import type { IAdjacentProps } from '../Commons/adjacent.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIcon } from '../../types/Icon/icon.type'
import type { TTabVariant } from '../../types/Tabs/tab.type'

/**
 * Props for `<OrigamTab>` — a single registered tab inside an
 * `<OrigamTabs>` tablist.
 *
 * The slot scope is the default text label. Leading / trailing content
 * is driven by the standard `IAdjacentProps` surface (`prependIcon` /
 * `appendIcon` / `prependAvatar` / `appendAvatar`) — the same contract
 * every other adjacent-icon component in the DS uses (`OrigamBtn`,
 * `OrigamChip`, `OrigamListItem`, …). Before this fix `icon` /
 * `appendIcon` were declared by hand, without `prependIcon` — an icon
 * could only ever be placed on the trailing edge, never the leading one.
 *
 * ARIA wiring (`role="tab"`, `aria-selected`, `aria-controls`, `id`,
 * `tabindex`) is computed inside the component — consumers only
 * provide `value` (the canonical identifier) and `disabled`.
 *
 * Typography props (`fontSize`, `fontWeight`, `letterSpacing`) override
 * the matching `--origam-tabs__item---*` variables on the tab element.
 * `lineHeight` is intentionally excluded — the SCSS hard-codes `line-height: 1`
 * with no CSS-var hook.
 */
export interface ITabProps extends ICommonsComponentProps, ITagProps, IGroupItemProps, ITypographyProps, IAdjacentProps {
    tag?: string
    /** Text label — used when the `default` slot is not provided. */
    text?: string
    /** Visual treatment, mirrored down from the parent `<OrigamTabs>` (`default`, `pills`, `underline`). */
    variant?: TTabVariant
    /**
     * @deprecated Use `prependIcon` instead — same leading-icon position,
     * kept for backward compatibility. Ignored when `prependIcon` is set.
     */
    icon?: TIcon
}

/**
 * `<OrigamTab>` self-registers into the parent `<OrigamTabs>` group via
 * `useGroupItem`, which watches `isSelected` and emits `group:selected`
 * on this component's own instance whenever selection state changes —
 * a genuine, always-active emit (see `IGroupEmits`), not conditional
 * on a specific handler.
 */
export interface ITabEmits extends IGroupEmits {}

/** Scope forwarded to the `default` slot — the resolved selection
 *  state from `useGroupItem`, unwrapped from its `Ref`s (unlike
 *  `ITabsSlotProps`, which forwards the parent's raw `useGroup()` API
 *  as-is). */
export interface ITabSlotProps {
    isSelected: boolean
    toggle: () => void
    select: (value: boolean) => void
    value: unknown
    disabled: boolean | undefined
}

/** Slot signatures for `<OrigamTab>`. */
export interface ITabSlots {
    default?: (data: ITabSlotProps) => any
}
