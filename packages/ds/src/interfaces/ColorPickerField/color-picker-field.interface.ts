import type {
    IAdjacentSlots,
    IFieldSlots,
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

/** Slot signatures for `<OrigamColorPickerField>` — the field chrome
 *  slots (`IFieldSlots` minus its scoped `default`, since this field
 *  renders its own swatch/value markup instead) plus `prepend` /
 *  `append` (`IAdjacentSlots`) and the color-swatch override. */
export interface IColorPickerFieldSlots extends Omit<IFieldSlots, 'default'>, IAdjacentSlots {
    /** Overrides the selected color's text/swatch representation. */
    colorSelection?: () => any
}
