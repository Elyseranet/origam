import type { IInspectorPropRow } from '../Commons/inspector-group.interface'
import type { IComponentRegistry } from '../Registry/component-registry.interface'
import type { IPlaygroundScene } from '../Scene/playground-scene.interface'

/*********************************************************
 * IPlaygroundProps
 *
 * @description
 * The embeddable component's public contract. `theme` / `mode` are the
 * whole of the theming surface this lot exposes — see the package README:
 * "the playground does not know the 8 themes. It receives a theme." Both
 * forward straight to `<origam-theme-provider>`, so `'auto'` means "inherit
 * whatever the host's own ancestor already set", never "light" by default.
 ********************************************************/
export interface IPlaygroundProps {
    /** The scene to render. Lot 2 only ever renders `scene.roots[0]`. */
    scene: IPlaygroundScene
    /** The catalogue + lazy loaders this playground instance reads from. */
    registry: IComponentRegistry
    /** Forwarded to `<origam-theme-provider>`. Defaults to `'auto'`. */
    theme?: string
    /** Forwarded to `<origam-theme-provider>`. Defaults to `'auto'`. */
    mode?: string
}

/*********************************************************
 * IPlaygroundEmits
 *
 * @description
 * `select` fires whenever the selected instance changes — a host (e.g.
 * `packages/marketing` syncing its route) listens for it rather than
 * polling `scene.selectedInstanceId`. `update:scene` is the `useVModel`
 * channel for the scene prop itself.
 ********************************************************/
export interface IPlaygroundEmits {
    (e: 'select', instanceId: string | null): void
    (e: 'update:scene', scene: IPlaygroundScene): void
}

/*********************************************************
 * IPlaygroundSlots
 *
 * @description
 * The 4 extension points lot 2 commits to as public API, even though three
 * render nothing by default. Adding a 5th later is cheap; removing one of
 * these four once a host depends on it is a breaking change.
 ********************************************************/
export interface IPlaygroundSlots {
    /** Extra controls in the top bar, after the built-in ones. */
    toolbar?: () => unknown
    /** Wraps the preview stage — a host can frame or annotate it. */
    'preview-surround'?: () => unknown
    /** Extra panels in the inspector, below the prop groups. */
    'inspector-panels'?: () => unknown
    /** Overrides how ONE prop row renders. Scoped: `{ row }`. */
    'prop-row'?: (scope: { row: IInspectorPropRow }) => unknown
}
