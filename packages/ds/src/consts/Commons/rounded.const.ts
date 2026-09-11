import { ROUNDED } from '../../enums'

import type { TRounded } from '../../types'

/**
 * Regex used to detect a free-form CSS border-radius string the consumer
 * can pass via `rounded="4px"` / `"4px 0 4px 0"` / etc. Each value can
 * carry a unit (px/em/%/…) OR be a unit-less `0` (CSS allows zero without
 * a unit). Anything that doesn't match falls through to the named-variant
 * or boolean branches.
 *
 * Example matches: `4px`, `0`, `4px 0 4px 0`, `4px 4px 0 0`, `1.5rem`.
 */
export const BORDER_RADIUS_REGEX = /^(?<radius>(?: ?(?:0|(?:[0-9]+(?:\.[0-9]+)?)(?:px|pt|PC|in|cm|mm|em|rem|%|ex|ch|fr))){0,4})$/

/**
 * Detects a free-form custom `border-radius` value that `BORDER_RADIUS_REGEX`
 * (fixed unit whitelist) cannot describe but is still a valid CSS declaration:
 * a custom-property reference (`var(--origam-radius---card)`), a `calc(...)` /
 * `clamp(...)` / `min(...)` / `max(...)` expression, or a single CSS length
 * whose unit lives outside the literal whitelist (`vw`, `vh`, `vmin`, `vmax`,
 * `q`, `lh`, …). Mirrors how `convertToUnit` / `useDimension` already pass
 * custom-property refs and computed lengths straight through, so `rounded`
 * gains the same escape hatch as `width` / `height`.
 *
 * Example matches: `var(--origam-radius---card)`, `calc(1rem + 2px)`,
 * `clamp(4px, 1vw, 16px)`, `12vw`, `var(--x, 8px)`.
 */
export const CUSTOM_BORDER_RADIUS_REGEX = /^(?:var|calc|clamp|min|max|env)\(.*\)$|^-?(?:0|[0-9]*\.?[0-9]+)(?:px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|%)$/i

/**
 * Whitelist of named radius variants. Mirrors `useDensity` /
 * `PREDEFINED_DENSITY` so the composable can decide between
 * `--rounded-{name}` (class output) and an inline `border-radius`
 * declaration.
 */
export const PREDEFINED_ROUNDED: Array<TRounded> = [
    ROUNDED.X_SMALL,
    ROUNDED.SMALL,
    ROUNDED.DEFAULT,
    ROUNDED.MEDIUM,
    ROUNDED.LARGE,
    ROUNDED.X_LARGE,
    ROUNDED.SHAPED,
    ROUNDED.SHAPED_INVERT
]

/**
 * @deprecated Misspelling of `PREDEFINED_ROUNDED`. Kept as an alias for
 * backward compatibility and slated for removal in a future major. Use
 * `PREDEFINED_ROUNDED`.
 */
export const PREDIFINED_ROUNDED = PREDEFINED_ROUNDED
