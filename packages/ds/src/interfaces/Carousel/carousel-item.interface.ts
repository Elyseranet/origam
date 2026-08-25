import type { IImgProps } from '../Img/img.interface'
import type { IWindowItemProps } from '../Window/window-item.interface'

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

/** `<OrigamCarouselItem>` only forwards props/slots to `<OrigamWindowItem>`
 *  and `<OrigamImg>` — it never calls `emit(...)` in its own script. */
export interface ICarouselItemEmits {}
