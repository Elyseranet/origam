import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IIntersectionObserverInit } from '../Commons/commons.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { IResponsiveProps } from '../Responsive/responsive.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

import type {
    TCrossOrigin,
    TReferrerPolicy
} from '../../types/Img/img.type'

export interface IImgProps extends IColorProps, IBgColorProps, IResponsiveProps, ITransitionComponentProps, ILazyProps {
    alt?: string
    cover?: boolean,
    draggable?: boolean
    gradient?: string
    lazySrc?: string
    options?: IIntersectionObserverInit
    sizes?: string
    src?: string | ISrcObject
    crossorigin?: TCrossOrigin
    referrerpolicy?: TReferrerPolicy
    srcset?: string
    position?: string
}

export interface ISrcObject {
    src?: string
    srcset?: string
    lazySrc?: string
    aspectRatio: number
    alt?: string
}

/** Emits fired by `<OrigamImg>` — native <img> lifecycle (loadstart fires
 *  before the network request, load when the resource is fully decoded,
 *  error when the browser gives up). */
export interface IImgEmits {
    (e: 'loadstart', value: { src: string }): void
    (e: 'load', value: { src: string }): void
    (e: 'error', value: { src: string }): void
}

/** Slot signatures for `<OrigamImg>`. */
export interface IImgSlots {
    placeholder?: () => any
    error?: () => any
    default?: () => any
}

