import type { TPosition } from '../../types/Commons/position.type'

export interface IPositionProps {
    position?: TPosition

    top?: number | string
    bottom?: number | string
    left?: number | string
    right?: number | string
}
