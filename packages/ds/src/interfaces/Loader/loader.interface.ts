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
 * ILoaderEmits
 *
 * @description
 * Emits fired by `<OrigamLoader>` — none. Toggles between the
 * `#loader` and `#default` slot purely from the `loading` prop.
 ********************************************************/
export interface ILoaderEmits {}
