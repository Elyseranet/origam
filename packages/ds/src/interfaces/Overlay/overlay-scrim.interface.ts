import type { IClickEmits, ICommonsComponentProps, ITagProps, ITransitionComponentProps } from '../../interfaces'

export interface IOverlayScrimProps extends ICommonsComponentProps, ITagProps, ITransitionComponentProps, IScrimProps {
    active?: boolean
}

export interface IScrimProps {
    scrim?: boolean | string
}

/** Emits fired by `<OrigamOverlayScrim>` — click + pointer hover events
 *  surface to the parent overlay (so it can close on backdrop click
 *  or pause its auto-close timer while the pointer is over the scrim). */
export interface IOverlayScrimEmits extends IClickEmits {
    (e: 'mouseenter', event: MouseEvent): void
    (e: 'mouseleave', event: MouseEvent): void
}
