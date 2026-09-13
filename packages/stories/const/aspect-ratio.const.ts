import type { IOptions } from '@origam/interfaces'

/**
 * Aspect ratios for `HstSelect` controls.
 *
 * `IImgProps.aspectRatio` is typed `number`, not a string: the component feeds
 * it to `padding-block-end: (1 / ratio) * 100%` on the sizer element. The
 * values below are therefore real divisions, not `'16/9'` literals — a string
 * would reach the sizer as `NaN` and collapse the box.
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
