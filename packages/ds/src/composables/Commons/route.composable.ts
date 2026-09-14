import type { Ref } from 'vue'
import { computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useRoute
 *
 * @description
 * Reads the current route off the active component instance's proxy
 * (`$route`), Options-API style — kept separate from `useRouter` so a
 * consumer that only needs the current route doesn't pull in the
 * router instance accessor too.
 * `useLink` depends on this hook (route-aware `isActive` derivation).
 ********************************************************/
export function useRoute (): Ref<RouteLocationNormalizedLoaded | undefined> {
    const vm = getCurrentInstance('useRoute')

    return computed(() => vm?.proxy?.$route)
}
