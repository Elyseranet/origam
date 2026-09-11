import type {
    IBorderProps,
    IBox,
    ICommonsComponentProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TAnchor, TAxis, TParallaxElementType, TParallaxEvent, TPoint } from '../../types'

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

export interface IParallaxElementCicle {
    referencePosition: TPoint,
    shape: IBox,
    event: TParallaxEvent,
    cycles: number,
    strength: number,
}
