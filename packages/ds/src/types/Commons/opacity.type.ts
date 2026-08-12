/**
 * `opacity` prop accepted by every component that consumes the
 * `useOpacity` composable (`src/composables/Commons/opacity.composable.ts`).
 *
 * Mirrors `TBackdropBlur`'s three-shape contract, disambiguated at runtime
 * (not by the type system) by `useOpacity`:
 *   - An origam-native opacity rung name — the primitive scale
 *     `'0' | '12' | '26' | '32' | '50' | '60' | '70' | '87' | '100'`
 *     (`ORIGAM_OPACITY_RUNGS`, `tokens/primitive.json` → `opacity.*`) —
 *     resolves to `var(--origam-opacity---{rung})`.
 *   - A bare CSS opacity number in the `0..1` range (`0.7`) or a numeric
 *     string (`'0.7'`) — emitted verbatim as `opacity: {value}`.
 *   - A free-form custom value (`'var(--my-opacity)'`) — emitted verbatim.
 *     Mirrors the `TElevation` / `TRounded` / `TBackdropBlur` custom-string
 *     escape hatch.
 *
 * Added ADR-005 D6 (`docs/internal/adr-005-variant-as-props-preset.md`):
 * `OrigamBtn`'s `plain` variant sets `opacity: .7` (`:hover{opacity:1}`)
 * with NO prop covering it pre-migration — this closes that gap.
 */
export type TOpacity = number | string
