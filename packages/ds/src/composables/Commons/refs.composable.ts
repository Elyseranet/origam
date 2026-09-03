// Utilities
// Types
import type { Ref } from 'vue'
import { onBeforeUpdate, ref } from 'vue'

/*********************************************************
 * useRefs
 ********************************************************/
export function useRefs<T extends object> () {
    const refs = ref<(T | null | undefined)[]>([]) as Ref<(T | null | undefined)[]>

    onBeforeUpdate(() => (refs.value = []))

    function updateRef (e: T | null, i: number) {
        refs.value[i] = e
    }

    return {refs, updateRef}
}
