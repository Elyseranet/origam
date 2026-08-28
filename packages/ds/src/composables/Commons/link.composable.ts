import type { SetupContext } from 'vue'
import { computed, resolveDynamicComponent, toRef } from 'vue'
import type { RouterLink as _RouterLink, UseLinkOptions } from 'vue-router'
import type { ITagProps } from '../../interfaces/Commons/commons.interface'
import type { ILink, ILinkProps } from '../../interfaces/Commons/router.interface'
import { deepEqual, hasEvent } from '../../utils/Commons/commons.util'
import { useRoute } from './route.composable'

/*********************************************************
 * useLink
 *
 * @description
 * Resolves the tag / clickable state / router-aware navigation of any
 * link-like component (Btn, Card, Chip, ListItem, BreadcrumbItem…).
 * Depends on `useRoute` for the exact-match `isActive` derivation —
 * kept in its own file since it is a consumer of `useRoute`, not a
 * variant of it.
 ********************************************************/
export function useLink (props: ILinkProps & ITagProps, attrs: SetupContext['attrs']): ILink {
    const RouterLink = resolveDynamicComponent('RouterLink') as typeof _RouterLink | string

    const isLink = computed(() => !!(props.href || props.to))
    const isClickable = computed(() => {
        return isLink?.value || hasEvent(attrs, 'click') || hasEvent(props, 'click')
    })

    /*********************************************************
     *  TAG IS RESOLVED LAZILY, NOT SNAPSHOTTED
     *
     *  @description
     *  `useLink` runs during `setup()`, which Vue executes BEFORE the
     *  `beforeCreate` hook where the ADR-005 theme-props resolver patches
     *  `instance.props`.
     *  Reading `props.tag` here as a plain string therefore captured the value
     *  a theme had not yet had the chance to set, and no later change could
     *  correct it.
     *  A `computed` first evaluates at render, long after `beforeCreate`, so
     *  the themed value is the one that lands.
     *  Measured before this changed: a theme setting `tag` on Btn, Card, Chip,
     *  ListItem or BreadcrumbItem produced no change in the rendered markup.
     ********************************************************/
    const tag = computed(() => (isLink.value ? 'a' : props.tag ?? 'div'))

    if (typeof RouterLink === 'string') {
        return {
            tag,
            isLink,
            isClickable,
            href: toRef(props, 'href')
        }
    }

    /*********************************************************
     *  useLink() IS ALWAYS CALLED, NOT GATED ON `props.to`
     *
     *  @description
     *  `RouterLink.useLink(props)` used to run only when `props.to` was
     *  already truthy AT THE MOMENT `useLink()` (this composable) was
     *  called — `const link = props.to ? RouterLink.useLink(...) :
     *  undefined`. If `to` started unset, `link` was frozen at
     *  `undefined` forever: a `to` set on the component AFTER mount
     *  never activated routing, since nothing re-evaluated the gate.
     *  Measured: `href`, `route`, `navigate` and `isActive` all stayed
     *  inert (#504).
     *  @description
     *  vue-router's OWN `useLink` is already internally lazy — its
     *  `route` is a `computed(() => { const to = unref(props.to); ...
     *  })`, so it re-reads `to` on every access. Calling it
     *  unconditionally is safe: the underlying `computed` is NEVER
     *  evaluated until something reads `link.route` / `link.isActive`,
     *  and every read site below already guards on `props.to` (or
     *  `link?.`) before touching them — so an unset `to` never triggers
     *  `router.resolve(undefined)`.
     ********************************************************/
    const link = RouterLink.useLink(props as UseLinkOptions)
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
