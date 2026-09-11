import type { Router } from 'vue-router'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useRouter
 *
 * @description
 * Reads the router instance off the active component instance's proxy
 * (`$router`), Options-API style — kept separate from `useRoute` so a
 * consumer that only needs the router instance doesn't pull in the
 * current-route accessor too.
 ********************************************************/
export function useRouter (): Router | undefined {
    return getCurrentInstance('useRouter')?.proxy?.$router
}
