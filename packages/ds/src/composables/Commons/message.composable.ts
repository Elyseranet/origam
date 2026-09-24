import { computed, ComputedRef, Ref, ref, useSlots } from 'vue'

import type { IMessageProps } from '../../interfaces/Commons/message.interface'

/*********************************************************
 * useMessage
 *
 * @description
 * Resout les messages a afficher sous un conteneur de champ par ordre de
 * priorite : `props.errorMessages`/`otherMessages` (erreurs externes, ex.
 * validation) d'abord, sinon `props.hint`, sinon `props.messages`.
 * `hasMessages` vaut vrai des qu'une SOURCE existe — y compris le slot
 * `#message`, meme si les props textuelles sont vides.
 *
 * @description
 * ⛔ Un seul consommateur reel dans `packages/ds/src` : `OrigamForm`
 * (verifie par import, pas par grep de nom). La famille Field affiche ses
 * messages par un autre chemin — ne pas ecrire que ce composable est
 * celui de `OrigamTextField`.
 *
 * @description
 * ⛔ La branche prioritaire rend `otherMessages.value`, PAS
 * `props.errorMessages`. Mesure : avec `errorMessages: ['boum']` et le
 * `otherMessages` par defaut (`ref([])`), `hasMessages` vaut `true` et
 * `messages` vaut `[]` — la zone de message s'ouvre VIDE. La prop n'est
 * donc qu'un DECLENCHEUR de priorite ; c'est a l'appelant de reinjecter
 * ses erreurs par le second argument (ce que fait `OrigamForm`).
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
