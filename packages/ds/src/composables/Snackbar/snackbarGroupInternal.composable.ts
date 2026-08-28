import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { SNACKBAR_GROUP_DEFAULT_ID } from '../../consts/Snackbar/snackbar-group.const'
import { getStore } from '../../utils/Snackbar/snackbar-group.util'

/*********************************************************
 * Internal helper for the host component
 *
 * @description
 * `<OrigamSnackbarGroup>` needs a *writable* ref to the
 * items list (it reads them to render and the composable
 * mutates them). Exposed under a separate name so the
 * public `useSnackbarGroup` API stays read-only on
 * `items`. Components outside the library should never
 * import this.
 * @description
 * Shares the store singleton (`getStore`) with `useSnackbarGroup` (own
 * file) via `utils/Snackbar/snackbar-group.util.ts` — both hooks
 * address the same per-id stack and must never own separate copies of
 * it.
 * @description
 * `id` accepts a `MaybeRefOrGetter<string>` rather than a plain
 * `string` — see #469. The host component calls `getStore(props.id)`
 * indirectly through this composable; if `id` were captured as a
 * one-time snapshot at the top of `setup()`, a theme naming
 * `'origam-snackbar-group': { id: 'custom' }` would never be seen
 * (the ADR-005 theme-props resolver patches `instance.props` in
 * `beforeCreate`, which runs AFTER `setup()`). Resolving `toValue(id)`
 * lazily, INSIDE each returned accessor, defers the read to render
 * time, after the resolver has run, and also makes the store follow
 * `id` if it changes reactively later.
 * @description
 * Deliberately NOT a single shared `computed(() => getStore(toValue(id)))`
 * memoized once and reused by every accessor below. The host component's
 * `watch(() => props.defaultDuration, …, { immediate: true })` calls
 * `registerDefaultDuration` SYNCHRONOUSLY during `setup()` — before the
 * ADR-005 resolver runs. A shared computed would be forced to evaluate
 * right then, permanently caching the PRE-theme store on `rawItems` too
 * (Vue's computed cache does not get invalidated by the resolver's
 * `defineProperty` patch). Each accessor below re-resolves the store
 * independently so an early, unavoidable read by one of them never
 * poisons the others.
 ********************************************************/
export function useSnackbarGroupInternal (id: MaybeRefOrGetter<string> = SNACKBAR_GROUP_DEFAULT_ID) {
    // Links the component's `defaultDuration` prop to `notify()`'s
    // resolution above — the two channels used to never meet (see the
    // `defaultDuration` doc comment on `ISnackbarGroupState`). The host
    // component calls this from a `watch(() => props.defaultDuration,
    // …, { immediate: true })` so the store always reflects the
    // CURRENTLY mounted instance's prop, including live updates.
    const registerDefaultDuration = (duration: number): void => {
        getStore(toValue(id)).defaultDuration.value = duration
    }

    return {
        rawItems: computed(() => getStore(toValue(id)).items.value),
        itemCount: computed(() => getStore(toValue(id)).items.value.length),
        registerDefaultDuration
    }
}
