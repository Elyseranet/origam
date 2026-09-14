import type { IOptions } from '@origam/interfaces'

/**
 * Aspect ratios for `HstSelect` controls.
 *
 * `IImgProps.aspectRatio` is typed `number`, not a string. The values below are
 * therefore real divisions, not `'16/9'` literals.
 *
 * #709 — the component used to feed the value to
 * `padding-block-end: (1 / ratio) * 100%` on a `__sizer` child; it now emits
 * the native `aspect-ratio` on the root. A string form like `'16/9'` is
 * accepted by the composable too (and preserved as `aspect-ratio: 16 / 9`),
 * but these options stay numeric to match the `number` prop type.
 *
 * Labels keep the human-readable form so the control stays readable in the
 * story panel, where `1.7777777777777777` would not be.
 */
export const aspectRatioList: Array<IOptions<number>> = [
    // ── Landscape ───────────────────────────────────────────────
    { label: '21 / 9 (ultrawide)', value: 21 / 9 },
    { label: '16 / 9 (widescreen)', value: 16 / 9 },
    { label: '3 / 2 (photo)', value: 3 / 2 },
    { label: '4 / 3 (classic)', value: 4 / 3 },

    // ── Square ──────────────────────────────────────────────────
    { label: '1 / 1 (square)', value: 1 },

    // ── Portrait ────────────────────────────────────────────────
    { label: '3 / 4 (portrait)', value: 3 / 4 },
    { label: '2 / 3 (portrait photo)', value: 2 / 3 },
    { label: '9 / 16 (story / reel)', value: 9 / 16 }
]
