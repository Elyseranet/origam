import type {
    IAlignProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IMarginProps,
    IPaddingProps,
    ITagProps
} from '../../interfaces'

import type { TCols } from '../../types'

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
