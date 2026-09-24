/**
 * Options accepted by `readSettledStyle` / `waitForTransitionsToLand`.
 *
 * Declared in a sibling `.interface.ts` rather than inline, mirroring
 * `transition-recorder.interface.ts`: the shape is shared by the helper and by
 * every spec that tunes it, and a second, drifting definition would be exactly
 * the kind of silent divergence #783 is about.
 */
export interface IReadSettledOptions {
    /**
     * How many CONSECUTIVE identical samples count as "settled".
     *
     * Two is enough for a value driven by a CSS transition (the browser
     * repaints between samples). Raise it for a value driven by a JS rAF loop
     * with easing, where two neighbouring frames can be equal by rounding long
     * before the animation has actually finished.
     *
     * @default 3
     */
    stableSamples?: number

    /**
     * Delay between two samples, in ms. Kept above one frame (~16 ms) so two
     * consecutive samples are genuinely two different repaints.
     *
     * @default 60
     */
    intervalMs?: number

    /**
     * Give up after this long and throw. A throw is the intended outcome: a
     * value that never settles is a finding, not something to paper over with
     * the last sample read.
     *
     * @default 6000
     */
    timeoutMs?: number

    /** Included in the timeout message, to name what failed to settle. */
    message?: string
}
