import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type {
    IGroupProps,
    IGroupProvide
} from '../Commons/group.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISlideGroupProps } from '../Slide/slide-group.interface'
import type {
    IActiveState,
    IHoverState
} from '../Commons/state-effect.interface'

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
