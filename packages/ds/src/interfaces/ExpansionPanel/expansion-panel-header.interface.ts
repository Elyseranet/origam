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
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IExpansionPanelHeaderProps extends IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IDensityProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, IAdjacentProps, IRippleProps, IActiveProps, IHoverProps, Pick<ITypographyProps, 'fontSize' | 'lineHeight'> {
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
