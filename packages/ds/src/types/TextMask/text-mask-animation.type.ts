/**
 * Animation strategy applied to the background painted under the
 * `background-clip: text` mask.
 *
 *   - `pan`    — translate the gradient horizontally (default; great for
 *                long horizontal `linear-gradient` ramps).
 *   - `rotate` — rotate the background-image (best fit for `conic` gradients
 *                where every angle is meaningful).
 *   - `pulse`  — scale 1 → 1.2 → 1 (subtle breathing effect).
 *   - `zoom`   — continuous scale 1 → 2 (cinematic "moving forward" feel).
 *
 * Every animation respects `prefers-reduced-motion: reduce` — the SCSS
 * disables the keyframes entirely so users opting out of motion get a
 * static painted text without flashes or transforms.
 */
export type TTextMaskAnimation =
    | 'pan'
    | 'rotate'
    | 'pulse'
    | 'zoom'
