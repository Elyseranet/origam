import type { IAdjacentSlots } from '../Commons/adjacent.interface'
import type { IFieldSlots } from '../Field/field.interface'
import type { IMenuProps } from '../Menu/menu.interface'
import type { ITextFieldProps } from '../TextField/text-field.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

import type { TColor } from '../../types/Commons/color.type'

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

/*********************************************************
 * IColorPickerFieldEmits
 *
 * @description
 * Emits fired by `<OrigamColorPickerField>` — both are genuine
 * `useVModel(props, …)` writes (`modelValue` on selecting/clearing a
 * color, `menu` on opening/closing the popup), not inherited defaults.
 * @description
 * Pre-fix neither was declared: the component emitted `update:menu` /
 * `update:modelValue` at runtime while `defineEmits` stayed absent —
 * the exact gap flagged by the `emits-completeness` guard baseline
 * (`ColorPickerField:update:menu,update:modelValue`).
 ********************************************************/
export interface IColorPickerFieldEmits {
    (e: 'update:modelValue', value: TColor): void
    (e: 'update:menu', value: boolean): void
}
