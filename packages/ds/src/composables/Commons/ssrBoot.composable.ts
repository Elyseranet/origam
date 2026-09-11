// Utilities
import { computed, onMounted, readonly, shallowRef } from 'vue'

// Composables

/*********************************************************
 * useSsrBoot
 ********************************************************/
export function useSsrBoot () {
    const isBooted = shallowRef(false)

    onMounted(() => {
        window.requestAnimationFrame(() => {
            isBooted.value = true
        })
    })

    const ssrBootStyles = computed(() => !isBooted.value ? ({
        transition: 'none !important'
    }) : [])

    return {ssrBootStyles, isBooted: readonly(isBooted)}
}
