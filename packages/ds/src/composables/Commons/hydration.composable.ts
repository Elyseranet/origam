import { onMounted, shallowRef } from 'vue'
import { useDisplay } from '../../composables'
import { IN_BROWSER } from '../../consts'

/*********************************************************
 * useHydration
 ********************************************************/
export function useHydration () {
    if (!IN_BROWSER) return shallowRef(false)

    const {ssr} = useDisplay()

    if (ssr) {
        const isMounted = shallowRef(false)
        onMounted(() => {
            isMounted.value = true
        })
        return isMounted
    } else {
        return shallowRef(true)
    }
}
