import type { IActiveProps } from '../Commons/active.interface'
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
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IExpansionPanelContentProps } from './expansion-panel-content.interface'
import type {
    IExpansionPanelHeaderProps,
    IExpansionPanelHeaderSlotProps
} from './expansion-panel-header.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IExpansionPanelProps extends ITagProps, ICommonsComponentProps, IDensityProps, IColorProps, IBgColorProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, IRoundedProps, IGroupItemProps, IExpansionPanelHeaderProps, IExpansionPanelContentProps, ILazyProps, ILoaderProps, IActiveProps, IHoverProps {
}

/** Emits fired by `<OrigamExpansionPanel>` — group membership lifecycle. */
export interface IExpansionPanelEmits extends IGroupEmits {}

/** Slot signatures for `<OrigamExpansionPanel>`. `header` / `wrapper`
 *  receive the filtered props forwarded to the nested
 *  `<OrigamExpansionPanelHeader>` / `<OrigamExpansionPanelContent>`;
 *  `prepend` / `title` / `append` receive that header's own slot scope
 *  (they're forwarded straight through to it). */
export interface IExpansionPanelSlots {
    loader?: () => any
    header?: (props: Partial<IExpansionPanelHeaderProps>) => any
    prepend?: (data: IExpansionPanelHeaderSlotProps) => any
    title?: (data: IExpansionPanelHeaderSlotProps) => any
    append?: (data: IExpansionPanelHeaderSlotProps) => any
    wrapper?: (props: Partial<IExpansionPanelContentProps>) => any
    default?: () => any
}
