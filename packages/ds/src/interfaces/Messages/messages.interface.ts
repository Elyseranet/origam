import type { IBorderProps } from '../Commons/border.interface'
import type { IColorProps } from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface IMessagesProps extends ICommonsComponentProps, ITagProps, ITransitionComponentProps, IColorProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, IDensityProps, IElevationProps, Pick<ITypographyProps, 'fontSize' | 'lineHeight'> {
    active?: boolean
    messages?: Array<string> | string
}

export interface IMessagesSlots {
    default?: (data: { message: string }) => any
}

/*********************************************************
 * IMessagesEmits
 *
 * @description
 * `<OrigamMessages>` renders a static list of messages inside a
 * transition — nothing is emitted.
 ********************************************************/
export interface IMessagesEmits {}
