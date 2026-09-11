import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    ILayoutItemProps,
    IRoundedProps,
    ITagProps,
    ITypographyProps
} from "../../interfaces"

export interface ISystemBarProps extends ICommonsComponentProps, ITagProps, IElevationProps, IColorProps, IBgColorProps, ILayoutItemProps, IRoundedProps, IBorderProps, IDimensionProps, ITypographyProps {
    window?: boolean
}
