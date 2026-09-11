import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IExpansionPanelProps,
    IGroupProps,
    IHoverProps,
    ILazyProps,
    ILoaderProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TIcon } from '../../types'

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
