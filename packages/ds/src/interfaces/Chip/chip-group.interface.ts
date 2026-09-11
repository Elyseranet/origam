import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IGroupProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISlideGroupProps,
    ITagProps, IActiveState, IHoverState
} from '../../interfaces'

export interface IChipGroupProps extends ICommonsComponentProps, ITagProps, IGroupProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IBorderProps, IRoundedProps, ISlideGroupProps {
    column?: boolean
    filter?: boolean
    valueComparator?: (a: any, b: any) => boolean
    active?: IActiveState
    hover?: IHoverState
}

/** Emits fired by `<OrigamChipGroup>` — v-model on the active chip set. */
export interface IChipGroupEmits extends ICommonsComponentEmits {}
