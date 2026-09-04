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
import type { ICommonsComponentProps } from '../Commons/commons.interface'
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

export interface IFieldProps extends ICommonsComponentProps, ILoaderProps, IColorProps, IBgColorProps, IAdjacentInnerProps, IFocusProps, IDensityProps, ILabelProps, IActiveProps, IVariantProps, IRoundedProps, IElevationProps, ISizeProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
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

/*********************************************************
 * IFieldEmits
 *
 * @description
 * Aggregate of every emit `<OrigamField>` itself actually relays: focus
 * (`useFocus`), the inner adjacent clicks (`useAdjacentInner` — real
 * `vm.emit` calls, see `adjacentInner.composable.ts`), and the activation
 * lifecycle (`useStateFlag(props, {state: 'active'})` → `useVModel` →
 * `vm.emit('update:active', …)`, verified by mounting `<OrigamField>` and
 * toggling focus — see `packages/tests/TU/components/Field/`).
 * @description
 * ⛔ Does NOT extend `ICommonsComponentEmits` (`update:modelValue`).
 * `<OrigamField>` is pure chrome around a consumer-supplied control (the
 * `default` slot) — it never reads or writes a `modelValue` of its own, so
 * declaring that emit only ever stripped a real `@update:modelValue`
 * listener from `$attrs` without anyone ever firing it back (issue: guard
 * `unemitted-declarations`, `Field:update:modelValue`).
 * @description
 * ⚠️ Downstream wrappers (TextField, NumberField, PasswordField,
 * TextareaField, FileField, OtpInputField) do NOT `extends IFieldEmits`
 * wholesale — each nests `<origam-field>` inside a scoped-slot template
 * (not its own component root), so Vue's automatic attrs-fallthrough never
 * reaches it, AND none of them relay `<origam-field>`'s own
 * `update:active` upward (each computes its OWN, slightly different
 * `isActive` locally instead). Inheriting `IActiveEmits` there would
 * declare an emit nobody fires — they extend `IFocusEmits` +
 * `IAdjacentInnerEmits` directly instead. See each file's own comment.
 ********************************************************/
export interface IFieldEmits extends IFocusEmits, IAdjacentInnerEmits, IActiveEmits {
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
