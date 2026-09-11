import type { IImgProps, IWindowItemProps } from '../../interfaces'

export interface ICarouselItemProps extends IImgProps, IWindowItemProps {
    transition?: boolean | string
}
