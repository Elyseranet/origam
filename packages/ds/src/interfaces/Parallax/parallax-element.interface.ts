import type { IBorderProps } from '../Commons/border.interface'
import type { IBox } from '../Commons/box.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TAnchor } from '../../types/Commons/anchor.type'
import type { TAxis } from '../../types/Commons/axis.type'
import type { TParallaxElementType } from '../../types/Parallax/parallax-element.type'
import type { TParallaxEvent } from '../../types/Parallax/parallax.type'
import type { TPoint } from '../../types/Commons/point.type'

export interface IParallaxElementTypeProps {
    type?: TParallaxElementType
}

export interface IParallaxElementProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IParallaxElementTypeProps {
    transformOrigin?: TAnchor
    originX?: number
    originY?: number
    strength?: number
    axis?: TAxis
    maxX?: number
    maxY?: number
    minX?: number
    minY?: number
    cycle?: number
    audioIndex?: number
}

export interface IParallaxElementMovement {
    x: number,
    y: number,
    target?: DOMRect | IBox,
    originX?: number,
    originY?: number,
    strength: number,
    event: TParallaxEvent,
    minX?: number,
    minY?: number,
    maxX?: number,
    maxY?: number,
}

/*********************************************************
 * IParallaxElementEmits
 *
 * @description
 * `<OrigamParallaxElement>` emits nothing of its own — the transform
 * is purely reactive to the injected parent `<OrigamParallax>` state.
 ********************************************************/
export interface IParallaxElementEmits {}

/** Slot signatures for `<OrigamParallaxElement>`. */
export interface IParallaxElementSlots {
    default?: () => any
}

export interface IParallaxElementCicle {
    referencePosition: TPoint,
    shape: IBox,
    event: TParallaxEvent,
    cycles: number,
    strength: number,
}
