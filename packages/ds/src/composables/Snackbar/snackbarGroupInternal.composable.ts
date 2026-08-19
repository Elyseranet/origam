import { computed } from 'vue'
import { SNACKBAR_GROUP_DEFAULT_ID } from '../../consts'
import { getStore } from '../../utils'

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
 ********************************************************/
export function useSnackbarGroupInternal (id: string = SNACKBAR_GROUP_DEFAULT_ID) {
    const state = getStore(id)

    // Links the component's `defaultDuration` prop to `notify()`'s
    // resolution above — the two channels used to never meet (see the
    // `defaultDuration` doc comment on `ISnackbarGroupState`). The host
    // component calls this from a `watch(() => props.defaultDuration,
    // …, { immediate: true })` so the store always reflects the
    // CURRENTLY mounted instance's prop, including live updates.
    const registerDefaultDuration = (duration: number): void => {
        state.defaultDuration.value = duration
    }

    return {
        rawItems: state.items,
        itemCount: computed(() => state.items.value.length),
        registerDefaultDuration
    }
}
