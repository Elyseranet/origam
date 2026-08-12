/**
 * `backdropBlur` prop accepted by every component that consumes
 * `useBackdrop` (`src/composables/Commons/backdrop.composable.ts`).
 *
 * Mirrors `TElevation`'s three-shape contract, disambiguated at runtime
 * (not by the type system) by `useBackdrop`:
 *   - An origam-native blur rung name — `'none' | 'xs' | 'sm' | 'md' |
 *     'lg' | 'xl'` (`ORIGAM_BACKDROP_BLUR_RUNGS`) — resolves to
 *     `var(--origam-backdrop__blur---{rung})`, itself a ready-made
 *     `blur(Npx)` filter-function value.
 *   - A bare CSS length, as a `number` (→ `Npx`) or a unit string
 *     (`'8px'`, `'0.5rem'`) — wrapped into `blur({length})` for callers
 *     who want "blur by N" without reaching for a named rung.
 *   - A free-form custom `backdrop-filter` value (`'blur(8px) saturate(1.4)'`,
 *     `'var(--my-filter)'`, a composed multi-function filter list) —
 *     emitted verbatim. Mirrors the `TElevation` / `TRounded` custom-string
 *     escape hatch.
 *
 * Scope note (ticket #21): only `blur()` is modelled. It is the sole
 * `backdrop-filter` function actually used across the DS's 16 current
 * call sites (audited via `grep -rn backdrop-filter packages/ds/src`,
 * 2026-08-12) — every one of them is a plain `blur(6px)` or `blur(8px)`.
 * A component that genuinely needs `saturate()` / `brightness()` / a
 * composed filter reaches for the custom-string escape hatch above; it
 * does not need a second prop.
 */
export type TBackdropBlur = number | string
