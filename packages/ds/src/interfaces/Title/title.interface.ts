import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ITitleProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IDensityProps, IPaddingProps, IMarginProps, IBorderProps, ITypographyProps {
    text?: string
}

/** Slot signatures for `<OrigamTitle>`. The `default` slot wins over
 *  the `text` prop. */
export interface ITitleSlots {
    default?: () => any
}
