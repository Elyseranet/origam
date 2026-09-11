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
    useSnackbarGroup
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
