import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface IListSubheader extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, ITypographyProps {
    inset?: boolean,
    sticky?: boolean,
    title?: string,
}

/** `<OrigamListSubheader>` emits nothing of its own — it's a purely
 *  presentational row (inset/sticky/title chrome). */
export interface IListSubheaderEmits {}

/** Slot signatures for `<OrigamListSubheader>`. */
export interface IListSubheaderSlots {
    default?: (data: { title?: string }) => any
}
