import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IDisplayProps } from '../Commons/display.interface'
import type {
    IGroupProps,
    IGroupProvide
} from '../Commons/group.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { TIcon } from '../../types/Icon/icon.type'

export interface ISlideGroupProps extends ICommonsComponentProps, ITagProps, IDirectionProps, IGroupProps, IPaddingProps, IMarginProps, IRoundedProps, IBorderProps, IDisplayProps {
    centerActive?: boolean
    nextIcon?: TIcon
    prevIcon?: TIcon
    showArrows?: boolean | string
}

/** Emits fired by `<OrigamSlideGroup>` — v-model on the active slide. */
export interface ISlideGroupEmits extends ICommonsComponentEmits {}

/** Slot signatures for `<OrigamSlideGroup>`. */
export interface ISlideGroupSlots {
    prev?: () => any
    /** Receives the group's own navigation/selection API so custom
     *  content can drive the slide group without re-injecting it. */
    default?: (data: Pick<IGroupProvide, 'next' | 'prev' | 'select' | 'isSelected'>) => any
    next?: () => any
}
