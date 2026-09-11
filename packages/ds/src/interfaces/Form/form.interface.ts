import type { ComponentInternalInstance, ComputedRef, Raw, Ref } from 'vue'
import type { ICommonsComponentProps, ICommonsComponentSlots, ITypographyProps } from '../../interfaces'
import type { TValidateOn } from '../../types'

export interface IFormProvide {
    register: (item: {
        id: number | string
        vm: ComponentInternalInstance
        validate: () => Promise<Array<string>>
        reset: () => Promise<void>
        resetValidation: () => Promise<void>
    }) => void
    unregister: (id: number | string) => void
    update: (id: number | string, isValid: boolean | undefined, errorMessages: Array<string>) => void
    items?: Ref<Array<IFormField>>
    isDisabled: ComputedRef<boolean>
    isReadonly: ComputedRef<boolean>
    isValidating?: Ref<boolean>
    isValid: Ref<boolean | null | undefined>
    validateOn: Ref<TValidateOn | undefined>
}

export interface IFormProps extends ICommonsComponentProps, ITypographyProps {
    disabled?: boolean
    fastFail?: boolean
    readonly?: boolean
    modelValue?: boolean | null
    validateOn?: TValidateOn
    rules?: Array<any>
    errorMessages?: Array<string> | string
    hint?: string
    messages?: Array<string> | string
    scrollToError?: boolean | ScrollIntoViewOptions
}

export interface IFormSlots extends ICommonsComponentSlots {
    messages?: () => any
    message?: () => any
    actions?: (data: { submit: () => void, reset: () => void }) => any
}

export interface IFormEmits {
    (e: 'submit', value: any): void
    (e: 'reset', value: any): void
}

export interface IFormField {
    id: number | string
    validate: () => Promise<Array<string>>
    reset: () => Promise<void>
    resetValidation: () => Promise<void>
    vm: Raw<ComponentInternalInstance>
    isValid?: boolean | null
    errorMessages: Array<string>
}

export interface ISubmitEventPromise extends SubmitEvent, Promise<IFormValidationResult> {
}

export interface IFormValidationResult {
    valid: boolean
    errors: IFieldValidationResult[]
}

export interface IFieldValidationResult {
    id: number | string
    errorMessages: string[]
}
