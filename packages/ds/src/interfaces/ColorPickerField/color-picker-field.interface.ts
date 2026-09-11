import type {
    IMenuProps,
    ITextFieldProps,
    ITransitionComponentProps
} from "../../interfaces"

// ITextFieldProps already includes ICommonsComponentProps, IColorProps,
// IDensityProps, IFieldProps, IInputProps, IAdjacentProps, IAdjacentInnerProps,
// IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps.
// Listing them again alongside ITextFieldProps triggered TS2320 because
// TypeScript detected incompatible redeclarations across the diamond hierarchy.
export interface IColorPickerFieldProps extends ITextFieldProps, ITransitionComponentProps {
    menu?: boolean,
    menuProps?: IMenuProps,
    openOnClear?: boolean
    closeText?: string
    openText?: string
    closeOnSelect?: boolean
}
