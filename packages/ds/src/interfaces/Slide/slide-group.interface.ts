import type {
    IBorderProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDirectionProps,
    IDisplayProps,
    IGroupProps,
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
