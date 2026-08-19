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

/** Scope forwarded to every `<OrigamExpansionPanelHeader>` slot — the
 *  panel's current expand/disabled/readonly state plus the resolved
 *  expand/collapse icons. */
export interface IExpansionPanelHeaderSlotProps {
    collapseIcon?: TIcon
    disabled?: boolean
    expanded: boolean
    expandIcon?: TIcon
    readonly?: boolean
}

/** Slot signatures for `<OrigamExpansionPanelHeader>`. `prepend` /
 *  `append` receive the same scope as `title` / `default` here (NOT
 *  the unscoped `IAdjacentSlots` shape used elsewhere in the DS). */
export interface IExpansionPanelHeaderSlots {
    prepend?: (data: IExpansionPanelHeaderSlotProps) => any
    title?: (data: IExpansionPanelHeaderSlotProps) => any
    default?: (data: IExpansionPanelHeaderSlotProps) => any
    append?: (data: IExpansionPanelHeaderSlotProps) => any
}
