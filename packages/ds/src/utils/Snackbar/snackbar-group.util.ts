import { ref } from 'vue'
import { SNACKBAR_GROUP_DEFAULT_DURATION } from '../../consts/Snackbar/snackbar-group.const'
import type { ISnackbarGroupItem } from '../../interfaces/Snackbar/snackbar-group-item.interface'
import type { ISnackbarGroupState } from '../../interfaces/Snackbar/snackbar-group.interface'

/*********************************************************
 * snackbar-group.util
 *
 * @description
 * Singleton store registry shared by `useSnackbarGroup` and
 * `useSnackbarGroupInternal` (packages/ds/src/composables/Snackbar/).
 * @description
 * Extracted here rather than duplicated in each composable file: one
 * store per stack `id` must persist for the lifetime of the module so
 * ANY number of components/composables addressing the same stack
 * share state (notify here, dismiss there) — duplicating the `STORES`
 * map per file would break that singleton contract.
 ********************************************************/

const STORES = new Map<string, ISnackbarGroupState>()

export const getStore = (id: string): ISnackbarGroupState => {
    let store = STORES.get(id)

    if (!store) {
        store = {
            items: ref<Array<ISnackbarGroupItem>>([]),
            timers: new Map(),
            counter: { current: 0 },
            defaultDuration: ref(SNACKBAR_GROUP_DEFAULT_DURATION)
        }

        STORES.set(id, store)
    }

    return store
}

export const generateId = (state: ISnackbarGroupState): string => {
    state.counter.current += 1

    return `origam-snackbar-group-item-${state.counter.current}`
}

export const clearTimer = (state: ISnackbarGroupState, itemId: string): void => {
    const handle = state.timers.get(itemId)

    if (handle !== undefined) {
        // SSR-safe — `dismiss` is part of the public API and a consumer
        // could plausibly invoke it from a setup() block (no DOM).
        if (typeof window !== 'undefined') window.clearTimeout(handle)
        state.timers.delete(itemId)
    }
}

/*********************************************************
 * Test helper
 *
 * @description
 * Vitest needs to wipe the singleton between specs so that
 * counters / timers do not leak across tests. Not part of
 * the public surface — do not import in product code.
 ********************************************************/
export function resetSnackbarGroupForTesting (): void {
    STORES.forEach((state) => {
        state.timers.forEach((handle) => {
            if (typeof window !== 'undefined') window.clearTimeout(handle)
        })
        state.timers.clear()
        state.items.value = []
        state.counter.current = 0
    })
    STORES.clear()
}
