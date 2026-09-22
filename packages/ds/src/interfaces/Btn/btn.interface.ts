import type { IActiveProps } from '../Commons/active.interface'
import type {
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILinkProps } from '../Commons/router.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { IVariantProps } from '../Commons/variant.interface'

import type { TIcon } from '../../types/Icon/icon.type'
import type {
    TStatus,
    TStatusPosition
} from '../../types/Commons/status.type'

/** Btn needs `status` / `statusIconPosition` from IStatusProps but its own
 *  `icon` prop accepts `boolean | TIcon` (boolean = icon-only mode) which is
 *  wider than `IIconProps.icon?: TIcon`.  Pulling the two status props in
 *  directly avoids the TS2430 incompatible-extends error. */
export interface IBtnProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IBorderProps, IDensityProps, IDimensionProps, IElevationProps, IRoundedProps, ITagProps, ISizeProps, ILinkProps, IRippleProps, ILoaderProps, IPositionProps, ILocationProps, IGroupItemProps, IPaddingProps, IMarginProps, IAdjacentProps, IHoverProps, IActiveProps, IVariantProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
    /** @deprecated Use `variant="flat"` instead. Kept for backward compat. */
    flat?: boolean,
    /** Pass `true` to activate icon-only mode; pass a `TIcon` value to set the icon. */
    icon?: boolean | TIcon
    block?: boolean
    slim?: boolean
    stacked?: boolean
    text?: string
    status?: TStatus
    statusIconPosition?: TStatusPosition
}

/**
 * Emit signatures for `<OrigamBtn>`.
 *
 * ⛔ REMOVED SURFACE (#443, #577) — `click:prepend` / `click:append` used to
 * be inherited from `IAdjacentEmits`. They are GONE, not merely typed
 * away: `<OrigamBtn>` no longer relays a click from the prepend/append zone
 * at all (see `OrigamBtn.vue`, the spans carry no `@click` any more).
 *
 * They were never reachable by keyboard: the emit was bound to the
 * `origam-btn__prepend` / `origam-btn__append` `<span>`, while a keyboard
 * activation synthesises its click on the component ROOT, which never
 * reaches a descendant listener. The fix `useAdjacent` applies on the other
 * ten consumers — promote the zone to a `role="button"` tab stop — is
 * ILLEGAL here: Btn renders as `<button>` or `<a>`, and both forbid an
 * interactive-content descendant and any descendant with `tabindex`.
 *
 * Two actions are two buttons: compose them with `<origam-btn-group>`. The
 * `prepend` / `append` SLOTS are unaffected — see {@link IBtnSlots}.
 */
export interface IBtnEmits extends IGroupEmits {}

/** Slot signatures for `<OrigamBtn>`. */
export interface IBtnSlots extends IAdjacentSlots {
    /** Overrides the whole loader/prepend/content/append layout. */
    wrapper?: () => any
    /** Overrides the active loader (line/circular/skeleton), receives the
     *  forwarded `<OrigamProgress>` props. */
    loader?: (data: Record<string, unknown>) => any
    default?: () => any
}
