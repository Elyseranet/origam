import type { IActiveProps } from '../Commons/active.interface'
import type {
    IAdjacentEmits,
    IAdjacentProps
} from '../Commons/adjacent.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IClickEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILinkProps } from '../Commons/router.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TLines } from '../../types/List/list.type'
import type { TListItemSlot } from '../../types/List/list-item.type'

/**
 * `size` picks a rung of the shared control-height scale (28 / 36 / 44 / 52 px,
 * the same one `--origam-input__control---height-{sm,md,lg,xl}` drives) and
 * paints it on the row: `min-height` plus the matching block padding. The
 * title typography is deliberately NOT scaled — `.origam-field` keeps a fixed
 * 16px text at every size, so shrinking the row text would re-introduce the
 * mismatch this scale exists to remove.
 *
 * `size` composes with `density`, it does not replace it. The resolved height is
 * `max(<size rung> + <density>, <title line box> + 2 * <block padding>)` — the
 * same expression `.origam-field__input` uses, floor included, so a `small` row
 * at `compact` density holds 28px instead of collapsing to 20px.
 */
export interface IListItemProps extends IBorderProps, ICommonsComponentProps, IDensityProps, IDimensionProps, IElevationProps, IRoundedProps, ISizeProps, ITagProps, ILinkProps, IColorProps, IBgColorProps, IRippleProps, IPaddingProps, IMarginProps, IAdjacentProps, IActiveProps, IHoverProps, ITypographyProps {
    active?: boolean
    activeClass?: string
    disabled?: boolean
    lines?: TLines
    link?: boolean
    nav?: boolean
    slim?: boolean
    subtitle?: string | number
    title?: string | number
    value?: any
}

/** Emits fired by `<OrigamListItem>` — generic click + prepend/append slot clicks. */
export interface IListItemEmits extends IClickEmits, IAdjacentEmits {}

/** Slot signatures for `<OrigamListItem>`. `prepend` / `default` /
 *  `append` share the same selection-state scope (`TListItemSlot`);
 *  `title` / `subtitle` receive their own resolved text value. */
export interface IListItemSlots {
    /** Overrides the whole prepend/content/append layout. */
    wrapper?: () => any
    prepend?: (data: TListItemSlot) => any
    title?: (data: { title?: string | number }) => any
    subtitle?: (data: { subtitle?: string | number }) => any
    default?: (data: TListItemSlot) => any
    append?: (data: TListItemSlot) => any
}
