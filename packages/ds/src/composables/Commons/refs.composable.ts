// Utilities
// Types
import type { Ref } from 'vue'
import { onBeforeUpdate, ref } from 'vue'

/*********************************************************
 * useRefs
 ********************************************************/
export function useRefs<T extends object> () {
    const refs = ref<(T | undefined)[]>([]) as Ref<(T | undefined)[]>

    onBeforeUpdate(() => (refs.value = []))

    function updateRef (e: any, i: number) {
        refs.value[i] = e
    }

    return {refs, updateRef}
}
