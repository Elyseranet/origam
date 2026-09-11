import type {
    IAdjacentProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IMarginProps,
    IPaddingProps
} from "../../interfaces";

import type { TColor } from "../../types";

export interface IDataTitleProps extends ICommonsComponentProps, IAdjacentProps, IDensityProps, IMarginProps, IPaddingProps, IColorProps, IBgColorProps {
    text: string | number
    /** @deprecated Use the `hover` object prop instead. Kept for back-compat. */
    hoverColor?: TColor
    /** @deprecated Use the `hover` object prop instead. Kept for back-compat. */
    hoverBgColor?: TColor
}
