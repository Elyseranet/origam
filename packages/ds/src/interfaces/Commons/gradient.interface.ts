import type { TIntent } from '../../types'

/**
 * Single stop in a multi-stop gradient.
 *
 *   - `color` accepts either a {@link TIntent} (resolved to its
 *     `--origam-color__action--{intent}---bg` token) or a raw CSS color
 *     string (hex / rgb / hsl / named).
 *   - `position` is a percentage in `[0..100]`.
 */
export interface IGradientStop {
    color: TIntent | string
    position: number
}

/**
 * Structured gradient descriptor — second of the three accepted formats
 * for `color` / `bgColor` / `textColor` props (the others are a raw CSS
 * gradient string and a preset name like `'gradient-sunset'`).
 *
 * Two ways to define the colour ramp:
 *
 *   1. Short form — `from` + `to` (+ optional `via`) → emits a 2- or
 *      3-stop gradient with stops auto-spaced.
 *   2. Full form — `stops: [...]` overrides the short form entirely and
 *      lets the consumer specify any number of stops with explicit
 *      positions.
 *
 * `direction` accepts a numeric angle in degrees (default `135`) OR a
 * CSS keyword such as `'to right'`, `'to bottom left'`, … For radial /
 * conic gradients, `direction` is forwarded as the shape/position prefix
 * (e.g. `'circle at center'` for radial).
 */
export interface IGradient {
    type?: 'linear' | 'radial' | 'conic'
    from?: TIntent | string
    to?: TIntent | string
    via?: TIntent | string
    direction?: number | string
    stops?: IGradientStop[]
}
