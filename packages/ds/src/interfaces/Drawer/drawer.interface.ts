import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IHoverProps,
    ILayoutItemProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    IScrimProps,
    ITagProps,
    ITransitionComponentProps
} from '../../interfaces'


export interface IDrawerProps extends ITagProps, ICommonsComponentProps, IBorderProps, IElevationProps, ILayoutItemProps, IRoundedProps, IColorProps, IBgColorProps, IDensityProps, IPaddingProps, IMarginProps, ITransitionComponentProps, IScrimProps, IActiveProps, IHoverProps {
    disableResizeWatcher?: boolean
    disableRouteWatcher?: boolean
    expandOnHover?: boolean
    floating?: boolean
    modelValue?: boolean
    permanent?: boolean | null
    rail?: boolean | null
    railWidth?: number | string
    temporary?: boolean
    touchless?: boolean
    width?: number | string
    sticky?: boolean
    /**
     * Whether the drawer reserves space in the layout grid (PUSHES the
     * adjacent toolbar / main / footer / etc.) or overlays them.
     *
     *   • `true`  → drawer registers with the layout's reserved-space
     *               system. Toolbar / main / footer adjacent to the
     *               drawer offset themselves accordingly.
     *   • `false` → drawer paints over the surrounding content (no
     *               reservation, no offset).
     *   • `null` (default) → derived from `permanent`: permanent
     *               drawers push by default, temporary drawers don't.
     *
     * Declared as `boolean | null` (NOT `boolean | undefined`) because
     * Vue's prop coercion turns absent boolean attributes into `false`,
     * which would silently disable the push heuristic. `null` survives
     * coercion and lets the runtime fall back to the permanent-derived
     * default.
     */
    push?: boolean | null
    /**
     * Whether the drawer slots BELOW any top-anchored layout item
     * (typically the AppBar) instead of extending the full height of
     * the layout.
     *
     *   • `true`  → drawer's effective layout order is bumped after
     *               top items, so the drawer's top edge starts where
     *               the AppBar's bottom edge ends.
     *   • `false` → drawer keeps order 0, extending full height and
     *               pushing the AppBar to its right (or claiming the
     *               full left lane regardless of top items).
     *   • `null` (default) → resolved from the HTML declaration order.
     *               AppBar before Drawer → drawer below.
     *               Drawer before AppBar → drawer full-height.
     */
    clipped?: boolean | null
}

/** Emits fired by `<OrigamDrawer>` — v-model on the rail collapsed state. */
export interface IDrawerEmits {
    (e: 'update:rail', value: boolean): void
}
