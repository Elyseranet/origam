import type { IActiveProps } from '../Commons/active.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IExpansionPanelContentProps } from './expansion-panel-content.interface'
import type {
    IExpansionPanelHeaderProps,
    IExpansionPanelHeaderSlotProps
} from './expansion-panel-header.interface'
import type { IExpansionPanelProps } from './expansion-panel.interface'
import type { IGroupProps } from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IExpansionPanelsProps extends IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IGroupProps, IDensityProps, IRoundedProps, IBorderProps, IPaddingProps, IMarginProps, ILazyProps, ILoaderProps, IElevationProps, IActiveProps, IHoverProps {
    flat?: boolean
    items?: Array<IExpansionPanelProps>
    accordion?: boolean
    popout?: boolean
    inset?: boolean
    expandIcon?: TIcon
    collapseIcon?: TIcon
    hideActions?: boolean
}

/** Emits fired by `<OrigamExpansionPanels>` — v-model on the active panel set. */
export interface IExpansionPanelsEmits extends ICommonsComponentEmits {}

/** Scope forwarded to the per-item `item.{index}` / `item` slots. */
export interface IExpansionPanelsItemSlotProps {
    collapseIcon?: TIcon
    expandIcon?: TIcon
    hideActions?: boolean
    item: IExpansionPanelProps
    index: number
}

/**
 * Slot signatures for `<OrigamExpansionPanels>`.
 *
 * Per-panel overrides are only known at runtime (`item-{index}` and the
 * per-panel `header` / `prepend` / `title` / `append` / `wrapper` /
 * `content` forwards), so they're expressed as template-literal index
 * signatures alongside the un-indexed fallback names the template also
 * checks (`slots[\`header.${index}\`] || slots.header`, …).
 */
export interface IExpansionPanelsSlots {
    default?: () => any
    item?: (data: IExpansionPanelsItemSlotProps) => any
    header?: (props: Partial<IExpansionPanelHeaderProps>) => any
    prepend?: (data: IExpansionPanelHeaderSlotProps) => any
    title?: (data: IExpansionPanelHeaderSlotProps) => any
    append?: (data: IExpansionPanelHeaderSlotProps) => any
    wrapper?: (props: Partial<IExpansionPanelContentProps>) => any
    content?: () => any
    [key: `item.${number}`]: ((data: IExpansionPanelsItemSlotProps) => any) | undefined
    [key: `header.${number}`]: ((props: Partial<IExpansionPanelHeaderProps>) => any) | undefined
    [key: `prepend.${number}`]: ((data: IExpansionPanelHeaderSlotProps) => any) | undefined
    [key: `title.${number}`]: ((data: IExpansionPanelHeaderSlotProps) => any) | undefined
    [key: `append.${number}`]: ((data: IExpansionPanelHeaderSlotProps) => any) | undefined
    [key: `wrapper.${number}`]: ((props: Partial<IExpansionPanelContentProps>) => any) | undefined
    [key: `content.${number}`]: (() => any) | undefined
}
