import type {
    IActiveEmits,
    IActiveProps,
    IAdjacentInnerEmits,
    IAdjacentInnerProps,
    IAdjacentInnerSlots,
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IFocusEmits,
    IFocusProps,
    ILabelProps,
    ILoaderProps,
    IRoundedProps,
    ISizeProps,
    ITypographyProps,
    IVariantProps
} from '../../interfaces'

import type { TColor } from '../../types'

export interface IFieldProps extends ICommonsComponentProps, ILoaderProps, IColorProps, IBgColorProps, IAdjacentInnerProps, IFocusProps, IDensityProps, ILabelProps, IActiveProps, IVariantProps, IRoundedProps, IElevationProps, ISizeProps, ITypographyProps {
    centerAffix?: boolean
    dirty?: boolean
    disabled?: boolean
    /**
     * Error state for the field.
     *   - `boolean` — paints the `--error` modifier (rules-driven flow).
     *   - `string`  — paints the modifier AND becomes the inline error
     *     message rendered by consumers that opt-in (e.g. FileField's
     *     dropzone). For consumers that don't read the string, the
     *     truthy semantics still apply.
     *   - `false` / omitted — no error.
     */
    error?: string | boolean
    flat?: boolean
    inline?: boolean
    label?: string
    prefix?: string
    suffix?: string
    persistentClear?: boolean
    reverse?: boolean
    singleLine?: boolean
    required?: boolean
    /** @deprecated Use the `active` object prop instead. Kept for back-compat. */
    activeColor?: TColor
    /** @deprecated Use the `active` object prop instead. Kept for back-compat. */
    activeBgColor?: TColor
}

/**
 * Aggregate of every emit a `<OrigamField>` is expected to relay. Bundles
 * the focus, the v-model echo, the clear/click-inner variants, and the
 * activation lifecycle so that consuming components (TextField,
 * NumberField, PasswordField, etc.) can `defineEmits<IFieldEmits>()`
 * without having to repeat the underlying signatures.
 */
export interface IFieldEmits extends IFocusEmits, ICommonsComponentEmits, IAdjacentInnerEmits, IActiveEmits {
}

/**
 * Default slot props passed to the `<OrigamField>` default slot —
 * downstream input components destructure these to wire up their native
 * `<input>` element.
 */
export interface IFieldDefaultSlotProps {
    id: string
    'aria-describedby': string
    isActive: boolean
    isFocused: boolean | undefined
    ref: HTMLElement | undefined
    onBlur: () => void
    onFocus: () => void
}

/** Slot signatures for `<OrigamField>` (default + label/prefix/suffix). */
export interface IFieldSlots extends IAdjacentInnerSlots {
    default?: (props: { class?: string | Array<string> } & IFieldDefaultSlotProps) => any
    loader?: () => any
    label?: (props: ILabelProps) => any
    floatingLabel?: (props: ILabelProps) => any
    prefix?: () => any
    suffix?: () => any
}
