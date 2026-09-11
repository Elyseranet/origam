import { computed, ComputedRef, Ref, ref, useSlots } from 'vue'

/*********************************************************
 * useMessage
 ********************************************************/
export function useMessage (props: any, otherMessages: Ref<Array<any>> | ComputedRef<Array<any>> = ref([])) {
    const $slots = useSlots()

    const hasMessages = computed(() => {
        return Boolean(props.messages) || Boolean(props.errorMessages) || otherMessages.value.length > 0 || Boolean($slots.message)
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
