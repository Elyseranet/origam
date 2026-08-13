import type { IImgProps, IWindowItemProps } from '../../interfaces'

export interface ICarouselItemProps extends IImgProps, IWindowItemProps {
    transition?: boolean | string
}

/** Slot signatures for `<OrigamCarouselItem>`. `content` / `error` /
 *  `placeholder` forward into the nested `<OrigamImg>`'s own named slots. */
export interface ICarouselItemSlots {
    /** Overrides the whole `<OrigamImg>`. */
    default?: () => any
    content?: () => any
    error?: () => any
    placeholder?: () => any
}
