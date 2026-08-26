import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { ILayoutItemProps } from '../Commons/layout.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ISystemBarProps extends ICommonsComponentProps, ITagProps, IElevationProps, IColorProps, IBgColorProps, ILayoutItemProps, IRoundedProps, IBorderProps, IDimensionProps, ITypographyProps {
    window?: boolean
}

/*********************************************************
 * ISystemBarEmits
 *
 * @description
 * `<OrigamSystemBar>` is a static layout item (registers itself via
 * `useLayoutItem`) — nothing is emitted.
 ********************************************************/
export interface ISystemBarEmits {}
