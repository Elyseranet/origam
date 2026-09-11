import type {
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRippleProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IExpansionPanelHeaderProps extends IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IDensityProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, IAdjacentProps, IRippleProps, IActiveProps, IHoverProps, ITypographyProps {
    expandIcon?: TIcon
    collapseIcon?: TIcon
    hideActions?: boolean
    focusable?: boolean
    static?: boolean
    readonly?: boolean
    title?: string
}

/** Emits fired by `<OrigamExpansionPanelHeader>` — prepend/append icon clicks. */
export interface IExpansionPanelHeaderEmits extends IAdjacentEmits {}
