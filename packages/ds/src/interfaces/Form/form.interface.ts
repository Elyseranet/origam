import type { ComponentInternalInstance, ComputedRef, Raw, Ref } from 'vue'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ICommonsComponentSlots
} from '../Commons/commons.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { TValidateOn } from '../../types/Commons/validation.type'

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

export interface IFormProps extends ICommonsComponentProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
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

/*********************************************************
 * IFormSlots
 *
 * @description
 * ⛔ `actions` exposes the form's REAL handlers, so `@click="submit"`
 * runs validation and fires the `submit` emit. Until this was fixed the
 * template bound `{ submit: () => handleSubmit, reset: () => handleReset }`
 * — arrow functions RETURNING the handler instead of being it. Clicking
 * the button documented on `OrigamForm.md` evaluated the reference and
 * threw it away: no validation, no emit, nothing.
 *
 * @description
 * Both take the originating `Event`. It is the native `SubmitEvent` when
 * the form is submitted by a `type="submit"` button, and whatever event
 * you forward (typically a `MouseEvent`) when you call the slot helper
 * yourself — `handleSubmit` only needs an object it can hang
 * `then`/`catch`/`finally` on before emitting it.
 ********************************************************/
export interface IFormSlots extends ICommonsComponentSlots {
    messages?: () => any
    message?: () => any
    actions?: (data: { submit: (e: Event) => void, reset: (e: Event) => void }) => any
}

/*********************************************************
 * IFormEmits
 *
 * @description
 * useForm ECRIT la validite calculee dans modelValue
 * (form.composable.ts:77) — c'est un canal sortant, pas seulement une
 * valeur entrante.
 *
 * L'emission correspondante doit donc etre declaree, sans quoi Vue
 * avertit a chaque montage et le handler onUpdate:modelValue reste dans
 * $attrs, ou inheritAttrs le pose sur l'element <form> racine.
 ********************************************************/
export interface IFormEmits extends ICommonsComponentEmits {
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
