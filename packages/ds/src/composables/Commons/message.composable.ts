import { computed, ComputedRef, Ref, ref, useSlots } from 'vue'

import type { IMessageProps } from '../../interfaces/Commons/message.interface'

/*********************************************************
 * useMessage
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
