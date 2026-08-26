import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ICardTextSlots {
    /** Overrides the `text` prop. */
    default?: () => any
}

/*********************************************************
 * ICardTextEmits
 *
 * @description
 * `<OrigamCardText>` only renders the `text` prop / slot content — it
 * never calls `emit(...)` in its script.
 ********************************************************/
export interface ICardTextEmits {}

export interface ICardTextProps extends ICommonsComponentProps, ITagProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, ITypographyProps {
    text?: string | number
}
