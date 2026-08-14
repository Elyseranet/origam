import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IPositionProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'


export interface IToolbarProps extends ITagProps, ICommonsComponentProps, IBorderProps, IRoundedProps, IElevationProps, IDensityProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IPositionProps, IDimensionProps, IActiveProps, IHoverProps, ITypographyProps {
    collapse?: boolean
    flat?: boolean
    floating?: boolean
    title?: string
    modelValue?: boolean
}

/** Slot signatures for `<OrigamToolbar>`. None are scoped — every slot
 *  is a plain content override on top of the default wrapper layout
 *  (prepend / title / content / append). */
export interface IToolbarSlots {
    /** Replaces the entire wrapper (prepend + title + content + append). */
    default?: () => any
    /** Leading content, before the title. */
    prepend?: () => any
    /** Overrides the rendered title. Slot wins over the `title` prop. */
    title?: () => any
    /** Main bar content. */
    content?: () => any
    /** Trailing content, after the main content. */
    append?: () => any
}
