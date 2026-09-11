import type {
    IBgColorProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../../interfaces'

/**
 * Props for the `<OrigamApp>` application shell.
 *
 * App is a thin wrapper over `<OrigamLayout>` whose only surface concern is
 * the page background / default text colour — it intentionally does NOT
 * expose the full layout design surface (border / rounded / elevation /
 * dimension / spacing): an application root has no business carrying a
 * corner radius, a shadow or margins. Those remain available on
 * `<OrigamLayout>` directly for embedded / sized layouts.
 *
 * `color` / `bgColor` are forwarded to the underlying layout: `bgColor`
 * paints the app surface, and `color` sets the root text colour which
 * cascades to descendants through normal CSS inheritance.
 */
export interface IAppProps extends ICommonsComponentProps, IColorProps, IBgColorProps {
    /** Occupy at least the full viewport (`100vw` / `min-height: 100vh`) — content taller than one screen grows past it rather than clipping. Default `true`. */
    fullHeight?: boolean
    /** IDs of layout items allowed to overlap each other (forwarded to the layout). */
    overlaps?: Array<string>
}

/** Emits fired by `<OrigamApp>` — none beyond the shared component contract. */
export interface IAppEmits extends ICommonsComponentEmits {}
