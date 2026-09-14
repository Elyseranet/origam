import type { Ref } from 'vue'

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
    IGroupItemProps,
    IGroupItemProvide
} from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IExpansionPanelProps extends ITagProps, ICommonsComponentProps, IDensityProps, IColorProps, IBgColorProps, IBorderProps, IPaddingProps, IMarginProps, IElevationProps, IRoundedProps, IGroupItemProps, IExpansionPanelHeaderProps, IExpansionPanelContentProps, ILazyProps, ILoaderProps, IActiveProps, IHoverProps {
}

/*********************************************************
 * IExpansionPanelGroupItemProvide
 *
 * @description
 * Shape provided under `ORIGAM_EXPANSION_PANEL_KEY` — the single panel's
 * own group registration (`IGroupItemProvide`, from `useGroupItem`), PLUS
 * two mutable slots (`headerId` / `contentId`) that let the header and
 * content cross-reference each other's REAL resolved DOM id for
 * `aria-controls` / `aria-labelledby`. Each is written by its own owner
 * (`<OrigamExpansionPanelHeader>` / `<OrigamExpansionPanelContent>`
 * respectively) and read by the other.
 * @description
 * Neither `<OrigamExpansionPanelHeader>` nor `<OrigamExpansionPanelContent>`
 * self-registers into a group — both merely `inject` this SAME shared
 * object (re-provided as-is by `<OrigamExpansionPanel>`). Without this,
 * each side could only GUESS the other's id from the generated-fallback
 * naming scheme (`expansion-panel-header-${id}` / `-content-${id}`), which
 * breaks the moment either side receives a consumer-supplied `id` prop
 * (#519, #520).
 ********************************************************/
export interface IExpansionPanelGroupItemProvide extends IGroupItemProvide {
    headerId: Ref<string | undefined>
    contentId: Ref<string | undefined>
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
