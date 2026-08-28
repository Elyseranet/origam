import type {
    IActiveEmits,
    IActiveProps
} from '../Commons/active.interface'
import type {
    IAdjacentInnerEmits,
    IAdjacentInnerProps,
    IAdjacentInnerSlots
} from '../Commons/adjacent.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IFocusEmits,
    IFocusProps
} from '../Commons/focus.interface'
import type { ILabelProps } from '../Label/label.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { IVariantProps } from '../Commons/variant.interface'

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
    singleLine?: boolean
    required?: boolean
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
