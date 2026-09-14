import type { IFocusProps } from './focus.interface'

import type { TValidateOn } from '../../types/Commons/validation.type'

/*********************************************************
 * IValidationProps
 *
 * @description
 * ⛔ `label` used to live here and no longer does. A validation mixin has
 * no display surface: `useValidation` never read it, and the ONE component
 * whose whole prop set comes from this mixin — `<OrigamInput>`, via
 * `IInputProps extends … IValidationProps` — renders no label at all. Its
 * root is a 4-area grid (prepend / control / append / messages); the
 * accessible name belongs to the CONTROL handed in through its `#default`
 * slot, not to the wrapper `<div>`.
 *
 * @description
 * Measured before removing (mount + one tick, `label="PROBE_LABEL"`):
 * `<label>` elements rendered — Checkbox 1, Switch 1, TextField 2 (static
 * + floating), RatingField 1, SliderField 1, RadioGroup 1, OrigamInput 0.
 * So making the wrapper paint one would have given all six a DUPLICATE,
 * and warning on it fired on `<OrigamCheckbox label>` /
 * `<OrigamTextField label>` / `<OrigamSwitch label>` — correct calls,
 * because each of those forwards its own props into `<origam-input>`
 * through `filterProps`, which only carries keys `<OrigamInput>` declares.
 * Dropping the declaration is what stops that forwarding at the source.
 *
 * @description
 * The label now sits on the interfaces that actually render one:
 * `ILabelProps` (`text`), `IFieldProps.label`,
 * `ISelectionControlProps.label`, and — added with this change, since this
 * mixin was their only source — `IRatingFieldProps.label` /
 * `ISliderFieldProps.label`.
 ********************************************************/
export interface IValidationProps extends IFocusProps {
    disabled?: boolean
    /** Field-level error flag. Accepts a `boolean` (error on/off) or a `string`
     *  (error message rendered inline by consumers such as `FileField`). */
    error?: string | boolean
    errorMessages?: Array<string> | string
    maxErrors?: number | string
    name?: string
    readonly?: boolean
    rules?: Array<any>
    modelValue?: any
    validateOn?: TValidateOn
    validationValue?: any
}

export interface IValidationFieldResult {
    id: number | string
    errorMessages: Array<string>
}
