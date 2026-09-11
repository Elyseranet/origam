/**
 * Origam-native shadow rungs accepted as a string `elevation` prop
 * on every component that consumes the `useElevation` composable.
 * Matches the token rungs under `--origam-shadow-{rung}` in
 * `src/assets/css/tokens/origam-utilities.css`.
 *
 * Lookup is identity (rung name == token suffix). Numeric inputs
 * still flow through `elevationToToken` separately.
 */
export const ORIGAM_SHADOW_RUNGS: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'
])

/**
 * Subset of shadow rungs for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest).
 * `2xl` and `3xl` are not yet emitted as utilities — they fall back
 * to the inline-style path.
 */
export const UTILITY_SHADOW_RUNGS: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl'
])

/**
 * Detects a free-form custom `box-shadow` value that is neither an
 * origam-native rung name (`ORIGAM_SHADOW_RUNGS`) nor a Material 0..24
 * number — e.g. `'0 4px 12px rgba(0,0,0,.24)'`, a `var(--origam-shadow---card)`
 * / `calc(...)` reference, multiple comma-separated shadow layers, or an
 * `inset` shadow.
 *
 * Mirrors `CUSTOM_BORDER_RADIUS_REGEX` (`rounded.const.ts`): deliberately
 * permissive, not a full box-shadow grammar validator. It only checks that
 * the string carries at least one signal a real `box-shadow` value would
 * have — a CSS function call (`var(`, `calc(`, `clamp(`, `rgb(`, `rgba(`,
 * `hsl(`, `hsla(`, `hwb(`, `color-mix(`, …), a hex color, a CSS length with
 * a unit, or the `inset` keyword. Anything that matches none of these is
 * treated as not-a-shadow and falls through to the existing (silent-drop)
 * behaviour — no regression for genuinely invalid input.
 *
 * Example matches: `'0 4px 12px rgba(0,0,0,.24)'`, `'var(--origam-shadow---card)'`,
 * `'inset 0 0 0 2px #fff'`, `'0 1px 2px #000, 0 2px 8px #000'`.
 */
export const CUSTOM_BOX_SHADOW_REGEX = /(?:var|calc|clamp|min|max|env|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix)\(|#[0-9a-f]{3,8}\b|[\d.]+(?:px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|%)|\binset\b/i
