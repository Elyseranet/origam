/*
 * Deterministic scheduler harness for the "async work that outlives its
 * owner" family (#706 → #719 → #753).
 *
 * ⛔ EXTRACTED, NOT REWRITTEN. The rAF half of this file is the harness
 * #719 shipped inline in `TU/origam/raf-teardown-719.spec.ts`. #753
 * needed the same instrument on more sites, and on `setTimeout` as well
 * as `requestAnimationFrame`. Writing a second copy is what the repo's
 * anti-duplication rule forbids, and it would also let the two copies
 * drift — so the original moved here and both specs import it.
 *
 * ⛔ WHAT THIS MEASURES, AND WHAT IT DOES NOT
 *
 * Nobody has ever reproduced #706 by TIMING — the race is a 16-to-48 ms
 * window and it is not addressable from a test. What IS addressable is
 * the CONDITION: a continuation still pending when the environment goes
 * away. That is what these helpers measure.
 *
 * The real schedulers are replaced by deterministic fakes for the whole
 * file that installs them. The fakes honour `cancelAnimationFrame` /
 * `clearTimeout` exactly like the platform does — a cancelled id is
 * dropped and never fires — so "the fix cancels the work" and "the work
 * never runs" are the same measurement, not two.
 */
import { vi } from 'vitest'

interface IArmedTask {
    cb: (...args: Array<unknown>) => void
    /** Capture site, used to attribute a pending task to ONE source file. */
    origin: string
}

let frames: Map<number, IArmedTask>
let timers: Map<number, IArmedTask>
let nextId: number

/**
 * Replace `requestAnimationFrame` / `cancelAnimationFrame` and
 * `setTimeout` / `clearTimeout` by deterministic fakes that record the
 * capture stack of every armed task.
 *
 * ⛔ `setTimeout` is faked here rather than through `vi.useFakeTimers()`
 * on purpose: fake timers give control over WHEN a task runs, but not
 * over WHO armed it, and attribution by capture stack is the whole point
 * (see `pendingFramesFrom`). Faking it by hand also keeps the two
 * schedulers symmetric, so a spec reads the same for a rAF site and a
 * timer site.
 */
export const installFakeSchedulers = (): void => {
    frames = new Map()
    timers = new Map()
    nextId = 1

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback): number => {
        const id = nextId++

        frames.set(id, {cb: cb as IArmedTask['cb'], origin: new Error('armed').stack ?? ''})

        return id
    })

    vi.stubGlobal('cancelAnimationFrame', (id: number): void => {
        frames.delete(id)
    })

    vi.stubGlobal('setTimeout', (cb: () => void): number => {
        const id = nextId++

        timers.set(id, {cb, origin: new Error('armed').stack ?? ''})

        return id
    })

    vi.stubGlobal('clearTimeout', (id: number): void => {
        timers.delete(id)
    })
}

/** rAF only — the #719 shape, kept so that spec's calls are unchanged. */
export const installFakeRaf = installFakeSchedulers

/**
 * ⛔ Count tasks armed BY THE FILE UNDER TEST, never the global queue.
 *
 * Mounting any real component arms frames from several other places
 * (`contrast.directive.ts`, `location.util.ts`, …), so a bare
 * `frames.size === 0` assertion would measure whoever else happens to be
 * on the queue rather than the site under test — and would turn the spec
 * red the day an unrelated component changes. Attribution comes from the
 * capture stack of the scheduler call itself.
 */
export const pendingFramesFrom = (sourceFile: string): number =>
    [...frames.values()].filter(({origin}) => origin.includes(sourceFile)).length

/** `pendingFramesFrom`, for the `setTimeout` queue. */
export const pendingTimersFrom = (sourceFile: string): number =>
    [...timers.values()].filter(({origin}) => origin.includes(sourceFile)).length

/** Both queues at once, for a site that mixes the two (`OrigamMenu`). */
export const pendingTasksFrom = (sourceFile: string): number =>
    pendingFramesFrom(sourceFile) + pendingTimersFrom(sourceFile)

/**
 * Run the frames armed by `sourceFile`, repeatedly, so a callback that
 * schedules the next rung (the `InfiniteScroll` triple-rAF, `useVirtual`'s
 * `calculateVisibleItems`) is drained too. Bounded so a self-rescheduling
 * loop cannot hang the suite. Foreign frames are left untouched.
 *
 * @returns how many rounds actually ran — a self-rescheduling loop that
 *          never stops consumes every round, which is what
 *          `runsForever`-style assertions read.
 */
export const flushFramesFrom = (sourceFile: string, rounds = 6): number => {
    let ran = 0

    for (let i = 0; i < rounds; i++) {
        const batch = [...frames.entries()].filter(([, {origin}]) => origin.includes(sourceFile))

        if (!batch.length) return ran

        ran++

        for (const [id] of batch) frames.delete(id)
        for (const [, {cb}] of batch) cb(0)
    }

    return ran
}

/** `flushFramesFrom`, for the `setTimeout` queue. */
export const flushTimersFrom = (sourceFile: string, rounds = 6): number => {
    let ran = 0

    for (let i = 0; i < rounds; i++) {
        const batch = [...timers.entries()].filter(([, {origin}]) => origin.includes(sourceFile))

        if (!batch.length) return ran

        ran++

        for (const [id] of batch) timers.delete(id)
        for (const [, {cb}] of batch) cb()
    }

    return ran
}

/**
 * Stand-in for vitest's jsdom environment teardown: the globals the
 * environment installed are gone, while the objects the component still
 * holds references to (DOM nodes, closures) are not.
 *
 * `globalThis === window` under jsdom, so deleting `window` does NOT
 * remove the other globals it also exposes (`getComputedStyle` stays
 * callable) — measured. The extra names are therefore deleted
 * explicitly, per site, matching what that site's continuation actually
 * dereferences.
 */
export const withoutGlobals = <T>(names: Array<string>, fn: () => T): T => {
    const saved = new Map<string, unknown>()

    for (const name of names) {
        saved.set(name, (globalThis as Record<string, unknown>)[name])
        delete (globalThis as Record<string, unknown>)[name]
    }

    try {
        return fn()
    } finally {
        for (const [name, value] of saved) {
            ;(globalThis as Record<string, unknown>)[name] = value
        }
    }
}
