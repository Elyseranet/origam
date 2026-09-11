import { BLOCK, INLINE } from '../../enums'

/**
 * Parse a free-form `border` value into width / style / color groups.
 *
 * Accepted color forms (in alternation order — `var()` MUST come before
 * the bare `[A-Za-z]+` branch, otherwise `var` would be eaten as a word
 * before the parenthesis group has a chance to match):
 *
 *   • Hex literal       — `#abc` / `#aabbcc`
 *   • CSS function      — `rgb(…)` / `rgba(…)` / `hsl(…)` / `hsla(…)`
 *   • CSS custom prop   — `var(--origam-color__action--primary---bg)` (with optional
 *                          fallback: `var(--x, fallback)`)
 *   • Named keyword     — `red`, `currentColor`, `transparent`, etc.
 *
 * The user reported that DS-token references (`var(--…)`) silently
 * dropped through this regex and were never emitted as `border-color`,
 * while raw hex / named colors worked. Adding the `var()` alternative
 * fixes the design-token path.
 */
export const BORDER_REGEX = /^(?<width>(?: ?(?:[0-9]+)(?:px|pt|PC|in|cm|mm|em|rem|%|ex|ch|fr)?){0,4}) {0,1}(?<style>(?:(?: ?(?:none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset))+){0,4}) ?(?<color>(?: ?(?:(?:(?:#)(?:[a-f0-9]{3}|[a-f0-9]{6}))|(?:var\(--[^)]+\))|(?:(?:rgb|hsl|rgba)a?\(.*\))|(?:[A-Za-z]+))){0,4})$/

/**
 * Physical-side lookup driving the per-side border wiring (issue #215).
 *
 * `IBorderProps` names its discrete side props PHYSICALLY
 * (`borderTop`/`borderRight`/`borderBottom`/`borderLeft`), unlike the
 * global `border` shorthand's 4-value mode which distributes across
 * LOGICAL axes (`block-start`/`inline-start`/…, see `formatBorderStylesVar`
 * / issue #216). `useBorder` reads this map to emit matching PHYSICAL CSS
 * declarations (`border-top-width`, …) — no logical/physical mismatch for
 * the consumer to mentally translate.
 */
export const BORDER_POSITION_MAP = [
    {side: BLOCK.TOP, widthProp: 'borderTop', colorProp: 'borderTopColor'},
    {side: INLINE.RIGHT, widthProp: 'borderRight', colorProp: 'borderRightColor'},
    {side: BLOCK.BOTTOM, widthProp: 'borderBottom', colorProp: 'borderBottomColor'},
    {side: INLINE.LEFT, widthProp: 'borderLeft', colorProp: 'borderLeftColor'},
] as const
