import type {
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
    IBgColorProps,
    IBorderProps,
    IClickEmits,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IHoverProps,
    ILinkProps,
    IMarginProps,
    IPaddingProps,
    IRippleProps,
    IRoundedProps,
    ISizeProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TLines } from '../../types'

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
