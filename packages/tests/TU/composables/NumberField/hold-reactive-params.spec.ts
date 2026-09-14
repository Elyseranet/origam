// #487 — `useHold` read `holdRepeat` / `holdDelay` as PLAIN numbers, once,
// at call time. `OrigamNumberField.vue` calls `useHold({toggleUpDown},
// props.holdRepeat, props.holdDelay)` in `setup()` — a value change on
// those props after mount never reaches `holdStart`'s closures.
//
// Proof: supply `holdRepeat` / `holdDelay` as refs, change them AFTER the
// composable has already been created (mirroring "props changed after
// mount"), and assert the NEXT hold sequence honours the NEW value — the
// ticket's own described impact ("toute nouvelle séquence de maintien du
// bouton +/− continue d'utiliser les anciennes valeurs").

import { effectScope, ref, type Ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useHold } from '@origam/composables/NumberField/hold.composable'

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

function makeHoldReactive (holdRepeat: Ref<number>, holdDelay: Ref<number>) {
    const calls: boolean[] = []
    const toggleUpDown = vi.fn((inc: boolean) => { calls.push(inc) })

    let api!: ReturnType<typeof useHold>
    const scope = effectScope()
    scope.run(() => {
        api = useHold({ toggleUpDown }, holdRepeat, holdDelay)
    })

    return { api, toggleUpDown, calls, scope }
}

describe('useHold — holdDelay/holdRepeat must not freeze at call time (#487)', () => {
    it('a NEW hold sequence honours a holdDelay changed after the composable was created', () => {
        const holdDelay = ref(500)
        const { api, toggleUpDown } = makeHoldReactive(ref(50), holdDelay)

        // First sequence — original 500ms delay.
        api.holdStart('up')
        vi.advanceTimersByTime(499)
        expect(toggleUpDown).toHaveBeenCalledTimes(1)
        api.holdStop()

        // Consumer changes holdDelay AFTER the composable already exists —
        // simulates a prop change reaching OrigamNumberField post-mount.
        holdDelay.value = 100

        // A brand-new sequence should honour the NEW delay, not the one
        // captured when useHold() was first called. The repeat interval
        // (holdRepeat=50, unchanged) only starts ticking once the delay
        // has elapsed, so the first repeat lands at delay + repeat.
        api.holdStart('up')
        vi.advanceTimersByTime(99)
        expect(toggleUpDown).toHaveBeenCalledTimes(2) // only this sequence's immediate tick
        vi.advanceTimersByTime(1 + 50)
        expect(toggleUpDown).toHaveBeenCalledTimes(3) // repeat fired at 100+50ms, not 500+50ms
        api.holdStop()
    })

    it('a NEW hold sequence honours a holdRepeat changed after the composable was created', () => {
        const holdRepeat = ref(50)
        const { api, toggleUpDown } = makeHoldReactive(holdRepeat, ref(0))

        api.holdStart('up')
        vi.advanceTimersByTime(50)
        expect(toggleUpDown).toHaveBeenCalledTimes(2) // immediate + one 50ms repeat
        api.holdStop()

        holdRepeat.value = 1000

        api.holdStart('up')
        vi.advanceTimersByTime(999)
        expect(toggleUpDown).toHaveBeenCalledTimes(3) // just this sequence's immediate tick
        vi.advanceTimersByTime(1)
        expect(toggleUpDown).toHaveBeenCalledTimes(4) // repeat fires at 1000ms, not 50ms
        api.holdStop()
    })

    it('backward compatible — still accepts plain numbers positionally', () => {
        const calls: boolean[] = []
        const toggleUpDown = vi.fn((inc: boolean) => { calls.push(inc) })
        let api!: ReturnType<typeof useHold>
        const scope = effectScope()
        scope.run(() => {
            api = useHold({ toggleUpDown }, 50, 500)
        })

        api.holdStart('up')
        vi.advanceTimersByTime(499)
        expect(toggleUpDown).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(1 + 50)
        expect(toggleUpDown).toHaveBeenCalledTimes(2)
        api.holdStop()
        scope.stop()
    })
})
