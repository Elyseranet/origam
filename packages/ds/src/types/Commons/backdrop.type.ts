/*********************************************************
 * TBackdropBlur
 *
 * @description
 * `backdropBlur` prop accepted by every component that consumes
 * `useBackdrop` (`src/composables/Commons/backdrop.composable.ts`).
 *
 * @description
 * Three shapes, disambiguated at runtime by `useBackdrop`:
 *   - a rung name (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`) resolving to
 *     `blur(var(--origam-blur---{rung}))`;
 *   - `true`, meaning the default rung (`BACKDROP_BLUR_DEFAULT_RUNG`), so
 *     a consumer can write `backdrop-blur` with no value;
 *   - a number (read as `px`) or any CSS length string, emitted inside
 *     `blur(...)` verbatim.
 *
 * @description
 * `false`, `null` and `undefined` all mean "no backdrop filter" and emit
 * nothing at all — not `backdrop-filter: none`. Emitting `none` would win
 * the cascade over a component's own rule and erase a blur the component
 * painted for itself, the same defect #813 measured on `box-shadow`.
 ********************************************************/
export type TBackdropBlur = boolean | number | string
