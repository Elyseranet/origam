import type { SetupContext } from 'vue'
import { computed, resolveDynamicComponent, toRef } from 'vue'
import type { RouterLink as _RouterLink, UseLinkOptions } from 'vue-router'
import type { ITagProps } from '../../interfaces/Commons/commons.interface'
import type { ILink, ILinkProps } from '../../interfaces/Commons/router.interface'
import { deepEqual, hasEvent } from '../../utils/Commons/commons.util'
import { getCurrentInstance } from '../../utils/Commons/getCurrentInstance.util'
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
    const vm = getCurrentInstance('useLink')

    const isLink = computed(() => !!(props.href || props.to))

    /*********************************************************
     *  ISCLICKABLE ALSO READS vnode.props, NOT ONLY $attrs (#397)
     *
     *  @description
     *  `hasEvent(attrs, 'click')` is blind whenever the HOST component
     *  declares `click` as its OWN emit (`OrigamChip`, `OrigamListItem`):
     *  Vue strips any listener matching a declared emit out of `$attrs`
     *  entirely — on purpose, so the same click doesn't fire twice (once
     *  via the component's `emit()`, once via attrs fallthrough).
     *  `vm.vnode.props` is the raw props object the parent actually
     *  wrote, BEFORE that emit-declaration filtering runs; reading it
     *  directly sees the `onClick` the emit declaration hides from
     *  `$attrs`.
     *  Verified empirically (issue #397): mounting `OrigamChip` with only
     *  `onClick` (no `link` prop, no group) reported `Object.keys($attrs)`
     *  EMPTY and `tabindex` `undefined` — the chip was clickable by mouse
     *  (Vue's own emit-forwarding still fired the handler) yet permanently
     *  invisible to `isClickable`, so no tabindex/ripple/keyboard
     *  activation ever appeared.
     *  `OrigamCard`, which does not declare `click` as an emit, never hit
     *  this: its `onClick` stays in `$attrs`, which is exactly why the
     *  negative control in #397 showed Card detecting a plain `@click`
     *  correctly while Chip/ListItem did not — two different components,
     *  two distinct bugs, not one defect copy-pasted.
     ********************************************************/
    const isClickable = computed(() => {
        return isLink?.value || hasEvent(attrs, 'click') || hasEvent(props, 'click') || hasEvent(vm.vnode.props ?? {}, 'click')
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
