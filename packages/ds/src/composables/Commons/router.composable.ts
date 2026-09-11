import { IN_BROWSER } from '../../consts'

import type { ILink, ILinkProps, ITagProps } from '../../interfaces'

import { deepEqual, getCurrentInstance, hasEvent } from '../../utils'

import { computed, nextTick, onScopeDispose, Ref, resolveDynamicComponent, SetupContext, toRef } from 'vue'
import {
    NavigationGuardNext,
    RouteLocationNormalizedLoaded,
    Router,
    RouterLink as _RouterLink,
    UseLinkOptions
} from 'vue-router'


/*********************************************************
 * useRoute
 ********************************************************/
export function useRoute (): Ref<RouteLocationNormalizedLoaded | undefined> {
    const vm = getCurrentInstance('useRoute')

    return computed(() => vm?.proxy?.$route)
}

/*********************************************************
 * useRouter
 ********************************************************/
export function useRouter (): Router | undefined {
    return getCurrentInstance('useRouter')?.proxy?.$router
}

/*********************************************************
 * useLink
 ********************************************************/
export function useLink (props: ILinkProps & ITagProps, attrs: SetupContext['attrs']): ILink {
    const RouterLink = resolveDynamicComponent('RouterLink') as typeof _RouterLink | string

    const isLink = computed(() => !!(props.href || props.to))
    const isClickable = computed(() => {
        return isLink?.value || hasEvent(attrs, 'click') || hasEvent(props, 'click')
    })
    const tag = isLink.value ? 'a' : props.tag ?? 'div'

    if (typeof RouterLink === 'string') {
        return {
            tag,
            isLink,
            isClickable,
            href: toRef(props, 'href')
        }
    }

    const link = props.to ? RouterLink.useLink(props as UseLinkOptions) : undefined
    const route = useRoute()

    return {
        tag,
        isLink,
        isClickable,
        route: link?.route,
        navigate: link?.navigate,
        isActive: link && computed(() => {
            if (!props.exact) return link.isActive?.value
            if (!route.value) return link.isExactActive?.value

            return link.isExactActive?.value && deepEqual(link.route.value.query, route.value.query)
        }),
        href: computed(() => props.to ? link?.route.value.href : props.href)
    }
}

let inTransition = false

/*********************************************************
 * useBackButton
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
