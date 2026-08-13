import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IGroupProps,
    IGroupProvide,
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

/** Slot signatures for `<OrigamChipGroup>`. `selected` is bound
 *  unwrapped (template auto-unref of `IGroupProvide.selected`). */
export interface IChipGroupSlots {
    default?: (data: { selected: Readonly<Array<number>> } & Pick<IGroupProvide, 'isSelected' | 'select' | 'next' | 'prev'>) => any
}
