import type { Locator } from '@playwright/test'

import type { IReadSettledOptions } from './settled-style.interface'

/**
 * Read a computed value ONCE IT HAS STOPPED MOVING — the antidote to
 * `waitForTimeout(N)` before a `getComputedStyle` read (#783).
 *
 * WHY THIS EXISTS
 * ---------------
 * `transition-recorder.ts` (#750 / PR #782) answers one half of the problem:
 * a Vue transition CLASS exists only DURING the animation, so it must be
 * accumulated, never sampled. This helper answers the other half, which is the
 * bulk of #783's 38 sites: a computed STYLE is never absent — it always returns
 * something — so the failure mode is not "empty", it is **a value read
 * mid-flight**.
 *
 * Measured in this repo and recorded in the root CLAUDE.md: `.origam-main`
 * carries `transition-property: all` over 0.2 s, and a synchronous read after a
 * mutation returns `rgb(255,255,255)` where the landed value is `rgb(3,3,3)` —
 * **identical on broken and on correct code**. A fixed `waitForTimeout(N)`
 * before the read only moves where in the animation the sample lands; on a
 * loaded machine it lands somewhere else again. That is measuring the machine,
 * not the component.
 *
 * WHAT IT DOES INSTEAD
 * --------------------
 * Samples until `stableSamples` CONSECUTIVE reads are identical, then returns
 * that value. The verdict no longer depends on the animation's duration, which
 * in this DS comes from a token and can therefore never be guessed correctly
 * from the spec side.
 *
 * ⛔ WHEN **NOT** TO USE IT
 * -------------------------
 * When the assertion is "the value CHANGED", do not settle-then-compare — use
 * `expect.poll(read).not.toBe(before)` directly. It waits for the state you
 * actually care about and, crucially, still goes red when the change never
 * happens. Settling first would wait for the animation to finish before even
 * looking, which is slower and buys nothing.
 *
 * This helper earns its place on the OTHER shape: an assertion that the value
 * is a SPECIFIC one, or that it did NOT change. There, "has it settled?" is
 * the real question and no `expect.poll` predicate can express it — a polled
 * equality against the starting value is satisfied at t=0, before the component
 * has had any chance to react, which is how a negative assertion passes
 * vacuously.
 */
export const readSettledStyle = async <T>(
    sample: () => Promise<T>,
    options: IReadSettledOptions = {}
): Promise<T> => {
    const stableSamples = options.stableSamples ?? 3
    const intervalMs = options.intervalMs ?? 60
    const timeoutMs = options.timeoutMs ?? 6000

    const deadline = Date.now() + timeoutMs

    let previous = await sample()
    let streak = 1

    while (streak < stableSamples) {
        if (Date.now() > deadline) {
            throw new Error(
                `readSettledStyle: value never settled within ${timeoutMs}ms`
                + (options.message ? ` — ${options.message}` : '')
                + `. Last two samples: ${JSON.stringify(previous)}`
            )
        }

        await new Promise((resolve) => { setTimeout(resolve, intervalMs) })

        const current = await sample()

        streak = JSON.stringify(current) === JSON.stringify(previous) ? streak + 1 : 1
        previous = current
    }

    return previous
}

/**
 * Wait for the animations declared ON THE ELEMENT ITSELF to have run their
 * course, by reading their duration out of the DOM instead of guessing it.
 *
 * `transition-duration` / `animation-duration` are serialised as a
 * comma-separated list of CSS times (`"0.2s, 1s"`); the longest one is the
 * point after which nothing on this element can still be moving. Adding a
 * small margin covers the delay between the trigger and the first frame.
 *
 * This is the treatment the root CLAUDE.md prescribes for the third measured
 * trap ("dérive l'attente de `transitionDuration`"), and it is the only honest
 * option for a NEGATIVE assertion — "nothing moved" — where there is no state
 * to poll for: the wait has to be long enough that a defect WOULD have shown,
 * and a hardcoded constant shorter than the component's own transition (the
 * `disabled` variant runs `duration: 1000` against a spec waiting 400 ms) makes
 * the test weaker without anyone noticing.
 */
export const waitForOwnAnimationsToLand = async (
    locator: Locator,
    marginMs = 150
): Promise<number> => {
    const longestMs = await locator.evaluate((el) => {
        const style = getComputedStyle(el)

        const parse = (list: string): number[] => list
            .split(',')
            .map((raw) => raw.trim())
            .map((raw) => raw.endsWith('ms')
                ? parseFloat(raw)
                : parseFloat(raw) * 1000)
            .filter((value) => Number.isFinite(value))

        return Math.max(
            0,
            ...parse(style.transitionDuration),
            ...parse(style.transitionDelay),
            ...parse(style.animationDuration)
        )
    })

    await new Promise((resolve) => { setTimeout(resolve, longestMs + marginMs) })

    return longestMs
}
