/**
 * Timing constants of `useCountdown` — the tick loop behind
 * `<OrigamSnackbar>`'s remaining-time bar.
 *
 * The countdown deliberately ticks at the snackbar's own CSS
 * `transition-duration` rather than at a fixed rate: the bar then
 * animates one transition per tick, so each step lands exactly when the
 * previous one finished and the motion reads as continuous. The two
 * fallbacks below are the same duration expressed in the two units the
 * function juggles — they are used when no element is passed (`start()`
 * without argument) or when `getComputedStyle` yields a non-numeric
 * duration.
 */
export const SNACKBAR_COUNTDOWN_FALLBACK_TRANSITION_S = 0.2
export const SNACKBAR_COUNTDOWN_FALLBACK_INTERVAL_MS = 200

/**
 * `transition-duration` is reported in seconds; `setInterval` and the
 * remaining `time` are in milliseconds.
 */
export const SNACKBAR_COUNTDOWN_MS_PER_SECOND = 1000
