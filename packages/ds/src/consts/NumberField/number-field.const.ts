/*********************************************************
 * NUMBER_FIELD_DEFAULT_HOLD_DELAY
 *
 * @description
 * Milliseconds `useHold` waits, after the first immediate tick, before
 * it starts repeating. This is the press-and-hold threshold: below it a
 * press reads as a single step, above it as a sustained hold. `500` is
 * the platform convention for key auto-repeat, and short enough that a
 * deliberate hold never feels stuck.
 *
 * `<OrigamNumberField>` exposes it as the `holdDelay` prop and repeats
 * the value as an inline literal in `withDefaults()` — the SFC compiler
 * cannot statically resolve an imported constant there (cf. CLAUDE.md,
 * "withDefaults() — inline literals only").
 ********************************************************/
export const NUMBER_FIELD_DEFAULT_HOLD_DELAY = 500

/*********************************************************
 * NUMBER_FIELD_DEFAULT_HOLD_REPEAT
 *
 * @description
 * Milliseconds between two ticks once repetition has started — i.e. 20
 * increments per second. Exposed as the `holdRepeat` prop, same
 * inline-literal caveat as above.
 ********************************************************/
export const NUMBER_FIELD_DEFAULT_HOLD_REPEAT = 50
