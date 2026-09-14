import type {
    IAdjacentInnerEmits
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type {
    IFieldProps,
    IFieldSlots
} from '../Field/field.interface'
import type {
    IInputEmits,
    IInputProps,
    IInputSlots
} from '../Input/input.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type {
    TMask,
    TTextFieldType
} from '../../types/TextField/text-field.type'

export interface ITextFieldProps extends ICommonsComponentProps, IColorProps, IDensityProps, IFieldProps, IInputProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps {
    autofocus?: boolean
    counter?: boolean | number | string
    counterValue?: number | ((e: any) => number)
    placeholder?: string
    persistentPlaceholder?: boolean
    persistentCounter?: boolean
    role?: string
    type?: TTextFieldType
    modelModifiers?: string | boolean
    /**
     * Mask spec — built-in preset key (`'phone:fr'`, …), a
     * raw pattern (`'(##) ###-####'`) or a full options object.
     * When set, `v-model` exposes the UNMASKED value; the DOM
     * input displays the formatted (masked) string.
     */
    mask?: TMask
}

/**
 * Aggregate emits for `<OrigamTextField>` — re-exports field/input lifecycle
 * events plus the click events on the control surface.
 *
 * ⛔ Extends `IFocusEmits` + `IAdjacentInnerEmits` DIRECTLY rather than the
 * full `IFieldEmits` — `<OrigamTextField>` calls its OWN `useFocus(props)`
 * (line ~253) and its OWN `useAdjacentInner(props)`, so `update:focused` /
 * `click:appendInner` / `click:prependInner` / `click:clear` are genuinely
 * emitted at THIS level. `IFieldEmits` also carries `IActiveEmits`
 * (`update:active`), deliberately excluded: the nested `<origam-field>`
 * lives inside a scoped-slot template (not this component's own root), so
 * Vue's automatic attrs-fallthrough never reaches it, and this component
 * computes its OWN `isActive` (`isActive || isDirty`, passed DOWN to
 * `<origam-field>` as a plain prop) rather than relaying the child's
 * internal toggle — no `@update:active` listener is wired on
 * `<origam-field>` anywhere in the template. Declaring it here promised an
 * event nobody ever fired (issue: guard `unemitted-declarations`,
 * `TextField:update:active`).
 */
export interface ITextFieldEmits extends IFocusEmits, IAdjacentInnerEmits, IInputEmits {
    (e: 'click:control', value: MouseEvent): void
    (e: 'mousedown:control', value: MouseEvent): void
    /**
     * Emitted on every input/paste when a mask is active.
     * Carries the current validity status (pattern + validator).
     */
    (e: 'valid', value: boolean): void
    /**
     * Emitted when every consumer slot of the mask has been
     * filled. The unmasked value is provided for convenience.
     */
    (e: 'complete', value: { complete: boolean, unmasked: string }): void
}

/**
 * Slot signatures for `<OrigamTextField>`. Extends field and input slots with
 * the counter slot and the optional field override slot.
 */
export interface ITextFieldSlots extends IFieldSlots, Omit<IInputSlots, 'default'> {
    counter?: (data: { counter: string, max?: string | number, value: string | number }) => any
    field?: (data: { id: string, isDisabled: boolean, isDirty: boolean, isValid: boolean | undefined, isReadonly: boolean }) => any
}
