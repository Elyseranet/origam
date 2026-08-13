import type {
    IBorderProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDirectionProps,
    IDisplayProps,
    IGroupProps,
    IGroupProvide,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'
import type { TIcon } from '../../types'

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
