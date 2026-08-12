/**
 * Origam-native opacity rungs accepted as a string `opacity` prop on every
 * component that consumes the `useOpacity` composable. Matches the
 * primitive token rungs under `--origam-opacity---{rung}`
 * (`tokens/primitive.json` → `opacity.*`), already generated (consumed
 * pre-ADR-005 by `OrigamBtn`'s hand-rolled `--variant-plain` /
 * `--variant-disabled` SCSS via `var(--origam-opacity---70)` /
 * `var(--origam-opacity---50)`).
 *
 * Nine rungs — the full primitive scale, not a 6-rung ladder like
 * `rounded`/`shadow`/`backdrop`, because opacity's existing consumers
 * (`--opacity-disabled`, `--opacity-plain`) already pin specific
 * percentages (50, 70) that must stay reachable by name.
 */
export const ORIGAM_OPACITY_RUNGS: ReadonlySet<string> = new Set([
    '0', '12', '26', '32', '50', '60', '70', '87', '100'
])

/**
 * Subset of `ORIGAM_OPACITY_RUNGS` for which a global utility class exists
 * in `src/assets/css/tokens/origam-utilities.css` (Opacity group in
 * `scripts/build-tokens.mjs` → `UTILITY_GROUPS`). Kept as its own set,
 * mirroring the `UTILITY_SHADOW_RUNGS` / `ORIGAM_SHADOW_RUNGS` split.
 */
export const UTILITY_OPACITY_RUNGS: ReadonlySet<string> = new Set([
    '0', '12', '26', '32', '50', '60', '70', '87', '100'
])

/**
 * Detects a free-form custom `opacity` value that is neither an
 * origam-native rung name (`ORIGAM_OPACITY_RUNGS`) nor a bare number/numeric
 * string in the `0..1` (or `0..100`) range — e.g. `'var(--my-opacity)'`,
 * `'calc(1 - var(--x))'`. Mirrors `CUSTOM_BOX_SHADOW_REGEX` /
 * `CUSTOM_BACKDROP_FILTER_REGEX`: permissive, signal-based, not a grammar
 * parser.
 */
export const CUSTOM_OPACITY_REGEX = /(?:var|calc|clamp|min|max|env)\(/i
