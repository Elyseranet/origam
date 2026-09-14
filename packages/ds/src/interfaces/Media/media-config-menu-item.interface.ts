/**
 * Internal implementation detail of `<OrigamMediaController>`'s config
 * menu (quality / speed / subtitles / download rows) — NOT part of the
 * component's public props/emits/slots surface. Deliberately not
 * re-exported from `src/interfaces/index.ts`: nothing outside
 * `OrigamMediaController.vue` consumes this shape.
 */
export interface IConfigMenuItem {
    title: string
    appendText?: string
    prependIcon?: string
    key: string
    value?: string | number
    children?: Array<IConfigMenuItem>
    onClick?: (event: MouseEvent) => void
    link?: boolean
    href?: string
    download?: string | boolean
    rel?: string
    target?: string
}
