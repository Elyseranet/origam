import { computed, ref, type Ref } from 'vue'

import { SNACKBAR_GROUP_DEFAULT_DURATION, SNACKBAR_GROUP_DEFAULT_ID } from '../../consts'

import type { ISnackbarGroupItem, ISnackbarGroupItemOptions } from '../../interfaces'

/*********************************************************
 * Internal store
 *
 * @description
 * One singleton store per `id`. The map persists for the
 * lifetime of the module so any number of components /
 * composables addressing the same stack `id` share state
 * (notify here, dismiss there).
 ********************************************************/

interface ISnackbarGroupState {
    items: Ref<Array<ISnackbarGroupItem>>
    timers: Map<string, number>
    counter: { current: number }
}

const STORES = new Map<string, ISnackbarGroupState>()

const getStore = (id: string): ISnackbarGroupState => {
    let store = STORES.get(id)

    if (!store) {
        store = {
            items: ref<Array<ISnackbarGroupItem>>([]),
            timers: new Map(),
            counter: { current: 0 }
        }

        STORES.set(id, store)
    }

    return store
}

const generateId = (state: ISnackbarGroupState): string => {
    state.counter.current += 1

    return `origam-snackbar-group-item-${state.counter.current}`
}

const clearTimer = (state: ISnackbarGroupState, itemId: string): void => {
    const handle = state.timers.get(itemId)

    if (handle !== undefined) {
        // SSR-safe — `dismiss` is part of the public API and a consumer
        // could plausibly invoke it from a setup() block (no DOM).
        if (typeof window !== 'undefined') window.clearTimeout(handle)
        state.timers.delete(itemId)
    }
}

/*********************************************************
 * useSnackbarGroup
 *
 * @description
 * Public API. Returns an interface to push / pop items
 * from a named stack. The returned `items` ref is the
 * same reactive reference shared with the matching
 * `<OrigamSnackbarGroup id="…">` instance, so direct
 * mutation outside of `notify` / `dismiss` is discouraged.
 ********************************************************/
export interface IUseSnackbarGroupOptions {
    id?: string
    /**
     * Maximum number of items kept in the stack. When `notify` would
     * push past this number, the oldest item is evicted FIFO. When
     * undefined, the stack is unbounded (the rendering component
     * still caps the visible count via its `max` prop).
     */
    max?: number
    /**
     * Fallback `duration` applied to items that omit their own.
     * Defaults to `SNACKBAR_GROUP_DEFAULT_DURATION` (5 000 ms).
     */
    defaultDuration?: number
}

export interface IUseSnackbarGroupReturn {
    items: Readonly<Ref<ReadonlyArray<ISnackbarGroupItem>>>
    notify: (opts: ISnackbarGroupItemOptions) => string
    dismiss: (itemId: string) => void
    dismissAll: () => void
}

export function useSnackbarGroup (options: IUseSnackbarGroupOptions = {}): IUseSnackbarGroupReturn {
    const id = options.id ?? SNACKBAR_GROUP_DEFAULT_ID
    const state = getStore(id)

    const dismiss = (itemId: string): void => {
        const index = state.items.value.findIndex(item => item.id === itemId)

        if (index === -1) return

        const [removed] = state.items.value.splice(index, 1)

        clearTimer(state, itemId)
        removed?.onDismiss?.()
    }

    const scheduleAutoDismiss = (itemId: string, duration: number): void => {
        if (duration <= 0) return
        if (typeof window === 'undefined') return

        const handle = window.setTimeout(() => {
            dismiss(itemId)
        }, duration)

        state.timers.set(itemId, handle)
    }

    const notify = (opts: ISnackbarGroupItemOptions): string => {
        const itemId = generateId(state)
        const duration = opts.duration ?? options.defaultDuration ?? SNACKBAR_GROUP_DEFAULT_DURATION

        const item: ISnackbarGroupItem = {
            ...opts,
            id: itemId,
            createdAt: Date.now()
        }

        state.items.value.push(item)

        // FIFO eviction against the composable-level max. The component
        // (`<OrigamSnackbarGroup max="…">`) enforces its own cap on the
        // *visible* slice; this one prevents unbounded memory growth
        // when callers spam `notify` programmatically.
        if (options.max != null && state.items.value.length > options.max) {
            const evicted = state.items.value.shift()

            if (evicted) {
                clearTimer(state, evicted.id)
                evicted.onDismiss?.()
            }
        }

        scheduleAutoDismiss(itemId, duration)

        return itemId
    }

    const dismissAll = (): void => {
        // Snapshot the ids first — `dismiss` mutates `items.value`.
        const ids = state.items.value.map(item => item.id)
        ids.forEach(dismiss)
    }

    // NOTE: we return the raw ref (not `readonly()`-wrapped) to avoid a
    // Histoire bug where its `applyState` deep-watcher does
    // `Object.assign(target.items, state.items)` on a readonly proxy and
    // throws "'set' on proxy: trap returned falsish for property 'items'".
    // The read-only contract is enforced at the TS level via the
    // `ReadonlyArray<…>` return type — consumers shouldn't mutate items
    // directly; the official mutators are `notify` / `dismiss` /
    // `dismissAll`.
    return {
        items: state.items as Ref<ReadonlyArray<ISnackbarGroupItem>>,
        notify,
        dismiss,
        dismissAll
    }
}

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
 ********************************************************/
export function useSnackbarGroupInternal (id: string = SNACKBAR_GROUP_DEFAULT_ID) {
    const state = getStore(id)

    return {
        rawItems: state.items,
        itemCount: computed(() => state.items.value.length)
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
