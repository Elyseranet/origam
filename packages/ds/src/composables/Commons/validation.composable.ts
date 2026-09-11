import { useToggleScope, useVModel } from '../../composables'

import { ORIGAM_FORM_KEY } from '../../consts'

import type { IValidationProps } from '../../interfaces'

import { getCurrentInstance, getCurrentInstanceName, getUid, wrapInArray } from '../../utils'

import {
    computed,
    inject,
    MaybeRef,
    nextTick,
    onBeforeMount,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    unref,
    watch
} from 'vue'

/*********************************************************
 * useValidation
 ********************************************************/
export function useValidation (props: IValidationProps, name = getCurrentInstanceName(), id: MaybeRef<string | number> = getUid()) {
    const model = useVModel(props, 'modelValue')
    const validationModel = computed(() => {
        return props.validationValue === undefined ? model.value : props.validationValue
    })
    const form = inject(ORIGAM_FORM_KEY, null)
    const internalErrorMessages = ref<Array<string>>([])
    const isPristine = shallowRef(true)
    const isDirty = computed(() => {
        return !!(
            wrapInArray(model.value === '' ? null : model.value).length ||
            wrapInArray(validationModel.value === '' ? null : validationModel.value).length
        )
    })
    const isDisabled = computed(() => {
        return !!(props.disabled ?? form?.isDisabled.value)
    })
    const isReadonly = computed(() => {
        return !!(props.readonly ?? form?.isReadonly.value)
    })
    const maxErrors = computed(() => {
        return props.maxErrors ?? 1
    })
    const errorMessages = computed(() => {
        return props.errorMessages?.length
            ? wrapInArray(props.errorMessages).concat(internalErrorMessages.value).slice(0, Math.max(0, +maxErrors.value))
            : internalErrorMessages.value
    })
    const validateOn = computed(() => {
        let value = (props.validateOn ?? form?.validateOn.value) || 'input'
        if (value === 'lazy') value = 'input lazy'
        const set = new Set(value?.split(' ') ?? [])

        return {
            blur: set.has('blur') || set.has('input'),
            input: set.has('input'),
            submit: set.has('submit'),
            lazy: set.has('lazy')
        }
    })
    const isValid = computed(() => {
        if (props.error || props.errorMessages?.length) return false
        if (!props.rules || !props.rules.length) return true
        if (isPristine.value) {
            return internalErrorMessages.value.length || validateOn.value.lazy ? undefined : true
        } else {
            return !internalErrorMessages.value.length
        }
    })
    const isValidating = shallowRef(false)
    const validationClasses = computed(() => {
        return {
            [`${name}--error`]: isValid.value === false,
            [`${name}--dirty`]: isDirty.value,
            [`${name}--disabled`]: isDisabled.value,
            [`${name}--readonly`]: isReadonly.value
        }
    })

    const vm = getCurrentInstance('validation')
    const uid = computed(() => props.name ?? unref(id))

    onBeforeMount(() => {
        form?.register({
            id: uid.value,
            vm,
            validate,
            reset,
            resetValidation
        })
    })

    onBeforeUnmount(() => {
        form?.unregister(uid.value)
    })

    onMounted(async () => {
        if (!validateOn.value.lazy) {
            await validate(true)
        }
        form?.update(uid.value, isValid.value, errorMessages.value)
    })

    useToggleScope(() => validateOn.value.input, () => {
        watch(validationModel, () => {
            if (validationModel.value != null) {
                validate()
            } else if (props.focused) {
                const unwatch = watch(() => props.focused, val => {
                    if (!val) validate()

                    unwatch()
                })
            }
        })
    })

    useToggleScope(() => validateOn.value.blur, () => {
        watch(() => props.focused, val => {
            if (!val) validate()
        })
    })

    watch([isValid, errorMessages], () => {
        form?.update(uid.value, isValid.value, errorMessages.value)
    })

    const reset = async () => {
        model.value = null
        await nextTick()
        await resetValidation()
    }

    const resetValidation = async () => {
        isPristine.value = true
        if (!validateOn.value.lazy) {
            await validate(true)
        } else {
            internalErrorMessages.value = []
        }
    }

    const validate = async (silent = false) => {
        const results = []

        isValidating.value = true

        if (props.rules) {
            for (const rule of props.rules) {
                if (results.length >= +(props.maxErrors ?? 1)) {
                    break
                }

                const handler = typeof rule === 'function' ? rule : () => rule
                const result = await handler(validationModel.value)

                if (result === true) continue

                if (result !== false && typeof result !== 'string') {

                    console.warn(`${result} is not a valid value. Rule functions must return boolean true or a string.`)

                    continue
                }

                results.push(result || '')
            }
        }

        internalErrorMessages.value = results
        isValidating.value = false
        isPristine.value = silent

        return internalErrorMessages.value
    }

    return {
        errorMessages,
        isDirty,
        isDisabled,
        isReadonly,
        isPristine,
        isValid,
        isValidating,
        reset,
        resetValidation,
        validate,
        validationClasses
    }
}
