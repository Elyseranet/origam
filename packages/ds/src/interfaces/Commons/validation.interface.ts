import type { IFocusProps } from '../../interfaces'

import type { TValidateOn } from '../../types'

export interface IValidationProps extends IFocusProps {
    disabled?: boolean
    /** Field-level error flag. Accepts a `boolean` (error on/off) or a `string`
     *  (error message rendered inline by consumers such as `FileField`). */
    error?: string | boolean
    errorMessages?: Array<string> | string
    maxErrors?: number | string
    name?: string
    label?: string
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
