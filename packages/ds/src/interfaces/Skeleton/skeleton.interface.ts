import type {
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IRoundedProps,
    ISizeProps
} from '../../interfaces'
import type { TSkeletonComposition, TSkeletonShape } from '../../types'

export interface ISkeletonProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IRoundedProps {
    /**
     * Primitive shape of a single skeleton block.
     *
     * Ignored when `composition` is set — a composition renders its own
     * fixed set of shapes internally.
     *
     * @default 'rectangular'
     */
    shape?: TSkeletonShape
    /**
     * Composite layout assembled from several primitive shapes (e.g. a
     * `'card'` renders a rectangular block plus three text lines). When
     * set, this selects an entirely different template branch and
     * `shape` no longer applies.
     */
    composition?: TSkeletonComposition
    width?: string | number
    height?: string | number
    loading?: boolean
    pulse?: boolean
}
