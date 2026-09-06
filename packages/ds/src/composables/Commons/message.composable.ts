import { computed, ComputedRef, Ref, ref, useSlots } from 'vue'

import type { IMessageProps } from '../../interfaces/Commons/message.interface'

/*********************************************************
 * useMessage
 *
 * @description
 * Resout les messages a afficher sous un champ (Field, TextField…) par
 * ordre de priorite : `props.errorMessages`/`otherMessages` (erreurs
 * externes, ex. validation) d'abord, sinon `props.hint`, sinon
 * `props.messages`. `hasMessages` vaut vrai des qu'une SOURCE existe —
 * y compris le slot `#message`, meme si les props textuelles sont vides.
 *
 * @description
 * `otherMessages` (typiquement les erreurs de `useValidation`) est un
 * parametre separe plutot qu'une prop, pour que ce composable reste
 * utilisable sans dependre du systeme de validation complet — un appelant
 * qui n'a pas de validateur passe simplement le defaut `ref([])`.
 ********************************************************/
export function useMessage (props: IMessageProps, otherMessages: Ref<Array<string>> | ComputedRef<Array<string>> = ref([])) {
    const $slots = useSlots()

    const hasMessages = computed(() => {
        return Boolean(props.messages) || Boolean(props.errorMessages) || Boolean(props.hint) || otherMessages.value.length > 0 || Boolean($slots.message)
    })

    const messages = computed(() => {
        if (props.errorMessages?.length || otherMessages.value.length) {
            return otherMessages.value
        } else if (props.hint) {
            return props.hint
        }

        return props.messages ?? []
    })

    return { hasMessages, messages }
}
