import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'

/**
 * Container is a structural wrapper. It deliberately does NOT extend
 * `IColorProps` / `IRoundedProps` — chrome (background, border-radius)
 * belongs on `Sheet` / `Card` / `Alert`, not on the page-level wrapper.
 */
export interface IContainerProps extends ICommonsComponentProps, ITagProps, IDimensionProps, IPaddingProps, IMarginProps, IBorderProps {
    fluid?: boolean
    fullscreen?: boolean
}
