import type { IActiveProps } from '../Commons/active.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'


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
