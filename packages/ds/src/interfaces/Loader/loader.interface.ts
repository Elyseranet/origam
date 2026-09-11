import type { ILoaderProps } from '../Commons/loader.interface'

/*********************************************************
 * ILoaderSlots
 *
 * @description
 * Slot signatures for `<OrigamLoader>` itself — the only consumer.
 * Issue #364 split this out of `interfaces/Commons/loader.
 * interface.ts`, which keeps `ILoaderProps` and `IResolvedLoader`:
 * those are genuinely transverse — ExpansionPanel (x3), Card, Field,
 * Btn, Switch, and DataTable (headers/rows) all `extends ILoaderProps`
 * — while this slot surface has exactly one consumer.
 ********************************************************/
export interface ILoaderSlots {
    loader?: () => any
    default?: () => any
}

/*********************************************************
 * ILoaderComponentProps
 *
 * @description
 * `<OrigamLoader>`-only prop surface (issue #444). `fullscreen` mirrors
 * the `--origam-loader__fullscreen---*` SCSS block (position: fixed,
 * covering the viewport) — meaningful ONLY for the standalone
 * `<OrigamLoader>` wrapper, never for the transverse `ILoaderProps`
 * consumers (Btn/Field/Card/Switch/DataTable/ExpansionPanel loading
 * states are inline, never full-viewport), so it does NOT belong on
 * the shared `ILoaderProps` in `Commons/loader.interface.ts`.
 ********************************************************/
export interface ILoaderComponentProps extends ILoaderProps {
    fullscreen?: boolean
}

/*********************************************************
 * ILoaderEmits
 *
 * @description
 * Emits fired by `<OrigamLoader>` — none. Toggles between the
 * `#loader` and `#default` slot purely from the `loading` prop.
 ********************************************************/
export interface ILoaderEmits {}
