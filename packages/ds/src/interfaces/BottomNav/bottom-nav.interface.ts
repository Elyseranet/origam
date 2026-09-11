import type {
    IActiveEmits,
    IActiveProps,
    IBorderProps,
    IBtnProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IGroupProps,
    IHoverEmits,
    IHoverProps,
    ILayoutItemProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITransitionComponentProps
} from '../../interfaces'

import type { TBottomNavPosition, TNavMode } from '../../types'

export interface IBottomNavProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IPaddingProps, IBorderProps, IElevationProps, IMarginProps, IDimensionProps, IDensityProps, IRoundedProps, ILayoutItemProps, IGroupProps, IHoverProps, IActiveProps, ITransitionComponentProps {
    grow?: boolean
    mode?: TNavMode
    items?: Array<IBtnProps>
    /**
     * Horizontal placement of the bar when it does not span the full width
     * (e.g. a custom `width`): `'start'` (inline-start), `'center'` or
     * `'end'` (inline-end).
     *
     * @default 'start'
     */
    position?: TBottomNavPosition
}

/** Emits fired by `<OrigamBottomNav>` — active item v-model + hover/active
 *  propagation. */
export interface IBottomNavEmits extends ICommonsComponentEmits, IActiveEmits, IHoverEmits {}
