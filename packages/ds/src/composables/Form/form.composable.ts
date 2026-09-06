import { computed, markRaw, provide, ref, shallowRef, toRef, watch } from 'vue'
import { useVModel } from '../Commons/vModel.composable'
import { ORIGAM_FORM_KEY } from '../../consts/Form/form.const'

import type { IValidationFieldResult } from '../../interfaces/Commons/validation.interface'
import type { IFormField, IFormProps } from '../../interfaces/Form/form.interface'

import { consoleWarn } from '../../utils/Commons/console.util'

/*********************************************************
 * useForm
 ********************************************************/
/*********************************************************
 * useForm
 *
 * @description
 * Etat d'un `<origam-form>` : agrege les champs qui s'y enregistrent et
 * expose la validation d'ensemble, `reset` et `resetValidation`.
 *
 * @description
 * La validite globale n'est pas calculee par le formulaire mais DELEGUEE aux
 * champs : `validate` appelle chacun d'eux et rassemble les erreurs. Un champ
 * ajoute dynamiquement participe donc sans que le formulaire ait a le
 * connaitre a l'avance.
 *
 * @description
 * `disabled` et `readonly` descendent aux champs enregistres — les poser sur
 * le formulaire evite de les repeter sur chaque champ.
 ********************************************************/
export function useForm (props: IFormProps) {
    const model = useVModel(props, 'modelValue')

    const isDisabled = computed(() => {
        return props.disabled ?? false
    })
    const isReadonly = computed(() => {
        return props.readonly ?? false
    })
    const isValidating = shallowRef(false)
    const items = ref<Array<IFormField>>([])
    const errors = ref<Array<IValidationFieldResult>>([])

    const validate = async () => {
        const results = []
        let valid = true

        errors.value = []
        isValidating.value = true

        for (const item of items.value) {
            const itemErrorMessages = await item.validate()

            if (itemErrorMessages.length > 0) {
                valid = false

                results.push({
                    id: item.id,
                    errorMessages: itemErrorMessages
                })
            }

            if (!valid && props.fastFail) break
        }

        errors.value = results
        isValidating.value = false

        return {valid, errors: errors.value}
    }

    const reset = () => {
        items.value.forEach((item) => item.reset())
    }

    const resetValidation = () => {
        items.value.forEach((item) => item.resetValidation())
    }

    watch(items, () => {
        let valid = 0
        let invalid = 0
        const results = []

        for (const item of items.value) {
            if (item.isValid === false) {
                invalid++
                results.push({
                    id: item.id,
                    errorMessages: item.errorMessages
                })
            } else if (item.isValid === true) valid++
        }

        errors.value = results
        model.value =
            invalid > 0 ? false
                : valid === items.value.length ? true
                    : null
    }, {deep: true, flush: 'post'})

    provide(ORIGAM_FORM_KEY, {
        register: ({id, vm, validate, reset, resetValidation}) => {
            if (items.value.some((item) => item.id === id)) {
                consoleWarn(`Duplicate input name "${id}"`)
            }

            items.value.push({
                id,
                validate,
                reset,
                resetValidation,
                vm: markRaw(vm),
                isValid: null,
                errorMessages: []
            })
        },
        unregister: id => {
            items.value = items.value.filter((item) => {
                return item.id !== id
            })
        },
        update: (id, isValid, errorMessages) => {
            const found = items.value.find((item) => item.id === id)

            if (!found) return

            found.isValid = isValid
            found.errorMessages = errorMessages
        },
        isDisabled,
        isReadonly,
        isValidating,
        isValid: model,
        items,
        validateOn: toRef(props, 'validateOn')
    })

    return {
        errors,
        isDisabled,
        isReadonly,
        isValidating,
        isValid: model,
        items,
        validate,
        reset,
        resetValidation
    }
}

