import type {
    IActiveState,
    IAdjacentEmits,
    IAdjacentProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IGroupEmits,
    IGroupItemProps,
    IHoverProps,
    ILinkProps,
    ILoaderProps,
    ILocationProps,
    IMarginProps,
    IPaddingProps,
    IPositionProps,
    IRippleProps,
    IRoundedProps,
    ISizeProps,
    ITagProps,
    ITypographyProps,
    IVariantProps
} from '../../interfaces'

import type { TIcon, TStatus, TStatusPosition } from '../../types'

/** Btn needs `status` / `statusIconPosition` from IStatusProps but its own
 *  `icon` prop accepts `boolean | TIcon` (boolean = icon-only mode) which is
 *  wider than `IIconProps.icon?: TIcon`.  Pulling the two status props in
 *  directly avoids the TS2430 incompatible-extends error. */
export interface IBtnProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IBorderProps, IDensityProps, IDimensionProps, IElevationProps, IRoundedProps, ITagProps, ISizeProps, ILinkProps, IRippleProps, ILoaderProps, IPositionProps, ILocationProps, IGroupItemProps, IPaddingProps, IMarginProps, IAdjacentProps, IHoverProps, IVariantProps, ITypographyProps {
    active?: boolean | IActiveState
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

/** Emits fired by `<OrigamBtn>` — clicks on prepend/append slots and
 *  group-membership lifecycle. */
export interface IBtnEmits extends IAdjacentEmits, IGroupEmits {}
