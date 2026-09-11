import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationRaw, useLink as _useLink } from 'vue-router'

export interface ILinkProps {
    href?: string
    replace?: boolean
    to?: RouteLocationRaw
    exact?: boolean
}

export interface ILink extends Omit<Partial<ReturnType<typeof _useLink>>, 'href'> {
    tag: string
    isLink: ComputedRef<boolean>
    isClickable: ComputedRef<boolean>
    href: Ref<string | undefined>
}
