import type { Ref } from 'vue'
import { SNACKBAR_GROUP_DEFAULT_ID } from '../../consts'
import type {
    ISnackbarGroupItem,
    ISnackbarGroupItemOptions,
    IUseSnackbarGroupOptions,
    IUseSnackbarGroupReturn
} from '../../interfaces'
import { clearTimer, generateId, getStore } from '../../utils'

export type {
    IUseSnackbarGroupOptions,
    IUseSnackbarGroupReturn
} from '../../interfaces'

/*********************************************************
 * useSnackbarGroup
 *
 * @description
 * Public API. Returns an interface to push / pop items
 * from a named stack. The returned `items` ref is the
 * same reactive reference shared with the matching
 * `<OrigamSnackbarGroup id="…">` instance, so direct
 * mutation outside of `notify` / `dismiss` is discouraged.
 * @description
 * The store singleton (`getStore` / `generateId` / `clearTimer`) lives
 * in `utils/Snackbar/snackbar-group.util.ts`, shared with
 * `useSnackbarGroupInternal` (own file) — both hooks address the same
 * per-id stack and must never own separate copies of it.
 ********************************************************/
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
        // Precedence: per-item override > explicit `useSnackbarGroup({
        // defaultDuration })` call-site option > the stack's registered
        // default (`<OrigamSnackbarGroup defaultDuration="…">`, kept in
        // sync via `useSnackbarGroupInternal`'s `registerDefaultDuration`
        // — falls back to `SNACKBAR_GROUP_DEFAULT_DURATION` itself when
        // no component instance is mounted for this stack `id`).
        const duration = opts.duration ?? options.defaultDuration ?? state.defaultDuration.value

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
