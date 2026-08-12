/**
 * Origam-native backdrop-blur rungs accepted as a string `backdropBlur`
 * prop on every component that consumes the `useBackdrop` composable.
 * Matches the primitive token rungs under `--origam-backdrop__blur---{rung}`
 * (`tokens/primitive.json` → `backdrop.blur.*`), themselves full
 * `blur(Npx)` filter-function values ready to drop into a
 * `backdrop-filter` declaration without further wrapping.
 *
 * Six rungs, mirroring the `rounded` / `shadow` ladders (`none|xs|sm|md|lg|xl`)
 * rather than inventing a fourth taxonomy. `md` (`8px`) intentionally lines
 * up with the pre-existing `--origam-btn---backdrop-filter-ghost` default so
 * a future `ghost` preset (ticket #23) can reuse it pixel-for-pixel.
 */
export const ORIGAM_BACKDROP_BLUR_RUNGS: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl'
])

/**
 * Subset of `ORIGAM_BACKDROP_BLUR_RUNGS` for which a global utility class
 * exists in `src/assets/css/tokens/origam-utilities.css`. Kept as its own
 * set (identical to `ORIGAM_BACKDROP_BLUR_RUNGS` today) so a rung can be
 * added to the prop's vocabulary before its utility class ships, mirroring
 * the `UTILITY_SHADOW_RUNGS` / `ORIGAM_SHADOW_RUNGS` split in
 * `elevation.const.ts`.
 */
export const UTILITY_BACKDROP_BLUR_RUNGS: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl'
])

/**
 * Detects a free-form custom `backdrop-filter` value that is neither an
 * origam-native rung name (`ORIGAM_BACKDROP_BLUR_RUNGS`) nor a bare CSS
 * length meant to be wrapped in `blur(...)` — e.g. `'blur(8px)'` (already a
 * complete filter-function call, so no double-wrapping), `'blur(8px)
 * saturate(1.4)'`, a `var(--my-filter)` / `calc(...)` reference, or a
 * composed multi-function filter list.
 *
 * Mirrors `CUSTOM_BOX_SHADOW_REGEX` (`elevation.const.ts`): deliberately
 * permissive, not a full `<filter-function-list>` grammar parser — matches
 * on the presence of any CSS function call (a known filter function, or a
 * `var`/`calc`/`clamp`/`min`/`max`/`env` reference/expression) or a
 * comma-separated list. `var(...)` is treated as an already-complete custom
 * value (not a bare length to wrap), same convention `useElevation` /
 * `useRounded` use for their own custom-property-reference escape hatch.
 *
 * A bare CSS length with no parentheses (`'8px'`, `'0.5rem'`, `'8'`) does
 * NOT match — that shape is handled separately by `useBackdrop` (wrapped
 * into `blur({length})`), same split as `useRounded`'s numeric/length
 * branch vs. its custom-string branch.
 */
export const CUSTOM_BACKDROP_FILTER_REGEX = /(?:var|calc|clamp|min|max|env|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|opacity|saturate|sepia)\(|,/i
