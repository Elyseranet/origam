import type { IAlignProps } from '../Commons/align.interface'
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

import type { TCols } from '../../types/Grids/col.type'

export interface IColProps extends IColorProps, IBgColorProps, ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IAlignProps {
    cols?: TCols,
    sm?: TCols,
    md?: TCols,
    lg?: TCols,
    xl?: TCols,
    xxl?: TCols,
    offset?: Omit<TCols, '12'>,
    offsetSm?: Omit<TCols, '12'>,
    offsetMd?: Omit<TCols, '12'>,
    offsetLg?: Omit<TCols, '12'>,
    offsetXl?: Omit<TCols, '12'>,
    offsetXxl?: Omit<TCols, '12'>,
    order?: number,
    orderSm?: number,
    orderMd?: number,
    orderLg?: number,
    orderXl?: number,
    orderXxl?: number
}
