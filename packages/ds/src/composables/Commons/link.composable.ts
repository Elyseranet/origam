import type { SetupContext } from 'vue'
import { computed, resolveDynamicComponent, toRef } from 'vue'
import type { RouterLink as _RouterLink, UseLinkOptions } from 'vue-router'
import type { ILink, ILinkProps, ITagProps } from '../../interfaces'
import { deepEqual, hasEvent } from '../../utils'
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
