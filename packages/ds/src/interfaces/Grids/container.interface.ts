import type {
    IBorderProps,
    ICommonsComponentProps,
    IDimensionProps,
    IMarginProps,
    IPaddingProps,
    ITagProps
} from '../../interfaces'

/**
 * Container is a structural wrapper. It deliberately does NOT extend
 * `IColorProps` / `IRoundedProps` — chrome (background, border-radius)
 * belongs on `Sheet` / `Card` / `Alert`, not on the page-level wrapper.
 */
export interface IContainerProps extends ICommonsComponentProps, ITagProps, IDimensionProps, IPaddingProps, IMarginProps, IBorderProps {
    fluid?: boolean
    fullscreen?: boolean
}
