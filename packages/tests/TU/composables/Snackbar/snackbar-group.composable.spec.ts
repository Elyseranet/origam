// Unit tests for `useSnackbarGroup`.
//
// The composable is a singleton-per-id store: `notify` pushes items,
// `dismiss` / `dismissAll` remove them, FIFO eviction kicks in past
// `max`, and `duration` schedules an auto-dismiss via `setTimeout`. We
// drive timers with `vi.useFakeTimers()` so the suite stays fast and
// deterministic.
//
// `resetSnackbarGroupForTesting()` (test-only helper) wipes the store
// between cases — without it the counter and any pending timers would
// leak across specs.

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    resetSnackbarGroupForTesting,
    useSnackbarGroup,
    useSnackbarGroupInternal
} from '@origam/composables/Snackbar/snackbar-group.composable'

describe('useSnackbarGroup', () => {
    beforeEach(() => {
        resetSnackbarGroupForTesting()
        vi.useFakeTimers()
    })

    it('notify pushes an item with an auto-generated id and returns it', () => {
        const stack = useSnackbarGroup()
        const id = stack.notify({ message: 'hello' })

        expect(id).toMatch(/^origam-snackbar-group-item-/)
        expect(stack.items.value).toHaveLength(1)
        expect(stack.items.value[0].id).toBe(id)
        expect(stack.items.value[0].message).toBe('hello')
    })

    it('dismiss removes the matching item and fires onDismiss', () => {
        const onDismiss = vi.fn()
        const stack = useSnackbarGroup()
        const id = stack.notify({ message: 'x', onDismiss, duration: 0 })

        stack.dismiss(id)

        expect(stack.items.value).toHaveLength(0)
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('dismiss with an unknown id is a no-op', () => {
        const stack = useSnackbarGroup()
        stack.notify({ message: 'x', duration: 0 })

        stack.dismiss('nope')

        expect(stack.items.value).toHaveLength(1)
    })

    it('dismissAll removes every item', () => {
        const stack = useSnackbarGroup()
        stack.notify({ message: 'a', duration: 0 })
        stack.notify({ message: 'b', duration: 0 })
        stack.notify({ message: 'c', duration: 0 })

        stack.dismissAll()

        expect(stack.items.value).toHaveLength(0)
    })

    it('FIFO eviction kicks in past `max`', () => {
        const stack = useSnackbarGroup({ max: 2 })
        const onDismissA = vi.fn()
        stack.notify({ message: 'a', duration: 0, onDismiss: onDismissA })
        stack.notify({ message: 'b', duration: 0 })
        stack.notify({ message: 'c', duration: 0 })

        expect(stack.items.value.map(i => i.message)).toEqual(['b', 'c'])
        expect(onDismissA).toHaveBeenCalledTimes(1)
    })

    it('auto-dismisses after `duration` ms', () => {
        const stack = useSnackbarGroup()
        stack.notify({ message: 'x', duration: 1000 })

        expect(stack.items.value).toHaveLength(1)
        vi.advanceTimersByTime(999)
        expect(stack.items.value).toHaveLength(1)
        vi.advanceTimersByTime(1)
        expect(stack.items.value).toHaveLength(0)
    })

    it('duration=0 disables the auto-dismiss', () => {
        const stack = useSnackbarGroup()
        stack.notify({ message: 'sticky', duration: 0 })

        vi.advanceTimersByTime(60_000)

        expect(stack.items.value).toHaveLength(1)
    })

    it('falls back to `defaultDuration` when duration is undefined', () => {
        const stack = useSnackbarGroup({ defaultDuration: 500 })
        stack.notify({ message: 'x' })

        vi.advanceTimersByTime(499)
        expect(stack.items.value).toHaveLength(1)
        vi.advanceTimersByTime(1)
        expect(stack.items.value).toHaveLength(0)
    })

    it('keeps separate buckets per `id`', () => {
        const a = useSnackbarGroup({ id: 'a' })
        const b = useSnackbarGroup({ id: 'b' })

        a.notify({ message: 'in-a', duration: 0 })
        b.notify({ message: 'in-b-1', duration: 0 })
        b.notify({ message: 'in-b-2', duration: 0 })

        expect(a.items.value).toHaveLength(1)
        expect(b.items.value).toHaveLength(2)
    })

    it('two callers on the same id share the same store', () => {
        const a = useSnackbarGroup({ id: 'shared' })
        const b = useSnackbarGroup({ id: 'shared' })

        a.notify({ message: 'from-a', duration: 0 })
        b.notify({ message: 'from-b', duration: 0 })

        expect(a.items.value).toHaveLength(2)
        expect(b.items.value).toHaveLength(2)
        b.dismissAll()
        expect(a.items.value).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// BUG 3 regression — `<OrigamSnackbarGroup defaultDuration>` used to be
// purely decorative: the component prop and `useSnackbarGroup().notify()`'s
// duration resolution were two channels that never met — `notify()` only
// ever read `opts.duration ?? options.defaultDuration ??
// SNACKBAR_GROUP_DEFAULT_DURATION`, and nothing fed the component's prop
// into `options.defaultDuration` for a `notify()` call site that never
// re-specifies it. Fixed by having the component register its prop into
// the shared per-id store (`useSnackbarGroupInternal(id)
// .registerDefaultDuration`), which `notify()` now falls back to.
// ---------------------------------------------------------------------------
describe('useSnackbarGroup — registerDefaultDuration link (BUG 3 regression)', () => {
    beforeEach(() => {
        resetSnackbarGroupForTesting()
        vi.useFakeTimers()
    })

    it('notify() honours a duration registered via useSnackbarGroupInternal — simulating the mounted <OrigamSnackbarGroup defaultDuration> — even though the notify() call site never passes defaultDuration itself', () => {
        // Mirrors the real runtime wiring: the component instance calls
        // `useSnackbarGroupInternal(id).registerDefaultDuration(prop)` from
        // a `watch(…, { immediate: true })`; a COMPLETELY SEPARATE
        // `useSnackbarGroup({ id })` call site (e.g. a story button
        // handler) fires `notify()` without ever repeating the value.
        useSnackbarGroupInternal('toasts').registerDefaultDuration(0)

        const stack = useSnackbarGroup({ id: 'toasts' })
        stack.notify({ message: 'sticky by component default' })

        vi.advanceTimersByTime(60_000)
        expect(stack.items.value).toHaveLength(1)
    })

    it('a short registered default auto-dismisses within the registered window, not the hardcoded 5000ms', () => {
        useSnackbarGroupInternal('toasts').registerDefaultDuration(1500)

        const stack = useSnackbarGroup({ id: 'toasts' })
        stack.notify({ message: 'short-lived' })

        vi.advanceTimersByTime(1499)
        expect(stack.items.value).toHaveLength(1)
        vi.advanceTimersByTime(1)
        expect(stack.items.value).toHaveLength(0)
    })

    it('an explicit useSnackbarGroup({ defaultDuration }) call-site option still wins over the registered component default', () => {
        useSnackbarGroupInternal('toasts').registerDefaultDuration(0)

        const stack = useSnackbarGroup({ id: 'toasts', defaultDuration: 300 })
        stack.notify({ message: 'call-site wins' })

        vi.advanceTimersByTime(300)
        expect(stack.items.value).toHaveLength(0)
    })

    it('a per-item duration still wins over the registered component default', () => {
        useSnackbarGroupInternal('toasts').registerDefaultDuration(0)

        const stack = useSnackbarGroup({ id: 'toasts' })
        stack.notify({ message: 'item wins', duration: 200 })

        vi.advanceTimersByTime(200)
        expect(stack.items.value).toHaveLength(0)
    })

    it('falls back to SNACKBAR_GROUP_DEFAULT_DURATION when nothing registered a default for this id', () => {
        // No component mounted for 'unregistered' — the store still uses
        // its own initial default (5000ms per SNACKBAR_GROUP_DEFAULT_DURATION).
        const stack = useSnackbarGroup({ id: 'unregistered' })
        stack.notify({ message: 'x' })

        vi.advanceTimersByTime(4_999)
        expect(stack.items.value).toHaveLength(1)
        vi.advanceTimersByTime(1)
        expect(stack.items.value).toHaveLength(0)
    })
})
