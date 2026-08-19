import { nextTick, onScopeDispose } from 'vue'
import type { NavigationGuardNext, Router } from 'vue-router'
import { IN_BROWSER } from '../../consts'

// Module-scoped, shared across every `useBackButton` call site (there is
// only ever one physical back button / popstate listener per app) — NOT
// a per-hook-instance flag, so it stays a plain module `let`, not a ref.
let inTransition = false

/*********************************************************
 * useBackButton
 *
 * @description
 * Wires a `popstate` listener + router navigation guard so a consumer
 * (e.g. a Dialog / Sheet / Bottom-sheet) can intercept the native
 * back-button gesture and run its own close callback instead of
 * letting the browser navigate away.
 * Independent from `useRoute` / `useRouter` / `useLink` — does not
 * delegate to any of them.
 ********************************************************/
export function useBackButton (router: Router | undefined, cb: (next: NavigationGuardNext) => void) {
    let popped = false
    let removeBefore: (() => void) | undefined
    let removeAfter: (() => void) | undefined

    if (IN_BROWSER) {
        nextTick(() => {
            window.addEventListener('popstate', onPopstate)
            if (router) {
                removeBefore = router.beforeEach((_to, _from, next) => {
                    if (!inTransition) {
                        setTimeout(() => {
                            if (popped) {
                                cb(next)
                            } else {
                                next()
                            }
                        })
                    } else {
                        if (popped) {
                            cb(next)
                        } else {
                            next()
                        }
                    }
                    inTransition = true
                })
                removeAfter = router.afterEach(() => {
                    inTransition = false
                })
            }
        })
        onScopeDispose(() => {
            window.removeEventListener('popstate', onPopstate)
            removeBefore?.()
            removeAfter?.()
        })
    }

    const onPopstate = (e: PopStateEvent) => {
        if (e.state?.replaced) return

        popped = true
        setTimeout(() => (popped = false))
    }
}
