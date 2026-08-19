import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IExpansionPanelContentProps,
    IExpansionPanelHeaderProps,
    IExpansionPanelHeaderSlotProps,
    IGroupEmits,
    IGroupItemProps,
    IHoverProps,
    ILazyProps,
    ILoaderProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

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
