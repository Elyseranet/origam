/*********************************************************
 * TOpacity
 *
 * @description
 * `opacity` prop accepted by every component that consumes `useOpacity`
 * (`src/composables/Commons/opacity.composable.ts`).
 *
 * @description
 * Two numeric readings share one type, disambiguated at runtime by the
 * MAGNITUDE of the value — the same loose `number | string` union
 * `TElevation` and `TRounded` use, for the same reason: the shapes are
 * told apart by `useOpacity`, not by the type system.
 *
 * @description
 * A number `<= 1` is read as a CSS fraction and emitted verbatim
 * (`0.7` -> `opacity: 0.7`). A number `> 1` is read on the 0..100
 * PERCENT scale that names the token rungs (`70` -> rung `70`), which is
 * the vocabulary ADR-005's variant presets are written in
 * (`plain: { opacity: 70, hover: { opacity: 100 } }`).
 *
 * @description
 * ⛔ The split is at 1, not at 0, and that is deliberate. Reading every
 * number on the percent scale would make `opacity={1}` mean 1 % — very
 * nearly invisible — where every CSS author on earth means "opaque". The
 * cost of the split is that 1 % cannot be written as a number; pass the
 * string `'1%'` for it. That trade was chosen because `opacity={1}`
 * meaning "opaque" is the single most likely thing a consumer types, and
 * silently rendering it invisible is the worst available failure.
 *
 * @description
 * A non-numeric string passes through verbatim, so `'50%'`,
 * `'var(--origam-opacity---50)'` and `'calc(1 / 3)'` all reach the
 * declaration untouched. Mirrors the custom-value escape hatch of
 * `TRounded` / `TElevation`.
 ********************************************************/
export type TOpacity = number | string
